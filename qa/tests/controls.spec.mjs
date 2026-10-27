// Every button, field and switch that the older specs didn't touch yet.
// Each test is one row in qa/TEST_CASES.md (same id). The coverage gate (coverage.spec.mjs)
// fails if a control in index.html is not used by any test.
import { test, expect, todayIso, shiftIso, openAdd, addFromLibrary, synced, entries, goTab, SHEET_URL, TOKEN } from "../fixtures.mjs";
import { connectedPage, APP } from "../fixtures.mjs";

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
const png = name => ({ name, mimeType: "image/png", buffer: PNG });
const bgSync = page => page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
const setupCode = (u, t) => "budgie:" + Buffer.from(JSON.stringify({ u, t })).toString("base64");

test.describe("Setup screen", () => {
  test("SU1 setup code from another device fills URL and token, then connects", async ({ context, wire, sheet }) => {
    await wire(context);
    const page = await connectedPage(context, { connected: false });
    await page.goto(APP);
    await page.fill("#sCode", setupCode(SHEET_URL, TOKEN));
    await expect(page.locator("#sUrl")).toHaveValue(SHEET_URL);
    await expect(page.locator("#sTok")).toHaveValue(TOKEN);
    await page.click("#sGo");
    await expect(page.locator("#setup")).toBeHidden();
    await synced(page);
    expect(page.errors).toEqual([]);
  });

  test("SU2 'Try it without a Sheet' opens the app on this phone only", async ({ context, wire }) => {
    await wire(context);
    const page = await connectedPage(context, { connected: false });
    await page.goto(APP);
    await page.click("#sLocal");
    await expect(page.locator("#setup")).toBeHidden();
    await expect(page.locator("#status")).toHaveText("On this phone only");
    await page.reload();
    await expect(page.locator("#setup")).toBeHidden();   // remembered
    expect(page.errors).toEqual([]);
  });
});

test.describe("Today screen", () => {
  test("DN1 previous / next day arrows", async ({ app }) => {
    await app.click("#prev");
    await expect(app.locator("#dlabel")).toContainText("Yesterday");
    await app.click("#next");
    await expect(app.locator("#dlabel")).toContainText("Today");
  });

  test("A1 pick a food by tapping it in the list (per-piece food starts at 1)", async ({ app, sheet }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="lib"]');
    await app.click('#aPick [data-id="egg"]');
    await expect(app.locator("#aAmt")).toHaveValue("1");
    await app.click("#aAdd");
    await synced(app);
    expect(entries(sheet, todayIso())[0]).toMatchObject({ foodId: "egg", amount: 1, kcal: 72 });
  });

  test("A9 searching moves the search box to the top so results show above the keyboard", async ({ app }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="lib"]');
    await app.fill("#aSearch", "o");
    const sheetTop = (await app.locator("#addSheet").boundingBox()).y;
    const searchTop = (await app.locator("#aSearch").boundingBox()).y;
    expect(searchTop - sheetTop, "search box is right under the title").toBeLessThan(80);
    await expect(app.locator("#modeSeg")).toBeHidden();          // Meal and mode rows step aside while searching
    await expect(app.locator("#addTitle")).toHaveText(/^Add to /);  // …and the title still says which meal
    await expect(app.locator("#aPick button").first()).toBeInViewport();
  });

  test("A10 sheet fits the space above the phone keyboard", async ({ app }) => {
    await openAdd(app);
    const r = await app.evaluate(() => {
      const vv = window.visualViewport; Object.defineProperty(vv, "height", { configurable: true, get: () => 400 });
      Object.defineProperty(vv, "offsetTop", { configurable: true, get: () => 0 });
      vv.dispatchEvent(new Event("resize"));
      const s = document.getElementById("addSheet"), b = s.getBoundingClientRect();
      return { bottom: b.bottom, height: b.height };
    });
    expect(r.bottom).toBeLessThanOrEqual(401);   // nothing hidden under the keyboard
    expect(r.height).toBeLessThanOrEqual(400);
  });

  test("A11 the food you tap shows clearly as Selected (not logged yet); Change goes back to the list", async ({ app, sheet }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="lib"]');
    await app.fill("#aSearch", "oat");
    await app.click('#aPick [data-id="oats"]');
    await expect(app.locator("#aPicked")).toBeVisible();
    await expect(app.locator("#aPicked")).toContainText("Rolled oats");
    await expect(app.locator("#aPicked")).toContainText(/not in your log yet/i);
    await expect(app.locator("#aPick")).toBeHidden();
    await expect(app.locator("#aAmt")).toBeInViewport();
    expect(entries(sheet, todayIso())).toHaveLength(0);
    await app.click("#aChange");
    await expect(app.locator("#aPick")).toBeVisible();
    await expect(app.locator("#aSearch")).toBeFocused();
  });

  test("A12 food not found → add it as a new food → back on Add with it selected", async ({ app, sheet }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="lib"]');
    await app.selectOption("#aMeal", "dinner");
    await app.fill("#aSearch", "Kefir");
    await app.click("#aPick [data-newfood]");
    await expect(app.locator("#foodSheet")).toBeVisible();
    await expect(app.locator("#fName")).toHaveValue("Kefir");
    await app.fill("#fK", "41"); await app.fill("#fP", "3.4");
    await app.click('#foodForm [type="submit"]');
    await expect(app.locator("#addSheet")).toBeVisible();
    await expect(app.locator("#aPicked")).toContainText("Kefir");
    await expect(app.locator("#aMeal")).toHaveValue("dinner");
    await app.fill("#aAmt", "200");
    await app.click("#aAdd");
    await synced(app);
    expect(entries(sheet, todayIso())[0]).toMatchObject({ name: "Kefir", amount: 200, kcal: 82, meal: "dinner" });
  });

  test("A2 quick entry saves carbs, fat and fibre too", async ({ app, sheet }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="quick"]');
    await app.fill("#qName", "Café latte");
    await app.fill("#qK", "190"); await app.fill("#qP", "10");
    await app.fill("#qC", "15"); await app.fill("#qF", "9,5"); await app.fill("#qFb", "0");
    await app.click("#aAdd");
    await synced(app);
    expect(entries(sheet, todayIso())[0]).toMatchObject({ name: "Café latte", kcal: 190, p: 10, c: 15, f: 9.5, fb: 0 });
  });

  test("A2b quick entry: the keyboard's Return/Go key adds it (no page reload, nothing lost)", async ({ app, sheet }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="quick"]');
    await app.fill("#qName", "Apple"); await app.fill("#qK", "95");
    await app.evaluate(() => { window.__noReload = 1; });
    await app.locator("#m-quick #qK").press("Enter");
    await expect(app.locator("#addSheet")).toBeHidden();
    await synced(app);
    expect(await app.evaluate(() => window.__noReload)).toBe(1);   // same page, not reloaded
    expect(entries(sheet, todayIso()).map(e => e.name)).toEqual(["Apple"]);
  });

  test("A3 'Remove from log' inside the edit screen", async ({ app, sheet }) => {
    await addFromLibrary(app, "Rolled oats", 40);
    await app.locator("#meals [data-edit]").first().click();
    await expect(app.locator("#aDel")).toBeVisible();
    await app.click("#aDel");
    await synced(app);
    expect(entries(sheet, todayIso())).toHaveLength(0);
  });

  test("A4 × closes the add screen without saving", async ({ app, sheet }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="quick"]');
    await app.fill("#qName", "Should not save"); await app.fill("#qK", "100");
    await app.click("#addSheet [data-close]");
    await expect(app.locator("#addSheet")).toBeHidden();
    expect(entries(sheet, todayIso())).toHaveLength(0);
  });

  test("A5 Say review: untick a line, pick a food for one Budgie didn't know", async ({ app, sheet }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="say"]');
    await app.fill("#sayText", "two eggs and 40 g rolled oats and some kombucha");
    await app.click("#aAdd");
    await expect(app.locator("#sayOut .ai-item[data-item]")).toHaveCount(3);
    await app.locator('#sayOut [data-pick="2"]').selectOption("greek-yogurt");
    await app.locator('#sayOut [data-n="1"]').uncheck();   // drop the oats
    await expect(app.locator("#aAdd")).toHaveText("Add 2 to log");
    await app.click("#aAdd");
    await synced(app);
    expect(entries(sheet, todayIso()).map(e => e.foodId)).toEqual(["egg", "greek-yogurt"]);
  });

  test("A6 nutrition-label photo with a note opens a new food with the label's numbers", async ({ app, sheet }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="photo"]');
    await app.setInputFiles("#phFile", png("label.png"));
    await app.check("#phLabel");
    await app.fill("#phNote", "serving is one 40 g bar");
    await app.click("#phGo");
    await expect(app.locator("#foodSheet")).toBeVisible();
    await expect(app.locator("#fName")).toHaveValue("Test bar");
    await expect(app.locator("#fK")).toHaveValue("400");
    expect(sheet.lastReq.prompt).toContain("serving is one 40 g bar");
    await app.click('#foodForm [type="submit"]');
    await synced(app);
    expect(Object.values(sheet.data.foods).find(f => f.name === "Test bar")).toMatchObject({ kcal: 400, p: 20 });
  });

  test("A7 barcode photo is read and fills in the food", async ({ app }) => {
    await app.evaluate(() => { window.BarcodeDetector = class { async detect() { return [{ rawValue: "0123456789012" }]; } }; });
    await openAdd(app);
    await app.click('#modeSeg [data-m="barcode"]');
    await app.setInputFiles("#bcFile", png("barcode.png"));
    await expect(app.locator("#foodSheet")).toBeVisible();
    await expect(app.locator("#fName")).toHaveValue("QA Foods Protein Bar");
  });

  test("A8 unreadable barcode photo says what to do", async ({ app }) => {
    await app.context().route(/unpkg\.com/, r => r.abort());
    await app.evaluate(() => { delete window.BarcodeDetector; });
    await openAdd(app);
    await app.click('#modeSeg [data-m="barcode"]');
    await app.setInputFiles("#bcFile", png("blurry.png"));
    await expect(app.locator("#bcOut")).toContainText("Couldn't read the barcode");
  });
});

test.describe("Foods screen", () => {
  test("FD1 search box filters the list", async ({ app }) => {
    await goTab(app, "foods");
    await app.fill("#fSearch", "yog");
    await expect(app.locator("#foodList")).toContainText("Greek yogurt");
    await expect(app.locator("#foodList")).not.toContainText("Rolled oats");
  });

  test("FD2 food-group chips filter the list", async ({ app }) => {
    await goTab(app, "foods");
    await app.click('#gChips [data-g="Dairy"]');
    await expect(app.locator("#foodList")).toContainText("Greek yogurt");
    await expect(app.locator("#foodList")).not.toContainText("Rolled oats");
    await app.click('#gChips [data-g=""]');
    await expect(app.locator("#foodList")).toContainText("Rolled oats");
  });

  test("FD3 new per-piece food saves every field", async ({ app, sheet }) => {
    await goTab(app, "foods");
    await app.click("#newFood");
    await app.fill("#fName", "Rice cake");
    await app.selectOption("#fBasis", "unit");
    await app.fill("#fUnit", "cake");
    await app.fill("#fK", "35"); await app.fill("#fP", "0.7"); await app.fill("#fC", "7.3"); await app.fill("#fF", "0.3"); await app.fill("#fFb", "0.4");
    await app.fill("#fPieceG", "9");
    await app.selectOption("#fGroup", "Grains & starches");
    await app.check("#fFav");
    await app.click('#foodForm [type="submit"]');
    await synced(app);
    const f = Object.values(sheet.data.foods).find(x => x.name === "Rice cake");
    expect(f).toMatchObject({ basis: "unit", unit: "cake", kcal: 35, p: 0.7, c: 7.3, f: 0.3, fb: 0.4, pieceG: 9, group: "Grains & starches", fav: true });
  });

  test("FD4 delete a food needs two taps", async ({ app, sheet }) => {
    await goTab(app, "foods");
    await app.locator('#foodList [data-f="oats"]').click();
    await app.click("#fDel");
    await expect(app.locator("#fDel")).toHaveText("Tap again to delete");
    expect(sheet.data.foods.oats).toBeTruthy();          // first tap deletes nothing
    await app.click("#fDel");
    await synced(app);
    expect(sheet.data.foods.oats).toBeUndefined();
  });

  test("FD5 × closes the food screen without saving", async ({ app, sheet }) => {
    await goTab(app, "foods");
    await app.click("#newFood");
    await app.fill("#fName", "Not saved");
    await app.click("#foodSheet [data-close]");
    await expect(app.locator("#foodSheet")).toBeHidden();
    expect(Object.values(sheet.data.foods).some(f => f.name === "Not saved")).toBe(false);
  });
});

test.describe("Recipes", () => {
  test("RC1 your own ingredient with numbers per 100 g; remove an ingredient", async ({ app, sheet }) => {
    await goTab(app, "foods");
    await app.click("#newRecipe");
    await app.fill("#rName", "Tahini sauce");
    await app.fill("#rSearch", "Tahini");
    await app.click("#rPick [data-new]");
    await app.locator('#rIngs [data-a="0"]').fill("50");
    await app.locator('#rIngs [data-n="0"][data-k="kcal"]').fill("600");
    await app.locator('#rIngs [data-n="0"][data-k="p"]').fill("17");
    await app.fill("#rSearch", "oats");
    await app.locator("#rPick button", { hasText: "Rolled oats" }).click();
    await expect(app.locator("#rIngs .ing")).toHaveCount(2);
    await app.click('#rIngs [data-rm="1"]');
    await expect(app.locator("#rIngs .ing")).toHaveCount(1);
    await app.click("#rSave");
    await synced(app);
    // 50 g at 600 kcal/100 g, no cooked weight → per 100 g = 600
    expect(Object.values(sheet.data.foods).find(f => f.name === "Tahini sauce")).toMatchObject({ kcal: 600, p: 17 });
  });

  test("RC2 delete a recipe needs two taps", async ({ app, sheet }) => {
    sheet.data.foods.stew = { id: "stew", name: "Test stew", basis: "100g", unit: "", group: "Recipes", kcal: 126, p: 4.3, c: 23, f: 2.2, fb: 3.3,
      recipe: { ingredients: [{ foodId: "oats", amount: 100 }], cookedWeight: 300, pot: "", batchWeight: 300 } };
    await bgSync(app); await synced(app);
    await goTab(app, "foods");
    await app.locator('#foodList [data-f="stew"]').click();
    await expect(app.locator("#recTitle")).toHaveText("Edit recipe");
    await app.click("#rDel");
    await expect(app.locator("#rDel")).toHaveText("Tap again to delete");
    await app.click("#rDel");
    await synced(app);
    expect(sheet.data.foods.stew).toBeUndefined();
  });

  test("RC3 × closes the recipe screen without saving", async ({ app, sheet }) => {
    await goTab(app, "foods");
    await app.click("#newRecipe");
    await app.fill("#rName", "Not saved");
    await app.click("#recSheet [data-close]");
    await expect(app.locator("#recSheet")).toBeHidden();
    expect(Object.values(sheet.data.foods).some(f => f.name === "Not saved")).toBe(false);
  });
});

test.describe("Recipes with the AI switch on", () => {
  test.use({ sayAI: true });
  test("RC4 recipe photo is read by the AI into ingredients", async ({ app }) => {
    await goTab(app, "foods");
    await app.click("#newRecipe");
    await app.setInputFiles("#rPhoto", png("recipe.png"));
    await expect(app.locator("#rName")).toHaveValue("Photo oats");
    await expect(app.locator("#rIngs .ing")).toHaveCount(2);
  });
});

test.describe("Body screen", () => {
  test("BD1 weigh-in with waist and hips, then delete it with two taps", async ({ app, sheet }) => {
    await goTab(app, "body");
    await app.fill("#bKg", "66.4"); await app.fill("#bWa", "70"); await app.fill("#bHi", "91");
    await app.click('#bodyForm [type="submit"]');
    await synced(app);
    const d = todayIso();
    expect(sheet.data.body[d]).toMatchObject({ kg: 66.4, waist: 70, hips: 91 });
    await expect(app.locator("#bHips")).toHaveText("91 cm");
    await app.click(`#bodyList [data-bd="${d}"]`);
    await app.click(`#bodyList [data-bd="${d}"]`);
    await synced(app);
    expect(sheet.data.body[d]).toBeUndefined();
  });
});

test.describe("Body goal", () => {
  test("BD2 Return key in the goal box sets the goal", async ({ app, sheet }) => {
    await goTab(app, "body");
    await app.fill("#gGoal", "62");
    await app.locator("#goalForm #gGoal").press("Enter");
    await synced(app);
    expect(sheet.data.settings.plan.goalKg).toBe(62);
  });
});

test.describe("Settings screen", () => {
  test("ST1 'Calculate for me' uses every profile field, 'Use this plan' saves it", async ({ app, sheet }) => {
    await goTab(app, "settings");
    await app.selectOption("#uSex", "f");
    await app.fill("#uAge", "39"); await app.fill("#uH", "177"); await app.fill("#uW", "66.6");
    await app.selectOption("#uAct", "1.375");
    await app.fill("#uGoal", "63");
    await app.selectOption("#uPace", "0.25");
    await app.fill("#uBf", "22");
    await app.selectOption("#uProt", "2.0");
    await app.click('#profForm [type="submit"]');
    await expect(app.locator("#calcOut")).toBeVisible();
    await expect(app.locator("#calcOut")).toContainText("Katch-McArdle");   // body fat given → lean-mass formula
    await app.click("#usePlan");
    await synced(app);
    const P = sheet.data.settings.plan;
    expect(P.profile).toMatchObject({ sex: "f", age: 39, height: 177, weight: 66.6, activity: 1.375, pace: 0.25, bf: 22, prot: 2 });
    expect(P.goalKg).toBe(63);
    expect(P.protein).toBe(135);   // 2.0 g × 66.6 kg = 133, rounded to the nearest 5 g
  });

  test("ST2 'Save my numbers' keeps protein, fibre, start weight and date", async ({ app, sheet }) => {
    await goTab(app, "settings");
    await app.locator("details summary").click();
    await app.fill("#pProt", "120"); await app.fill("#pFib", "30");
    await app.fill("#pStart", "66.6"); await app.fill("#pDate", "2026-10-19");
    await app.click('#planForm [type="submit"]');
    await synced(app);
    expect(sheet.data.settings.plan).toMatchObject({ protein: 120, fibre: 30, startKg: 66.6, startDate: "2026-10-19" });
  });

  test("ST3 add a pot, then delete it", async ({ app, sheet }) => {
    await goTab(app, "settings");
    await app.fill("#potName", "Dutch oven"); await app.fill("#potG", "2000");
    await app.click('#potForm [type="submit"]');
    await synced(app);
    expect(sheet.data.settings.pots.pots).toEqual([{ name: "Dutch oven", g: 2000 }]);
    await app.click('#potList [data-pot="0"]');
    await synced(app);
    expect(sheet.data.settings.pots.pots).toEqual([]);
  });

  test("ST4 'Save and test': wrong token is explained, right token connects", async ({ app }) => {
    await goTab(app, "settings");
    await expect(app.locator("#cUrl")).toHaveValue(SHEET_URL);
    await app.fill("#cTok", "wrong");
    await app.click("#cSave");
    await expect(app.locator("#toast")).toContainText("token doesn't match");
    await app.fill("#cUrl", SHEET_URL); await app.fill("#cTok", TOKEN);
    await app.click("#cSave");
    await expect(app.locator("#toast")).toContainText("Connected to your Sheet");
  });

  test("ST5 'Sync now' brings in changes made elsewhere", async ({ app, sheet }) => {
    sheet.data.foods.kefir = { id: "kefir", name: "Kefir 1%", basis: "100g", unit: "", group: "Dairy", kcal: 41, p: 3.4, c: 4.8, f: 1, fb: 0 };
    await goTab(app, "settings");
    await app.click("#cSync");
    await synced(app);
    await goTab(app, "foods");
    await expect(app.locator("#foodList")).toContainText("Kefir 1%");
  });

  test("ST6 'Copy setup code' copies a code that sets up another phone", async ({ app, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await goTab(app, "settings");
    await app.click("#cCode");
    await expect(app.locator("#toast")).toContainText("Setup code copied");
    const code = await app.evaluate(() => navigator.clipboard.readText());
    expect(code.startsWith("budgie:")).toBe(true);
    expect(JSON.parse(Buffer.from(code.slice(7), "base64").toString())).toEqual({ u: SHEET_URL, t: TOKEN });
  });

  test("ST7 'Export backup' downloads everything", async ({ app }) => {
    await addFromLibrary(app, "Rolled oats", 40);
    await goTab(app, "settings");
    const [dl] = await Promise.all([app.waitForEvent("download"), app.click("#expBtn")]);
    expect(dl.suggestedFilename()).toBe(`budgie-backup-${todayIso()}.json`);
    const fs = await import("node:fs");
    const j = JSON.parse(fs.readFileSync(await dl.path(), "utf8"));
    expect(Object.keys(j.foods)).toEqual(expect.arrayContaining(["oats", "egg", "greek-yogurt"]));
    expect(j.days[todayIso()].entries).toHaveLength(1);
  });
});

test.describe("Updates", () => {
  test("UP1 new version banner appears and reloads the app", async ({ app }) => {
    await app.context().route(/version\.json/, r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ version: "v2099.01.01 · future" }) }));
    await bgSync(app);
    await expect(app.locator("#updBar")).toBeVisible();
    await app.click("#updBar");
    await app.waitForURL(/\?v=\d+/);
    await expect(app.locator("#status")).toHaveText(/Synced|Saved to Sheet/);
  });
});
