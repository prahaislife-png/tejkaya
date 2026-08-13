#!/usr/bin/env python3
"""Draw Tej Kaya lockups onto existing cream labels (no extra sticker)."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path("/workspace/assets/images")
FONTS = Path("/tmp/tk-fonts")

INK = (38, 30, 22, 255)
GOLD = (150, 112, 70, 255)
GOLD_LINE = (184, 149, 106, 230)


def font(path, size, variation):
    f = ImageFont.truetype(str(path), size)
    try:
        f.set_variation_by_name(variation)
    except Exception:
        pass
    return f


def text_size(draw, text, fnt):
    x0, y0, x1, y1 = draw.textbbox((0, 0), text, font=fnt)
    return x1 - x0, y1 - y0, -x0, -y0


def draw_centered(draw, text, cx, y, fnt, fill):
    w, h, ox, oy = text_size(draw, text, fnt)
    draw.text((cx - w / 2 + ox, y + oy), text, font=fnt, fill=fill)
    return h


def wrap(draw, name, fnt, max_w):
    if text_size(draw, name, fnt)[0] <= max_w:
        return [name]
    parts = name.split()
    if len(parts) <= 1:
        return [name]
    return [" ".join(parts[:-1]), parts[-1]]


JOBS = [
    {
        "file": "product-chyawanprash.jpg",
        "cx": 512,
        "cy": 528,
        "max_w": 220,
        "h": 210,
        "name": "Chyawanprash",
        "hindi": "च्यवनप्राश",
        "category": "Daily Ritual",
        "number": "01",
        "weight": "500 g",
    },
    {
        "file": "product-urinary.jpg",
        "cx": 512,
        "cy": 482,
        "max_w": 200,
        "h": 150,
        "name": "Urinary Care",
        "hindi": "मूत्र स्वास्थ्य",
        "category": "Everyday Wellness",
        "number": "02",
        "weight": "60 caps",
    },
    {
        "file": "product-prostate.jpg",
        "cx": 470,
        "cy": 505,
        "max_w": 168,
        "h": 310,
        "name": "Prostate Care",
        "hindi": "पुरुष स्वास्थ्य",
        "category": "Men's Wellness",
        "number": "03",
        "weight": "60 caps",
    },
    {
        "file": "product-piles.jpg",
        "cx": 430,
        "cy": 575,
        "max_w": 150,
        "h": 145,
        "name": "Piles Care",
        "hindi": "गुदा स्वास्थ्य",
        "category": "Comfort & Care",
        "number": "04",
        "weight": "60 caps",
    },
    {
        "file": "product-fibre.jpg",
        "cx": 300,
        "cy": 478,
        "max_w": 210,
        "h": 230,
        "name": "Daily Fibre",
        "hindi": "ईसबगोल",
        "category": "Digestive Rhythm",
        "number": "05",
        "weight": "200 g",
    },
]


def paint(base, job):
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    cx, cy, max_w, box_h = job["cx"], job["cy"], job["max_w"], job["h"]

    brand_size = max(20, int(box_h * 0.14))
    name_size = max(26, int(box_h * 0.22))
    hi_size = max(15, int(box_h * 0.11))
    cat_size = max(11, int(box_h * 0.075))
    micro_size = max(10, int(box_h * 0.065))

    f_brand = font(FONTS / "cormorant.ttf", brand_size, "Medium")
    f_name = font(FONTS / "cormorant.ttf", name_size, "Regular")
    f_hi = font(FONTS / "noto-dev.ttf", hi_size, "Medium")
    f_cat = font(FONTS / "outfit.ttf", cat_size, "Regular")
    f_micro = font(FONTS / "outfit.ttf", micro_size, "Regular")

    lines = wrap(d, job["name"], f_name, max_w)
    name_h = sum(text_size(d, ln, f_name)[1] + 2 for ln in lines)

    stack = 18 + brand_size + 4 + hi_size + 14 + name_h + 8 + cat_size + 10 + micro_size
    y = cy - stack / 2

    # small house mark
    mark_r = max(5, int(box_h * 0.035))
    d.ellipse([cx - mark_r - 3, y, cx + mark_r + 3, y + mark_r * 2 + 4], outline=GOLD_LINE, width=1)
    d.polygon(
        [
            (cx, y + 2),
            (cx + mark_r * 0.55, y + mark_r * 1.35),
            (cx, y + mark_r * 2 + 1),
            (cx - mark_r * 0.55, y + mark_r * 1.35),
        ],
        fill=GOLD,
    )
    y += mark_r * 2 + 10

    # faint ink shadow for print-on-paper feel
    def ink(text, yy, fnt, fill=INK):
        # shadow
        w, h, ox, oy = text_size(d, text, fnt)
        d.text((cx - w / 2 + ox + 1, yy + oy + 1), text, font=fnt, fill=(255, 255, 255, 40))
        return draw_centered(d, text, cx, yy, fnt, fill)

    y += ink("TEJ KAYA", y, f_brand) + 2
    y += ink(job["hindi"], y, f_hi, GOLD) + 8
    rule = min(64, max_w * 0.38)
    d.line([(cx - rule, y), (cx + rule, y)], fill=GOLD_LINE, width=1)
    y += 10
    for ln in lines:
        y += ink(ln, y, f_name) + 1
    y += 8
    y += ink(f"{job['number']}  ·  {job['category'].upper()}", y, f_cat, GOLD) + 6
    ink(job["weight"].upper(), y, f_micro, GOLD)

    return Image.alpha_composite(base.convert("RGBA"), overlay)


def main():
    for job in JOBS:
        src = ROOT / job["file"].replace(".jpg", "-blank.jpg")
        dest = ROOT / job["file"]
        img = Image.open(src)
        out = paint(img, job).convert("RGB")
        out.save(dest, quality=93, optimize=True)
        print("branded", dest.name, "at", job["cx"], job["cy"])


if __name__ == "__main__":
    main()
