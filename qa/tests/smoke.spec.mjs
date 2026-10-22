import { test, expect, APP, SHEET_URL, TOKEN, connectedPage, todayIso, addFromLibrary, synced, goTab, entries } from "../fixtures.mjs";

test.describe("@smoke", () => {
  test("S1 app opens without errors", async ({ app }) => {
    await expect(app.locator("#ver")).toHaveText(/v\d{4}\.\d{2}\.\d{2}/);
    await expect(app.locator("#v-today")).toBeVisible();
    await expect(app.locator("#kEaten")).toContainText("kcal eaten");
  });

  test("S2 connect to the Sheet from the setup screen", async ({ context, wire, sheet }) => {
    await wire(context);
    const page = await connectedPage(context, { connected: false });
    await page.goto(APP);
    await expect(page.locator("#setup")).toBeVisible();
    await page.fill("#sUrl", SHEET_URL);
    await page.fill("#sTok", TOKEN);
    await page.click("#sGo");
    await expect(page.locator("#setup")).toBeHidden();
    await synced(page);
    expect(sheet.log).toContain("load");
    expect(page.errors).toEqual([]);
  });

  test("S3 log a food from the library", async ({ app, sheet }) => {
    await addFromLibrary(app, "Greek yogurt 2%", 150, "breakfast");
    await expect(app.locator("#meals")).toContainText("Greek yogurt 2%");
    await expect(app.locator("#kEaten")).toContainText("110");
    await synced(app);
    const e = entries(sheet, todayIso());
    expect(e).toHaveLength(1);
    expect(e[0]).toMatchObject({ foodId: "greek-yogurt", amount: 150, kcal: 109.5, meal: "breakfast" });
  });

  test("S4 entry survives a reload", async ({ app, sheet }) => {
    await addFromLibrary(app, "Rolled oats", 40);
    await synced(app);
    await app.evaluate(() => localStorage.removeItem("budgie-db")); // force it to come from the Sheet
    await app.reload();
    await synced(app);
    await expect(app.locator("#meals")).toContainText("Rolled oats");
  });

  test("S5 every tab renders", async ({ app }) => {
    for (const t of ["body", "foods", "settings", "today"]) {
      await goTab(app, t);
      await expect(app.locator("#v-" + t)).toBeVisible();
    }
    await goTab(app, "foods");
    await expect(app.locator("#foodList")).toContainText("Rolled oats");
  });
});
