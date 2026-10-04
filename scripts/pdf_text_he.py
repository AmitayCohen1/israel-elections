"""Hebrew text out of a PDF's text layer, in reading order.

Ghostscript's txtwrite prints Hebrew in *visual* order: every line comes out mirrored (words intact,
characters reversed, numbers and Latin runs left-to-right). This reverses each line and restores
the number/Latin runs and mirrored brackets, so quotes can be matched against the text.

    python3 scripts/pdf_text_he.py file.pdf            # prints the text
    from pdf_text_he import pdf_text                    # or import it

Scanned PDFs (pages that are only images) have no text layer: this returns nothing for them.
"""

import re
import subprocess
import sys

_MIRROR = str.maketrans("()[]{}<>", ")(][}{><")
# A number or Latin word, with its inner punctuation and a leading/trailing percent sign.
_RUN = re.compile(r"%?[0-9A-Za-z]+(?:[.,:/\-][0-9A-Za-z]+)*%?")


def _fix_line(line: str) -> str:
    rev = line.rstrip().translate(_MIRROR)[::-1]
    return _RUN.sub(lambda m: m.group(0)[::-1], rev).strip()


def pdf_text(path: str) -> str:
    raw = subprocess.run(
        ["gs", "-q", "-dNOPAUSE", "-dBATCH", "-sDEVICE=txtwrite", "-sOutputFile=-", path],
        capture_output=True, text=True, check=True,
    ).stdout
    lines = [_fix_line(ln) for ln in raw.splitlines()]
    return "\n".join(ln for ln in lines if ln)


if __name__ == "__main__":
    print(pdf_text(sys.argv[1]))
