import { test, expect, todayIso, addFromLibrary, synced, goTab, entries, connectedPage, APP } from "../fixtures.mjs";

const bgSync = page => page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));

test.describe("Save & sync safety", () => {
  test("Y1 entry added while a slow sync is loading is not lost", async ({ app, sheet }) => {
    await addFromLibrary(app, "Egg, large", 2);          // today already exists in the Sheet
    await synced(app); await bgSync(app); await synced(app);
    sheet.loadDelayMs = 2500;
    await bgSync(app);                                   // app starts loading from the Sheet (slow)
    await app.waitForTimeout(200);
    await addFromLibrary(app, "Rolled oats", 40);        // added while that load is in flight
    await app.waitForTimeout(3500);                      // let the slow (older) load land
    await expect(app.locator("#meals")).toContainText("Rolled oats");
    sheet.loadDelayMs = 0;
    await addFromLibrary(app, "Greek yogurt 2%", 100);
    await synced(app);
    expect(entries(sheet, todayIso()).map(e => e.name)).toEqual(["Egg, large", "Rolled oats", "Greek yogurt 2%"]);
  });

  test("Y2 offline then back online", async ({ app, sheet }) => {
    sheet.offline = true;
    await addFromLibrary(app, "Rolled oats", 40);
    await expect(app.locator("#status")).toHaveText(/1 change waiting/);
    sheet.offline = false;
    await app.evaluate(() => window.dispatchEvent(new Event("online")));
    await synced(app);
    expect(entries(sheet, todayIso())).toHaveLength(1);
  });

  test("Y3 one rejected record doesn't block later saves", async ({ app, sheet }) => {
    sheet.reject = req => req.action === "put" && req.collection === "body" ? "Your input contains more than the maximum of 50000 characters in a single cell." : null;
    await goTab(app, "body");
    await app.fill("#bKg", "72");
    await app.click('#bodyForm [type="submit"]');
    await expect(app.locator("#toast")).toContainText(/couldn.t save/i, { timeout: 10000 });
    await goTab(app, "today");
    await addFromLibrary(app, "Rolled oats", 40);
    await expect.poll(() => entries(sheet, todayIso()).length, { timeout: 10000 }).toBe(1);
  });

  test("Y4 entry from another device shows up and isn't overwritten", async ({ app, sheet, browser, wire }) => {
    const ctx2 = await browser.newContext({ baseURL: test.info().project.use.baseURL, timezoneId: "America/Edmonton" });
    await wire(ctx2);
    const phone = await connectedPage(ctx2);
    await phone.goto(APP); await synced(phone);
    await addFromLibrary(phone, "Greek yogurt 2%", 150);
    await synced(phone);
    // laptop window was open the whole time; user clicks back into it
    await app.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(app.locator("#meals")).toContainText("Greek yogurt 2%");
    await addFromLibrary(app, "Rolled oats", 40);
    await synced(app);
    expect(entries(sheet, todayIso()).map(e => e.name).sort()).toEqual(["Greek yogurt 2%", "Rolled oats"]);
    await ctx2.close();
  });

  test("Y5 import saves to the Sheet, and says so honestly when it can't", async ({ app, sheet }) => {
    const backup = { foods: { tofu: { id: "tofu", name: "Tofu firm", basis: "100g", kcal: 144, p: 17, c: 3, f: 9, fb: 2 } },
      days: { "2026-10-01": { date: "2026-10-01", entries: [{ id: "x1", meal: "lunch", name: "Soup", kcal: 200, p: 10, c: 20, f: 5, fb: 4 }] } }, body: {}, settings: {} };
    await goTab(app, "settings");
    await app.setInputFiles("#impFile", { name: "budgie.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)) });
    await expect(app.locator("#toast")).toContainText("Import saved to your Sheet");
    expect(sheet.data.foods.tofu).toBeTruthy();
    expect(sheet.data.days["2026-10-01"]).toBeTruthy();

    sheet.offline = true;
    backup.foods.tempeh = { id: "tempeh", name: "Tempeh", basis: "100g", kcal: 192, p: 20, c: 8, f: 11, fb: 5 };
    await app.setInputFiles("#impFile", { name: "budgie2.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)) });
    await expect(app.locator("#toast")).toContainText(/waiting|offline|later/i);
    await expect(app.locator("#toast")).not.toContainText("saved to your Sheet");
  });
});
