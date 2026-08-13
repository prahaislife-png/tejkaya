import { expect, test } from "@playwright/test";

async function register(page: import("@playwright/test").Page, suffix: string) {
  const email = `guest.${suffix}.${Date.now()}@example.com`;
  await page.goto("/sign-in.html");
  await page.getByRole("button", { name: "Need an account?" }).click();
  await page.locator("#fn").fill("Anika");
  await page.locator("#em").fill(email);
  await page.locator("#pw").fill("atelier99");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("h1")).toContainText("welcome", { timeout: 15000 });
  return email;
}

test("existing house pages still render", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator("h1")).toContainText("Ayurveda");
  await page.goto("/collection.html");
  await expect(page.locator(".product-card")).toHaveCount(5);
  await page.goto("/product.html?slug=chyawanprash");
  await expect(page.locator("h1")).toContainText("Chyawanprash");
});

test("account hub after registration", async ({ page }) => {
  await register(page, "hub");
  await expect(page.getByRole("link", { name: "My Ritual" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Private Journal" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Included 21 Days A self-paced" })).toBeVisible();
  await expect(page.getByText("Chyawanprash").first()).toBeVisible();
});

test("ritual finder completes and reveals result", async ({ page }) => {
  await page.goto("/ritual-finder.html");
  await expect(page.getByText("Question 1 of 18")).toBeVisible();
  for (let i = 0; i < 18; i++) {
    await page.locator(".choice-list label").first().click();
    await page.getByRole("button", { name: i === 17 ? "Continue" : "Next" }).click();
  }
  await expect(page.locator("h1")).toContainText("Your name");
  await page.locator("#fn").fill("Anika");
  await page.locator("#em").fill(`finder.${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Reveal my ritual" }).click();
  await expect(page.locator("h1")).toContainText("composed next step");
  await expect(page.getByText("Rhythm", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Hydration", { exact: true }).first()).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download" }).click()
  ]);
  expect(download.suggestedFilename()).toMatch(/ritual/i);
});

test("private journal save, views, export", async ({ page }) => {
  await register(page, "journal");
  await page.goto("/private.html");
  await expect(page.locator("h1")).toContainText("journal");
  await page.locator("#hydration").fill("6");
  await page.locator("#movement").fill("20");
  await page.locator("#notes").fill("Walked after lunch.");
  await page.getByRole("button", { name: "Save today" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
  await page.getByRole("button", { name: "7 Days" }).click();
  await expect(page.getByText("Days logged")).toBeVisible();
  await page.getByRole("button", { name: "Journal history" }).click();
  await expect(page.getByText("Walked after lunch.")).toBeVisible();
  await page.getByRole("button", { name: "Summary" }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export 30-day summary" }).click()
  ]);
  expect(download.suggestedFilename()).toMatch(/30-day/i);
});

test("all 21 days and saved ritual", async ({ page }) => {
  test.setTimeout(120000);
  await register(page, "days");
  for (let d = 1; d <= 20; d++) {
    await page.goto(`/21-days.html?day=${d}`);
    await page.locator("#notice").fill(`Noted day ${d}`);
    await page.getByRole("button", { name: "Complete day" }).click();
    await expect(page.getByText("Day marked complete.")).toBeVisible();
  }
  await page.goto("/21-days.html?day=21");
  await expect(page.getByRole("heading", { name: "Your ritual starts here" })).toBeVisible();
  await page.locator(".check-list input").first().check();
  await page.locator("#morning").fill("Water, window, then tea.");
  await page.locator("#evening").fill("Dim the lamp. Phone in the hall.");
  await page.getByRole("button", { name: "Save ritual" }).click();
  await expect(page.getByText("Ritual saved to your account.")).toBeVisible();
  await page.goto("/account.html");
  await expect(page.getByText("Day 21 ritual saved")).toBeVisible();
});

test("mobile homepage atelier", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html");
  await expect(page.getByRole("heading", { name: "Three practices. One account." })).toBeVisible();
});
