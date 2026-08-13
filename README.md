# Tej Kaya — तेज काया

Premium pre-launch website for **Tej Kaya**, a modern Indian Ayurvedic wellness house.

Traditional formulations, presented with the refinement of luxury: five launch vessels, editorial botanicals, rituals, early access, and a digital atelier. There is no checkout.

## Pages

| Path | Purpose |
| --- | --- |
| `index.html` | House, manifesto, collection, atelier, early access |
| `collection.html` | All launch products |
| `product.html?slug=` | Product template (driven by catalogue) |
| `house.html` | Brand origin and principles |
| `ingredients.html` | Botanical stories |
| `rituals.html` | Daily sequence |
| `ritual-finder.html` (`/ritual-finder/`) | Ritual Finder questionnaire |
| `private.html` (`/private/`) | Private wellness journal |
| `21-days.html` (`/21-days/`) | 21-day programme |
| `account.html` (`/account/`) | One account hub |
| `consult.html` | Book Dr Rajeshree (clinic / video / 3-visit pack) |
| `clinic.html` | Staff desk + letterhead (PIN in `src/clinic/config.ts`) |

## Digital atelier

One account (email + password, PBKDF2 in IndexedDB on this device) unlocks:

1. **Ritual Finder** — 18 questions, rules-based scores, 4–6 habits. Name and email required before the full result. Optional password saves it to the account.
2. **Tej Kaya Private** — daily journal, 7/30-day views, history, summary, 30-day HTML export.
3. **21 Days of Tej Kaya** — read / do / notice / complete. Day 21 composes a morning/evening ritual. Relevant days can **Log this in Private**.

Physician bookings (Shree Urocare) live at `consult.html`. Fees: in-clinic ₹700, video ₹1,200, 3-visit video pack ₹3,000. WhatsApp confirm + Google Calendar. The doctor writes plans on clinic letterhead from `clinic.html`. Tej Kaya still does not prescribe. Set `CLINIC.upiId` and `deskPin` in `src/clinic/config.ts` before going live.



Supabase is not connected (MCP unauthenticated). Swap the local IndexedDB adapter later without splitting accounts.

Copy is **pre-launch / educational**. These tools do not diagnose, prescribe, or treat disease.

## Adding a physical product later

1. Place photography in `assets/images/`.
2. Append an object to `window.TEJ_KAYA.products` in `js/products.js`.

## Design system

- Type: Cormorant Garamond, Outfit, Noto Serif Devanagari (SIL OFL), self-hosted in `assets/fonts/`
- Rules: `.cursor/skills/tej-kaya/SKILL.md`

## Develop

```bash
npm install
npm run dev
```

```bash
npm run test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Local static preview of the existing pages: `python3 -m http.server 4173` (digital atelier TypeScript will not compile this way — use Vite).
