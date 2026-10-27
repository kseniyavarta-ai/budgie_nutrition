import { test as base, expect } from "@playwright/test";
import { FakeSheet, SHEET_URL, TOKEN } from "./fake-sheet.mjs";

export const APP = process.env.APP ?? "index.html";

export function todayIso() {
  // tests run with timezoneId America/Edmonton; compute the same "today" the app uses
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Edmonton" });
}
export function shiftIso(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

async function wire(context, sheet) {
  await context.route(SHEET_URL, r => sheet.handle(r));
  await context.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  // fake Open Food Facts: 0000000000000 is "not found", 1111111111111 has no nutrition data, anything else is a protein bar
  await context.route(/openfoodfacts\.org/, r => {
    const u = r.request().url();
    if (/\/0000000000000\b/.test(u)) return r.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ status: 0, status_verbose: "product not found" }) });
    if (/\/1111111111111\b/.test(u)) return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: 1, product: { product_name: "Mystery tea", nutriments: {} } }) });
    return r.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify({ status: 1, product: { product_name: "Protein Bar", brands: "QA Foods", serving_size: "40 g", serving_quantity: 40,
        categories_tags: ["en:snacks", "en:protein-bars"],
        nutriments: { "energy-kcal_100g": 400, proteins_100g: 25, carbohydrates_100g: 40, fat_100g: 14, fiber_100g: 9 } } }) });
  });
}

export async function connectedPage(context, { connected = true } = {}) {
  const page = await context.newPage();
  if (connected) {
    await page.addInitScript(([u, t]) => {
      if (!localStorage.getItem("budgie-conn")) localStorage.setItem("budgie-conn", JSON.stringify({ url: u, token: t }));
    }, [SHEET_URL, TOKEN]);
  }
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.errors = errors;
  return page;
}

export const test = base.extend({
  sayAI: [false, { option: true }],   // turn on "Use AI for Say" in the seeded settings
  sheet: async ({ sayAI }, use) => { const sh = new FakeSheet(); if (sayAI) sh.data.settings.prefs = { sayAI: true }; await use(sh); },
  app: async ({ context, sheet }, use) => {
    await wire(context, sheet);
    const page = await connectedPage(context);
    await page.goto(APP);
    await expect(page.locator("#status")).toHaveText(/Synced|Saved to Sheet/);
    await use(page);
    expect(page.errors, "JavaScript errors on the page").toEqual([]);
  },
  wire: async ({ sheet }, use) => { await use(ctx => wire(ctx, sheet)); },
});
export { expect, SHEET_URL, TOKEN };

/* ---------- user actions ---------- */
export async function openAdd(page) { await page.click("#fab"); await expect(page.locator("#addSheet")).toBeVisible(); }
export async function addFromLibrary(page, foodName, amount, meal) {
  await openAdd(page);
  await page.click('#modeSeg [data-m="lib"]');
  if (meal) await page.selectOption("#aMeal", meal);
  await page.fill("#aSearch", foodName.split(" ")[0]);
  await page.locator("#aPick button", { hasText: foodName }).first().click();
  await page.fill("#aAmt", String(amount));
  await page.click("#aAdd");
  await expect(page.locator("#addSheet")).toBeHidden();
}
export async function synced(page) {
  await expect(page.locator("#status")).toHaveText(/Synced|Saved to Sheet/, { timeout: 15000 });
}
export async function goTab(page, t) { await page.click(`.tabs [data-tab="${t}"]`); }
// phone camera stand-in: a blank video stream and a barcode reader that "sees" code (or nothing, or a blocked camera)
export async function fakeCamera(page, code, { blocked = false } = {}) {
  await page.evaluate(([c, blocked]) => {
    window.BarcodeDetector = class { async detect() { return c ? [{ rawValue: c }] : []; } };
    if (!navigator.mediaDevices) Object.defineProperty(navigator, "mediaDevices", { value: {}, configurable: true });
    navigator.mediaDevices.getUserMedia = async () => {
      if (blocked) throw new DOMException("Permission denied", "NotAllowedError");
      const cv = document.createElement("canvas"); cv.width = cv.height = 16; cv.getContext("2d").fillRect(0, 0, 16, 16);
      window.__camOn = true; return cv.captureStream(5);
    };
  }, [code, blocked]);
}
export const entries = (sheet, date) => ((sheet.day(date) || {}).entries) || [];
