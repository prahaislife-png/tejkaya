# Shree Urocare ads

Ready-to-post images and captions for local Instagram, Facebook, and WhatsApp.

1. Open **`COPY.md`** — captions, facts, and what not to say.
2. Use the JPEGs in **`ads/`**. Start with **`02-consult-mr.jpg`**.
3. You pay; the ad must show **Dr Rajeshree / Shree Urocare**. WhatsApp goes to **+91 87883 29648**.

Rebuild posters after copy edits:

```bash
python3 -m http.server 8766 --bind 127.0.0.1
node tools/export-shree-urocare-ads.mjs
```
