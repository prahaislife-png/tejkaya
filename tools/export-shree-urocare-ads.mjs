import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pageUrl = "http://127.0.0.1:8766/brand/shree-urocare/posters.html";
const out = resolve(root, "brand/shree-urocare/ads");

const boards = [
  "01-consult-en",
  "02-consult-mr",
  "03-intro-en",
  "04-intro-mr",
  "05-find-us",
  "06-hours",
  "07-suvarna",
  "08-agnikarma",
  "09-story-en",
  "10-story-mr",
  "11-wa-status",
  "12-cover"
];

mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: 1 });
const page = await context.newPage();
await page.goto(pageUrl, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(200);

for (const id of boards) {
  const el = page.locator(`[id="${id}"]`);
  await el.scrollIntoViewIfNeeded();
  await el.screenshot({ path: resolve(out, `${id}.jpg`), type: "jpeg", quality: 88 });
  console.log("wrote", id);
}

await browser.close();
