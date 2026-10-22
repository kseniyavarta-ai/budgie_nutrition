# Budgie test cases

Every case below is automated in `qa/tests/`. The ID in brackets is the test title prefix, so a failure in the report points straight back here.

Tests run against a **fake Google Sheet** (an in-memory copy of `apps-script/Code.gs`), so they never touch real data. The fake can be made slow, offline, or made to reject one record, which is how the save and sync cases are tested.

## Smoke (runs first; if any fail, stop)

| ID | Case | Pass when |
|---|---|---|
| S1 | App opens | No JS errors, version label shows, Today tab renders |
| S2 | Connect to Sheet | Setup screen → paste URL + token → "Synced" |
| S3 | Log a food | Library → pick food → grams → Add → shows in Today **and** in the Sheet |
| S4 | Survives reload | Reload the app → the entry is still there (loaded from the Sheet) |
| S5 | All tabs render | Today, Body, Foods, Settings each open without errors |

## Food log

| ID | Case | Pass when |
|---|---|---|
| L1 | Edit an entry | Tap entry → change grams → Save changes → new kcal in Today and Sheet |
| L2 | Move to another meal | Edit entry → change meal → it moves |
| L3 | Remove an entry | × removes it from Today and the Sheet |
| L4 | Quick entry | Name + kcal → Add → saved with the numbers typed |
| L5 | Another day | ‹ to yesterday → add → saved under yesterday's date, today untouched |

## 🎤 Say (voice or typed)

| ID | Case | Pass when |
|---|---|---|
| V1 | Review before saving | Say text → review card lists each food with **grams, kcal, protein, carbs, fat, fibre** and a total. Nothing is in the log yet |
| V2 | Approve adds it | Tap "Add N to log" → every ticked item is in Today and the Sheet with the numbers shown on the card |
| V3 | Untick skips | Untick one item → only the ticked ones are saved |
| V4 | Change grams | Change an item's grams → its macros and the total update → saved value matches |
| V5 | Meal from speech | "for breakfast…" → meal set to Breakfast |
| V6 | Siri link | Opening `#say=<text>` lands on the review card, not saved until approved |
| V7 | AI can't run | Missing API key or no credits → a plain message on screen says what to fix (not a disappearing toast) |

## Photo / barcode

| ID | Case | Pass when |
|---|---|---|
| P1 | Plate photo | Photo → items with grams/macros → approve → saved |
| B1 | Barcode | Type a code → product saved to library → grams → added to log |

## Foods & recipes

| ID | Case | Pass when |
|---|---|---|
| F1 | New food | Fill form → Save → in Foods list and Sheet |
| F2 | Edit food | Change kcal → saved |
| F3 | Clear a note | Empty the note → Save → note is gone (not kept) |
| F4 | Favourite | ★ → stays a favourite after reload |
| R1 | Recipe with pot | Ingredients + full pot weight − pot → per-100 g numbers right → saved |

## Body, goal & plan

| ID | Case | Pass when |
|---|---|---|
| W1 | Weigh-in | Weight + waist → saved under the date |
| W2 | Comma decimal | Typing `72,5` saves 72.5 kg (Ukrainian/Russian keyboards use a comma) |
| W3 | Empty date | Cleared date is refused with a message; nothing broken gets queued |
| G1 | Goal | Type goal → Set → saved, survives reload |
| G2 | Goal survives background sync | Typing a goal, app syncs in the background → Set button and typed value are still there |
| PL1 | Manual plan | Edit calories → Save → saved |
| PL2 | Plan typing survives sync | Typing in the plan form, background sync happens → typed values are not wiped |

## Save & sync safety (the "my entry disappeared" bugs)

| ID | Case | Pass when |
|---|---|---|
| Y1 | Add during slow sync | App is loading from the Sheet (slow) → add an entry → after load finishes, the entry is still there and in the Sheet |
| Y2 | Offline then back | Sheet unreachable → add entry → "1 change waiting" → Sheet back → saved, status "Saved" |
| Y3 | One bad record doesn't block | Sheet rejects one record → later saves still go through, user is told |
| Y4 | Second device | Another device adds an entry → when this device comes back to the app it shows that entry, and adding here keeps both |
| Y5 | Import | Import a backup → all records in the Sheet; a failed upload says so honestly |

## After every deploy (live site)

| ID | Case | Pass when |
|---|---|---|
| D1 | Live smoke | S1, S3, S5 against https://kseniyavarta-ai.github.io/budgie_nutrition/ with the fake Sheet |
| D2 | Version matches | Live `version.json` equals the version in the deployed `index.html` |
