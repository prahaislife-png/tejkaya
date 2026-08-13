# Tej Kaya — तेज काया

Premium pre-launch website for **Tej Kaya**, a modern Indian Ayurvedic wellness house.

Traditional formulations, presented with the refinement of luxury: five launch vessels, editorial botanicals, rituals, and early access. There is no checkout.

## Pages

| Path | Purpose |
| --- | --- |
| `index.html` | House, manifesto, collection, early access |
| `collection.html` | All launch products |
| `product.html?slug=` | Product template (driven by catalogue) |
| `house.html` | Brand origin and principles |
| `ingredients.html` | Botanical stories |
| `rituals.html` | Daily sequence |

## Adding a product later

1. Place photography in `assets/images/`.
2. Append an object to `window.TEJ_KAYA.products` in `js/products.js`.
3. The collection grid, footer, related products, and `product.html?slug=...` update automatically.

Copy is written as **pre-launch / formulation-pending**. Do not add disease-treatment claims without regulatory review.

## Design system (free)

No paid Figma file is required. The house identity lives in the repo:

- Type: [Google Fonts](https://fonts.google.com/) — Cormorant Garamond, Outfit, Noto Serif Devanagari (SIL Open Font License), self-hosted in `assets/fonts/`
- Mark: `assets/mark.svg`
- Product labels: HTML overlays (`.pack-label`) positioned in `js/products.js` — photographs stay unbranded
- Rules for later edits: `.cursor/skills/tej-kaya/SKILL.md`

## Local preview

Serve the folder over HTTP (opening `file://` can block fonts in some browsers):

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
