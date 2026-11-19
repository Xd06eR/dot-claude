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

Options:
  --what <scope>    also emit the captured request:
                    system  the system prompt alone
                    all     the whole request (system prompt, tool schemas,
                            messages, response)
  --raw             emit raw JSON instead of readable Markdown
  --to <target>     terminal (default) or file; file writes under dumps/
                    beside this script. --what all always writes a file —
                    the whole request is too large for the terminal.
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
  const out = { what: null, raw: false, to: "terminal", help: false, prompt: "reply with the single word ok" };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const [key, inline] = arg.split("=");
    if (key === "--help") out.help = true;
    else if (key === "--raw") out.raw = true;
    else if (key === "--prompt") out.prompt = inline ?? argv[++i];
    else if (key === "--what" || key === "--to") {
      const value = inline ?? argv[++i];
      if (key === "--what") out.what = value;
      else out.to = value;
    } else {
      console.error(`unknown option: ${arg}`);
      out.help = true;
    }
  }
  if (out.help) return out;
  if (out.what !== null && !["system", "all"].includes(out.what)) {
    console.error(`--what expects system or all, got: ${out.what}`);
    out.help = true;
  }
  if (!["terminal", "file"].includes(out.to)) {
    console.error(`--to expects terminal or file, got: ${out.to}`);
    out.help = true;
  }
  if (out.what === "all" && out.to === "terminal") {
    console.log("[agent-proxy] --what all is too large for the terminal — writing to file");
    out.to = "file";
  }
  return out;
}

const FLAG = parseArgs(process.argv.slice(2));
if (FLAG.help) { console.log(USAGE); process.exit(0); }
const VERSION = execSync("claude --version", { shell: true }).toString().match(/([\d.]+)/)?.[1] || "unknown";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DUMP_DIR = path.join(HERE, "dumps");

/** Rough token estimate for display. Real input tokens come from the response
 * usage; this is only for ranking the request before the reply arrives. */
const estTokens = (bytes) => Math.round(bytes / 4);

/** count_tokens calls send content but get back only a number, never a reply.
 * A single turn fires many as housekeeping — pure noise here, so skip them. */
const isTokenCount = (reqPath) => reqPath.includes("count_tokens");

const REDACT = new Set(["authorization", "x-api-key", "api-key"]);

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

/** Dump path under dumps/: <stamp>-<scope>.<md|json>. */
function dumpName(scope, ext) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(DUMP_DIR, `${stamp}-${scope}.${ext}`);
}

// ---------------------------------------------------------------------------
// The audit: rank what's in the request
// ---------------------------------------------------------------------------

/** Measure every removable region of the request and rank the tools by size.
 * This is the whole point of the proxy — the numbers you cut against. */
function auditRequest(reqJson, realInputTokens) {
  const tools = Array.isArray(reqJson?.tools) ? reqJson.tools : [];
  const toolRows = tools
    .map((t) => {
      const bytes = Buffer.byteLength(JSON.stringify(t));
      return { name: t?.name ?? "(unnamed)", bytes, tokens: estTokens(bytes) };
    })
    .sort((a, b) => b.bytes - a.bytes);

  const toolsBytes = toolRows.reduce((n, r) => n + r.bytes, 0);
  const systemBytes = reqJson?.system ? Buffer.byteLength(JSON.stringify(reqJson.system)) : 0;
  const totalBytes = Buffer.byteLength(JSON.stringify(reqJson ?? {}));

  return {
    toolRows,
    toolCount: toolRows.length,
    toolsBytes,
    systemBytes,
    totalBytes,
    realInputTokens,
  };
}

/** The ranked table, as Markdown. The hero of the whole document. */
function renderAudit(a) {
  const pct = (b) => (a.totalBytes ? ((b / a.totalBytes) * 100).toFixed(1) : "0.0");
  const rows = a.toolRows
    .map((r) => `| ${r.name} | ${r.bytes.toLocaleString()} | ~${r.tokens.toLocaleString()} | ${pct(r.bytes)}% |`)
    .join("\n");

  return [
    "<audit>",
    "",
    a.realInputTokens != null
      ? `**${a.realInputTokens.toLocaleString()} input tokens** billed for this request (from the response usage).`
      : "",
    "",
    `- **tools**: ${a.toolCount} definitions, ${a.toolsBytes.toLocaleString()} bytes (~${estTokens(a.toolsBytes).toLocaleString()} tokens)`,
    `- **system prompt**: ${a.systemBytes.toLocaleString()} bytes (~${estTokens(a.systemBytes).toLocaleString()} tokens)`,
    `- **total request**: ${a.totalBytes.toLocaleString()} bytes`,
    "",
    "**Tools, ranked by size:**",
    "",
    "| tool | bytes | ~tokens | % of request |",
    "| --- | --: | --: | --: |",
    rows,
    "",
    "</audit>",
  ].join("\n");
}

/** Context injected around the prompt: first user message (CLAUDE.md and rule
 * files as "Contents of <file>" attachments) plus system-role messages
 * (environment block, MCP server instructions). */
function contextBreakdown(reqJson) {
  const flat = (c) => (typeof c === "string" ? c : (Array.isArray(c) ? c.map((p) => p.text || "").join("\n") : ""));
  const files = [];
  const other = [];
  (reqJson.messages || []).forEach((msg, i) => {
    const text = flat(msg.content);
    if (i === 0 && msg.role === "user") {
      const marker = /Contents of (.+?) \(/g;
      const positions = [];
      let m;
      while ((m = marker.exec(text))) positions.push({ name: m[1], at: m.index });
      if (!positions.length) { other.push({ name: "user instructions", bytes: Buffer.byteLength(text) }); return; }
      if (text.slice(0, positions[0].at).trim()) other.push({ name: "instructions preamble", bytes: Buffer.byteLength(text.slice(0, positions[0].at)) });
      positions.forEach((p, j) => {
        const end = j + 1 < positions.length ? positions[j + 1].at : text.length;
        files.push({ name: path.basename(p.name), bytes: Buffer.byteLength(text.slice(p.at, end)) });
      });
    } else if (msg.role === "system") {
      for (const h of text.split(/^(?=# )/m)) {
        if (h.trim()) other.push({ name: (h.match(/^# (.+)$/m) || [, "system injection"])[1].slice(0, 40), bytes: Buffer.byteLength(h) });
      }
    }
  });
  return { files, other };
}

/** The report: every number measured from the captured request — identity and
 * headline first, then per-section totals, then detail. */
function printAudit(reqJson, inputTokens, version) {
  const tools = (reqJson.tools || [])
    .map((t) => ({ name: t.name, bytes: Buffer.byteLength(JSON.stringify(t)) }))
    .sort((a, b) => b.bytes - a.bytes);
  const toolsBytes = tools.reduce((s, t) => s + t.bytes, 0);
  const sysBytes = Buffer.byteLength(JSON.stringify(reqJson.system || []));
  const ctx = contextBreakdown(reqJson);
  const ctxBytes = [...ctx.files, ...ctx.other].reduce((s, x) => s + x.bytes, 0);
  const total = sysBytes + toolsBytes + ctxBytes;
  const pct = (b) => (total ? ((b / total) * 100).toFixed(1) : "0.0");

  console.log(`\n[agent-proxy] Claude Code ${version} · payload ${total.toLocaleString()} B` +
    (inputTokens != null ? ` · ${inputTokens.toLocaleString()} input tokens (provider-counted)` : ""));
  console.log(`\ntools: ${tools.length} definitions · ${toolsBytes.toLocaleString()} B, ranked by size`);
  const w = Math.max(...tools.map((t) => t.name.length), 4);
  for (const t of tools) console.log(`  ${t.name.padEnd(w)}  ${String(t.bytes).padStart(7)} B  ~${String(Math.round(t.bytes / 4)).padStart(5)} tok  ${pct(t.bytes).padStart(5)}%`);
  console.log(`\ninjected context: ${ctxBytes.toLocaleString()} B`);
  for (const f of ctx.files) console.log(`  ${f.bytes.toLocaleString().padStart(7)} B  ${f.name}`);
  for (const o of ctx.other) console.log(`  ${o.bytes.toLocaleString().padStart(7)} B  ${o.name}`);
  console.log(`\nsystem prompt: ${sysBytes.toLocaleString()} B`);
}

/** Emit the flagged output for one main request: --what × --raw × --to.
 * Default (no --what): nothing — the report above is the whole output. */
function emitOutput(reqJson, rawBody, c, inputTokens) {
  if (!FLAG.what) return;
  let content;
  if (FLAG.what === "system") {
    content = FLAG.raw ? JSON.stringify(reqJson.system, null, 2) : renderSystem(reqJson.system);
  } else {
    content = FLAG.raw ? rawBody : renderMarkdown({ reqJson, timestamp: new Date().toISOString(), method: c.method, path: c.path, statusCode: c.statusCode, headers: c.headers }, auditRequest(reqJson, inputTokens), c.markdown);
  }
  if (FLAG.to === "file") {
    fs.mkdirSync(DUMP_DIR, { recursive: true });
    const file = dumpName(FLAG.what, FLAG.raw ? "json" : "md");
    fs.writeFileSync(file, content);
    console.log(`\n[agent-proxy] wrote ${file}`);
  } else {
    console.log(`\n${content}`);
  }
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
  return `\`[image: ${src.media_type ?? "unknown"}, ${bytes} base64 chars — full data in .request.txt]\``;
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
    `${k}: ${REDACT.has(k.toLowerCase()) ? "[REDACTED]" : Array.isArray(v) ? v.join(", ") : v ?? ""}`
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
            printAudit(reqJson, inputTokens, VERSION);
            emitOutput(reqJson, body.toString("utf8"), { method: req.method ?? "POST", path: reqPath, statusCode: up.statusCode ?? 0, headers: req.headers, markdown }, inputTokens);
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
await new Promise((resolve) => server.listen(PORT, "127.0.0.1", () => {
  console.log(`[agent-proxy] listening on 127.0.0.1:${PORT}`);
  console.log(`[agent-proxy] forwarding to ${UPSTREAM_URL.href}`);
  resolve();
}));

// Spawn the resolved binary directly (no shell) so the inline JSON reaches
// claude unquoted-mangled. CLAUDE_BIN overrides the lookup.
const claudeBin = process.env.CLAUDE_BIN
  || execSync(process.platform === "win32" ? "where claude" : "command -v claude", { shell: true }).toString().trim().split(/\r?\n/)[0];
if (!claudeBin) {
  console.error("agent-proxy: claude not found on PATH — set CLAUDE_BIN");
  process.exit(1);
}

const inlineSettings = JSON.stringify({ env: { ANTHROPIC_BASE_URL: `http://127.0.0.1:${PORT}` } });
const child = spawn(claudeBin, ["-p", "--settings", inlineSettings, FLAG.prompt], {
  cwd: process.cwd(),
  stdio: ["ignore", "ignore", "ignore"],
});
console.log(`[agent-proxy] probing: one headless claude run`);

await new Promise((r) => child.on("exit", r));
await new Promise((r) => server.close(r));
