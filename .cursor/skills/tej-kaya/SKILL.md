---
name: tej-kaya
description: Visual system for the Tej Kaya pre-launch site. Use when editing layout, type, product labels, colours, or photography.
---

# Tej Kaya house rules

Tej Kaya is a luxury Ayurveda house, not a pharmacy. Prefer composure over decoration.

## Type (do not invent a new scale)

| Role | Size | Face |
| --- | --- | --- |
| Nav / buttons / eyebrows | 13px (`0.8125rem`), tracking `0.1–0.14em` | Outfit |
| Body | 16px, weight 400 | Outfit |
| Product name under photo | 1.7rem | Cormorant Garamond |
| Section H2 | `--h2` (~30–41px) | Cormorant |
| Page / hero H1 | `--h1` (~38–57px), max 2–3 lines | Cormorant |
| Devanagari | Noto Serif Devanagari, gold-dim | |

Fonts are self-hosted in `assets/fonts` via `css/fonts.css` (Google Fonts, SIL OFL). Do not hotlink Google in HTML.

## Colour

- Forest `#1b2a22` / deep `#101914`
- Ivory `#faf6ef` / cream `#f3ece1`
- Gold `#b8956a`
- Ink `#161410`

One page gutter: `--page` (1200px). Header, hero, and collection share it.

## Product labels

Never paint text into JPEGs. Photos stay unbranded. Overlay `.pack-label` (HTML) using `product.label` in `js/products.js`:

```
label: { top, left, width, height, shape: "rect" | "oval" }
```

`top`/`left` are the centre of the cream panel. Tune in the browser at 1440px. Type inside labels uses `cqh` so it scales with the label.

## Visual QA (required before shipping UI)

Playwright, 1440×900 and 390×844: homepage hero, collection cards, one product page. Check:

1. Headline lines up with “The Collection”
2. Labels sit on the cream panels, not on the lid or the table
3. Nav is readable (~13px), H1 is not wrapping into five lines

## Adding a product

Append an object in `js/products.js` with `image` + `label`. Grid, footer, and `product.html?slug=` update themselves.
