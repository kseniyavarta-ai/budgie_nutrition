import { test, expect, todayIso, synced, goTab } from "../fixtures.mjs";

const bgSync = page => page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));

test.describe("Foods and recipes", () => {
  test("F1 new food", async ({ app, sheet }) => {
    await goTab(app, "foods");
    await app.click("#newFood");
    await app.fill("#fName", "Cottage cheese");
    await app.fill("#fK", "98"); await app.fill("#fP", "11");
    await app.click('#foodForm [type="submit"]');
    await synced(app);
    const f = Object.values(sheet.data.foods).find(x => x.name === "Cottage cheese");
    expect(f).toMatchObject({ kcal: 98, p: 11, basis: "100g" });
    await expect(app.locator("#foodList")).toContainText("Cottage cheese");
  });

  test("F2 edit a food's calories", async ({ app, sheet }) => {
    await goTab(app, "foods");
    await app.locator('#foodList [data-f="oats"]').click();
    await app.fill("#fK", "370");
    await app.click('#foodForm [type="submit"]');
    await synced(app);
    expect(sheet.data.foods.oats.kcal).toBe(370);
  });

  test("F3 clearing a note removes it", async ({ app, sheet }) => {
    sheet.data.foods.oats.note = "old note";
    await bgSync(app); await synced(app);
    await goTab(app, "foods");
    await app.locator('#foodList [data-f="oats"]').click();
    await expect(app.locator("#fNote")).toHaveValue("old note");
    await app.fill("#fNote", "");
    await app.click('#foodForm [type="submit"]');
    await synced(app);
    expect(sheet.data.foods.oats.note).toBeFalsy();
  });

  test("F4 favourite survives reload", async ({ app, sheet }) => {
    await goTab(app, "foods");
    await app.locator('#foodList [data-star="egg"]').click();
    await synced(app);
    expect(sheet.data.foods.egg.fav).toBe(true);
    await app.reload(); await synced(app); await goTab(app, "foods");
    await expect(app.locator('#foodList [data-star="egg"]')).toHaveAttribute("aria-pressed", "true");
  });

  test("R1 recipe with a pot gives the right per-100 g numbers", async ({ app, sheet }) => {
    sheet.data.settings.pots = { pots: [{ name: "Dutch oven", g: 2000 }] };
    await bgSync(app); await synced(app);
    await goTab(app, "foods");
    await app.click("#newRecipe");
    await app.fill("#rName", "Overnight oats");
    await app.fill("#rSearch", "oats");
    await app.locator("#rPick button", { hasText: "Rolled oats" }).click();
    await app.locator("#rIngs [data-a]").last().fill("200");
    await app.fill("#rSearch", "yog");
    await app.locator("#rPick button", { hasText: "Greek yogurt" }).click();
    await app.locator("#rIngs [data-a]").last().fill("400");
    await app.selectOption("#rPot", "0");
    await app.fill("#rW", "2800"); // 800 g of food in a 2000 g pot
    await app.click("#rSave");
    await synced(app);
    const r = Object.values(sheet.data.foods).find(f => f.name === "Overnight oats");
    // batch: oats 758 kcal + yogurt 292 kcal = 1050 kcal over 800 g → 131.3 per 100 g
    expect(r).toMatchObject({ kcal: 131.3, group: "Recipes" });
    expect(r.recipe.batchWeight).toBe(800);
  });
});

test.describe("Body, goal and plan", () => {
  test("W1 weigh-in saves", async ({ app, sheet }) => {
    await goTab(app, "body");
    await app.fill("#bKg", "72.4"); await app.fill("#bWa", "80");
    await app.click('#bodyForm [type="submit"]');
    await synced(app);
    expect(sheet.data.body[todayIso()]).toMatchObject({ kg: 72.4, waist: 80 });
  });

  test("W2 comma decimal (72,5) saves as 72.5", async ({ app, sheet }) => {
    await goTab(app, "body");
    await app.locator("#bKg").pressSequentially("72,5");
    await app.click('#bodyForm [type="submit"]');
    await synced(app);
    expect(sheet.data.body[todayIso()]).toMatchObject({ kg: 72.5 });
  });

  test("W3 empty date is refused and nothing broken is queued", async ({ app, sheet }) => {
    await goTab(app, "body");
    await app.fill("#bDate", "");
    await app.fill("#bKg", "72");
    await app.click('#bodyForm [type="submit"]');
    const q = await app.evaluate(() => JSON.parse(localStorage.getItem("budgie-queue") || "[]"));
    expect(q.filter(o => !o.id)).toHaveLength(0);
    expect(Object.keys(sheet.data.body)).not.toContain("");
  });

  test("G1 set a goal", async ({ app, sheet }) => {
    await goTab(app, "body");
    await app.fill("#gGoal", "63");
    await app.click("#gSave");
    await synced(app);
    expect(sheet.data.settings.plan.goalKg).toBe(63);
    await app.reload(); await synced(app); await goTab(app, "body");
    await expect(app.locator("#gGoal")).toHaveValue("63");
  });

  test("G2 typed goal and Set button survive a background sync", async ({ app }) => {
    await goTab(app, "body");
    await app.fill("#gGoal", "61");
    await expect(app.locator("#gSave")).toBeVisible();
    await bgSync(app); await synced(app);
    await expect(app.locator("#gGoal")).toHaveValue("61");
    await expect(app.locator("#gSave")).toBeVisible();
  });

  test("PL1 save plan numbers by hand", async ({ app, sheet }) => {
    await goTab(app, "settings");
    await app.locator("details summary").click();
    await app.fill("#pLow", "1650"); await app.fill("#pHigh", "1700");
    await app.click('#planForm [type="submit"]');
    await synced(app);
    expect(sheet.data.settings.plan).toMatchObject({ kcalLow: 1650, kcalHigh: 1700 });
  });

  test("PL2 typing in the plan isn't wiped by a background sync", async ({ app, sheet }) => {
    await goTab(app, "settings");
    await app.locator("details summary").click();
    await app.fill("#pLow", "1600");
    await app.fill("#uAge", "39");
    await bgSync(app); await synced(app);
    await expect(app.locator("#pLow")).toHaveValue("1600");
    await expect(app.locator("#uAge")).toHaveValue("39");
    await app.click('#planForm [type="submit"]');
    await synced(app);
    expect(sheet.data.settings.plan.kcalLow).toBe(1600);
  });
});
