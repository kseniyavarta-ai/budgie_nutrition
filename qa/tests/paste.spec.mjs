// "Paste from Claude": a code (or link) carrying foods/recipes that Claude made. Adds only what you don't have yet.
import { test, expect, synced, goTab, todayIso } from "../fixtures.mjs";

const code = foods => "budgie-add:" + Buffer.from(JSON.stringify({ v: 1, foods })).toString("base64");
const SOUP = [
  { id: "qa-broth", name: "QA broth", basis: "100g", unit: "", group: "Pantry", kcal: 20, p: 2.5, c: 0.4, f: 1, fb: 0 },
  { id: "egg", name: "Egg (Claude's numbers)", basis: "unit", unit: "egg", kcal: 999, p: 0, c: 0, f: 0, fb: 0 },   // you already have egg: must stay yours
  { id: "qa-soup", name: "QA soup", basis: "100g", unit: "", group: "Recipes", kcal: 25.7, p: 2.5, c: 0.2, f: 1.6, fb: 0,
    recipe: { ingredients: [{ foodId: "qa-broth", amount: 1000 }, { foodId: "egg", amount: 2 }], cookedWeight: null, pot: "", batchWeight: 1100, batch: { kcal: 344, p: 37.6, c: 4.8, f: 19.6, fb: 0 } } },
];

test.describe("Paste from Claude", () => {
  test("LK1 paste a code → preview → Add: new foods and the recipe join your library, yours stay as they are", async ({ app, sheet }) => {
    await goTab(app, "foods");
    await app.click("#pasteBtn");
    await expect(app.locator("#pasteSheet")).toBeVisible();
    await expect(app.locator("#pasteAdd")).toBeDisabled();
    await app.fill("#pasteText", "Here you go:\n" + code(SOUP) + "\nEnjoy!");
    await expect(app.locator("#pasteOut")).toContainText("QA soup");
    await expect(app.locator("#pasteOut")).toContainText(/already in your library/i);
    await expect(app.locator("#pasteAdd")).toHaveText("Add 2 to my library");
    expect(sheet.data.foods["qa-soup"]).toBeUndefined();          // nothing added before you tap Add
    await app.click("#pasteAdd");
    await expect(app.locator("#pasteSheet")).toBeHidden();
    await synced(app);
    expect(sheet.data.foods["qa-soup"]).toMatchObject({ name: "QA soup", kcal: 25.7, group: "Recipes" });
    expect(sheet.data.foods["qa-broth"]).toMatchObject({ kcal: 20 });
    expect(sheet.data.foods.egg.kcal).toBe(72);                    // your egg unchanged
    await expect(app.locator("#foodList")).toContainText("QA soup");
    await app.locator('#foodList [data-f="qa-soup"]').click();     // opens as an editable recipe
    await expect(app.locator("#recTitle")).toHaveText("Edit recipe");
    await expect(app.locator("#rIngs .ing")).toHaveCount(2);
  });

  test("LK2 something that isn't a code is explained, Add stays off", async ({ app }) => {
    await goTab(app, "foods");
    await app.click("#pasteBtn");
    await app.fill("#pasteText", "chicken soup please");
    await expect(app.locator("#pasteOut")).toContainText("doesn't look like a Budgie code");
    await expect(app.locator("#pasteAdd")).toBeDisabled();
  });

  test("LK3 opening a #add= link shows the preview; × adds nothing", async ({ app, sheet }) => {
    const b64 = code(SOUP).slice("budgie-add:".length);
    await app.evaluate(h => { location.hash = "add=" + h; }, b64);
    await expect(app.locator("#pasteSheet")).toBeVisible();
    await expect(app.locator("#pasteOut")).toContainText("QA soup");
    await app.click("#pasteSheet [data-close]");
    await synced(app);
    expect(sheet.data.foods["qa-soup"]).toBeUndefined();
  });

  test("LK4 pasting the same code again adds nothing new", async ({ app, sheet }) => {
    sheet.data.foods["qa-broth"] = SOUP[0]; sheet.data.foods["qa-soup"] = SOUP[2];
    await app.evaluate(() => document.dispatchEvent(new Event("visibilitychange"))); await synced(app);
    await goTab(app, "foods");
    await app.click("#pasteBtn");
    await app.fill("#pasteText", code(SOUP));
    await expect(app.locator("#pasteOut")).toContainText(/already/i);
    await expect(app.locator("#pasteAdd")).toBeDisabled();
  });
});
