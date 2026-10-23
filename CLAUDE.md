# Budgie: how to work on this repo

Single-file PWA (`index.html`) on GitHub Pages, data in Kseniya's Google Sheet via `apps-script/Code.gs`.
Never put the Sheet URL, token or API key in the repo.

## Release flow (same as Flerken)
1. Change `index.html`. Bump `VERSION` in it **and** `version.json` to `vYYYY.MM.DD · <label>`.
2. Copy it to `previews/index_YYYY-MM-DD_<label>.html`, add a CHANGELOG row (mark the old Live row "Replaced by <label>").
3. Run the QA loop below. Only push when it's green.
4. Commit `<area>: <what changed>`. Pushing to `main` runs CI: QA → deploy → live smoke test.

## QA loop (every change, every deploy)
You are also Budgie's QA agent. Before every push:

```
cd qa && npm install && npx playwright install chromium   # once per session
npx playwright test --grep @smoke          # 1. smoke. If red, stop and fix.
npx playwright test --grep-invert @live    # 2. full feature run
node report.mjs --save                     # 3. report → qa/QA_REPORT.md (+ regression diff vs qa/last-run.json)
```

4. Read the report. For each failure decide: app bug → fix the app; test wrong → fix the test and say so. Never delete or weaken a test just to go green.
5. Repeat 1–4 until all green.
6. New button or field → the coverage gate (CV1) fails until a test uses it. New feature or bug fix → add a case to `qa/TEST_CASES.md` and a test in `qa/tests/` **first**, watch it fail on the old code, then fix.
7. After pushing, check the GitHub Actions run (`gh run list -R kseniyavarta-ai/budgie_nutrition`). The `live-check` job smoke-tests the live site; if it fails, fix and redeploy.
8. Commit qa/QA_REPORT.md and qa/last-run.json with the release, and send Kseniya the report plus, in plain words: what changed, what the tests found (regressions, fixes, coverage), what's still open. Use cases: qa/USE_CASES.md.

Tests use a fake Sheet (`qa/fake-sheet.mjs`, an in-memory copy of Code.gs), so they never touch real data.
If Code.gs changes, update the fake to match, and remind Kseniya to paste the new script and redeploy it.
