// After-deploy checks against the live site. Uses the fake Sheet, never real data.
import { test, expect, todayIso, addFromLibrary, synced, goTab, entries } from "../fixtures.mjs";

test.describe("@live", () => {
  test("D1 live app opens, logs a food, all tabs render", async ({ app, sheet }) => {
    await expect(app.locator("#ver")).toHaveText(/v\d{4}\.\d{2}\.\d{2}/);
    await addFromLibrary(app, "Greek yogurt 2%", 150);
    await synced(app);
    expect(entries(sheet, todayIso())).toHaveLength(1);
    for (const t of ["body", "foods", "settings", "today"]) { await goTab(app, t); await expect(app.locator("#v-" + t)).toBeVisible(); }
  });

  test("D2 live version.json matches the live app", async ({ app, request }) => {
    const shown = (await app.locator("#ver").textContent()).trim();
    const res = await request.get("version.json?t=" + Date.now());
    expect((await res.json()).version).toBe(shown);
    await expect(app.locator("#updBar")).toBeHidden();
  });
});
