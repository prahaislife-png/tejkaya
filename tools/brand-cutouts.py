#!/usr/bin/env python3
"""Print Tej Kaya lockups onto the blank cream panels of studio cutouts.

The cutouts already have cream labels and gold borders. This script paints
typography only — no second sticker — so the lockup sits on the vessel.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets/images/cutouts"
DEST = ROOT / "assets/images"
FONTS = ROOT / "tools/fonts"
if not (FONTS / "cormorant.ttf").exists():
    FONTS = Path("/tmp/tk-fonts")

INK = (36, 28, 20, 255)
GOLD = (138, 102, 58, 255)


def font(path, size, variation="Medium"):
    f = ImageFont.truetype(str(path), size)
    try:
        f.set_variation_by_name(variation)
    except Exception:
        pass
    return f


def text_wh(draw, text, fnt):
    x0, y0, x1, y1 = draw.textbbox((0, 0), text, font=fnt)
    return x1 - x0, y1 - y0, -x0, -y0


def centered(draw, text, cx, y, fnt, fill):
    w, h, ox, oy = text_wh(draw, text, fnt)
    draw.text((cx - w / 2 + ox, y + oy), text, font=fnt, fill=fill)
    return h


def wrap(draw, name, fnt, max_w):
    if text_wh(draw, name, fnt)[0] <= max_w:
        return [name]
    parts = name.split()
    if len(parts) <= 1:
        return [name]
    return [" ".join(parts[:-1]), parts[-1]]


def draw_mark(d, cx, y, r):
    d.ellipse([cx - r - 3, y, cx + r + 3, y + r * 2 + 6], outline=GOLD, width=2)
    d.polygon(
        [
            (cx, y + 3),
            (cx + r * 0.55, y + r * 1.4),
            (cx, y + r * 2 + 2),
            (cx - r * 0.55, y + r * 1.4),
        ],
        fill=GOLD,
    )
    return r * 2 + 10


def paint_label(base, box, product, hindi, category, number, weight, compact=False):
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    l, t, r, b = box
    w, h = r - l, b - t
    cx = (l + r) / 2

    inner_w = w - (20 if compact else 28)
    brand_size = max(16, int(h * (0.12 if compact else 0.095)))
    name_size = max(20, int(h * (0.18 if compact else 0.135)))
    hi_size = max(13, int(h * (0.10 if compact else 0.078)))
    cat_size = max(10, int(h * (0.068 if compact else 0.048)))

    f_brand = font(FONTS / "cormorant.ttf", brand_size, "Medium")
    f_name = font(FONTS / "cormorant.ttf", name_size, "Regular")
    f_hi = font(FONTS / "noto-dev.ttf", hi_size, "Medium")
    f_cat = font(FONTS / "outfit.ttf", cat_size, "Regular")

    lines = wrap(d, product, f_name, inner_w)
    name_h = sum(text_wh(d, ln, f_name)[1] + 2 for ln in lines)
    mark_h = max(12, int(h * (0.09 if compact else 0.065)))
    gap = 6 if compact else 10
    stack = mark_h + gap + brand_size + 4 + hi_size + gap + 8 + name_h + gap + cat_size * 2
    y = t + max(4, (h - stack) / 2)

    y += draw_mark(d, cx, y, max(5, int(h * (0.042 if compact else 0.032))))
    y += 4 if compact else 6
    y += centered(d, "TEJ KAYA", cx, y, f_brand, INK) + (2 if compact else 4)
    y += centered(d, hindi, cx, y, f_hi, GOLD) + (6 if compact else 8)
    rule = min(64 if compact else 80, w * 0.26)
    d.line([(cx - rule / 2, y), (cx + rule / 2, y)], fill=GOLD, width=1)
    y += 8 if compact else 10
    for ln in lines:
        y += centered(d, ln, cx, y, f_name, INK) + 1
    y += 6 if compact else 8
    y += centered(d, f"{number}  ·  {category.upper()}", cx, y, f_cat, GOLD) + 4
    centered(d, weight.upper(), cx, y, f_cat, GOLD)

    return Image.alpha_composite(base.convert("RGBA"), overlay)


JOBS = [
    {
        "src": "cut-chyawanprash.png",
        "dest": "product-chyawanprash.jpg",
        "box": (330, 418, 694, 792),
        "name": "Chyawanprash",
        "hindi": "च्यवनप्राश",
        "category": "Daily Ritual",
        "number": "01",
        "weight": "500 g",
    },
    {
        "src": "cut-urinary.png",
        "dest": "product-urinary.jpg",
        "box": (400, 558, 636, 748),
        "name": "Urinary Care",
        "hindi": "मूत्र स्वास्थ्य",
        "category": "Everyday Wellness",
        "number": "02",
        "weight": "60 caps",
        "compact": True,
    },
    {
        "src": "cut-prostate.png",
        "dest": "product-prostate.jpg",
        "box": (378, 392, 646, 812),
        "name": "Prostate Care",
        "hindi": "पुरुष स्वास्थ्य",
        "category": "Men's Wellness",
        "number": "03",
        "weight": "60 caps",
    },
    {
        "src": "cut-piles.png",
        "dest": "product-piles.jpg",
        "box": (318, 478, 706, 742),
        "name": "Piles Care",
        "hindi": "गुदा स्वास्थ्य",
        "category": "Comfort & Care",
        "number": "04",
        "weight": "60 caps",
        "compact": True,
    },
    {
        "src": "cut-fibre.png",
        "dest": "product-fibre.jpg",
        "box": (348, 412, 676, 772),
        "name": "Daily Fibre",
        "hindi": "ईसबगोल",
        "category": "Digestive Rhythm",
        "number": "05",
        "weight": "200 g",
    },
]


def main():
    if not (FONTS / "cormorant.ttf").exists():
        raise SystemExit("fonts missing at %s" % FONTS)
    for job in JOBS:
        src = SRC / job["src"]
        if not src.exists():
            src = SRC / job["src"].replace(".png", ".jpg")
        img = Image.open(src)
        out = paint_label(
            img,
            job["box"],
            job["name"],
            job["hindi"],
            job["category"],
            job["number"],
            job["weight"],
            compact=job.get("compact", False),
        )
        rgb = out.convert("RGB")
        dest = DEST / job["dest"]
        rgb.save(dest, quality=94, optimize=True)
        print("wrote", dest.name, dest.stat().st_size)


if __name__ == "__main__":
    main()
