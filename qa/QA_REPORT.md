# Budgie QA report
**Version:** v2026.10.23 · qa-full  
**Run:** 2026-10-23, 1:05:45 p.m. (Calgary)  
**Result:** 87/87 passed. 🟢 All green. Safe to deploy.  
**Coverage:** 116/116 controls have a test (100%)

## Regression check
Compared with v2026.10.23 · recipes-free (live before this update) (2026-10-23, 1:04:33 p.m.).

- **Still passing:** 83
- **Broken since last time (regressions):** none
- **Fixed since last time:** A2b quick entry: the keyboard's Return/Go key adds it (no page reload, nothing lost); F5 Add common foods: adds basics like white and whole wheat bread, keeps yours, no duplicates; R6 Read ingredients without a name: Save stays tappable and says what's missing; Y6 import only adds: nothing already in Budgie is changed or lost
- **New tests:** none
- **Tests removed:** none

## Failures to fix
None.

## By area
| Area | Passed |
|---|---|
| Setup screen | 2/2 |
| Today screen | 10/10 |
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
| Photo and barcode | 2/2 |
| @smoke | 5/5 |
| Save & sync safety | 6/6 |

## All checks
| Area | Test | Result | Time |
|---|---|---|---|
| Setup screen | SU1 setup code from another device fills URL and token, then connects | ✅ | 0.8s |
| Setup screen | SU2 'Try it without a Sheet' opens the app on this phone only | ✅ | 0.6s |
| Today screen | DN1 previous / next day arrows | ✅ | 0.4s |
| Today screen | A1 pick a food by tapping it in the list (per-piece food starts at 1) | ✅ | 0.7s |
| Today screen | A2 quick entry saves carbs, fat and fibre too | ✅ | 0.7s |
| Today screen | A2b quick entry: the keyboard's Return/Go key adds it (no page reload, nothing lost) | ✅ | 0.6s |
| Today screen | A3 'Remove from log' inside the edit screen | ✅ | 0.9s |
| Today screen | A4 × closes the add screen without saving | ✅ | 0.6s |
| Today screen | A5 Say review: untick a line, pick a food for one Budgie didn't know | ✅ | 0.9s |
| Today screen | A6 nutrition-label photo with a note opens a new food with the label's numbers | ✅ | 0.8s |
| Today screen | A7 barcode photo is read and looked up | ✅ | 0.6s |
| Today screen | A8 unreadable barcode photo says what to do | ✅ | 0.6s |
| Foods screen | FD1 search box filters the list | ✅ | 0.4s |
| Foods screen | FD2 food-group chips filter the list | ✅ | 0.6s |
| Foods screen | FD3 new per-piece food saves every field | ✅ | 0.8s |
| Foods screen | FD4 delete a food needs two taps | ✅ | 0.6s |
| Foods screen | FD5 × closes the food screen without saving | ✅ | 0.6s |
| Recipes | RC1 your own ingredient with numbers per 100 g; remove an ingredient | ✅ | 0.8s |
| Recipes | RC2 delete a recipe needs two taps | ✅ | 0.6s |
| Recipes | RC3 × closes the recipe screen without saving | ✅ | 0.5s |
| Recipes with the AI switch on | RC4 recipe photo is read by the AI into ingredients | ✅ | 0.6s |
| Body screen | BD1 weigh-in with waist and hips, then delete it with two taps | ✅ | 0.7s |
| Body goal | BD2 Return key in the goal box sets the goal | ✅ | 0.6s |
| Settings screen | ST1 'Calculate for me' uses every profile field, 'Use this plan' saves it | ✅ | 0.8s |
| Settings screen | ST2 'Save my numbers' keeps protein, fibre, start weight and date | ✅ | 0.6s |
| Settings screen | ST3 add a pot, then delete it | ✅ | 0.6s |
| Settings screen | ST4 'Save and test': wrong token is explained, right token connects | ✅ | 0.7s |
| Settings screen | ST5 'Sync now' brings in changes made elsewhere | ✅ | 0.5s |
| Settings screen | ST6 'Copy setup code' copies a code that sets up another phone | ✅ | 0.5s |
| Settings screen | ST7 'Export backup' downloads everything | ✅ | 0.8s |
| Updates | UP1 new version banner appears and reloads the app | ✅ | 0.5s |
| Coverage | CV1 every control in the app is used by a test | ✅ | 0.0s |
| Foods and recipes | F1 new food | ✅ | 0.6s |
| Foods and recipes | F2 edit a food's calories | ✅ | 0.5s |
| Foods and recipes | F3 clearing a note removes it | ✅ | 0.6s |
| Foods and recipes | F4 favourite survives reload | ✅ | 0.5s |
| Foods and recipes | F5 Add common foods: adds basics like white and whole wheat bread, keeps yours, no duplicates | ✅ | 1.6s |
| Foods and recipes | R1 recipe with a pot gives the right per-100 g numbers | ✅ | 0.8s |
| Foods and recipes | R2 pasted recipe is read without AI, every line becomes an ingredient | ✅ | 0.8s |
| Foods and recipes | R3 weigh the batch → per-100 g numbers; built-in foods join your library on save | ✅ | 0.8s |
| Foods and recipes | R6 Read ingredients without a name: Save stays tappable and says what's missing | ✅ | 0.9s |
| Foods and recipes | R4 'From a photo' without AI explains the free iPhone way (copy text from the photo) | ✅ | 0.7s |
| Foods and recipes | R5 Say uses built-in foods when your library doesn't have them | ✅ | 0.7s |
| Body, goal and plan | W1 weigh-in saves | ✅ | 0.6s |
| Body, goal and plan | W2 comma decimal (72,5) saves as 72.5 | ✅ | 0.5s |
| Body, goal and plan | W3 empty date is refused and nothing broken is queued | ✅ | 0.6s |
| Body, goal and plan | G1 set a goal | ✅ | 0.6s |
| Body, goal and plan | G2 typed goal and Set button survive a background sync | ✅ | 0.6s |
| Body, goal and plan | PL1 save plan numbers by hand | ✅ | 0.6s |
| Body, goal and plan | PL2 typing in the plan isn't wiped by a background sync | ✅ | 0.6s |
| Food log | L1 edit an entry's grams | ✅ | 0.8s |
| Food log | L2 move an entry to another meal | ✅ | 0.8s |
| Food log | L3 remove an entry | ✅ | 1.1s |
| Food log | L4 quick entry | ✅ | 0.6s |
| Food log | L5 log on yesterday | ✅ | 0.7s |
| Say, Budgie reads it itself (no AI) | N1 no AI call; amounts and library foods are understood | ✅ | 0.6s |
| Say, Budgie reads it itself (no AI) | N2 spoken numbers and units: half a cup of oats, a couple of eggs | ✅ | 0.6s |
| Say, Budgie reads it itself (no AI) | N3 food not in the library is not saved until you pick one; the pick is remembered | ✅ | 1.0s |
| Say, Budgie reads it itself (no AI) | N4 AI switch: off by default, on sends Say to the AI | ✅ | 0.8s |
| Say (voice or typed), with AI turned on | V1 review card shows grams and every macro before saving | ✅ | 0.7s |
| Say (voice or typed), with AI turned on | V2 approve adds every item with the numbers shown | ✅ | 0.8s |
| Say (voice or typed), with AI turned on | V3 unticked items are skipped | ✅ | 0.8s |
| Say (voice or typed), with AI turned on | V4 changing grams updates macros and what is saved | ✅ | 0.7s |
| Say (voice or typed), with AI turned on | V5 meal comes from what was said | ✅ | 0.7s |
| Say (voice or typed), with AI turned on | V7 keyboard dictation then Done shows the review card by itself | ✅ | 0.6s |
| Say (voice or typed), with AI turned on | V8 Add button works with words typed but not reviewed yet | ✅ | 0.6s |
| Say (voice or typed), with AI turned on | V9 review takes over the screen, with a way back to edit | ✅ | 0.7s |
| Say (voice or typed), with AI turned on | V10 if the AI can't answer, the reason is shown, not hidden | ✅ | 0.6s |
| Say (voice or typed), with AI turned on | V11 big mic button: talk, tap again → review card | ✅ | 0.9s |
| Say (voice or typed), with AI turned on | V6 Siri link opens the review card without saving | ✅ | 0.5s |
| Say (voice or typed), with AI turned on | V12 AI problem (no key, no credits) is explained on screen | ✅ | 0.7s |
| AI problems are visible | V13 script crash page: reason and Google's text shown above the button, not hidden | ✅ | 0.7s |
| AI problems are visible | V14 Settings → Test AI says it works | ✅ | 0.6s |
| AI problems are visible | V15 Settings → Test AI explains a crash | ✅ | 0.5s |
| Photo and barcode | P1 plate photo → review → saved | ✅ | 0.7s |
| Photo and barcode | B1 barcode lookup saves the product and the entry | ✅ | 0.7s |
| @smoke | S1 app opens without errors | ✅ | 0.4s |
| @smoke | S2 connect to the Sheet from the setup screen | ✅ | 0.6s |
| @smoke | S3 log a food from the library | ✅ | 0.7s |
| @smoke | S4 entry survives a reload | ✅ | 0.8s |
| @smoke | S5 every tab renders | ✅ | 0.6s |
| Save & sync safety | Y1 entry added while a slow sync is loading is not lost | ✅ | 5.0s |
| Save & sync safety | Y2 offline then back online | ✅ | 0.7s |
| Save & sync safety | Y3 one rejected record doesn't block later saves | ✅ | 3.2s |
| Save & sync safety | Y4 entry from another device shows up and isn't overwritten | ✅ | 1.6s |
| Save & sync safety | Y5 import saves to the Sheet, and says so honestly when it can't | ✅ | 0.5s |
| Save & sync safety | Y6 import only adds: nothing already in Budgie is changed or lost | ✅ | 0.7s |

What each test checks: qa/TEST_CASES.md. What you can do in the app: qa/USE_CASES.md. Traces and screenshots for failures: qa/results/html.