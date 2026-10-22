import { test, expect, todayIso, shiftIso, openAdd, addFromLibrary, synced, entries, goTab, SHEET_URL } from "../fixtures.mjs";

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

  test("B1 barcode lookup saves the product and the entry", async ({ app, sheet }) => {
    await openAdd(app);
    await app.click('#modeSeg [data-m="barcode"]');
    await app.fill("#bcNum", "0123456789012");
    await app.click("#bcLook");
    await expect(app.locator("#bcOut")).toContainText("Saved to your library");
    await app.fill("#bcAmt", "40");
    await app.click("#aAdd");
    await synced(app);
    const food = Object.values(sheet.data.foods).find(f => f.barcode === "0123456789012");
    expect(food).toMatchObject({ kcal: 400, p: 25 });
    expect(entries(sheet, todayIso())[0]).toMatchObject({ foodId: food.id, kcal: 160 });
  });
});
