"""Enrich data/lists.json with Wikipedia bios + Commons photos and Knesset records.

Writes data/candidates_enriched.json keyed by "<list-slug>:<position>".
Raw API responses are cached under scripts/raw/cache/ so re-runs are cheap.
"""
import hashlib
import json
import re
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / "raw" / "cache"
CACHE.mkdir(parents=True, exist_ok=True)
DATA = ROOT.parent / "data"
UA = "Mozilla/5.0 (israel-elections candidate directory; research script)"

HE_API = "https://he.wikipedia.org/w/api.php"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
KNESSET = "https://knesset.gov.il/OdataV4/ParliamentInfo"

# How deep into each slate we try to find a Wikipedia article for unlinked candidates.
GUESS_DEPTH = {"main": 20, "other": 3}
POLITICAL = re.compile(r"פוליטיקא|חבר(?:ת)? הכנסת|חבר(?:ת)? כנסת|שר(?:ת)? |מפלג|ח\"כ|ראש עיר|ראש העיר|ראש מועצ|אלוף|תת-אלוף|עיתונא|פעיל|עורך דין|עורכת דין|רב |כלכלן|כלכלנית|יזם|מנכ\"ל")
MK_POSITIONS = {43, 61}
# Reviewed by hand: namesakes, not the candidate. Key = "<list-slug>:<position>".
REJECT = {"otzma-yehudit:18", "hakahal:2", "partnership-for-all:4", "reservists-economic:19"}
# "X היה ..." / "X הייתה ..." in the opening clause = a deceased person, never a living candidate.
DECEASED = re.compile(r"^[^.,]{0,60}?\s(?:היה|הייתה)\s")
ROLE_POSITIONS = {39: "שר", 57: "שרה", 40: "סגן שר", 59: "סגנית שר", 285079: "סגן שרה", 45: "ראש הממשלה",
                  50: "סגן ראש הממשלה", 65: "סגנית ראש הממשלה", 31: "משנה לראש הממשלה", 51: "מ\"מ ראש הממשלה",
                  73: "ראש הממשלה החילופי", 122: "יושב-ראש הכנסת", 123: "יושבת-ראש הכנסת",
                  131: "ראש האופוזיציה", 130: "ראשת האופוזיציה", 41: "יו\"ר ועדה", 48: "יו\"ר סיעה"}


def get_json(url: str, params: dict | None = None, retries: int = 6) -> dict:
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    key = CACHE / (hashlib.sha1(url.encode()).hexdigest() + ".json")
    if key.exists():
        return json.loads(key.read_text())
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = json.loads(r.read().decode("utf-8"))
            key.write_text(json.dumps(data, ensure_ascii=False))
            if "wiki" in url:
                time.sleep(0.5)  # be polite to Wikimedia
            return data
        except Exception as e:  # noqa: BLE001
            if attempt == retries - 1:
                raise
            time.sleep(5 * (attempt + 1))
    raise RuntimeError("unreachable")


def chunks(xs: list, n: int):
    for i in range(0, len(xs), n):
        yield xs[i:i + n]


# ---------------------------------------------------------------- Wikipedia

def wiki_pages(titles: list[str]) -> dict[str, dict]:
    """Resolve titles (following redirects) -> page info with intro extract, image, wikidata id."""
    out: dict[str, dict] = {}
    for batch in chunks(sorted(set(titles)), 20):
        d = get_json(HE_API, {
            "action": "query", "format": "json", "formatversion": 2, "redirects": 1,
            "titles": "|".join(batch),
            "prop": "extracts|pageimages|pageprops|info",
            "exintro": 1, "explaintext": 1, "exlimit": "max",
            "piprop": "name", "inprop": "url",
        })
        q = d.get("query", {})
        alias = {t: t for t in batch}
        for n in q.get("normalized", []):
            alias[n["from"]] = n["to"]
        redirects = {r["from"]: r["to"] for r in q.get("redirects", [])}
        pages = {p["title"]: p for p in q.get("pages", [])}
        for t in batch:
            final = alias.get(t, t)
            final = redirects.get(final, final)
            p = pages.get(final)
            if not p or p.get("missing") or "disambiguation" in p.get("pageprops", {}):
                continue
            out[t] = {
                "title": p["title"],
                "url": p.get("fullurl") or f"https://he.wikipedia.org/wiki/{urllib.parse.quote(p['title'])}",
                "extract": (p.get("extract") or "").strip(),
                "image_file": p.get("pageimage"),
                "wikidata": p.get("pageprops", {}).get("wikibase_item"),
            }
    return out


def commons_images(files: list[str]) -> dict[str, dict]:
    """Only images hosted on Commons (freely licensed) — he-wiki local files may be fair-use."""
    out: dict[str, dict] = {}
    for batch in chunks(sorted(set(files)), 20):
        d = get_json(COMMONS_API, {
            "action": "query", "format": "json", "formatversion": 2,
            "titles": "|".join("File:" + f for f in batch),
            "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": 480,
        })
        q = d.get("query", {})
        alias = {n["to"]: n["from"] for n in q.get("normalized", [])}
        for p in q.get("pages", []):
            if p.get("missing") or not p.get("imageinfo"):
                continue
            ii = p["imageinfo"][0]
            meta = ii.get("extmetadata", {})
            artist = re.sub(r"<[^>]+>", "", meta.get("Artist", {}).get("value", "")).strip()
            name = alias.get(p["title"], p["title"]).removeprefix("File:").removeprefix("קובץ:")
            out[name] = {
                "url": (ii.get("thumburl") or ii["url"]).split("?")[0],
                "page": ii.get("descriptionurl"),
                "license": meta.get("LicenseShortName", {}).get("value"),
                "artist": artist[:120] or None,
            }
    return out


def name_guesses(official: str) -> list[str]:
    """'בן ארי מירב' -> ['מירב בן ארי', 'ארי מירב בן'...]: surname is the first 1-2 tokens."""
    t = official.split()
    guesses = []
    for k in (1, 2):
        if len(t) > k:
            surname, given = t[:k], t[k:]
            guesses.append(" ".join([given[0]] + surname))
            if len(given) > 1:
                guesses.append(" ".join(given + surname))
    return guesses


def tidy_extract(text: str) -> str:
    # Drop the parentheticals in the opening sentence: birth dates, Hebrew-calendar dates, foreign spellings.
    head, sep, tail = text.partition(". ")
    text = re.sub(r"\s*\([^()]*\)", "", head) + sep + tail
    text = re.sub(r"[\u0591-\u05C7]", "", text)  # nikud, so names render consistently
    text = re.sub(r"\s+", " ", text).strip()
    sentences = re.split(r"(?<=[.!?])\s+", text)
    out = ""
    for s in sentences:
        if len(out) + len(s) > 700:
            break
        out += (" " if out else "") + s
    return out or text[:700]


# ---------------------------------------------------------------- Knesset

def knesset_all(entity: str, flt: str | None = None) -> list[dict]:
    """The API pages at 100 rows and returns @odata.nextLink for the rest."""
    params = {"$filter": flt} if flt else None
    d = get_json(f"{KNESSET}/{entity}", params)
    rows = list(d["value"])
    while d.get("@odata.nextLink"):
        d = get_json(d["@odata.nextLink"])
        rows += d["value"]
    return rows


def knesset_index():
    people = knesset_all("KNS_Person")
    positions = knesset_all("KNS_PersonToPosition", "PositionID ne 42 and PositionID ne 66 and PositionID ne 67 and PositionID ne 663")
    by_person: dict[int, list[dict]] = {}
    for p in positions:
        by_person.setdefault(p["PersonID"], []).append(p)
    mks = {pid: ps for pid, ps in by_person.items() if any(x["PositionID"] in MK_POSITIONS for x in ps)}
    return {p["Id"]: p for p in people if p["Id"] in mks}, mks


def norm(s: str) -> str:
    return re.sub(r"[\"'׳״`\-־]", "", s or "").strip()


def match_mk(official: str, people: dict[int, dict], positions: dict[int, list[dict]]):
    """Strict: official name must be exactly '<LastName> <FirstName...>' and the person must have
    served since the 12th Knesset (filters namesakes from the early decades)."""
    off = norm(official).split()
    best = None
    for pid, p in people.items():
        last = norm(p["LastName"]).split()
        first = norm(p["FirstName"]).split()
        if not last or not first or off[:len(last)] != last or off[len(last):len(last) + 1] != first[:1]:
            continue
        terms = [x["KnessetNum"] for x in positions[pid] if x["PositionID"] in MK_POSITIONS and x["KnessetNum"]]
        if not terms or max(terms) < 12:
            continue
        score = (bool(p.get("IsCurrent")), max(terms))
        if best is None or score > best[0]:
            best = (score, pid)
    return best[1] if best else None


def knesset_record(pid: int, person: dict, positions: list[dict]) -> dict:
    terms = sorted({x["KnessetNum"] for x in positions if x["PositionID"] in MK_POSITIONS and x["KnessetNum"]})
    factions = []
    for x in sorted(positions, key=lambda x: (x["KnessetNum"] or 0, x["StartDate"] or "")):
        if x["PositionID"] == 54 and x.get("FactionName") and (x["KnessetNum"], x["FactionName"]) not in factions:
            factions.append((x["KnessetNum"], x["FactionName"]))
    roles = []
    for x in sorted(positions, key=lambda x: x["StartDate"] or ""):
        label = ROLE_POSITIONS.get(x["PositionID"])
        if not label:
            continue
        detail = x.get("GovMinistryName") or x.get("CommitteeName") or x.get("FactionName") or x.get("DutyDesc")
        roles.append({
            "role": label, "detail": detail, "knesset": x["KnessetNum"],
            "start": (x["StartDate"] or "")[:10], "end": (x["FinishDate"] or "")[:10] or None,
        })
    bills = get_json(f"{KNESSET}/KNS_BillInitiator", {"$filter": f"PersonID eq {pid} and IsInitiator eq true", "$count": "true", "$top": 0})
    return {
        "person_id": pid,
        "is_current": bool(person.get("IsCurrent")),
        "female": person.get("GenderDesc") == "נקבה",
        "terms": terms,
        "factions": [{"knesset": k, "name": n} for k, n in factions],
        "roles": roles,
        "bills_initiated": bills.get("@odata.count", 0),
        "url": f"https://main.knesset.gov.il/mk/apps/mk/mk-personal-details/{pid}",
    }


# ---------------------------------------------------------------- main

def main() -> None:
    lists = json.loads((DATA / "lists.json").read_text())

    # 1. Wikipedia: linked titles + guesses for unlinked candidates in realistic slots.
    want: dict[str, list[str]] = {}
    for l in lists:
        for c in l["candidates"]:
            k = f"{l['slug']}:{c['position']}"
            if c["wiki_title"]:
                want[k] = [c["wiki_title"]]
            elif c["official_name"] and c["position"] <= GUESS_DEPTH[l["tier"]]:
                want[k] = name_guesses(c["official_name"])
    pages = wiki_pages([t for ts in want.values() for t in ts])
    print(f"wiki: {len(pages)} pages resolved from {sum(len(v) for v in want.values())} titles")

    # A page claimed by two different candidates is ambiguous: drop it for guessed matches.
    wiki_for: dict[str, dict] = {}
    for l in lists:
        for c in l["candidates"]:
            k = f"{l['slug']}:{c['position']}"
            for t in want.get(k, []):
                p = pages.get(t)
                if not p:
                    continue
                guessed = not c["wiki_title"]
                if guessed and not POLITICAL.search(p["extract"][:600]):
                    continue
                wiki_for[k] = {**p, "guessed": guessed}
                break

    images = commons_images([p["image_file"] for p in wiki_for.values() if p.get("image_file")])
    print(f"commons: {len(images)} free images of {sum(1 for p in wiki_for.values() if p.get('image_file'))} page images")

    # 2. Knesset records.
    people, positions = knesset_index()
    print(f"knesset: {len(people)} people with MK history")
    jobs = []
    for l in lists:
        for c in l["candidates"]:
            if not c["official_name"]:
                continue
            pid = match_mk(c["official_name"], people, positions)
            if pid:
                k = f"{l['slug']}:{c['position']}"
                if k not in REJECT:
                    jobs.append((k, pid))
    with ThreadPoolExecutor(8) as ex:
        records = dict(zip([k for k, _ in jobs], ex.map(lambda j: knesset_record(j[1], people[j[1]], positions[j[1]]), jobs)))
    print(f"knesset: {len(records)} candidates matched to MK records")

    # 3. Former/current MKs without a Wikipedia match: try "<First> <Last>" from the Knesset record.
    mk_titles = {}
    for k, rec in records.items():
        if k not in wiki_for:
            person = people[rec["person_id"]]
            mk_titles[k] = f"{person['FirstName'].strip()} {person['LastName'].strip()}"
    extra = wiki_pages(list(mk_titles.values()))
    for k, t in mk_titles.items():
        pg = extra.get(t)
        if pg and re.search(r"חבר(?:ת)? הכנסת|חבר(?:ת)? כנסת", pg["extract"][:800]):
            wiki_for[k] = {**pg, "guessed": True}
    images.update(commons_images([wiki_for[k]["image_file"] for k in mk_titles if k in wiki_for and wiki_for[k].get("image_file")]))
    print(f"wiki: +{sum(1 for k in mk_titles if k in wiki_for)} pages via Knesset names")

    for k in list(wiki_for):
        if k in REJECT or (wiki_for[k]["guessed"] and DECEASED.search(tidy_extract(wiki_for[k]["extract"]))):
            print(f"  dropping {k}: {wiki_for[k]['title']}")
            wiki_for.pop(k)
            records.pop(k, None)

    out = {}
    for l in lists:
        for c in l["candidates"]:
            k = f"{l['slug']}:{c['position']}"
            w = wiki_for.get(k)
            entry = {}
            if w:
                entry["wiki"] = {"title": w["title"], "url": w["url"], "bio": tidy_extract(w["extract"]),
                                 "wikidata": w["wikidata"], "guessed": w["guessed"]}
                img = images.get(w.get("image_file") or "")
                if img:
                    entry["image"] = img
            if k in records:
                entry["knesset"] = records[k]
            if entry:
                out[k] = entry
    (DATA / "candidates_enriched.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(f"wrote {len(out)} enriched candidates; {sum(1 for v in out.values() if 'image' in v)} with photos")


if __name__ == "__main__":
    main()
