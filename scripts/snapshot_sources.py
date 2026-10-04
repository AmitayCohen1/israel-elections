"""Snapshot every registered source and tell us what changed.

Reads data/sources.json (the per-list source registry), fetches each non-null
URL (website / platform_url / positions_url), and keeps one snapshot per source
under data/snapshots/<slug>/<field>.json:

    { url, fetched_at, hash, prev_hash, changed_at, text }

HTML is reduced to visible text before hashing so ad-rotations in markup don't
ring the bell; PDFs are hashed as bytes and saved next to the json. A rerun
prints only the sources whose hash moved — that printout is the change feed the
future cron job will post. Nothing here publishes anything: changed text still
goes through extraction + human review before it touches positions.
"""

import hashlib
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SNAP = ROOT / "data" / "snapshots"
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) mi-ratz/1.0 (civic info site)"}
FIELDS = ("website", "platform_url", "positions_url")


class Text(HTMLParser):
    """Visible text only: scripts, styles and tags fall away."""

    def __init__(self):
        super().__init__()
        self.parts: list[str] = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript", "svg"):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip and data.strip():
            self.parts.append(data.strip())


def fetch(url: str) -> tuple[bytes, str]:
    # Hebrew paths (…/מצע) must be percent-encoded before urllib will send them.
    p = urllib.parse.urlsplit(url)
    url = urllib.parse.urlunsplit((p.scheme, p.netloc, urllib.parse.quote(p.path), urllib.parse.quote(p.query, safe="=&"), p.fragment))
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read(), r.headers.get_content_type()


def main() -> None:
    sources = json.loads((ROOT / "data" / "sources.json").read_text())
    changed, failed, fresh = [], [], 0

    for slug, s in sources.items():
        for field in FIELDS:
            url = s.get(field)
            if not url:
                continue
            out = SNAP / slug / f"{field}.json"
            out.parent.mkdir(parents=True, exist_ok=True)
            prev = json.loads(out.read_text()) if out.exists() else {}
            try:
                body, ctype = fetch(url)
            except Exception as err:
                failed.append((slug, field, url, str(err)[:80]))
                continue

            if "pdf" in ctype or url.lower().endswith(".pdf"):
                (out.parent / f"{field}.pdf").write_bytes(body)
                text = ""  # extraction comes later in the pipeline
                digest = hashlib.sha256(body).hexdigest()
            else:
                p = Text()
                p.feed(body.decode("utf-8", "replace"))
                text = re.sub(r"\s+", " ", " ".join(p.parts))
                digest = hashlib.sha256(text.encode()).hexdigest()

            now = datetime.now(timezone.utc).isoformat(timespec="seconds")
            moved = prev.get("hash") != digest
            out.write_text(
                json.dumps(
                    {
                        "url": url,
                        "fetched_at": now,
                        "hash": digest,
                        "prev_hash": prev.get("hash"),
                        "changed_at": now if moved else prev.get("changed_at", now),
                        "text": text,
                    },
                    ensure_ascii=False,
                )
            )
            fresh += 1
            if moved and prev:
                changed.append((slug, field, url))
            time.sleep(0.5)

    print(f"snapshotted {fresh} sources")
    if changed:
        print("CHANGED since last run:")
        for slug, field, url in changed:
            print(f"  {slug:24} {field:14} {url}")
    if failed:
        print("failed:", file=sys.stderr)
        for slug, field, url, err in failed:
            print(f"  {slug:24} {field:14} {err}  {url}", file=sys.stderr)


if __name__ == "__main__":
    main()
