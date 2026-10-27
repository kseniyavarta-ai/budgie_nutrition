# Budgie QA report
**Version:** v2026.10.26 · scan-barcode  
**Run:** 2026-10-26, 9:24:53 p.m. (Calgary)  
**Result:** 100/100 passed. 🟢 All green. Safe to deploy.  
**Coverage:** 121/121 controls have a test (100%)

## Regression check
Compared with v2026.10.23 · pick-clear (2026-10-23, 7:15:26 p.m.).

- **Still passing:** 91
- **Broken since last time (regressions):** none
- **Fixed since last time:** none
- **New tests:** 9 (B2, B3, B4, B5, B6, B7, B9, B10, B8)
- **Tests removed:** none

## Failures to fix
None.

## By area
| Area | Passed |
|---|---|
| Setup screen | 2/2 |
| Today screen | 14/14 |
| Foods screen | 5/5 |
| Recipes | 3/3 |
| Recipes with the AI switch on | 1/1 |
| Body screen | 1/1 |
| Body goal | 1/1 |
| Settings screen | 7/7 |
| Updates | 1/1 |
| Coverage | 1/1 |
| Foods and recipes | 11/11 |
| Body, goal and plan | 7/7 |
| Food log | 5/5 |
| Say, Budgie reads it itself (no AI) | 4/4 |
| Say (voice or typed), with AI turned on | 12/12 |
| AI problems are visible | 3/3 |
| Photo and barcode | 11/11 |
| @smoke | 5/5 |
| Save & sync safety | 6/6 |

## All checks
| Area | Test | Result | Time |
|---|---|---|---|
| Setup screen | SU1 setup code from another device fills URL and token, then connects | ✅ | 0.8s |
| Setup screen | SU2 'Try it without a Sheet' opens the app on this phone only | ✅ | 0.6s |
| Today screen | DN1 previous / next day arrows | ✅ | 0.6s |
| Today screen | A1 pick a food by tapping it in the list (per-piece food starts at 1) | ✅ | 0.8s |
| Today screen | A9 searching moves the search box to the top so results show above the keyboard | ✅ | 0.7s |
| Today screen | A10 sheet fits the space above the phone keyboard | ✅ | 0.6s |
| Today screen | A11 the food you tap shows clearly as Selected (not logged yet); Change goes back to the list | ✅ | 0.8s |
| Today screen | A12 food not found → add it as a new food → back on Add with it selected | ✅ | 1.1s |
| Today screen | A2 quick entry saves carbs, fat and fibre too | ✅ | 1.0s |
| Today screen | A2b quick entry: the keyboard's Return/Go key adds it (no page reload, nothing lost) | ✅ | 0.8s |
| Today screen | A3 'Remove from log' inside the edit screen | ✅ | 1.0s |
| Today screen | A4 × closes the add screen without saving | ✅ | 0.7s |
| Today screen | A5 Say review: untick a line, pick a food for one Budgie didn't know | ✅ | 1.0s |
| Today screen | A6 nutrition-label photo with a note opens a new food with the label's numbers | ✅ | 1.0s |
| Today screen | A7 barcode photo is read and fills in the food | ✅ | 0.8s |
| Today screen | A8 unreadable barcode photo says what to do | ✅ | 0.7s |
| Foods screen | FD1 search box filters the list | ✅ | 0.6s |
| Foods screen | FD2 food-group chips filter the list | ✅ | 0.7s |
| Foods screen | FD3 new per-piece food saves every field | ✅ | 1.1s |
| Foods screen | FD4 delete a food needs two taps | ✅ | 0.7s |
| Foods screen | FD5 × closes the food screen without saving | ✅ | 0.7s |
| Recipes | RC1 your own ingredient with numbers per 100 g; remove an ingredient | ✅ | 1.0s |
| Recipes | RC2 delete a recipe needs two taps | ✅ | 0.7s |
| Recipes | RC3 × closes the recipe screen without saving | ✅ | 0.8s |
| Recipes with the AI switch on | RC4 recipe photo is read by the AI into ingredients | ✅ | 0.7s |
| Body screen | BD1 weigh-in with waist and hips, then delete it with two taps | ✅ | 0.9s |
| Body goal | BD2 Return key in the goal box sets the goal | ✅ | 0.6s |
| Settings screen | ST1 'Calculate for me' uses every profile field, 'Use this plan' saves it | ✅ | 0.9s |
| Settings screen | ST2 'Save my numbers' keeps protein, fibre, start weight and date | ✅ | 0.8s |
| Settings screen | ST3 add a pot, then delete it | ✅ | 0.8s |
| Settings screen | ST4 'Save and test': wrong token is explained, right token connects | ✅ | 0.8s |
| Settings screen | ST5 'Sync now' brings in changes made elsewhere | ✅ | 0.7s |
| Settings screen | ST6 'Copy setup code' copies a code that sets up another phone | ✅ | 0.6s |
| Settings screen | ST7 'Export backup' downloads everything | ✅ | 1.0s |
| Updates | UP1 new version banner appears and reloads the app | ✅ | 0.8s |
| Coverage | CV1 every control in the app is used by a test | ✅ | 0.0s |
| Foods and recipes | F1 new food | ✅ | 0.7s |
| Foods and recipes | F2 edit a food's calories | ✅ | 0.7s |
| Foods and recipes | F3 clearing a note removes it | ✅ | 0.9s |
| Foods and recipes | F4 favourite survives reload | ✅ | 0.8s |
| Foods and recipes | F5 Add common foods: adds basics like white and whole wheat bread, keeps yours, no duplicates | ✅ | 2.9s |
| Foods and recipes | R1 recipe with a pot gives the right per-100 g numbers | ✅ | 1.1s |
| Foods and recipes | R2 pasted recipe is read without AI, every line becomes an ingredient | ✅ | 0.8s |
| Foods and recipes | R3 weigh the batch → per-100 g numbers; built-in foods join your library on save | ✅ | 0.9s |
| Foods and recipes | R6 Read ingredients without a name: Save stays tappable and says what's missing | ✅ | 1.0s |
| Foods and recipes | R4 'From a photo' without AI explains the free iPhone way (copy text from the photo) | ✅ | 0.7s |
| Foods and recipes | R5 Say uses built-in foods when your library doesn't have them | ✅ | 0.8s |
| Body, goal and plan | W1 weigh-in saves | ✅ | 0.6s |
| Body, goal and plan | W2 comma decimal (72,5) saves as 72.5 | ✅ | 0.6s |
| Body, goal and plan | W3 empty date is refused and nothing broken is queued | ✅ | 0.8s |
| Body, goal and plan | G1 set a goal | ✅ | 0.8s |
| Body, goal and plan | G2 typed goal and Set button survive a background sync | ✅ | 0.6s |
| Body, goal and plan | PL1 save plan numbers by hand | ✅ | 0.6s |
| Body, goal and plan | PL2 typing in the plan isn't wiped by a background sync | ✅ | 0.8s |
| Food log | L1 edit an entry's grams | ✅ | 3.4s |
| Food log | L2 move an entry to another meal | ✅ | 3.4s |
| Food log | L3 remove an entry | ✅ | 1.4s |
| Food log | L4 quick entry | ✅ | 0.7s |
| Food log | L5 log on yesterday | ✅ | 0.8s |
| Say, Budgie reads it itself (no AI) | N1 no AI call; amounts and library foods are understood | ✅ | 0.8s |
| Say, Budgie reads it itself (no AI) | N2 spoken numbers and units: half a cup of oats, a couple of eggs | ✅ | 0.7s |
| Say, Budgie reads it itself (no AI) | N3 food not in the library is not saved until you pick one; the pick is remembered | ✅ | 1.1s |
| Say, Budgie reads it itself (no AI) | N4 AI switch: off by default, on sends Say to the AI | ✅ | 0.8s |
| Say (voice or typed), with AI turned on | V1 review card shows grams and every macro before saving | ✅ | 0.9s |
| Say (voice or typed), with AI turned on | V2 approve adds every item with the numbers shown | ✅ | 0.9s |
| Say (voice or typed), with AI turned on | V3 unticked items are skipped | ✅ | 0.8s |
| Say (voice or typed), with AI turned on | V4 changing grams updates macros and what is saved | ✅ | 0.9s |
| Say (voice or typed), with AI turned on | V5 meal comes from what was said | ✅ | 0.7s |
| Say (voice or typed), with AI turned on | V7 keyboard dictation then Done shows the review card by itself | ✅ | 0.8s |
| Say (voice or typed), with AI turned on | V8 Add button works with words typed but not reviewed yet | ✅ | 0.8s |
| Say (voice or typed), with AI turned on | V9 review takes over the screen, with a way back to edit | ✅ | 0.9s |
| Say (voice or typed), with AI turned on | V10 if the AI can't answer, the reason is shown, not hidden | ✅ | 0.7s |
| Say (voice or typed), with AI turned on | V11 big mic button: talk, tap again → review card | ✅ | 1.2s |
| Say (voice or typed), with AI turned on | V6 Siri link opens the review card without saving | ✅ | 0.6s |
| Say (voice or typed), with AI turned on | V12 AI problem (no key, no credits) is explained on screen | ✅ | 0.8s |
| AI problems are visible | V13 script crash page: reason and Google's text shown above the button, not hidden | ✅ | 0.8s |
| AI problems are visible | V14 Settings → Test AI says it works | ✅ | 0.6s |
| AI problems are visible | V15 Settings → Test AI explains a crash | ✅ | 0.6s |
| Photo and barcode | P1 plate photo → review → saved | ✅ | 0.9s |
| Photo and barcode | B1 typed barcode fills in a New food from Open Food Facts → check → Save → logged at one serving | ✅ | 1.0s |
| Photo and barcode | B2 📷 Scan barcode: live camera reads the code and fills in the food | ✅ | 0.8s |
| Photo and barcode | B3 a barcode you saved before is picked straight away, at one serving | ✅ | 0.9s |
| Photo and barcode | B4 barcode not in Open Food Facts: type it from the label once, next scan finds it | ✅ | 1.2s |
| Photo and barcode | B5 product found but without nutrition numbers: name filled, numbers left for you | ✅ | 0.8s |
| Photo and barcode | B6 Foods → New food → 📷 Scan barcode fills the form there (nothing logged) | ✅ | 0.8s |
| Photo and barcode | B7 camera blocked: says how to allow it, scanner closes | ✅ | 0.8s |
| Photo and barcode | B9 iPhone way (no built-in reader): ZXing reads a real EAN-13 barcode from the camera | ✅ | 1.2s |
| Photo and barcode | B10 12-digit (UPC) and 13-digit (EAN) forms of the same barcode are one product | ✅ | 0.7s |
| Photo and barcode | B8 Cancel closes the scanner and turns the camera off | ✅ | 0.9s |
| @smoke | S1 app opens without errors | ✅ | 0.5s |
| @smoke | S2 connect to the Sheet from the setup screen | ✅ | 0.6s |
| @smoke | S3 log a food from the library | ✅ | 0.9s |
| @smoke | S4 entry survives a reload | ✅ | 1.1s |
| @smoke | S5 every tab renders | ✅ | 0.8s |
| Save & sync safety | Y1 entry added while a slow sync is loading is not lost | ✅ | 5.3s |
| Save & sync safety | Y2 offline then back online | ✅ | 0.9s |
| Save & sync safety | Y3 one rejected record doesn't block later saves | ✅ | 3.0s |
| Save & sync safety | Y4 entry from another device shows up and isn't overwritten | ✅ | 1.9s |
| Save & sync safety | Y5 import saves to the Sheet, and says so honestly when it can't | ✅ | 0.6s |
| Save & sync safety | Y6 import only adds: nothing already in Budgie is changed or lost | ✅ | 0.8s |

What each test checks: qa/TEST_CASES.md. What you can do in the app: qa/USE_CASES.md. Traces and screenshots for failures: qa/results/html.