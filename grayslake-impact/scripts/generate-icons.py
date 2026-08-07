#!/usr/bin/env python3
"""
Rasterises public/favicon.svg into the icon set search engines, browsers and
phone home screens actually look for.

Why redraw instead of rasterising the SVG file: the only SVG renderers in this
environment are ImageMagick's internal one, which mishandles rx on rect. The
mark is six rounded rectangles, so the geometry is transcribed below and drawn
directly. Coordinates are the 32-unit viewBox from favicon.svg -- if that file
changes, change SHAPES to match.

Everything is drawn at 8x and downsampled with LANCZOS, which is what keeps the
corner radius clean at 16px.

    python3 scripts/generate-icons.py
"""
from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'public'
SS = 8                      # supersample factor
VB = 32                     # source viewBox
BG = '#090910'

#        x     y     w     h     r     fill
SHAPES = [
    (6.0, 16.0,  4.0, 10.0, 1.00, '#0284c7'),
    (12.0, 10.0, 4.0, 16.0, 1.00, '#38bdf8'),
    (18.0, 13.0, 4.0, 13.0, 1.00, '#0ea5e9'),
    (24.0, 18.0, 2.5,  8.0, 0.75, '#7dd3fc'),
    (5.0, 27.0, 22.0,  1.0, 0.50, '#2c2c45'),
]


def render(size, corner_radius=7.0, pad=0.0):
    """corner_radius is in viewBox units. pad insets the artwork, for iOS."""
    n = size * SS
    img = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    k = n / VB                       # viewBox unit -> supersampled px

    if corner_radius > 0:
        d.rounded_rectangle([0, 0, n - 1, n - 1], radius=corner_radius * k, fill=BG)
    else:
        d.rectangle([0, 0, n - 1, n - 1], fill=BG)

    # pad shrinks the bars toward the centre so iOS's own mask cannot clip them
    s = (VB - 2 * pad) / VB
    for x, y, w, h, r, fill in SHAPES:
        X, Y = (x * s + pad) * k, (y * s + pad) * k
        W, H = w * s * k, h * s * k
        d.rounded_rectangle([X, Y, X + W, Y + H], radius=max(r * s * k, 1), fill=fill)

    return img.resize((size, size), Image.LANCZOS)


def main():
    written = []

    # Google reads the favicon from the home page's <link rel=icon>, and many
    # crawlers still request /favicon.ico blind. Ship both.
    ico = OUT / 'favicon.ico'
    render(48).save(ico, sizes=[(16, 16), (32, 32), (48, 48)])
    written.append(ico)

    # 96 is the smallest multiple of 48 Google documents for search results.
    for size, name in [(96, 'favicon-96.png'), (192, 'icon-192.png'), (512, 'icon-512.png')]:
        p = OUT / name
        render(size).save(p)
        written.append(p)

    # iOS applies its own squircle mask and does not honour transparency, so
    # this one is a full-bleed square with the bars inset out of harm's way.
    p = OUT / 'apple-touch-icon.png'
    render(180, corner_radius=0, pad=2.5).convert('RGB').save(p)
    written.append(p)

    for p in written:
        print(f'  {p.name:<24} {p.stat().st_size:>7,} bytes')


if __name__ == '__main__':
    main()
