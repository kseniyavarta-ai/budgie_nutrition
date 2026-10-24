# Budgie use cases

What Kseniya does with Budgie, and the test cases (in `TEST_CASES.md`) that prove each one works.
Every update runs **all** of these again (regression), and the report says what still passes, what broke and what was fixed since the last release.

| # | I want to… | How in the app | Proven by |
|---|---|---|---|
| U1 | Set Budgie up on my phone | Paste the Web app URL + token, or a setup code from another device | S2, SU1 |
| U2 | Try it before connecting a Sheet | "Try it without a Sheet" | SU2 |
| U3 | Log a food from my library | + → Library → tap the food → grams → Add | S3, A1, A9, A10, A11, L4 |
| U4 | Log something quickly with my own numbers | + → Quick → name, kcal, P/C/F/fibre → Add (or Return) | L4, A2, A2b |
| U5 | Say what I ate, without paid AI | + → 🎤 Say → talk or type → check the review card → Add | N1, N2, N3, A5, V1–V9, V11, R5 |
| U6 | Use AI for Say/photos (optional, off by default) | Settings → "Use AI for 🎤 Say" | N4, V10, V12–V15 |
| U7 | Log from a photo of my plate | + → Photo → Analyze → check → Add | P1 |
| U8 | Add a packaged food from its label | + → Photo → "This is a nutrition label" → check numbers → Save | A6 |
| U9 | Add a packaged food from its barcode | + → Barcode → type or photograph it → grams → Add | B1, A7, A8 |
| U10 | Fix or remove something I logged | Tap the entry → change grams/meal → Save, or Remove; × in the list | L1, L2, L3, A3 |
| U11 | Log for another day | ‹ › arrows at the top | L5, DN1 |
| U12 | Change my mind without saving | × on any add/edit screen | A4, FD5, RC3 |
| U13 | Keep my food library | Foods → New food / tap to edit / ★ / delete (two taps); or "＋ Add … as a new food" while logging | F1–F4, FD3, FD4, A12 |
| U14 | Find foods fast | Foods search box, group chips, ★ favourites and recents when adding | FD1, FD2, F4 |
| U15 | Get the basic foods (breads, grains, dairy…) without losing mine | Foods → "Add common foods to my library" | F5 |
| U16 | Build a recipe without paid AI | Foods → New recipe → paste ingredients → Read ingredients → weigh the batch → Save | R1, R2, R3, R6, RC1 |
| U17 | Build a recipe from a photo | Free: copy text from the photo (iPhone Live Text) and paste. With AI: "From a photo" | R4, RC4 |
| U18 | Weigh my cooked batch in a pot | Settings → Pots, then pick the pot in the recipe | R1, ST3 |
| U19 | Delete a recipe | Open it → Delete recipe (two taps) | RC2 |
| U20 | Record my Monday weigh-in and tape measures | Body → weight, waist, hips → Save; × (two taps) to delete | W1–W3, BD1 |
| U21 | See my goal and progress | Body → goal card, next Monday, milestone | G1, G2, BD2 |
| U22 | Have Budgie calculate my calories and macros | Settings → profile → Calculate for me → Use this plan | ST1 |
| U23 | Set my numbers by hand | Settings → Plan → Save my numbers | PL1, PL2, ST2 |
| U24 | Know my data is safe in my Sheet | Status shows Synced / waiting; nothing lost when offline or on two phones | Y1–Y4 |
| U25 | Reconnect or check the connection | Settings → Save and test, Sync now | ST4, ST5 |
| U26 | Set up a second phone | Settings → Copy setup code → paste on the other phone | ST6, SU1 |
| U27 | Back up and restore without losing anything | Settings → Export backup / Import (import only adds) | ST7, Y5, Y6 |
| U28 | Get new versions | Banner "New version of Budgie" → tap | UP1, D2 |

## Regression rule

On every change: smoke first, then every test, then `node report.mjs --save`. The report (`qa/QA_REPORT.md`) compares the run with the previous release (`qa/last-run.json`) and lists regressions, fixes, new tests and coverage. Nothing ships unless it's all green, and the coverage gate (CV1) fails if a new button or field has no test.
