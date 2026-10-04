"""Resolve a position-map axis: every coded cell must point at exactly one stored position
whose quote we can show. Prints the table; exit 1 if any cell is ambiguous or missing.

    python3 scripts/resolve_axis.py security-territory [religion-draft ...]
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def sources(slug):
    """The extraction when there is one, then the platform file: a list can have both, and a cell may point at either."""
    out = []
    ext = ROOT / "data" / "extracted" / f"{slug}.json"
    if ext.exists():
        d = json.loads(ext.read_text())
        out.append((d["status"], [{**p, "source_url": p.get("source_url") or d["source_url"]} for p in d["positions"]]))
    plat = ROOT / "data" / "platforms" / f"{slug}.json"
    if plat.exists():
        d = json.loads(plat.read_text())
        out.append(("platforms", [{**p, "stance": p["point"]} for p in d["positions"]]))
    return out


def main():
    bad = 0
    for axis_id in sys.argv[1:]:
        ax = json.loads((ROOT / "data" / "axes" / f"{axis_id}.json").read_text())
        print(f"\n## {ax['question']}")
        for lv in ax["scale"]:
            print(f"  {lv['level']} = {lv['label']}")
        for c in sorted(ax["coding"], key=lambda c: c["level"]):
            status, hit = "none", []
            for status, ps in sources(c["slug"]):
                hit = [p for p in ps if p["topic"] == ax["topic"] and c["match"] in p["stance"]]
                if hit:
                    break
            if len(hit) != 1:
                bad += 1
                print(f"  !! {c['slug']}: {len(hit)} matches for '{c['match']}'")
                continue
            p = hit[0]
            flag = "" if status in ("approved", "platforms") else f" [{status}]"
            print(f"  L{c['level']} {c['slug']}{flag}: {p['quote'][:90]}")
    return 1 if bad else 0


sys.exit(main())
