"""Fold data/research/batch*.json into data/sources.json (the registry the snapshot script reads).

Only the fields a batch reports are overwritten; media and anything else stay. Safe to re-run.
"""
import glob
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIELDS = ("website", "platform_url", "positions_url", "platform_kind", "status", "notes")

src_path = ROOT / "data" / "sources.json"
raw = src_path.read_text()
indent = 1 if raw.startswith('{\n "') else 2
src = json.loads(raw)

merged = []
for f in sorted(glob.glob(str(ROOT / "data" / "research" / "batch*.json"))):
    for slug, rec in json.load(open(f)).items():
        if slug not in src:
            print(f"skip {slug}: not in registry")
            continue
        for k in FIELDS:
            if k in rec:
                src[slug][k] = rec[k]
        merged.append(slug)

src_path.write_text(json.dumps(src, ensure_ascii=False, indent=indent) + "\n")
print(f"merged {len(merged)} lists:", ", ".join(merged))
