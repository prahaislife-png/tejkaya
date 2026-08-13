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

test("consult booking and clinic letterhead desk", async ({ page }) => {
  await page.goto("/consult.html");
  await expect(page.getByRole("heading", { name: "Consult with Dr Rajeshree." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Video follow-up pack (3 visits)" })).toBeVisible();
  await expect(page.getByText("₹3,000")).toBeVisible();
  await expect(page.locator("#cal-embed")).toHaveAttribute("data-cal-link", /govin-floyd-6lk5bw\/video-30/);
  await page.getByRole("button", { name: /In-clinic visit/ }).click();
  await expect(page.locator("#cal-embed")).toHaveAttribute("data-cal-link", /govin-floyd-6lk5bw\/clinic-30/);
  await expect(page.getByRole("link", { name: "Open this calendar on Cal.com" })).toHaveAttribute(
    "href",
    "https://cal.com/govin-floyd-6lk5bw/clinic-30"
  );
  await page.locator("#fn").fill("Anika");
  await page.locator("#ph").fill("9876543210");
  await page.locator("#em").fill(`consult.${Date.now()}@example.com`);
  await page.locator("#reason").selectOption("piles");

  await page.goto("/clinic.html");
  await page.evaluate(() => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.open("tej-kaya", 2);
      req.onerror = () => reject(req.error ?? new Error("idb open failed"));
      req.onblocked = () => reject(new Error("idb blocked"));
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("bookings")) {
          db.createObjectStore("bookings", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("prescriptions")) {
          db.createObjectStore("prescriptions", { keyPath: "bookingId" });
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("bookings", "readwrite");
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error ?? new Error("idb put failed"));
        tx.objectStore("bookings").put({
          id: "bkg-e2e",
          createdAt: new Date().toISOString(),
          firstName: "Anika",
          email: "anika@example.com",
          phone: "9876543210",
          skuId: "clinic-1",
          mode: "clinic",
          reason: "piles",
          notes: "Cal.com e2e seed",
          dateIso: "2026-08-14",
          time: "11:00",
          startIso: new Date().toISOString(),
          endIso: new Date().toISOString(),
          status: "confirmed",
          payStatus: "unpaid",
          priceInr: 700,
          calUid: "e2e-cal"
        });
      };
    });
  });

  await page.locator("#pin").fill("urocare");
  await page.getByRole("button", { name: "Enter" }).click();
  await expect(page.getByRole("heading", { name: "Today’s book." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Anika" })).toBeVisible();
  await page.getByRole("button", { name: "Open" }).first().click();
  await page.locator("textarea").nth(1).fill("Sitz bath. Review in 7 days.");
  await page.getByRole("button", { name: "Save letterhead" }).click();
});
