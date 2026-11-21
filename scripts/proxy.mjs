/**
 * agent-proxy — see what Claude Code actually sends the model.
 *
 * A zero-dependency, zero-config probe for Claude Code. It launches one
 * headless run through a local logging proxy: every request is captured,
 * forwarded upstream untouched (auth header and all) with the response
 * streamed straight back, and a ranked audit of what is eating your context
 * prints to the terminal. Creates no files unless an output flag asks for
 * one (--help for options).
 *
 * Derived from Matt Pocock's agent-proxy
 * (https://gist.github.com/mattpocock/5b3d76ea21f5f698aefded47a9cea3b1)
 * and its configurable-upstream fork by r1cc4rd0m4zz4
 * (https://gist.github.com/r1cc4rd0m4zz4/42c1a6a81874a5e59292d76192bfa1d2).
 *
 * Run:   node proxy.mjs
 *
 * Zero runtime dependencies — Node built-ins only. Requires Node 18+.
 */

import http from "node:http";
import https from "node:https";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT ?? 8787);

// Zero-config upstream: the same endpoint Claude Code itself uses, read from
// its own settings (targeted extraction — one key, nothing else); anyone
// without a custom provider falls through to the official API.
function readUpstream() {
  const settingsPath = process.env.CLAUDE_CONFIG_DIR
    ? path.join(process.env.CLAUDE_CONFIG_DIR, "settings.json")
    : path.join(os.homedir(), ".claude", "settings.json");
  try {
    const raw = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    return raw?.env?.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
  } catch {
    return "https://api.anthropic.com";
  }
}

const UPSTREAM_URL = new URL(readUpstream());
const UPSTREAM_PROTO = UPSTREAM_URL.protocol === "http:" ? http : https;
const UPSTREAM_PORT = UPSTREAM_URL.port || (UPSTREAM_URL.protocol === "http:" ? "80" : "443");

// ---------------------------------------------------------------------------
// Output flags
// ---------------------------------------------------------------------------
const USAGE = `Usage: node proxy.mjs [options]

Runs one headless Claude Code command through a local logging proxy and
reports what that request carried: tool schemas ranked by size, injected
context per source, the system prompt, and input tokens counted by the
provider.

What you get (one line per outcome):
  node proxy.mjs                       report on the terminal
  node proxy.mjs --what system         report + system prompt, terminal
  node proxy.mjs --what all            whole request, readable, dumps/all.md
  node proxy.mjs --save                report as dumps/report.md
  node proxy.mjs --what system --save  report + system prompt, dumps/system.md
  node proxy.mjs --raw                 request body verbatim, dumps/all.json

Each conversation (session or subagent) keeps one dump — the latest request
replaces earlier ones, tagged -subagent; the terminal report still prints
per request.

Options:
  --what <scope>    default (the report alone), system, or all
  --save            write the Markdown output to dumps/ beside this script
  --raw             write the raw request body to dumps/all.json; pairs with
                    no other output flag — the body contains everything, so
                    slice it later (e.g. jq '.system')
  --prompt <text>   prompt for the probe run (default: "reply with the single
                    word ok"); any prompt works — the requests it triggers
                    are captured too, including subagent requests
  --help            print this usage and exit

Removing a tool: add its bare name to permissions.deny (e.g. "Monitor").

Environment:
  PORT              proxy port (default 8787)
  CLAUDE_BIN        path to the claude executable (default: PATH lookup)
  CLAUDE_CONFIG_DIR config dir holding settings.json (default: ~/.claude)`;

function parseArgs(argv) {
  const out = { what: null, save: false, raw: false, help: false, hadError: false, prompt: "reply with the single word ok" };
  const bad = (msg) => { console.error(msg); out.help = true; out.hadError = true; };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const [key, inline] = arg.split("=");
    if (key === "--help") out.help = true;
    else if (key === "--raw") out.raw = true;
    else if (key === "--save") out.save = true;
    else if (key === "--prompt") {
      out.prompt = inline ?? argv[++i];
      if (!out.prompt) bad("--prompt expects a value");
    }
    else if (key === "--what") out.what = inline ?? argv[++i];
    else bad(`unknown option: ${arg}`);
  }
  if (out.help && out.hadError) return out;
  if (out.what !== null && !["default", "system", "all"].includes(out.what)) bad(`--what expects default, system, or all, got: ${out.what}`);
  if (out.raw && (out.what !== null || out.save)) bad("--raw pairs with no other output flag — the body contains everything");
  if (out.help) return out;
  return out;
}

const FLAG = parseArgs(process.argv.slice(2));
if (FLAG.help) { console.log(USAGE); process.exit(FLAG.hadError ? 1 : 0); }
let VERSION = "unknown";
try { VERSION = execSync("claude --version", { shell: true }).toString().match(/([\d.]+)/)?.[1] || "unknown"; } catch { /* claude missing: the spawn below reports it cleanly */ }

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DUMP_DIR = path.join(HERE, "dumps");

/** Rough token estimate for display. Real input tokens come from the response
 * usage; this is only for ranking the request before the reply arrives. */
const estTokens = (bytes) => Math.round(bytes / 4);

/** count_tokens calls send content but get back only a number, never a reply.
 * A single turn fires many as housekeeping — pure noise here, so skip them. */
const isTokenCount = (reqPath) => reqPath.includes("count_tokens");

/** Any header that looks like a credential is redacted in rendered output —
 * custom gateways authenticate with headers beyond any fixed name list. */
const isSecretHeader = (k) => /auth|key|token|secret|cookie/i.test(k);

/** Strip hop-by-hop and encoding headers so the captured response is readable,
 * recompute content-length, and pass auth through untouched so the real request
 * still authenticates. */
function forwardHeaders(headers, body) {
  const out = { ...headers };
  delete out["host"];
  delete out["connection"];
  delete out["accept-encoding"]; // force identity so we can read the stream
  delete out["transfer-encoding"];
  delete out["content-length"];
  if (body.length > 0) out["content-length"] = String(body.length);
  return out;
}

/** Dump path under dumps/: <stamp>-<scope>.<md|json>; same-millisecond writes
 * (parallel subagent fan-out) get a -2, -3 suffix instead of overwriting. */
function dumpName(scope, ext) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  let file = path.join(DUMP_DIR, `${stamp}-${scope}.${ext}`);
  let n = 2;
  while (fs.existsSync(file)) file = path.join(DUMP_DIR, `${stamp}-${scope}-${n++}.${ext}`);
  return file;
}

// ---------------------------------------------------------------------------
// The audit: rank what's in the request
// ---------------------------------------------------------------------------

/** The audit block for the Markdown dump — the same object and numbers the
 * terminal report renders, in Markdown form. */
function renderAudit(a) {
  const pct = (b) => (a.total ? ((b / a.total) * 100).toFixed(1) : "0.0");
  return [
    "<audit>",
    "",
    `- **Claude Code ${a.version} · payload ${a.total.toLocaleString()} B**` +
      (a.inputTokens != null ? ` · ${a.inputTokens.toLocaleString()} input tokens (provider-counted)` : ` · ~${estTokens(a.total).toLocaleString()} tok`),
    `- **tools**: ${a.tools.length} definitions · ${a.toolsBytes.toLocaleString()} B (~${estTokens(a.toolsBytes).toLocaleString()} tok)`,
    `- **system prompt**: ${a.sysBytes.toLocaleString()} B (~${estTokens(a.sysBytes).toLocaleString()} tok)`,
    `- **injected context**: ${a.ctxBytes.toLocaleString()} B (~${estTokens(a.ctxBytes).toLocaleString()} tok)`,
    ...((p) => p ? [`- **prompt**: ${p.bytes.toLocaleString()} B (excluded from the totals)`] : [])(a.sections.find((s) => s.kind === "prompt")),
    "",
    "**Tools, ranked by size:**",
    "",
    "| tool | bytes | ~tokens | % of payload |",
    "| --- | --: | --: | --: |",
    ...a.tools.map((t) => `| ${t.name} | ${t.bytes.toLocaleString()} | ~${estTokens(t.bytes).toLocaleString()} | ${pct(t.bytes)}% |`),
    "",
    "**Injected context:**",
    "",
    "| section | bytes | ~tokens |",
    "| --- | --: | --: |",
    ...(a.sections.some((s) => s.kind === "memory") ? [`| memory files | ${a.memoryBytes.toLocaleString()} | ~${estTokens(a.memoryBytes).toLocaleString()} |`] : []),
    ...a.sections.filter((s) => s.kind !== "prompt").map((s) => `| ${s.kind === "memory" ? "  " : ""}${s.name} | ${s.bytes.toLocaleString()} | ~${estTokens(s.bytes).toLocaleString()} |`),
    "",
    "</audit>",
  ].join("\n");
}

/** The request's context sections, split on content anchors (raw-grounded):
 * memory files (msg[0] "Contents of <file>" attachments) plus the system-role
 * message's hidden sections — environment, agents, skills carry no headings of
 * their own. Labels follow /context's vocabulary. */
function contextSections(reqJson) {
  const flat = (c) => (typeof c === "string" ? c : (Array.isArray(c) ? c.map((p) => p.text || "").join("\n") : ""));
  const sections = [];
  (reqJson.messages || []).forEach((msg, i) => {
    if (i === 0 && msg.role === "user") {
      // structural split: attachment parts (<system-reminder> wrappers) vs the
      // prompt part — the prompt is its own content part, never counted as
      // injected context
      const parts = Array.isArray(msg.content) ? msg.content : [{ text: flat(msg.content) }];
      const files = [];
      let preamble = 0;
      let prompt = 0;
      for (const part of parts) {
        const t = part.text ?? "";
        if (t.startsWith("<system-reminder>")) {
          const marker = /Contents of (.+?) \(/g;
          const positions = [];
          let m;
          while ((m = marker.exec(t))) positions.push({ name: m[1], at: m.index });
          if (!positions.length) { preamble += Buffer.byteLength(t); continue; }
          let cursor = 0;
          positions.forEach((p, j) => {
            const end = j + 1 < positions.length ? positions[j + 1].at : t.length;
            if (p.at > cursor) preamble += Buffer.byteLength(t.slice(cursor, p.at));
            files.push({ name: path.basename(p.name), bytes: Buffer.byteLength(t.slice(p.at, end)), kind: "memory" });
            cursor = end;
          });
          if (cursor < t.length) preamble += Buffer.byteLength(t.slice(cursor));
        } else if (t.trim()) {
          prompt += Buffer.byteLength(t);
        }
      }
      if (preamble) sections.push({ name: "memory preamble", bytes: preamble, kind: "memory" });
      sections.push(...files);
      if (prompt) sections.push({ name: "prompt", bytes: prompt, kind: "prompt" });
    } else if (msg.role === "system") {
      segmentSystemMessage(flat(msg.content), sections);
    }
  });
  return sections;
}

/** Split a system-role injection: environment up to the agents anchor, agents
 * up to the MCP region, per-server "## " blocks, and the skills catalogue (a
 * heading-less paragraph of "- name: description" lines — detected even when
 * no MCP servers exist). Any span the anchors do not cover is reported as
 * "other"; bytes are never dropped. */
function segmentSystemMessage(text, out) {
  const covered = [];
  const push = (name, start, end) => {
    if (end > start) {
      out.push({ name, bytes: Buffer.byteLength(text.slice(start, end)), kind: "system" });
      covered.push([start, end]);
    }
  };
  const envAt = Math.max(0, text.indexOf("# Environment"));
  let agentsAt = text.indexOf("Available agent types for the Agent tool:");
  const mcpAt = text.indexOf("# MCP Server Instructions");
  if (agentsAt < 0) agentsAt = mcpAt < 0 ? text.length : mcpAt;
  push("environment", envAt, agentsAt);
  // skills anchor: a paragraph of "- name: description" lines after the agents
  // block — distinguished from agent entries (same shape) by a higher entry
  // count, no agents anchor line, and no non-entry paragraph following it.
  // Where the agents list itself splits across paragraphs, the residual keeps
  // every byte; only the agents/skills label can be wrong.
  const scanFrom = mcpAt >= 0 ? mcpAt : agentsAt;
  const region = text.slice(scanFrom);
  const paras = region.split(/\n\s*\n/);
  const isEntry = (l) => /^- \S[^\n]*: /.test(l);
  let roff = 0, agentsParaSeen = mcpAt >= 0, skillsAt = -1;
  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    const rel = region.indexOf(p, roff);
    roff = rel + p.length;
    if (!agentsParaSeen) {
      if (p.includes("Available agent types")) agentsParaSeen = true;
      continue;
    }
    const lines = p.split("\n").filter((l) => l.trim());
    const entryLike = lines.filter(isEntry).length;
    const trailing = paras.slice(i + 1).filter((q) => q.trim());
    if (entryLike >= 5 && entryLike / lines.length >= 0.6 && !p.includes("Available agent types")
      && trailing.every((q) => { const ql = q.split("\n").filter((l) => l.trim()); return ql.filter(isEntry).length / ql.length >= 0.6; })) {
      skillsAt = scanFrom + rel;
      break;
    }
  }
  push("agents", agentsAt, mcpAt >= 0 ? mcpAt : (skillsAt >= 0 ? skillsAt : text.length));
  if (mcpAt >= 0) {
    // per-server "## " blocks; the region preamble folds into the first block
    const rest = text.slice(mcpAt);
    const rparas = rest.split(/\n\s*\n/);
    let roffset = 0, server = null, serverStart = 0;
    for (const p of rparas) {
      const at = rest.indexOf(p, roffset);
      roffset = at + p.length;
      const hm = p.match(/^## (.+)$/m);
      if (!hm) continue;
      if (server) {
        // subsequent server: close the previous block; the first block keeps
        // serverStart 0 so the region preamble folds into it
        push(`MCP server instructions: ${server}`, mcpAt + serverStart, mcpAt + at);
        serverStart = at;
      }
      server = hm[1].trim();
    }
    const regionEnd = skillsAt >= 0 ? skillsAt : text.length;
    if (server) push(`MCP server instructions: ${server}`, mcpAt + serverStart, regionEnd);
    else push("MCP server instructions", mcpAt, regionEnd);
  }
  if (skillsAt >= 0) push("skills", skillsAt, text.length);
  // residual: uncovered spans are reported, never dropped
  let cursor = 0;
  for (const [s, e] of covered.slice().sort((a, b) => a[0] - b[0])) {
    if (s > cursor) push("other", cursor, s);
    cursor = Math.max(cursor, e);
  }
  if (cursor < text.length) push("other", cursor, text.length);
}

/** The single audit object every output renders: measured sections, tool
 * schemas, totals, and provider-counted input tokens. */
function buildAudit(reqJson, inputTokens, version) {
  const tools = (reqJson.tools || [])
    .map((t) => ({ name: t.name ?? "(unnamed)", bytes: Buffer.byteLength(JSON.stringify(t)) }))
    .sort((a, b) => b.bytes - a.bytes);
  const toolsBytes = tools.reduce((s, t) => s + t.bytes, 0);
  const sysBytes = Buffer.byteLength(JSON.stringify(reqJson.system || []));
  const sections = contextSections(reqJson);
  const ctxBytes = sections.filter((s) => s.kind !== "prompt").reduce((s, x) => s + x.bytes, 0);
  return {
    version,
    subagent: (typeof reqJson.system === "string" ? reqJson.system : (reqJson.system || []).map((b) => b.text || "").join("\n")).includes("cc_is_subagent=true"),
    tools,
    toolsBytes,
    sysBytes,
    sections,
    memoryBytes: sections.filter((s) => s.kind === "memory").reduce((s, x) => s + x.bytes, 0),
    ctxBytes,
    total: sysBytes + toolsBytes + ctxBytes,
    inputTokens,
  };
}

/** The report: every number measured from the captured request — identity and
 * headline first, then per-section totals, then detail. */
function printAudit(audit) {
  const pct = (b) => (audit.total ? ((b / audit.total) * 100).toFixed(1) : "0.0");
  console.log(`\n[agent-proxy] Claude Code ${audit.version}${audit.subagent ? " · subagent" : ""} · payload ${audit.total.toLocaleString()} B` +
    (audit.inputTokens != null ? ` · ${audit.inputTokens.toLocaleString()} input tokens (provider-counted)` : ` · ~${estTokens(audit.total).toLocaleString()} tok`));
  console.log(`\ntools: ${audit.tools.length} definitions · ${audit.toolsBytes.toLocaleString()} B (~${estTokens(audit.toolsBytes).toLocaleString()} tok), ranked by size`);
  const w = Math.max(...audit.tools.map((t) => t.name.length), 4);
  for (const t of audit.tools) console.log(`  ${t.name.padEnd(w)}  ${String(t.bytes).padStart(7)} B  ~${String(Math.round(t.bytes / 4)).padStart(5)} tok  ${pct(t.bytes).padStart(5)}%`);
  console.log(`\ninjected context: ${audit.ctxBytes.toLocaleString()} B (~${estTokens(audit.ctxBytes).toLocaleString()} tok)`);
  let inMemory = false;
  for (const s of audit.sections) {
    if (s.kind === "prompt") continue;
    if (s.kind === "memory" && !inMemory) {
      console.log(`  ${audit.memoryBytes.toLocaleString().padStart(7)} B  ~${String(Math.round(audit.memoryBytes / 4)).padStart(5)} tok  memory files`);
      inMemory = true;
    }
    const indent = s.kind === "memory" ? "    " : "  ";
    console.log(`${indent}${s.bytes.toLocaleString().padStart(7)} B  ~${String(Math.round(s.bytes / 4)).padStart(5)} tok  ${s.name}`);
  }
  const prompt = audit.sections.find((s) => s.kind === "prompt");
  if (prompt) console.log(`\nprompt: ${prompt.bytes.toLocaleString()} B (excluded from the totals above)`);
  console.log(`\nsystem prompt: ${audit.sysBytes.toLocaleString()} B (~${estTokens(audit.sysBytes).toLocaleString()} tok)`);
}

function writeDump(scope, ext, content) {
  fs.mkdirSync(DUMP_DIR, { recursive: true });
  const file = dumpName(scope, ext);
  fs.writeFileSync(file, content);
  console.log(`\n[agent-proxy] wrote ${file}`);
  return file;
}

/** Emit the flagged output for one main request. Outcomes map one-to-one to
 * the usage table: --raw writes the body verbatim; --save (or --what all)
 * writes the scope's Markdown; a scope on the terminal appends its increment
 * after the report. Each conversation (session or subagent) keeps one dump —
 * the latest request replaces earlier ones, tagged -subagent. */
const DUMPED_SHAPES = new Map();

function emitOutput(reqJson, rawBody, c, audit) {
  // shape fingerprint: system+tools anatomy plus the first message — constant
  // across one conversation's turns (so they dedup), different between
  // parallel same-type subagents (so siblings each keep a dump)
  const firstMsg = JSON.stringify(reqJson.messages?.[0]?.content ?? "");
  const shape = `${audit.subagent}|${audit.sysBytes}|${audit.toolsBytes}|${audit.tools.length}|${firstMsg.length}|${firstMsg.slice(1, 81)}`;
  const replacePrior = (file) => {
    const prior = DUMPED_SHAPES.get(shape);
    if (prior && prior !== file) {
      try {
        fs.rmSync(prior, { force: true });
        console.error("[agent-proxy] a later request of this conversation replaced the earlier dump");
      } catch {
        // Windows: a locked prior (editor, antivirus) stays; the next
        // same-conversation write retries the unlink
        console.error("[agent-proxy] could not remove the earlier dump (file locked) — it stays");
      }
    }
    DUMPED_SHAPES.set(shape, file);
  };
  const tag = audit.subagent ? "-subagent" : "";
  if (FLAG.raw) {
    replacePrior(writeDump(`all${tag}`, "json", rawBody));
    return;
  }
  const scope = FLAG.what || "default";
  if (FLAG.save || scope === "all") {
    const reportMd = renderAudit(audit);
    let content;
    if (scope === "default") content = reportMd;
    else if (scope === "system") content = reportMd + "\n\n" + ["<system-prompt>", "", renderSystem(reqJson.system), "", "</system-prompt>"].join("\n");
    else content = renderMarkdown({ reqJson, timestamp: new Date().toISOString(), method: c.method, path: c.path, statusCode: c.statusCode, headers: c.headers }, audit, c.markdown);
    replacePrior(writeDump(`${scope === "default" ? "report" : scope}${tag}`, "md", content));
    return;
  }
  if (scope === "system") console.log(`\n${renderSystem(reqJson.system)}`);
}

// ---------------------------------------------------------------------------
// Readable Markdown render (Anthropic /messages only)
// ---------------------------------------------------------------------------

const fenceJson = (v) => "```json\n" + JSON.stringify(v, null, 2) + "\n```";
const fence = (t, lang = "") => "```" + lang + "\n" + t + "\n```";

function blockText(b) {
  if (typeof b === "string") return b;
  if (b?.type === "text" && typeof b.text === "string") return b.text;
  return "";
}

function renderSystem(system) {
  if (typeof system === "string") return system;
  if (Array.isArray(system)) {
    return system
      .map((b) => blockText(b) + (b?.cache_control ? "\n\n<!-- cache_control breakpoint -->" : ""))
      .join("\n\n");
  }
  return fenceJson(system);
}

function renderTools(tools) {
  const rendered = tools.map((t) => {
    const lines = [`### ${t.name ?? "(unnamed tool)"}`, ""];
    if (t.description) lines.push(t.description, "");
    if (t.input_schema) lines.push(fenceJson(t.input_schema));
    return lines.join("\n");
  });
  return ["<tools>", "", rendered.join("\n\n"), "", "</tools>"].join("\n");
}

function imagePlaceholder(b) {
  const src = b.source ?? {};
  const bytes = typeof src.data === "string" ? src.data.length : 0;
  return `\`[image: ${src.media_type ?? "unknown"}, ${bytes} base64 chars — full data in the raw dump]\``;
}

function renderContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return fenceJson(content);
  return content
    .map((b) => {
      switch (b?.type) {
        case "text":
          return b.text ?? "";
        case "tool_use":
          return [`<tool-use name="${b.name}" id="${b.id ?? ""}">`, "", fenceJson(b.input ?? {}), "", "</tool-use>"].join("\n");
        case "tool_result": {
          const inner =
            typeof b.content === "string"
              ? b.content
              : Array.isArray(b.content)
                ? b.content.map((x) => (x?.type === "image" ? imagePlaceholder(x) : blockText(x) || fenceJson(x))).join("\n\n")
                : fenceJson(b.content);
          return [`<tool-result tool-use-id="${b.tool_use_id ?? ""}" is-error="${!!b.is_error}">`, "", inner, "", "</tool-result>"].join("\n");
        }
        case "image":
          return imagePlaceholder(b);
        case "thinking":
          return ["<thinking>", "", b.thinking ?? "", "", "</thinking>"].join("\n");
        default:
          return fenceJson(b);
      }
    })
    .join("\n\n");
}

function renderMessages(messages) {
  if (!Array.isArray(messages)) return "<messages></messages>";
  const rendered = messages.map((m, i) =>
    [`<message index="${i + 1}" role="${m.role ?? "unknown"}">`, "", renderContent(m.content), "", "</message>"].join("\n")
  );
  return ["<messages>", "", rendered.join("\n\n"), "", "</messages>"].join("\n");
}

/** Reassemble the streamed SSE response so we can read the reply — and pull the
 * real input-token count out of the usage events. */
function decodeResponse(raw) {
  const events = [];
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^data:\s?(.*)$/);
    if (!m || m[1] === "[DONE]" || m[1].trim() === "") continue;
    try { events.push(JSON.parse(m[1])); } catch { /* skip */ }
  }
  const blocks = {};
  let stopReason, usage;
  for (const ev of events) {
    if (ev.type === "content_block_start") blocks[ev.index] = { type: ev.content_block?.type ?? "text", text: "", name: ev.content_block?.name, id: ev.content_block?.id };
    else if (ev.type === "content_block_delta" && blocks[ev.index]) {
      const d = ev.delta ?? {};
      blocks[ev.index].text += d.text ?? d.partial_json ?? d.thinking ?? "";
    } else if (ev.type === "message_start" && ev.message?.usage) usage = { ...ev.message.usage, ...(usage ?? {}) };
    else if (ev.type === "message_delta") {
      if (ev.delta?.stop_reason) stopReason = ev.delta.stop_reason;
      if (ev.usage) usage = { ...(usage ?? {}), ...ev.usage };
    }
  }
  const parts = [];
  if (stopReason) parts.push(`- **stop reason**: ${stopReason}`);
  if (usage) parts.push(`- **usage**: ${JSON.stringify(usage)}`, "");
  for (const i of Object.keys(blocks).map(Number).sort((a, b) => a - b)) {
    const b = blocks[i];
    if (b.type === "text") parts.push(["<assistant-text>", "", b.text, "", "</assistant-text>"].join("\n"));
    else if (b.type === "thinking") parts.push(["<thinking>", "", b.text, "", "</thinking>"].join("\n"));
    else if (b.type === "tool_use") parts.push([`<tool-use name="${b.name}" id="${b.id ?? ""}">`, "", fence(b.text || "{}", "json"), "", "</tool-use>"].join("\n"));
  }
  const inputTokens = usage
    ? (usage.input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0)
    : null;
  return { markdown: parts.length ? parts.join("\n\n") : fence(raw), inputTokens };
}

function renderMarkdown(c, audit, responseMd) {
  const headers = Object.entries(c.headers).map(([k, v]) =>
    `${k}: ${isSecretHeader(k) ? "[REDACTED]" : Array.isArray(v) ? v.join(", ") : v ?? ""}`
  );
  const req = c.reqJson;
  const parts = [
    ["<meta>", "", `- **timestamp**: ${c.timestamp}`, `- **model**: ${req?.model ?? "unknown"}`, `- **endpoint**: ${c.method} ${c.path}`, `- **upstream status**: ${c.statusCode}`, "", "</meta>"].join("\n"),
    renderAudit(audit),
    ["<headers>", "", "```", ...headers, "```", "", "</headers>"].join("\n"),
  ];
  if (req?.system != null) parts.push(["<system-prompt>", "", renderSystem(req.system), "", "</system-prompt>"].join("\n"));
  if (Array.isArray(req?.tools) && req.tools.length) parts.push(renderTools(req.tools));
  parts.push(renderMessages(req?.messages));
  parts.push("<response>\n\n" + responseMd + "\n\n</response>");
  return parts.join("\n\n") + "\n";
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

function handle(req, res) {
  const reqPath = req.url ?? "/";
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks);

    const upstream = UPSTREAM_PROTO.request(
      { hostname: UPSTREAM_URL.hostname, port: Number(UPSTREAM_PORT), path: UPSTREAM_URL.pathname.replace(/\/$/, '') + reqPath, method: req.method, headers: forwardHeaders(req.headers, body) },
      (up) => {
        res.writeHead(up.statusCode ?? 502, up.headers);
        const respChunks = [];
        up.on("data", (c) => { respChunks.push(c); res.write(c); });
        up.on("end", () => {
          res.end();
          if (isTokenCount(reqPath)) return;
          let reqJson = null;
          try { reqJson = JSON.parse(body.toString("utf8")); } catch { return; } // connection probes: empty body
          if (!Array.isArray(reqJson.tools) || reqJson.tools.length === 0) return; // sidecalls carry no tools
          try {
            const { markdown, inputTokens } = decodeResponse(Buffer.concat(respChunks).toString("utf8"));
            const audit = buildAudit(reqJson, inputTokens, VERSION);
            printAudit(audit);
            emitOutput(reqJson, body.toString("utf8"), { method: req.method ?? "POST", path: reqPath, statusCode: up.statusCode ?? 0, headers: req.headers, markdown }, audit);
          } catch (err) {
            console.error(`[agent-proxy] could not render: ${err.message}`);
          }
        });
      }
    );
    upstream.on("error", (err) => {
      console.error(`[agent-proxy] upstream error: ${err.message}`);
      if (!res.headersSent) res.writeHead(502, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: `agent-proxy upstream error: ${err.message}` }));
    });
    if (body.length > 0) upstream.write(body);
    upstream.end();
  });
}

// One-shot lifecycle: listen, launch a single headless claude pointed at the
// proxy via --settings (the strongest env layer — it also overrides a
// settings.json env block, where the shell ANTHROPIC_BASE_URL route can
// silently fail), wait for it to finish, exit.
const server = http.createServer(handle);
server.on("error", (err) => {
  console.error(`[agent-proxy] cannot listen on 127.0.0.1:${PORT} (${err.code}) — set PORT`);
  process.exit(1);
});
await new Promise((resolve) => server.listen(PORT, "127.0.0.1", () => {
  console.error(`[agent-proxy] listening on 127.0.0.1:${PORT}`);
  console.error(`[agent-proxy] forwarding to ${UPSTREAM_URL.href}`);
  resolve();
}));

// Spawn the resolved binary directly (no shell) so the inline JSON reaches
// claude unquoted-mangled. CLAUDE_BIN overrides the lookup; .cmd/.bat/.ps1
// shims are rejected — they need a shell, which would mangle the inline JSON.
let claudeBin = process.env.CLAUDE_BIN || "";
if (!claudeBin) {
  try {
    claudeBin = execSync(process.platform === "win32" ? "where claude" : "command -v claude", { shell: true }).toString().trim().split(/\r?\n/)[0] || "";
  } catch { /* not on PATH */ }
}
if (!claudeBin || /\.(cmd|bat|ps1)$/i.test(claudeBin)) {
  console.error("agent-proxy: claude executable not found (or resolved to a shell shim) — set CLAUDE_BIN to the binary");
  process.exit(1);
}

const inlineSettings = JSON.stringify({ env: { ANTHROPIC_BASE_URL: `http://127.0.0.1:${PORT}` } });
let child;
try {
  child = spawn(claudeBin, ["-p", "--settings", inlineSettings, FLAG.prompt], {
    cwd: process.cwd(),
    stdio: ["ignore", "ignore", "ignore"],
  });
} catch (err) {
  // sync spawn throws (shims, bad CLAUDE_BIN) are not caught by child.on("error")
  console.error(`agent-proxy: could not launch claude (${err.message}) — set CLAUDE_BIN to the binary`);
  process.exit(1);
}
child.on("error", (err) => {
  console.error(`agent-proxy: could not launch claude (${err.message}) — set CLAUDE_BIN`);
  server.close(() => process.exit(1));
});
console.error(`[agent-proxy] probing: one headless claude run`);

await new Promise((r) => child.on("exit", r));
await new Promise((r) => server.close(r));
