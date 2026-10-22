# 🐦 Budgie

A calm food tracker built by a nutritionist, for herself first: food log, a personal food library, a recipe builder that works from the cooked weight, photo-to-food AI, barcode lookup and **weekly** weigh-ins. No daily scale pressure.

- **Live app:** https://kseniyavarta-ai.github.io/budgie_nutrition/
- On iPhone: open it in Safari → Share → **Add to Home Screen**.

## How it works

| Part | What it does |
|---|---|
| `index.html` | The whole app (single file, no build step). |
| `apps-script/Code.gs` | Backend you paste into your own Google Sheet (Extensions → Apps Script). Stores data and calls Claude for photos. |
| Open Food Facts | Free barcode lookups, straight from the browser. |

**Your data never lives in this repo.** The Sheet's web-app URL and token are typed into the app once and stay on your phone. The Anthropic API key lives only in the Sheet's Script properties.

## Set up your own copy

1. Make a Google Sheet → Extensions → Apps Script → paste `apps-script/Code.gs` → save.
2. Project Settings → Script properties: `BUDGIE_TOKEN` (any long secret phrase) and `ANTHROPIC_API_KEY`.
3. Deploy → New deployment → Web app · Execute as **Me** · Access **Anyone** → copy the URL.
4. Open Budgie, paste the URL and token. Done.

## Features (v1)

- **Today:** calories against a range, protein, fibre, carbs, fat; meals; tap any line to edit it.
- **Add food:** from your library, from a photo (Claude estimates items and grams, matching your library), from a barcode, or quick entry.
- **Nutrition labels:** photograph a label → saved to your library per 100 g.
- **Recipes:** fill ingredients from a photo or pasted text, then weigh the cooked batch (save your pots' empty weights once). Logged per 100 g cooked.
- **Body:** weekly weigh-ins, tape measurements, progress to goal, 7-day food averages.
- **Backup:** import / export as JSON.
- **Hey Siri, Budgie:** a Shortcut that dictates what you ate and opens `…/budgie_nutrition/#say=<text>`; Budgie pre-fills the entries for you to approve.

## File naming (same as Flerken)

| File | What it is |
|---|---|
| `index.html` | **The live app.** Never renamed. |
| `previews/index_YYYY-MM-DD_what-changed.html` | A version to test before it goes live. |
| `CHANGELOG.md` | One line per version. |

Commit messages: `<area>: <what changed>`, e.g. `recipes: add pot weights`.
