"""Find more free candidate photos.

Phase A — candidates whose Wikipedia article has no usable page image:
        follow the article to its Wikidata item and take P18 (portrait) or the
        first file in its Commons category (P373). The article guarantees identity.
Phase B — candidates with no article at all: search Wikidata for an item whose
        Hebrew label/alias EXACTLY matches the name, is a human (P31=Q5), carries a
        free portrait (P18), and looks political (he description keywords, or has
        held a position P39). Everything accepted is printed for review.

Only Commons-hosted files are taken, as everywhere in this project.
"""

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) mi-ratz/1.0 (civic info site)"}
HE_API = "https://he.wikipedia.org/w/api.php"
WD_API = "https://www.wikidata.org/w/api.php"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"

# A he-description that makes a namesake plausible as this election's candidate.
POLITICAL = re.compile(
    r"פוליטיקא|חבר[ת]? ה?כנסת|ראש ה?עיר|ראש ה?מועצ|שר[ה]? |סגנ|ח\"כ|מפלג|אלוף|תא\"ל|קצינ|רב |רבנ|דיינ|פעיל|עיתונא|משפטנ|עורכ[ת]? דין|כלכלנ|פרופסור|ד\"ר|איש ציבור|אשת ציבור"
)


def api(url: str, **params) -> dict:
    params = {"format": "json", "formatversion": 2, **params}
    req = urllib.request.Request(f"{url}?{urllib.parse.urlencode(params)}", headers=HEADERS)
    for attempt in range(8):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as err:
            if attempt == 7:
                raise
            if err.code == 429:
                # Honour Retry-After; Wikidata hands these out freely.
                wait = int(err.headers.get("Retry-After") or 0) or 20 * (attempt + 1)
                time.sleep(min(wait, 120))
            else:
                time.sleep(2 * (attempt + 1))
        except Exception:
            if attempt == 7:
                raise
            time.sleep(2 * (attempt + 1))
    return {}


def chunks(xs, n):
    for i in range(0, len(xs), n):
        yield xs[i : i + n]


def commons_images(files: list[str]) -> dict[str, dict]:
    """File name -> {url, page, license, artist} for Commons-hosted files only."""
    out = {}
    clean = lambda s: re.sub(r"<[^>]+>", "", s or "").strip()  # noqa: E731
    for batch in chunks(sorted({f for f in files if f}), 40):
        d = api(
            COMMONS_API,
            action="query",
            titles="|".join(f"File:{f}" for f in batch),
            prop="imageinfo",
            iiprop="url|extmetadata",
            iiurlwidth=500,
        )
        for p in d.get("query", {}).get("pages", []):
            if p.get("missing") or not p.get("imageinfo"):
                continue
            ii = p["imageinfo"][0]
            meta = ii.get("extmetadata", {})
            out[p["title"].removeprefix("File:").replace("_", " ")] = {
                # Commons now appends ?utm_… tracking params; next/image rejects queried URLs.
                "url": (ii.get("thumburl") or ii["url"]).split("?")[0],
                "page": ii["descriptionurl"],
                "license": clean(meta.get("LicenseShortName", {}).get("value")),
                "artist": clean(meta.get("Artist", {}).get("value"))[:80],
            }
        time.sleep(0.3)
    return out


def entities(qids: list[str]) -> dict[str, dict]:
    out = {}
    for batch in chunks(qids, 50):
        d = api(WD_API, action="wbgetentities", ids="|".join(batch), props="claims|descriptions|labels|aliases")
        out.update(d.get("entities", {}))
        time.sleep(0.3)
    return out


def claim(ent: dict, prop: str):
    c = ent.get("claims", {}).get(prop)
    try:
        return c[0]["mainsnak"]["datavalue"]["value"]
    except (TypeError, KeyError, IndexError):
        return None


def norm(s: str | None) -> str:
    if not s:
        return ""
    return re.sub(r"\s+", " ", s.replace("״", '"').replace("׳", "'").replace("־", " ").replace("-", " ")).strip()


def main() -> None:
    lists = json.loads((ROOT / "data" / "lists.json").read_text())
    enriched_path = ROOT / "data" / "candidates_enriched.json"
    E = json.loads(enriched_path.read_text())

    # The one known bad article match: the event page, not the person.
    bad = [k for k, v in E.items() if (v.get("wiki") or {}).get("title", "").startswith("פרשת")]
    for k in bad:
        print(f"dropping event-article match for {k}: {E[k]['wiki']['title']}")
        E[k].pop("wiki", None)

    todo_a, todo_b = [], []
    for l in lists:
        for c in l["candidates"]:
            key = f"{l['slug']}:{c['position']}"
            e = E.get(key) or {}
            if e.get("image"):
                continue
            if e.get("wiki"):
                todo_a.append((key, e["wiki"]["title"]))
            else:
                name = c.get("display_name") or c.get("official_name")
                if name:
                    todo_b.append((key, name))

    # ---- Phase A: article -> QID -> P18 / Commons category
    print(f"phase A: {len(todo_a)} candidates with an article but no photo")
    qid_for = {}
    for batch in chunks([t for _, t in todo_a], 50):
        d = api(HE_API, action="query", titles="|".join(batch), prop="pageprops", redirects=1)
        for p in d.get("query", {}).get("pages", []):
            q = (p.get("pageprops") or {}).get("wikibase_item")
            if q:
                qid_for[p["title"]] = q
        time.sleep(0.3)
    ents = entities(sorted(set(qid_for.values())))

    want_files: dict[str, str] = {}  # key -> file name
    cats: dict[str, str] = {}  # key -> commons category
    for key, title in todo_a:
        ent = ents.get(qid_for.get(title, ""), {})
        p18 = claim(ent, "P18")
        if p18:
            want_files[key] = p18
        else:
            cat = claim(ent, "P373")
            if cat:
                cats[key] = cat

    for key, cat in cats.items():
        d = api(
            COMMONS_API,
            action="query",
            list="categorymembers",
            cmtitle=f"Category:{cat}",
            cmtype="file",
            cmlimit=5,
        )
        files = [m["title"].removeprefix("File:") for m in d.get("query", {}).get("categorymembers", [])]
        files = [f for f in files if f.lower().endswith((".jpg", ".jpeg", ".png"))]
        if files:
            want_files[key] = files[0]
        time.sleep(0.3)

    # ---- Phase B: exact-name Wikidata search for everyone else
    print(f"phase B: searching Wikidata for {len(todo_b)} candidates with no article")
    # Searches already made survive a crash or rerun in this cache: name -> qid or "".
    cache_path = ROOT / "scripts" / "raw" / "wd_search_cache.json"
    cache: dict[str, str] = json.loads(cache_path.read_text()) if cache_path.exists() else {}
    hits: dict[str, str] = {}  # key -> qid
    done = 0
    for key, name in todo_b:
        if name not in cache:
            d = api(WD_API, action="wbsearchentities", search=name, language="he", uselang="he", type="item", limit=5)
            cache[name] = ""
            for hit in d.get("search", []):
                if norm(hit.get("label") or "") == norm(name) or any(norm(a) == norm(name) for a in (hit.get("aliases") or [])):
                    cache[name] = hit["id"]
                    break
            done += 1
            if done % 50 == 0:
                cache_path.write_text(json.dumps(cache, ensure_ascii=False))
                print(f"  …{done} searched", file=sys.stderr)
            time.sleep(0.4)
        if cache[name]:
            hits[key] = cache[name]
    cache_path.write_text(json.dumps(cache, ensure_ascii=False))

    ents_b = entities(sorted(set(hits.values())))
    accepted_b = []
    for key, qid in hits.items():
        ent = ents_b.get(qid, {})
        human = claim(ent, "P31") or {}
        if human.get("id") != "Q5":
            continue
        p18 = claim(ent, "P18")
        if not p18:
            continue
        desc = ent.get("descriptions", {}).get("he", {}).get("value", "")
        if not (POLITICAL.search(desc) or "P39" in ent.get("claims", {})):
            continue
        want_files[key] = p18
        accepted_b.append((key, qid, desc))

    print(f"phase B accepted {len(accepted_b)} (exact name + human + portrait + political):")
    for key, qid, desc in accepted_b:
        print(f"  {key:28} {qid:12} {desc[:60]}")

    # Namesakes caught in human review (2026-10-02): the famous person is not the candidate.
    # likud:45 Friedmann the cosmologist, reservists-economic:19 the late minister David Levy,
    # color-black:9 the late Ramatkal Moshe Levi, color-black:11 a judge, raam:64 Hezbollah's
    # Mohammad Raad, pirates:3 Dan Ariely the economist.
    REJECTED = {"likud:45", "reservists-economic:19", "color-black:9", "color-black:11", "raam:64", "pirates:3"}
    for key in REJECTED:
        want_files.pop(key, None)

    # ---- fetch Commons info and merge
    images = commons_images(list(want_files.values()))
    added = 0
    for key, f in want_files.items():
        img = images.get(f.replace("_", " "))
        if img:
            E.setdefault(key, {})["image"] = img
            added += 1

    enriched_path.write_text(json.dumps(E, ensure_ascii=False, indent=1))
    total = sum(1 for v in E.values() if v.get("image"))
    print(f"added {added} photos; total now {total}")


if __name__ == "__main__":
    main()
