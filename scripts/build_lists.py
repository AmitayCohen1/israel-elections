"""Build data/lists.json from raw source snapshots in scripts/raw/.

Sources:
- knessettv.json: full submitted slates (official order, surname-first) for the 15 main lists,
  extracted from Knesset TV's summary of the CEC submissions.
- wiki_he.txt: Hebrew Wikipedia "הבחירות לכנסת העשרים ושש" — ballot letters, colours,
  component parties, and linked names for the top slots of each list.
- wiki_en.txt: English Wikipedia party-lists page — CEC page links and heads of the small lists.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw"
OUT = ROOT.parent / "data" / "lists.json"

KTV_URL = "https://www.knesset.tv/main-articles/61384/94592/"
WIKI_HE_URL = "https://he.wikipedia.org/wiki/הבחירות_לכנסת_העשרים_ושש"

# Knesset TV heading -> (slug, Hebrew wiki section heading prefix, english name)
MAIN = {
    "הליכוד עם בנימין נתניהו לראשות הממשלה": ("likud", "[[הליכוד]]", "Likud"),
    "ישר! עם איזנקוט – מאחדים את ישראל": ("yashar", "[[ישר!]]", "Yashar!"),
    "ביחד בראשות נפתלי בנט": ("together", "[[ביחד (רשימה)|ביחד]]", "Together"),
    "הדמוקרטים בראשות יאיר גולן": ("democrats", "[[הדמוקרטים]]", "The Democrats"),
    "ישראל ביתנו – בראשות אביגדור ליברמן": ("yisrael-beiteinu", "[[ישראל ביתנו]]", "Yisrael Beiteinu"),
    "יהדות התורה – אגודת ישראל – דגל התורה": ("utj", "[[יהדות התורה]]", "United Torah Judaism"),
    "עוצמה יהודית": ("otzma-yehudit", "[[עוצמה יהודית]]", "Otzma Yehudit"),
    "ש\"ס": ("shas", "[[מפלגת ש\"ס]]", "Shas"),
    "הרשימה המשותפת": ("joint-list", "[[הרשימה המשותפת]]", "Joint List"),
    "רע\"ם – הרשימה הערבית המאוחדת": ("raam", "[[הרשימה הערבית המאוחדת]]", "United Arab List (Ra'am)"),
    "הציונות הדתית בראשות בצלאל סמוטריץ' וזהות בראשון משה פייגלין": ("rzp-zehut", "[[הציונות הדתית (סיעה)", "Religious Zionism–Zehut"),
    "כחול לבן": ("blue-and-white", "[[כחול לבן חוסן לישראל|כחול לבן]]", "Blue and White"),
    "המילואימניקים והכלכלית בראשות יועז הנדל וירון זליכה": ("reservists-economic", "המילואימניקים-המפלגה הכלכלית", "The Reservists & Economic Party"),
    "עמך ישראל": ("amcha-yisrael", "[[עמך ישראל]]", "Amcha Yisrael"),
    "הציבור החרדי": ("haredi-public", "הציבור החרדי", "Haredi Public"),
}

# Small lists: Hebrew wiki heading -> (slug, english name, english wiki heading)
SMALL = {
    "[[מפלגת נעם|נעם לישראל]]": ("noam", "Noam", "Noam"),
    "ישראל תחילה": ("israel-first", "Israel First", "Israel First"),
    "צומת בית ישראל": ("tzomet-beit-israel", "Tzomet – Beit Yisrael", "Tzomet - Beit Yisrael"),
    "אורות השחר": ("orot-hashahar", "Orot HaShahar", "Orot HaShahar"),
    "בטח": ("betach", "Betach", "Betach"),
    "[[ברית עולם]]": ("brit-olam", "Brit Olam", "Brit Olam"),
    "גה\"ת-גוש התנ\"כי": ("bible-bloc", "Bible Bloc", "Bible Bloc"),
    "שמע": ("shma", "Shma", "Shma"),
    "בטחון אישי": ("personal-safety", "Personal Safety", "Democtatorship"),
    "התיקון": ("hatikun", "HaTikun", "HaTikun"),
    "צבע שחור – מגן עולם התורה": ("color-black", "The Color Black", "The Color Black"),
    "שרשר לאהבה ולאחדות העם": ("sharshar", "Sharshar", "Sharshar"),
    "דרך חזון ותקומה": ("tkuma", "Derech Hazon VeTkuma", "Tkuma"),
    "סדר חדש": ("new-order", "New Order", "New Order"),
    "משפט צדק": ("mishpat-tzedek", "Mishpat Tzedek", "Mishpat Tzedek"),
    "הקהל": ("hakahal", "Hakahal", "Hakahal"),
    "אחי": ("ahi", "Ahi", "Ahi"),
    "השותפות לכולם": ("partnership-for-all", "Partnership for All", "Ihud Bnei HaBrit"),
    "[[הפיראטים (מפלגה ישראלית)|הפיראטים]]": ("pirates", "Pirate Party", "Pirate Party"),
    "גן עדן בראשות ישוע בן דוד": ("gan-eden", "Gan Eden", "Paradise"),
    "קול הנשים": ("womens-voice", "Women's Voice", "Women's Voice"),
    "ביחד נצליח": ("beyachad-natzliach", "Beyachad Natzliach", "Beyachad Natzliach"),
    "אני ואתה מפלגת העם הישראלית": ("me-and-you", "Me and You", "You and I"),
}

CEC_INDEX = "https://www.gov.il/he/pages/candidates-lists-26"
# Official list names and CEC pages for the main lists (from the CEC index page).
CEC_MAIN = {
    "likud": ("הליכוד בהנהגת בנימין נתניהו לראשות הממשלה", "halikud-tikvahadasha_iist29"),
    "yashar": ("ישר! עם איזנקוט לראשות הממשלה מאחדים את ישראל", "yashar_list_2"),
    "together": ("ביחד בראשות נפתלי בנט", "beyahad_list1"),
    "democrats": ("הדמוקרטים בראשות יאיר גולן", "hademokratim_list17"),
    "yisrael-beiteinu": ("ישראל ביתנו בראשות אביגדור ליברמן", "israel-beitenu_list11"),
    "utj": ("יהדות התורה והשבת אגודת ישראל – דגל התורה", "yahadut-degel_list37"),
    "otzma-yehudit": ("עוצמה יהודית בראשות איתמר בן גביר", "yehudit-meuhedet_list14"),
    "shas": ("התאחדות הספרדים שומרי תורה תנועתו של מרן הרב עובדיה יוסף זצ\"ל", "shas_list19"),
    "joint-list": ("הרשימה המשותפת", "hareshima-hameshutefet_list35"),
    "raam": ("רע\"ם – הרשימה הערבית המאוחדת", "raam_list18"),
    "rzp-zehut": ("הציונות הדתית בראשות בצלאל סמוטריץ' וזהות בראשות משה פייגלין", "tzionutdatit-zehut_list31"),
    "blue-and-white": ("כחול לבן בראשות בני גנץ", "kachol-lavan_list30"),
    "reservists-economic": ("המילואימניקים והכלכלית בראשות יועז הנדל וירון זליכה", "hamiluimnikim-vehakalkalit_list16"),
    "amcha-yisrael": ("עמך ישראל בראשות עופר וינטר", "amcha-israel_list6"),
    "haredi-public": ("הציבור החרדי בראשות מוטי ליטנר", "tzibur-charedi_list20"),
}

# Short names voters use (the official names are long). Shown on cards; official name on the list page.
SHORT = {
    "likud": "הליכוד", "yashar": "ישר!", "together": "ביחד", "democrats": "הדמוקרטים",
    "yisrael-beiteinu": "ישראל ביתנו", "utj": "יהדות התורה", "otzma-yehudit": "עוצמה יהודית", "shas": "ש\"ס",
    "joint-list": "הרשימה המשותפת", "raam": "רע\"ם", "rzp-zehut": "הציונות הדתית וזהות", "blue-and-white": "כחול לבן",
    "reservists-economic": "המילואימניקים והכלכלית", "amcha-yisrael": "עמך ישראל", "haredi-public": "הציבור החרדי",
    "noam": "נעם", "partnership-for-all": "השותפות לכולם", "gan-eden": "גן עדן",
}

LINK = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")


def strip_wiki(text: str) -> str:
    text = re.sub(r"\{\{הערה\|.*?\}\}\}\}", "", text, flags=re.S)
    text = re.sub(r"<ref[^>]*>.*?</ref>|<ref[^>]*/>", "", text, flags=re.S)
    text = re.sub(r"\{\{[^{}]*\}\}", "", text)
    text = re.sub(r"\{\{[^{}]*\}\}", "", text)
    text = re.sub(r"\[\[(?:קובץ|File):[^\]]*\]\]", "", text)
    text = LINK.sub(lambda m: m.group(2) or m.group(1), text)
    text = re.sub(r"'{2,}", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def wiki_sections(raw: str) -> dict[str, str]:
    a = raw.index("=== רשימות המיוצגות בכנסת היוצאת ===")
    b = raw.index("===רשימות שפרשו טרם הצגת הרשימות===")
    parts = re.split(r"\n====\s*(.+?)\s*====[ \t]*\n", raw[a:b])
    return {parts[i]: parts[i + 1] for i in range(1, len(parts), 2)}


def find_section(sections: dict[str, str], prefix: str) -> str:
    for head, body in sections.items():
        if head.startswith(prefix):
            return body
    raise KeyError(prefix)


def parse_section(body: str) -> dict:
    letters = re.findall(r"\{\{אותיות רשימה\|([^}]*)\}\}", body)
    color = re.findall(r"background:\s*(#[0-9a-fA-F]{3,6})", body)
    nick = re.findall(r"כינוי הרשימה:\s*'''(.+?)'''", body)
    parties = []
    m = re.search(r"\* מפלגות:\n((?:\*\*.*\n?)+)", body)
    if m:
        parties = [strip_wiki(l.lstrip("* ")) for l in m.group(1).splitlines() if l.strip()]
    slate = []
    for line in body.splitlines():
        line = re.sub(r"^\|\s*תוכן\s*=\s*", "", line.strip())
        if not line.startswith("#"):
            continue
        item = line.lstrip("# ").strip()
        lm = LINK.fullmatch(item)
        if lm:
            slate.append({"name": (lm.group(2) or lm.group(1)).strip(), "wiki": lm.group(1).strip()})
        else:
            slate.append({"name": strip_wiki(item), "wiki": None})
    # Prose after the infobox, minus images and refs: a neutral background paragraph.
    prose = body.split("|}")[-1] if "|}" in body else body
    paras = [strip_wiki(p) for p in prose.split("\n") if p.strip() and not p.lstrip().startswith(("*", "{{", "[[קובץ", "{|", "|"))]
    paras = [p for p in paras if len(p) > 60]
    return {
        "letters": letters[0].strip() if letters else None,
        "color": color[0] if color else None,
        "official_name": nick[0].rstrip(".") if nick else None,
        "parties": parties,
        "wiki_slate": slate,
        "background": paras[:3],
    }


def tokens(name: str) -> list[str]:
    return [t for t in re.split(r"[\s\-־]+", re.sub(r"\(.*?\)", "", name)) if t]


def match_wiki(official: str, pos: int, wiki_slate: list[dict], used: set[int]) -> dict | None:
    """Official names are surname-first and formal ("כהן אליהו"); wiki names are display order and
    often a nickname ("אלי כהן"). Both slates share ordering, so match on a shared name token within
    a small window around the same slot, nearest slot first."""
    ot = set(tokens(official))
    best = None
    for i, w in enumerate(wiki_slate):
        if i in used or abs(i - (pos - 1)) > 4:
            continue
        wt = set(tokens(w["name"]))
        shared = {t for t in wt & ot if len(t) > 1}
        if not shared:
            continue
        score = (len(shared) == len(wt), len(shared), -abs(i - (pos - 1)))
        if best is None or score > best[0]:
            best = (score, i)
    if best is None:
        return None
    used.add(best[1])
    return wiki_slate[best[1]]


def en_heads(raw: str) -> dict[str, dict]:
    out = {}
    parts = re.split(r"\n===\s*(.+?)\s*===[ \t]*\n", raw[raw.index("== Additional parties =="):])
    for i in range(1, len(parts), 2):
        body = parts[i + 1]
        cec = re.findall(r"https://www\.gov\.il/he/pages/[A-Za-z0-9_\-]+", body)
        names = []
        for line in body.splitlines():
            if line.startswith("#"):
                names.append(strip_wiki(re.sub(r"\{\{\s*interlanguage link\|([^|}]+)\|he\|([^|}]+)\}\}", r"\2", line.lstrip("# "), flags=re.I)))
        out[parts[i]] = {"cec_url": cec[0] if cec else None, "names_en": names}
    # Main sections too (for CEC urls)
    for m in re.finditer(r"\n==\s*([^=\n]+?)\s*==\n(.*?)(?=\n==[^=])", raw, flags=re.S):
        cec = re.findall(r"https://www\.gov\.il/he/pages/[A-Za-z0-9_\-]+", m.group(2))
        out.setdefault(m.group(1), {"cec_url": cec[0] if cec else None, "names_en": []})
    return out


def main() -> None:
    ktv = json.loads((RAW / "knessettv.json").read_text())
    he = (RAW / "wiki_he.txt").read_text()
    en = (RAW / "wiki_en.txt").read_text()
    sections = wiki_sections(he)
    en_info = en_heads(en)

    lists = []
    for ktv_name, (slug, wiki_prefix, name_en) in MAIN.items():
        sec = parse_section(find_section(sections, wiki_prefix))
        used: set[int] = set()
        candidates = []
        for pos, official in enumerate(ktv[ktv_name], start=1):
            w = match_wiki(official, pos, sec["wiki_slate"], used)
            candidates.append({
                "position": pos,
                "official_name": official,
                "display_name": w["name"] if w else None,
                "wiki_title": w["wiki"] if w else None,
            })
        lists.append({
            "slug": slug,
            "name": ktv_name,
            "name_en": name_en,
            "tier": "main",
            "letters": sec["letters"],
            "color": sec["color"],
            "official_name": CEC_MAIN[slug][0],
            "cec_url": f"https://www.gov.il/he/pages/{CEC_MAIN[slug][1]}",
            "parties": sec["parties"],
            "background": sec["background"],
            "slate_complete": True,
            "slate_source": KTV_URL,
            "candidates": candidates,
        })

    cec_pages = json.loads((RAW / "cec_pages.json").read_text())
    cec_small = {}
    for line in (RAW / "cec_small.txt").read_text().splitlines():
        if not line or line.startswith("#"):
            continue
        slug, official, names = line.split("|", 2)
        cec_small[slug] = (official, [re.sub(r"^\d+\.\s*", "", n).replace(",", "").strip() for n in names.split(";")])

    for he_head, (slug, name_en, en_head) in SMALL.items():
        sec = parse_section(sections[he_head])
        official, names = cec_small[slug]
        used: set[int] = set()
        candidates = []
        for pos, off in enumerate(names, start=1):
            w = match_wiki(off, pos, sec["wiki_slate"], used)
            candidates.append({
                "position": pos,
                "official_name": off,
                "display_name": w["name"] if w else None,
                "wiki_title": w["wiki"] if w else None,
            })
        url = f"https://www.gov.il/he/pages/{cec_pages[slug]}"
        lists.append({
            "slug": slug,
            "name": strip_wiki(he_head),
            "name_en": name_en,
            "tier": "other",
            "letters": sec["letters"],
            "color": sec["color"],
            "official_name": official,
            "cec_url": url,
            "parties": sec["parties"],
            "background": sec["background"],
            "slate_complete": True,
            "slate_source": url,
            "candidates": candidates,
        })

    for l in lists:
        l["name"] = SHORT.get(l["slug"], l["name"])
        for c in l["candidates"]:
            # Official names are "surname given". With exactly two words the order is unambiguous,
            # so show the familiar "given surname"; longer names stay as filed.
            if not c["display_name"] and c["official_name"]:
                parts = c["official_name"].split()
                if len(parts) == 2:
                    c["display_name"] = f"{parts[1]} {parts[0]}"

    OUT.write_text(json.dumps(lists, ensure_ascii=False, indent=1))
    total = sum(len(l["candidates"]) for l in lists)
    print(f"{len(lists)} lists, {total} candidates -> {OUT}")
    for l in lists:
        linked = sum(1 for c in l["candidates"] if c["wiki_title"])
        print(f"  {l['letters'] or '?':5} {l['slug']:22} {len(l['candidates']):4} cands, {linked:3} wiki-linked, color={l['color']}")


if __name__ == "__main__":
    main()
