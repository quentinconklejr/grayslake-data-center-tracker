#!/usr/bin/env python3
"""
Generate Open Graph share images into public/og/.

Run from the grayslake-impact directory:
    python3 scripts/generate-og.py

Outputs 1200x630 PNGs, one per route, using the site's dark theme colour
(#090910) and the bar-chart motif from favicon.svg. These are intentionally
plain placeholders: swap FONT_* for Inter and drop in real artwork when a
designed template exists. Re-run after changing any title or subtitle.
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
BG = "#090910"
FG = "#ffffff"
MUTED = "#8b8ba7"
RULE = "#2c2c45"
BARS = ["#0284c7", "#38bdf8", "#0ea5e9", "#7dd3fc"]

FONT_BOLD = "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"
FONT_MONO = "/usr/share/fonts/truetype/liberation2/LiberationMono-Regular.ttf"

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "og")

# route slug -> (title, subtitle)
PAGES = {
    "home": ("Grayslake Data Center Tracker",
             "T5 @ Chicago IV — sourced public record"),
    "project": ("The Project",
                "Energy, jobs, tax and schools — with sources"),
    "energy": ("Energy Draw",
               "Capacity figures, grid interconnection, and rate structure"),
    "jobs": ("Employment",
             "Permanent and construction workforce projections"),
    "tax-impact": ("Fiscal Impact",
                   "Developer fees, property tax, and revenue allocation"),
    "schools": ("School Funding",
                "District revenue and the DeKalb precedent"),
    "timeline": ("Project Timeline",
                 "Approvals, permits, and policy actions by date"),
    "questions": ("Open Questions",
                  "What is stated, what is disputed, what is unanswered"),
    "map": ("Site Location",
            "Cornerstone business park, Grayslake, Illinois"),
    "sources": ("Sources",
                "Every figure on this site, linked to its origin"),
    "accessibility": ("Accessibility",
                       "What meets the standard, and where it falls short"),
    "privacy": ("Privacy",
                "No cookies, no accounts, no tracking"),
    "about": ("About This Tracker",
              "Who builds it and how figures are verified"),
    "actions": ("Jurisdictional Actions",
                "Filings and decisions across village, county, state, federal"),
    "reporters": ("For Reporters",
                  "Key figures with citations and contact reference"),
    "residents": ("For Residents",
                  "Plain-language summary of the project's local impact"),
    "officials": ("For Officials",
                  "Approval decisions, legal challenges, and policy events"),
}


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for word in words:
        trial = f"{cur} {word}".strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def render(slug, title, subtitle):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    f_title = ImageFont.truetype(FONT_BOLD, 68)
    f_sub = ImageFont.truetype(FONT_REG, 30)
    f_mono = ImageFont.truetype(FONT_MONO, 22)

    pad = 80

    # bar-chart motif, top left (scaled from favicon.svg)
    heights = [46, 74, 60, 36]
    base_y = pad + 78
    x = pad
    for h, colour in zip(heights, BARS):
        w = 18 if colour != BARS[-1] else 11
        d.rounded_rectangle([x, base_y - h, x + w, base_y], radius=4, fill=colour)
        x += 27
    d.rounded_rectangle([pad, base_y + 9, pad + 101, base_y + 13], radius=2, fill=RULE)

    # title, wrapped
    y = base_y + 74
    for line in wrap(d, title, f_title, W - pad * 2):
        d.text((pad, y), line, font=f_title, fill=FG)
        y += 82

    # subtitle
    y += 12
    for line in wrap(d, subtitle, f_sub, W - pad * 2):
        d.text((pad, y), line, font=f_sub, fill=MUTED)
        y += 42

    # footer rule + domain
    d.rectangle([pad, H - pad - 46, W - pad, H - pad - 45], fill=RULE)
    d.text((pad, H - pad - 28), "grayslakedatacentertracker.org",
           font=f_mono, fill=MUTED)

    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{slug}.png")
    img.save(path, "PNG", optimize=True)
    return path


if __name__ == "__main__":
    for slug, (title, subtitle) in PAGES.items():
        print("wrote", render(slug, title, subtitle))
