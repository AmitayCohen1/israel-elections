"""Validate an extraction draft: every quote must exist verbatim (after light
normalization) in one of the list's snapshot texts.

    python3 scripts/validate_extraction.py <slug> [<slug> ...]

Exit code 0 only when every quote of every given slug is found.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def norm(s: str) -> str:
    s = s.replace("״", '"').replace("׳", "'").replace("–", "-").replace("—", "-").replace("־", "-")
    return re.sub(r"\s+", " ", s).strip()


def texts_for(slug: str) -> list[str]:
    out = []
    for f in (ROOT / "data" / "snapshots" / slug).glob("*.json"):
        t = json.loads(f.read_text()).get("text") or ""
        if t:
            out.append(norm(t))
    return out


def main() -> int:
    bad_total = 0
    for slug in sys.argv[1:]:
        draft = json.loads((ROOT / "data" / "extracted" / f"{slug}.json").read_text())
        snaps = texts_for(slug)
        ok = bad = 0
        for p in draft["positions"]:
            # PDF-sourced quotes have no snapshot text to check against; they are
            # marked explicitly and reviewed by hand instead.
            if p.get("quote_validation") == "manual-pdf":
                continue
            if any(norm(p["quote"]) in s for s in snaps):
                ok += 1
            else:
                bad += 1
                print(f"{slug}: MISSING {p['topic']} → {p['quote'][:70]}")
        print(f"{slug}: {ok} found, {bad} missing, {len(draft['positions']) - ok - bad} manual-pdf")
        bad_total += bad
    return 1 if bad_total else 0


if __name__ == "__main__":
    sys.exit(main())
