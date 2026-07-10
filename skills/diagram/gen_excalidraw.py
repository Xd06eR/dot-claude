#!/usr/bin/env python3
"""Generate an editable .excalidraw scene from a mermaid flowchart.

Reads a .mmd path (arg 1), writes .excalidraw JSON to stdout.
Dependency-free: standard library only.

ponytail: regex extraction of the common flowchart forms only
(A[Label], A(Label), A{Label}, A[(db)], and --> --- ==> -.-> edges with an
optional |label|). Subgraphs, class/style directives, and non-flowchart
diagram types are ignored. Upgrade path when a richer scene is needed:
the official @excalidraw/mermaid-to-excalidraw importer in a browser
(excalidraw.com menu -> "Mermaid to Excalidraw").
"""
import json
import random
import re
import sys

NODE_H = 60
NODE_W_MIN = 140
H_GAP = 90
V_GAP = 40
CHAR_W = 9  # approximate glyph width at fontSize 20, for box sizing

OP = re.compile(r"(-{2,}>|-{2,}|={2,}>|=+|-\.-*->|--[xo])")
NODE_TOK = re.compile(
    r"^([A-Za-z0-9_]+)\s*(?:[\[\(\{]+\s*\"?(.*?)\"?\s*[\]\)\}]+)?$"
)


def rid():
    return "%016x" % random.getrandbits(64)


def seed():
    return random.getrandbits(31)


def parse(src):
    """Return (direction, nodes{id:label}, edges[(src,dst,label)])."""
    direction = "TD"
    m = re.search(r"^\s*(?:flowchart|graph)\s+(LR|RL|TD|TB|BT)", src, re.M)
    if m:
        direction = "LR" if m.group(1) in ("LR", "RL") else "TD"
    nodes = {}
    edges = []

    def add_node(chunk):
        # drop a leading edge label |lbl| left over from "-->|lbl| B"
        chunk = re.sub(r"^\s*\|[^|]*\|\s*", "", chunk.strip())
        m = NODE_TOK.match(chunk)
        if not m:
            return None
        nid, lbl = m.group(1), (m.group(2) or "").strip()
        if nid not in nodes or nodes[nid] == nid:
            nodes[nid] = lbl or nid
        return nid

    for line in src.splitlines():
        line = line.split("%%")[0].strip()
        if not line or re.match(
            r"^(flowchart|graph|subgraph|end|classDef|class|style|linkStyle)\b",
            line,
        ):
            continue
        # Split into alternating node / operator tokens; walk the chain so
        # "A --> B --> C" yields (A,B) and (B,C).
        toks = OP.split(line)
        prev = add_node(toks[0])
        i = 1
        while i + 1 < len(toks):
            seg = toks[i + 1]
            # An edge label rides as "|lbl|" at the head of the next segment.
            lbl = ""
            lm = re.match(r"\s*\|([^|]*)\|", seg)
            if lm:
                lbl = lm.group(1).strip()
            cur = add_node(seg)
            if prev and cur:
                edges.append((prev, cur, lbl))
            prev = cur
            i += 2
    return direction, nodes, edges


def layer_of(nodes, edges):
    """Longest-path layering from source nodes (in-degree 0).

    ponytail: naive layering, capped iterations. Cyclic graphs settle at
    whatever the cap produces; the user drags boxes to refine.
    """
    succ = {n: [] for n in nodes}
    indeg = {n: 0 for n in nodes}
    for s, d, _ in edges:
        succ[s].append(d)
        indeg[d] += 1
    layer = {n: 0 for n in nodes}
    for _ in range(len(nodes) + 1):
        changed = False
        for s, d, _ in edges:
            if layer[d] < layer[s] + 1:
                layer[d] = layer[s] + 1
                changed = True
        if not changed:
            break
    return layer


def base_elem(kind, x, y, w, h):
    return {
        "id": rid(),
        "type": kind,
        "x": x,
        "y": y,
        "width": w,
        "height": h,
        "angle": 0,
        "strokeColor": "#1e1e1e",
        "backgroundColor": "transparent",
        "fillStyle": "solid",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "roughness": 1,
        "opacity": 100,
        "groupIds": [],
        "frameId": None,
        "roundness": {"type": 3},
        "seed": seed(),
        "version": 1,
        "versionNonce": seed(),
        "isDeleted": False,
        "boundElements": [],
        "updated": 1,
        "link": None,
        "locked": False,
    }


def build(direction, nodes, edges):
    layer = layer_of(nodes, edges)
    # Group node ids by layer, preserving insertion order within a layer.
    by_layer = {}
    for n in nodes:
        by_layer.setdefault(layer[n], []).append(n)

    rects = {}
    elements = []
    for lv in sorted(by_layer):
        for idx, nid in enumerate(by_layer[lv]):
            label = nodes[nid]
            w = max(NODE_W_MIN, len(label) * CHAR_W + 30)
            if direction == "LR":
                x = lv * (NODE_W_MIN + H_GAP + 60)
                y = idx * (NODE_H + V_GAP)
            else:
                x = idx * (NODE_W_MIN + H_GAP)
                y = lv * (NODE_H + V_GAP + 30)
            rect = base_elem("rectangle", x, y, w, NODE_H)
            text = base_elem("text", x, y, w, NODE_H)
            text.update(
                {
                    "roundness": None,
                    "boundElements": None,
                    "fontSize": 20,
                    "fontFamily": 1,
                    "text": label,
                    "textAlign": "center",
                    "verticalAlign": "middle",
                    "containerId": rect["id"],
                    "originalText": label,
                    "lineHeight": 1.25,
                    "baseline": 18,
                }
            )
            rect["boundElements"] = [{"type": "text", "id": text["id"]}]
            rects[nid] = rect
            elements.append(rect)
            elements.append(text)

    for s, d, lbl in edges:
        rs, rd = rects.get(s), rects.get(d)
        if not rs or not rd:
            continue
        sx, sy = rs["x"] + rs["width"] / 2, rs["y"] + rs["height"] / 2
        dx, dy = rd["x"] + rd["width"] / 2, rd["y"] + rd["height"] / 2
        arrow = base_elem("arrow", sx, sy, abs(dx - sx), abs(dy - sy))
        arrow.update(
            {
                "roundness": {"type": 2},
                "points": [[0, 0], [dx - sx, dy - sy]],
                "lastCommittedPoint": None,
                "startBinding": {"elementId": rs["id"], "focus": 0, "gap": 4},
                "endBinding": {"elementId": rd["id"], "focus": 0, "gap": 4},
                "startArrowhead": None,
                "endArrowhead": "arrow",
            }
        )
        rs["boundElements"].append({"type": "arrow", "id": arrow["id"]})
        rd["boundElements"].append({"type": "arrow", "id": arrow["id"]})
        elements.append(arrow)
        if lbl:
            tw = len(lbl) * CHAR_W + 10
            t = base_elem(
                "text",
                (sx + dx) / 2 - tw / 2,
                (sy + dy) / 2 - 12,
                tw,
                24,
            )
            t.update(
                {
                    "roundness": None,
                    "boundElements": None,
                    "fontSize": 16,
                    "fontFamily": 1,
                    "text": lbl,
                    "textAlign": "center",
                    "verticalAlign": "middle",
                    "containerId": None,
                    "originalText": lbl,
                    "lineHeight": 1.25,
                    "baseline": 14,
                }
            )
            elements.append(t)

    return {
        "type": "excalidraw",
        "version": 2,
        "source": "diagram-skill",
        "elements": elements,
        "appState": {"gridSize": None, "viewBackgroundColor": "#ffffff"},
        "files": {},
    }


def main():
    src = open(sys.argv[1], encoding="utf-8").read()
    direction, nodes, edges = parse(src)
    if not nodes:
        sys.stderr.write("no flowchart nodes found; skip .excalidraw\n")
        sys.exit(2)
    scene = build(direction, nodes, edges)
    json.dump(scene, sys.stdout, ensure_ascii=False, indent=2)


def _selfcheck():
    """Structural invariants: valid refs, no dangling bindings."""
    src = "graph LR\n A[One] --> B{Two?}\n B -->|yes| C[Three]\n B -->|no| A\n"
    open("/tmp/_dgt.mmd", "w").write(src)
    sys.argv = ["x", "/tmp/_dgt.mmd"]
    direction, nodes, edges = parse(src)
    assert direction == "LR", direction
    assert set(nodes) == {"A", "B", "C"}, nodes
    assert nodes["A"] == "One" and nodes["B"] == "Two?", nodes
    assert ("B", "C", "yes") in edges and ("B", "A", "no") in edges, edges
    scene = build(direction, nodes, edges)
    ids = {e["id"] for e in scene["elements"]}
    for e in scene["elements"]:
        if e["type"] == "arrow":
            assert e["startBinding"]["elementId"] in ids
            assert e["endBinding"]["elementId"] in ids
        if e["type"] == "text" and e.get("containerId"):
            assert e["containerId"] in ids
    json.dumps(scene)  # serializable
    print("selfcheck OK: %d elements" % len(scene["elements"]))


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--selfcheck":
        _selfcheck()
    else:
        main()
