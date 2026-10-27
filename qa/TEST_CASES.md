# Budgie test cases

Every case below is automated in `qa/tests/`. What a person can do in the app (and which cases prove it) is in `USE_CASES.md`. The ID in brackets is the test title prefix, so a failure in the report points straight back here.

Tests run against a **fake Google Sheet** (an in-memory copy of `apps-script/Code.gs`), so they never touch real data. The fake can be made slow, offline, or made to reject one record, which is how the save and sync cases are tested.

## Smoke (runs first; if any fail, stop)

| ID | Case | Pass when |
|---|---|---|
| S1 | App opens | No JS errors, version label shows, Today tab renders |
| S2 | Connect to Sheet | Setup screen → paste URL + token → "Synced" |
| S3 | Log a food | Library → pick food → grams → Add → shows in Today **and** in the Sheet |
| S4 | Survives reload | Reload the app → the entry is still there (loaded from the Sheet) |
| S5 | All tabs render | Today, Body, Foods, Settings each open without errors |

## Setup screen

| ID | Case | Pass when |
|---|---|---|
| SU1 | Setup code | Paste a code copied from another phone → URL and token fill in → Connect → Synced |
| SU2 | Without a Sheet | "Try it without a Sheet" → app opens, status "On this phone only", remembered after reload |

## Food log

| ID | Case | Pass when |
|---|---|---|
| L1 | Edit an entry | Tap entry → change grams → Save changes → new kcal in Today and Sheet |
| L2 | Move to another meal | Edit entry → change meal → it moves |
| L3 | Remove an entry | × removes it from Today and the Sheet |
| L4 | Quick entry | Name + kcal → Add → saved with the numbers typed |
| L5 | Another day | ‹ to yesterday → add → saved under yesterday's date, today untouched |
| DN1 | Day arrows | ‹ shows Yesterday, › comes back to Today |
| A1 | Tap a food | Tap a food in the list → per-piece food starts at 1 → Add → saved |
| A2 | Quick entry, all macros | Carbs, fat (with comma "9,5") and fibre are saved as typed |
| A2b | Return key | In quick entry, the keyboard's Return/Go adds the entry; page doesn't reload |
| A3 | Remove from log | Edit an entry → "Remove from log" → gone from Today and Sheet |
| A4 | Close without saving | × on Add food closes it, nothing saved |
| A5 | Say: untick and pick | Untick one line, pick a food for an unknown one → only the right foods are saved |
| A9 | Search above the keyboard | Typing in search moves the box right under the title (Meal and mode rows step aside, title says "Add to <meal>") and results are on screen |
| A10 | Sheet fits above keyboard | When the phone keyboard opens, the Add screen shrinks to the visible area; nothing is hidden under the keyboard |
| A11 | Selected food is obvious | Tapping a food shows a "✓ Selected … Not in your log yet" card, the list folds away, grams box is on screen; nothing is logged until Add; Change brings the list back |
| A12 | New food from Add | Search finds nothing → "＋ Add “Kefir” as a new food" → New food form with the name filled → Save → back on Add (same meal) with Kefir selected → Add logs it |

## 🎤 Say without AI (Budgie reads it itself, default)

| ID | Case | Pass when |
|---|---|---|
| N1 | Library foods + grams | "for breakfast 150 grams of greek yogurt and two eggs" → 2 rows from the library, meal = breakfast, total right, no AI call, saved after Add |
| N2 | Spoken numbers/units | "half a cup of rolled oats and a couple of eggs" → 80 g oats, 2 eggs |
| N3 | Unknown food | Unknown food shows "Not in your library", isn't saved; picking a food adds it and is remembered next time |
| N4 | AI switch | Off by default; turning it on in Settings makes Say use the AI |

## 🎤 Say (voice or typed)

| ID | Case | Pass when |
|---|---|---|
| V1 | Review before saving | Say text → review card lists each food with **grams, kcal, protein, carbs, fat, fibre** and a total. Nothing is in the log yet |
| V2 | Approve adds it | Tap "Add N to log" → every ticked item is in Today and the Sheet with the numbers shown on the card |
| V3 | Untick skips | Untick one item → only the ticked ones are saved |
| V4 | Change grams | Change an item's grams → its macros and the total update → saved value matches |
| V5 | Meal from speech | "for breakfast…" → meal set to Breakfast |
| V7 | Dictate, tap Done | Keyboard 🎤 dictation, then Done → review card appears by itself, Add is active |
| V8 | Add before review | Text typed, Add tapped → reads it and shows the review, doesn't save yet |
| V9 | Review takes over | Review replaces the text box; "Change what I said" brings it back with the text |
| V10 | AI problem shown | Missing API key etc. → reason shown on screen |
| V11 | Big mic button | Tap mic, talk, tap again → review card |
| V6 | Siri link | Opening `#say=<text>` lands on the review card, not saved until approved |
| V12 | AI can't run | Missing API key or no credits → a plain message on screen says what to fix (not a disappearing toast) |
| V13 | Script crash page | Sheet answers AI with Google's error page → reason + Google's text shown above the pinned button; no duplicate Understand button |
| V14 | Test AI works | Settings → Test AI → "AI works" with time |
| V15 | Test AI explains | Script crash → Test AI says what to do (run testAI, new version) |

## Photo / barcode

| ID | Case | Pass when |
|---|---|---|
| P1 | Plate photo | Photo → items with grams/macros → approve → saved |
| A6 | Label photo | "This is a nutrition label" + note → note is sent, New food opens with the label's numbers → saved |
| A7 | Barcode photo | Photo of a barcode → number read → New food filled in from Open Food Facts |
| A8 | Unreadable barcode | Blurry photo / scanner unavailable → "Couldn't read the barcode…" with what to do |
| B1 | Barcode → autofill | Type a code → Look up → New food opens filled from Open Food Facts (name, kcal, P, C, F, fibre); nothing saved until you check and Save → back on Add (same meal) with it selected at one serving → logged |
| B2 | 📷 Live scan | Scan barcode → camera reads it → camera closes by itself → form filled |
| B3 | Known barcode | A barcode already in your library is selected straight away, amount = its serving |
| B4 | Not in Open Food Facts | Form opens with "isn't in Open Food Facts yet"; type it from the label once → saved with the barcode → next scan finds it |
| B5 | No nutrition data | Name filled, numbers left empty, message says to type them from the label |
| B6 | Scan in Foods tab | New food → 📷 Scan barcode fills the form there; saving doesn't log anything |
| B7 | Camera blocked | Says how to allow the camera; scanner closes |
| B8 | Cancel scan | Cancel closes the scanner and turns the camera off |
| B9 | iPhone scanner (ZXing) | Without the built-in reader, ZXing reads a real EAN-13 drawn in the camera feed |
| B10 | UPC = EAN | 12-digit and 13-digit forms of one barcode match the same food (no duplicates) |

## Foods & recipes

| ID | Case | Pass when |
|---|---|---|
| F1 | New food | Fill form → Save → in Foods list and Sheet |
| F2 | Edit food | Change kcal → saved |
| F3 | Clear a note | Empty the note → Save → note is gone (not kept) |
| F4 | Favourite | ★ → stays a favourite after reload |
| F5 | Add common foods | Adds basics (white/whole wheat bread…), keeps your foods unchanged, no duplicates, second tap adds nothing |
| FD1 | Search | Typing in the search box filters the Foods list |
| FD2 | Group chips | Tap "Dairy" → only dairy; "All groups" → everything back |
| FD3 | Per-piece food, every field | Per piece, piece name, kcal/P/C/F/fibre, grams per piece, group, ★ → all saved |
| FD4 | Delete food | First tap only asks "Tap again to delete"; second tap deletes |
| FD5 | Close without saving | × on New food closes it, nothing saved |
| R1 | Recipe with pot | Ingredients + full pot weight − pot → per-100 g numbers right → saved |
| R2 | Paste a recipe, no AI | Liver pâté list (bullets, "500gm", ranges "1 – 2", "(…)", "chopped") → 8 ingredients with sensible grams, no AI call |
| R3 | Weigh the batch | Cooked weight → per-100 g; saving adds built-in foods (e.g. chicken liver) to the library |
| R4 | Photo without AI | "From a photo" explains copying text from the photo (iPhone Live Text), no AI call |
| R5 | Built-in foods in Say | "200 grams of chicken livers" → built-in Chicken liver; saving adds it to the library |
| R6 | Save always tappable | After Read ingredients with no name, Save still works and says what's missing ("Almost there: …") instead of being greyed out |
| RC1 | Own ingredient | "Add … with my own numbers" → type kcal/protein per 100 g → right per-100 g; × removes an ingredient |
| RC2 | Delete recipe | Two taps on Delete recipe removes it |
| RC3 | Close without saving | × on New recipe closes it, nothing saved |
| RC4 | Recipe photo with AI | AI switch on → recipe photo → name and ingredients filled in |

## Body, goal & plan

| ID | Case | Pass when |
|---|---|---|
| W1 | Weigh-in | Weight + waist → saved under the date |
| W2 | Comma decimal | Typing `72,5` saves 72.5 kg (Ukrainian/Russian keyboards use a comma) |
| W3 | Empty date | Cleared date is refused with a message; nothing broken gets queued |
| G1 | Goal | Type goal → Set → saved, survives reload |
| G2 | Goal survives background sync | Typing a goal, app syncs in the background → Set button and typed value are still there |
| BD1 | Hips, delete weigh-in | Weight + waist + hips saved; hips shows on the card; two taps on × deletes the weigh-in |
| BD2 | Return sets goal | Typing a goal and pressing Return sets it |
| PL1 | Manual plan | Edit calories → Save → saved |
| PL2 | Plan typing survives sync | Typing in the plan form, background sync happens → typed values are not wiped |
| ST1 | Calculate for me | Every profile field (sex, age, height, weight, activity, goal, pace, body fat, protein/kg) is used; body fat → Katch-McArdle; "Use this plan" saves it (protein 2.0 × 66.6 → 135 g) |
| ST2 | Save my numbers | Protein, fibre, start weight and start date are saved |
| ST3 | Pots | Add a pot (name + empty weight) → saved; × deletes it |

## Settings: connection & backup

| ID | Case | Pass when |
|---|---|---|
| ST4 | Save and test | Wrong token → explains the token doesn't match; right token → "Connected to your Sheet" |
| ST5 | Sync now | Changes made in the Sheet elsewhere show up |
| ST6 | Copy setup code | Copies a `budgie:` code holding the URL and token, for another phone |
| ST7 | Export backup | Downloads `budgie-backup-<date>.json` with all foods and logs |
| UP1 | Update banner | New version online → banner shows → tap → app reloads to the new version |

## Coverage gate

| ID | Case | Pass when |
|---|---|---|
| CV1 | Every control tested | Every button, field, switch, form and list action in index.html (by id or data-attribute) is used by at least one test. A new button without a test fails this. |

## Save & sync safety (the "my entry disappeared" bugs)

| ID | Case | Pass when |
|---|---|---|
| Y1 | Add during slow sync | App is loading from the Sheet (slow) → add an entry → after load finishes, the entry is still there and in the Sheet |
| Y2 | Offline then back | Sheet unreachable → add entry → "1 change waiting" → Sheet back → saved, status "Saved" |
| Y3 | One bad record doesn't block | Sheet rejects one record → later saves still go through, user is told |
| Y4 | Second device | Another device adds an entry → when this device comes back to the app it shows that entry, and adding here keeps both |
| Y6 | Import only adds | Existing foods, day entries, weigh-ins and plan stay exactly as they were; only new records/entries are added |
| Y5 | Import | Import a backup → all records in the Sheet; a failed upload says so honestly |

## After every deploy (live site)

| ID | Case | Pass when |
|---|---|---|
| D1 | Live smoke | S1, S3, S5 against https://kseniyavarta-ai.github.io/budgie_nutrition/ with the fake Sheet |
| D2 | Version matches | Live `version.json` equals the version in the deployed `index.html` |
