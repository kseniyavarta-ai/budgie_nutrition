# Budgie changelog

| Date | Label | What changed | Status |
|---|---|---|---|
| 2026-10-22 | say-it-2 | "New version" banner: Budgie checks for updates when you open it and offers a one-tap refresh. | **Live** |
| 2026-10-22 | say-it | New 🎤 Say mode: talk or type what you ate; Claude splits it into foods, matches your library, picks the meal, and shows a ready-to-save list with a total. Edit grams or pieces, untick anything wrong, tap Save. | Replaced by say-it-2 |
| 2026-10-22 | sync-fix | Fix: Google Sheets turned date ids (2026-10-19) into dates, so days and weigh-ins loaded under the wrong key and looked empty. App now maps them back; Code.gs keeps ids as text. Sync no longer drops records that never reached the Sheet. | Replaced by say-it |
| 2026-10-22 | goal-and-plan | Body tab: goal you set right on the card, progress bar, weeks to goal, next Monday weigh-in, next milestone and an on-track mark. Settings: "Calculate for me" plan (Mifflin-St Jeor or Katch-McArdle with body fat %, activity, 1.8 g/kg protein, fat floor 0.8 g/kg, fibre 14 g/1,000 kcal; switches to measured maintenance after 3+ weigh-ins). Manual numbers moved under "Adjust by hand". | Replaced by sync-fix |
| 2026-10-22 | food-groups | Food groups (Protein, Dairy, Vegetables, Fruit, Grains & starches, Legumes, Nuts & seeds, Fats & oils, Pantry, Sweets & treats, Drinks, Recipes): sectioned Foods list, group chips to filter, group picker when editing a food. | Replaced by goal-and-plan |
| 2026-10-22 | lemon-and-blue | Dedication now reads "In memory of Lemon and Blue". | Replaced by food-groups |
| 2026-10-22 | lemon | Yellow now matches Lemon's feathers; new icon with both budgies (blue and Lemon) on a perch; "In memory of Lemon" in Settings. | Replaced by lemon-and-blue |
| 2026-10-22 | feathers | Budgie-feather colours (sunny yellow, leaf green, sky blue) with a colour per meal; calorie bar turns green inside your range; ★ favourites and recent foods at the top when adding; days-to-goal estimate on Today and Body (planned pace until 3+ weekly weigh-ins, then your real pace); setup code to connect another device. | Replaced by lemon |
| 2026-10-22 | connect-help | Setup screen now shows why connecting failed and how to fix it; error messages no longer hide behind the setup screen. | Replaced by feathers |
| 2026-10-22 | first-flight | First version: food log with editable entries, food library, recipe builder with pot weights, photo → food AI, nutrition-label photos, barcode lookup, weekly weigh-ins, import/export, Google Sheet sync, budgie icon. | Replaced by connect-help |
