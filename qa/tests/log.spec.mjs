import { test, expect, todayIso, shiftIso, openAdd, addFromLibrary, synced, entries, goTab, SHEET_URL, fakeCamera } from "../fixtures.mjs";
const bgSync = page => page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));

test.describe("Food log", () => {
  test("L1 edit an entry's grams", async ({ app, sheet }) => {
    await addFromLibrary(app, "Rolled oats", 40);
    await app.locator("#meals [data-edit]").first().click();
    await expect(app.locator("#addTitle")).toHaveText("Edit entry");
    await app.fill("#aAmt", "60");
    await app.click("#aAdd");
    await synced(app);
    const e = entries(sheet, todayIso());
    expect(e).toHaveLength(1);
    expect(e[0]).toMatchObject({ amount: 60, kcal: 227.4 });
  });

  test("L2 move an entry to another meal", async ({ app, sheet }) => {
    await addFromLibrary(app, "Rolled oats", 40, "breakfast");
    await app.locator("#meals [data-edit]").first().click();
    await app.selectOption("#aMeal", "dinner");
    await app.click("#aAdd");
    await synced(app);
    expect(entries(sheet, todayIso())[0].meal).toBe("dinner");
  });

  test("L3 remove an entry", async ({ app, sheet }) => {
    await addFromLibrary(app, "Rolled oats", 40);
    await addFromLibrary(app, "Greek yogurt 2%", 100);
    await app.locator("#meals [data-del]").first().click();
    await synced(app);
    expect(entries(sheet, todayIso())).toHaveLength(1);
    await expect(app.locator("#meals [data-del]")).toHaveCount(1);
  });

  test("L4 quick entry", async ({ app, sheet }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="quick"]');
    await app.fill("#qName", "Restaurant salad");
    await app.fill("#qK", "420");
    await app.fill("#qP", "18");
    await app.click("#aAdd");
    await synced(app);
    expect(entries(sheet, todayIso())[0]).toMatchObject({ name: "Restaurant salad", kcal: 420, p: 18 });
  });

  test("L5 log on yesterday", async ({ app, sheet }) => {
    await app.click("#prev");
    await expect(app.locator("#dlabel")).toContainText("Yesterday");
    await addFromLibrary(app, "Rolled oats", 50);
    await synced(app);
    expect(entries(sheet, shiftIso(todayIso(), -1))).toHaveLength(1);
    expect(entries(sheet, todayIso())).toHaveLength(0);
  });
});

test.describe("Say, Budgie reads it itself (no AI)", () => {
  async function sayLocal(app, text) {
    await openAdd(app);
    await app.click('#modeSeg [data-m="say"]');
    await app.fill("#sayText", text);
    await app.click("#aAdd");
  }
  test("N1 no AI call; amounts and library foods are understood", async ({ app, sheet }) => {
    await sayLocal(app, "for breakfast 150 grams of greek yogurt and two eggs");
    await expect(app.locator("#sayOut .ai-item[data-item]")).toHaveCount(2);
    await expect(app.locator("#aMeal")).toHaveValue("breakfast");
    await expect(app.locator("#sayOut")).toContainText("Greek yogurt 2%");
    await expect(app.locator("#sayOut")).toContainText("Egg, large");
    await expect(app.locator("#sayOut .ai-total")).toContainText("254 kcal"); // 109.5 + 144
    expect(sheet.log).not.toContain("ai");
    await app.click("#aAdd");
    await expect(app.locator("#addSheet")).toBeHidden();
    await synced(app);
    expect(entries(sheet, todayIso()).map(e => [e.name, e.amount])).toEqual([["Greek yogurt 2%", 150], ["Egg, large", 2]]);
  });
  test("N2 spoken numbers and units: half a cup of oats, a couple of eggs", async ({ app }) => {
    await sayLocal(app, "half a cup of rolled oats and a couple of eggs");
    await expect(app.locator('#sayOut [data-g="0"]')).toHaveValue("80");
    await expect(app.locator('#sayOut [data-g="1"]')).toHaveValue("2");
  });
  test("N3 food not in the library is not saved until you pick one; the pick is remembered", async ({ app, sheet }) => {
    await sayLocal(app, "two eggs and a bowl of porridge oats and some kombucha");
    const rows = app.locator("#sayOut .ai-item[data-item]");
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(2)).toContainText("Not in your library");
    await expect(app.locator("#aAdd")).toHaveText("Add 2 to log");
    await rows.nth(2).locator("select").selectOption("greek-yogurt");
    await expect(app.locator("#aAdd")).toHaveText("Add 3 to log");
    await app.click("#aAdd"); await synced(app);
    expect(sheet.data.settings.saymap.map.kombucha).toBe("greek-yogurt");
    await sayLocal(app, "kombucha");
    await expect(app.locator("#sayOut")).toContainText("Greek yogurt 2%");
  });
  test("N4 AI switch: off by default, on sends Say to the AI", async ({ app, sheet }) => {
    await goTab(app, "settings");
    await expect(app.locator("#prefSayAI")).not.toBeChecked();
    await app.check("#prefSayAI"); await synced(app);
    await goTab(app, "today");
    await sayLocal(app, "two eggs");
    await expect(app.locator("#sayOut .ai-item[data-item]")).toHaveCount(3);
    expect(sheet.log).toContain("ai");
  });
});

test.describe("Say (voice or typed), with AI turned on", () => {
  test.use({ sayAI: true });
  async function say(app, text = "for breakfast 150 grams of greek yogurt, a handful of blueberries and two eggs") {
    await openAdd(app);
    await app.click('#modeSeg [data-m="say"]');
    await app.fill("#sayText", text);
    await app.click("#aAdd");
    await expect(app.locator("#sayOut .ai-item[data-item]")).toHaveCount(3);
  }

  test("V1 review card shows grams and every macro before saving", async ({ app, sheet }) => {
    await say(app);
    const yog = app.locator("#sayOut .ai-item[data-item]").nth(0);
    await expect(yog).toContainText("Greek yogurt 2%");
    await expect(yog.locator("[data-g]")).toHaveValue("150");
    await expect(yog).toContainText(/110 kcal/);
    await expect(yog).toContainText(/P 15(?!\.?\d)/);
    await expect(yog).toContainText(/C 6(?!\.?\d)/);
    await expect(yog).toContainText(/F 3(?!\.?\d)/);
    await expect(yog).toContainText(/fibre 0(?!\.?\d)/);
    await expect(app.locator("#sayOut")).toContainText(/Total: 283 kcal/);
    await expect(app.locator("#aAdd")).toHaveText("Add 3 to log");
    expect(entries(sheet, todayIso())).toHaveLength(0); // nothing saved until approved
  });

  test("V2 approve adds every item with the numbers shown", async ({ app, sheet }) => {
    await say(app);
    await app.click("#aAdd");
    await expect(app.locator("#addSheet")).toBeHidden();
    await synced(app);
    const e = entries(sheet, todayIso());
    expect(e.map(x => x.name)).toEqual(["Greek yogurt 2%", "Blueberries", "Egg, large"]);
    expect(e[0]).toMatchObject({ amount: 150, kcal: 109.5, p: 15, c: 6, f: 3, meal: "breakfast" });
    expect(e[1]).toMatchObject({ kcal: 29, p: 0.4, c: 7.2, f: 0.2, fb: 1.2 });
    expect(e[2]).toMatchObject({ amount: 2, kcal: 144 });
    await expect(app.locator("#kEaten")).toContainText("283");
  });

  test("V3 unticked items are skipped", async ({ app, sheet }) => {
    await say(app);
    await app.locator("#sayOut .ai-item[data-item]").nth(1).locator('input[type="checkbox"]').uncheck();
    await expect(app.locator("#aAdd")).toHaveText("Add 2 to log");
    await app.click("#aAdd");
    await synced(app);
    expect(entries(sheet, todayIso()).map(x => x.name)).toEqual(["Greek yogurt 2%", "Egg, large"]);
  });

  test("V4 changing grams updates macros and what is saved", async ({ app, sheet }) => {
    await say(app);
    const blue = app.locator("#sayOut .ai-item[data-item]").nth(1);
    await blue.locator("[data-g]").fill("100");
    await blue.locator("[data-g]").blur();
    await expect(app.locator("#sayOut .ai-item[data-item]").nth(1)).toContainText("58 kcal");
    await app.click("#aAdd");
    await synced(app);
    expect(entries(sheet, todayIso())[1]).toMatchObject({ kcal: 58, c: 14.4 });
  });

  test("V5 meal comes from what was said", async ({ app }) => {
    await say(app);
    await expect(app.locator("#aMeal")).toHaveValue("breakfast");
  });

  test("V7 keyboard dictation then Done shows the review card by itself", async ({ app, sheet }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="say"]');
    await app.locator("#sayText").fill("150 grams greek yogurt, blueberries and two eggs"); // keyboard 🎤 dictation
    await app.locator("#sayText").blur();                                                  // tap Done
    await expect(app.locator("#sayOut .ai-item[data-item]")).toHaveCount(3);
    await expect(app.locator("#aAdd")).toBeEnabled();
    await expect(app.locator("#aAdd")).toHaveText("Add 3 to log");
    expect(entries(sheet, todayIso())).toHaveLength(0);
  });

  test("V8 Add button works with words typed but not reviewed yet", async ({ app }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="say"]');
    await app.locator("#sayText").fill("two eggs and yogurt");
    await expect(app.locator("#aAdd")).toBeEnabled();
    await app.click("#aAdd");
    await expect(app.locator("#sayOut .ai-item[data-item]")).toHaveCount(3);
    await expect(app.locator("#addSheet")).toBeVisible(); // still waiting for approval
  });

  test("V9 review takes over the screen, with a way back to edit", async ({ app }) => {
    await say(app);
    await expect(app.locator("#sayText")).toBeHidden();
    await expect(app.locator("#sayEdit")).toBeVisible();
    await app.click("#sayEdit");
    await expect(app.locator("#sayText")).toBeVisible();
    await expect(app.locator("#sayText")).toHaveValue(/greek yogurt/);
  });

  test("V10 if the AI can't answer, the reason is shown, not hidden", async ({ app, sheet }) => {
    sheet.reject = req => req.action === "ai" ? "no_api_key" : null;
    await openAdd(app);
    await app.click('#modeSeg [data-m="say"]');
    await app.locator("#sayText").fill("two eggs");
    await app.click("#aAdd");
    await expect(app.locator("#sayNote")).toContainText(/ANTHROPIC_API_KEY/);
  });

  test("V11 big mic button: talk, tap again → review card", async ({ app }) => {
    await app.addInitScript(() => {
      window.webkitSpeechRecognition = class { start(){ setTimeout(()=>this.onresult({ results: [[{ transcript: "two eggs and yogurt" }]] }), 50); }
        stop(){ setTimeout(()=>this.onend(), 50); } };
      window.SpeechRecognition = window.webkitSpeechRecognition; // newer Chromium has its own unprefixed one
    });
    await app.reload(); await expect(app.locator("#status")).toHaveText(/Synced|Saved/);
    await openAdd(app);
    await app.click('#modeSeg [data-m="say"]');
    await app.click("#sayMic");
    await expect(app.locator("#sayText")).toHaveValue("two eggs and yogurt");
    await app.click("#sayMic"); // tap when done
    await expect(app.locator("#sayOut .ai-item[data-item]")).toHaveCount(3);
  });

  test("V6 Siri link opens the review card without saving", async ({ app, sheet }) => {
    await app.goto(app.url().split("#")[0] + "#say=two%20eggs%20and%20yogurt");
    await expect(app.locator("#sayOut .ai-item[data-item]")).toHaveCount(3);
    await expect(app.locator("#aAdd")).toHaveText("Add 3 to log");
    expect(entries(sheet, todayIso())).toHaveLength(0);
  });

  test("V12 AI problem (no key, no credits) is explained on screen", async ({ app, sheet }) => {
    sheet.reject = req => req.action === "ai" ? "no_api_key" : null;
    await app.click("#fab");
    await app.click('#modeSeg [data-m="say"]');
    await app.fill("#sayText", "two eggs");
    await app.click("#aAdd");
    await expect(app.locator("#sayNote")).toContainText("ANTHROPIC_API_KEY");
    sheet.reject = req => req.action === "ai" ? "Your credit balance is too low to access the Anthropic API." : null;
    await app.click("#aAdd");
    await expect(app.locator("#sayNote")).toContainText("out of credits");
  });
});

test.describe("AI problems are visible", () => {
  test.use({ sayAI: true });
  test("V13 script crash page: reason and Google's text shown above the button, not hidden", async ({ app, sheet }) => {
    sheet.aiHtml = "<!DOCTYPE html><html><body><div>Exception: You do not have permission to call UrlFetchApp.fetch. Required permissions: https://www.googleapis.com/auth/script.external_request</div></body></html>";
    await app.click("#fab");
    await app.click('#modeSeg [data-m="say"]');
    await app.fill("#sayText", "whole wheat toast and 50 g of avocado");
    await app.click("#aAdd");
    const note = app.locator("#sayNote");
    await expect(note).toBeVisible();
    await expect(note).toContainText("testAI");
    await expect(note).toContainText("UrlFetchApp");
    // the message must not sit under the pinned Add button
    const n = await note.boundingBox(), b = await app.locator("#aAdd").boundingBox();
    expect(n.y + n.height <= b.y || n.y >= b.y + b.height).toBeTruthy();
    await expect(app.locator("#sayGo")).toBeHidden();
  });

  test("V14 Settings → Test AI says it works", async ({ app }) => {
    await app.click('.tabs [data-tab="settings"]');
    await app.click("#cTestAI");
    await expect(app.locator("#aiTestOut")).toContainText("AI works");
  });

  test("V15 Settings → Test AI explains a crash", async ({ app, sheet }) => {
    sheet.aiHtml = "<html><body>Exception: You do not have permission to call UrlFetchApp.fetch</body></html>";
    await app.click('.tabs [data-tab="settings"]');
    await app.click("#cTestAI");
    await expect(app.locator("#aiTestOut")).toContainText("testAI");
  });
});

test.describe("Photo and barcode", () => {
  test("P1 plate photo → review → saved", async ({ app, sheet }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="photo"]');
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
    await app.setInputFiles("#phFile", { name: "plate.png", mimeType: "image/png", buffer: png });
    await app.click("#phGo");
    await expect(app.locator("#phOut .ai-item[data-item]")).toHaveCount(2);
    await expect(app.locator("#phOut .ai-item[data-item]").first()).toContainText(/P \d/);
    await app.click("#aAdd");
    await synced(app);
    expect(entries(sheet, todayIso()).map(e => e.name)).toEqual(["Rolled oats", "Banana"]);
  });

  const barcodeMode = async app => { await openAdd(app); await app.click('#modeSeg [data-m="barcode"]'); };

  test("B1 typed barcode fills in a New food from Open Food Facts → check → Save → logged at one serving", async ({ app, sheet }) => {
    await barcodeMode(app);
    await app.selectOption("#aMeal", "lunch");
    await app.fill("#bcNum", "0123456789012");
    await app.click("#bcLook");
    await expect(app.locator("#foodSheet")).toBeVisible();
    await expect(app.locator("#fSrc")).toContainText("Open Food Facts");
    await expect(app.locator("#fName")).toHaveValue("QA Foods Protein Bar");
    for (const [id, v] of [["#fK", "400"], ["#fP", "25"], ["#fC", "40"], ["#fF", "14"], ["#fFb", "9"]]) await expect(app.locator(id)).toHaveValue(v);
    expect(Object.values(sheet.data.foods).some(f => f.barcode === "0123456789012")).toBe(false);   // nothing saved before you check it
    await app.click('#foodForm [type="submit"]');
    await expect(app.locator("#addSheet")).toBeVisible();
    await expect(app.locator("#aPicked")).toContainText("QA Foods Protein Bar");
    await expect(app.locator("#aAmt")).toHaveValue("40");                                         // one serving
    await expect(app.locator("#aMeal")).toHaveValue("lunch");
    await app.click("#aAdd");
    await synced(app);
    const food = Object.values(sheet.data.foods).find(f => f.barcode === "0123456789012");
    expect(food).toMatchObject({ kcal: 400, p: 25, c: 40, f: 14, fb: 9, servingG: 40 });
    expect(entries(sheet, todayIso())[0]).toMatchObject({ foodId: food.id, amount: 40, kcal: 160, meal: "lunch" });
  });

  test("B2 📷 Scan barcode: live camera reads the code and fills in the food", async ({ app }) => {
    await barcodeMode(app);
    await fakeCamera(app, "0123456789012");
    await app.click("#bcScan");
    await expect(app.locator("#foodSheet")).toBeVisible();
    await expect(app.locator("#scanView")).toBeHidden();                 // camera closes by itself
    expect(await app.evaluate(() => window.__camOn)).toBe(true);
    await expect(app.locator("#fName")).toHaveValue("QA Foods Protein Bar");
  });

  test("B3 a barcode you saved before is picked straight away, at one serving", async ({ app, sheet }) => {
    sheet.data.foods.bar = { id: "bar", name: "My bar", basis: "100g", unit: "", group: "Other", kcal: 380, p: 30, c: 35, f: 12, fb: 10, barcode: "0123456789012", servingG: 45 };
    await bgSync(app); await synced(app);
    await barcodeMode(app);
    await fakeCamera(app, "0123456789012");
    await app.click("#bcScan");
    await expect(app.locator("#bcOut")).toContainText("My bar");
    await expect(app.locator("#foodSheet")).toBeHidden();
    await expect(app.locator("#bcAmt")).toHaveValue("45");
    await app.click("#aAdd");
    await synced(app);
    expect(entries(sheet, todayIso())[0]).toMatchObject({ foodId: "bar", amount: 45, kcal: 171 });
  });

  test("B4 barcode not in Open Food Facts: type it from the label once, next scan finds it", async ({ app, sheet }) => {
    await barcodeMode(app);
    await fakeCamera(app, "0000000000000");
    await app.click("#bcScan");
    await expect(app.locator("#foodSheet")).toBeVisible();
    await expect(app.locator("#fSrc")).toContainText("isn't in Open Food Facts");
    await app.fill("#fName", "Local kefir"); await app.fill("#fK", "41"); await app.fill("#fP", "3.4");
    await app.click('#foodForm [type="submit"]');
    await expect(app.locator("#aPicked")).toContainText("Local kefir");
    await synced(app);
    expect(Object.values(sheet.data.foods).find(f => f.name === "Local kefir").barcode).toBe("0000000000000");
    await app.click("#addSheet [data-close]");
    await barcodeMode(app);
    await fakeCamera(app, "0000000000000");
    await app.click("#bcScan");
    await expect(app.locator("#bcOut")).toContainText("Local kefir");
  });

  test("B5 product found but without nutrition numbers: name filled, numbers left for you", async ({ app }) => {
    await barcodeMode(app);
    await app.fill("#bcNum", "1111111111111");
    await app.click("#bcLook");
    await expect(app.locator("#fName")).toHaveValue("Mystery tea");
    await expect(app.locator("#fK")).toHaveValue("");
    await expect(app.locator("#fSrc")).toContainText("no nutrition numbers");
  });

  test("B6 Foods → New food → 📷 Scan barcode fills the form there (nothing logged)", async ({ app, sheet }) => {
    await goTab(app, "foods");
    await app.click("#newFood");
    await fakeCamera(app, "0123456789012");
    await app.click("#fScan");
    await expect(app.locator("#fName")).toHaveValue("QA Foods Protein Bar");
    await expect(app.locator("#fK")).toHaveValue("400");
    await app.click('#foodForm [type="submit"]');
    await expect(app.locator("#foodSheet")).toBeHidden();
    await expect(app.locator("#addSheet")).toBeHidden();
    await synced(app);
    expect(Object.values(sheet.data.foods).find(f => f.barcode === "0123456789012")).toMatchObject({ kcal: 400, servingG: 40 });
    expect(entries(sheet, todayIso())).toHaveLength(0);
  });

  test("B7 camera blocked: says how to allow it, scanner closes", async ({ app }) => {
    await barcodeMode(app);
    await fakeCamera(app, null, { blocked: true });
    await app.click("#bcScan");
    await expect(app.locator("#scanView")).toBeHidden();
    await expect(app.locator("#bcOut")).toContainText(/allow the camera/i);
  });

  test("B9 iPhone way (no built-in reader): ZXing reads a real EAN-13 barcode from the camera", async ({ app }) => {
    const fs = await import("node:fs");
    const zx = fs.readFileSync(new URL("../node_modules/@zxing/library/umd/index.min.js", import.meta.url), "utf8");
    await app.context().route(/unpkg\.com\/@zxing/, r => r.fulfill({ status: 200, contentType: "text/javascript", body: zx }));
    await barcodeMode(app);
    await app.evaluate(() => {
      delete window.BarcodeDetector;                                   // like iPhone Safari
      // draw a real EAN-13 for 0123456789012 (first digit 0 → all left digits use L codes)
      const L = ["0001101","0011001","0010011","0111101","0100011","0110001","0101111","0111011","0110111","0001011"];
      const R = L.map(c => [...c].map(b => b === "0" ? "1" : "0").join(""));
      const d = "0123456789012".split("").map(Number);
      const bits = "101" + d.slice(1, 7).map(x => L[x]).join("") + "01010" + d.slice(7).map(x => R[x]).join("") + "101";
      const cv = document.createElement("canvas"); cv.width = 640; cv.height = 360;
      const g = cv.getContext("2d"); const paint = () => { g.fillStyle = "#fff"; g.fillRect(0, 0, 640, 360); g.fillStyle = "#000";
        [...bits].forEach((b, i) => { if (b === "1") g.fillRect(40 + i * 5, 60, 5, 240); }); };
      paint(); setInterval(paint, 100);
      navigator.mediaDevices.getUserMedia = async () => cv.captureStream(10);
    });
    await app.click("#bcScan");
    await expect(app.locator("#fName")).toHaveValue("QA Foods Protein Bar", { timeout: 15000 });
    await expect(app.locator("#bcNum")).toHaveValue("0123456789012");
  });

  test("B10 12-digit (UPC) and 13-digit (EAN) forms of the same barcode are one product", async ({ app, sheet }) => {
    sheet.data.foods.bar = { id: "bar", name: "My bar", basis: "100g", unit: "", group: "Other", kcal: 380, p: 30, c: 35, f: 12, fb: 10, barcode: "123456789012" };
    await bgSync(app); await synced(app);
    await barcodeMode(app);
    await fakeCamera(app, "0123456789012");
    await app.click("#bcScan");
    await expect(app.locator("#bcOut")).toContainText("My bar");
    await expect(app.locator("#foodSheet")).toBeHidden();
  });

  test("B8 Cancel closes the scanner and turns the camera off", async ({ app }) => {
    await barcodeMode(app);
    await fakeCamera(app, null);
    await app.click("#bcScan");
    await expect(app.locator("#scanView")).toBeVisible();
    await app.click("#scanCancel");
    await expect(app.locator("#scanView")).toBeHidden();
    expect(await app.evaluate(() => document.getElementById("scanVideo").srcObject)).toBeNull();
    await expect(app.locator("#addSheet")).toBeVisible();
  });
});
