// Turns Playwright's JSON results into a short QA report: what passed, what failed and why.
// Writes qa/results/QA_REPORT.md, prints it, and adds it to the GitHub Actions summary when run in CI.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const dir = path.dirname(url.fileURLToPath(import.meta.url));
const resFile = path.join(dir, "results/results.json");
if (!fs.existsSync(resFile)) { console.error("No results yet. Run the tests first."); process.exit(2); }
const R = JSON.parse(fs.readFileSync(resFile, "utf8"));
let version = "unknown";
try { version = JSON.parse(fs.readFileSync(path.join(dir, "../version.json"), "utf8")).version; } catch {}

const rows = [];
(function walk(suite, trail) {
  (suite.specs || []).forEach(spec => spec.tests.forEach(t => {
    const r = t.results[t.results.length - 1] || {};
    const status = t.status === "expected" ? "pass" : t.status === "skipped" ? "skip" : "FAIL";
    const err = (r.error && (r.error.message || r.error.value) || "").replace(/\u001b\[[0-9;]*m/g, "");
    rows.push({ area: trail.filter(Boolean).slice(-1)[0] || "", title: spec.title, status, ms: r.duration || 0,
      err: err.split("\n").filter(l => l.trim()).slice(0, 6).join("\n") });
  }));
  (suite.suites || []).forEach(s => walk(s, [...trail, s.title.endsWith(".mjs") ? "" : s.title]));
})({ suites: R.suites }, []);

const fails = rows.filter(r => r.status === "FAIL"), smokeFails = fails.filter(r => r.area === "@smoke");
const verdict = !rows.length ? "NO TESTS RAN" : smokeFails.length ? "🔴 SMOKE FAILED. Do not deploy." : fails.length ? "🟠 Smoke OK, some features failing. Fix before deploy." : "🟢 All green. Safe to deploy.";

// coverage (written by tests/coverage.spec.mjs)
let cov = null; try { cov = JSON.parse(fs.readFileSync(path.join(dir, "results/coverage.json"), "utf8")); } catch {}
const covLine = cov ? `${cov.covered}/${cov.total} controls have a test (${Math.round(cov.covered / cov.total * 100)}%)` + (cov.missing.length ? `. Missing: ${cov.missing.join(", ")}` : "") : "not measured in this run";

// regression: compare with the previous run (qa/last-run.json, committed with each release)
const idOf = t => t.split(" ")[0];
const lastFile = path.join(dir, "last-run.json");
let last = null; try { last = JSON.parse(fs.readFileSync(lastFile, "utf8")); } catch {}
const now = Object.fromEntries(rows.map(r => [idOf(r.title), r.status]));
const title = Object.fromEntries(rows.map(r => [idOf(r.title), r.title]));
let regr = [`No earlier run to compare with. This run is the baseline.`];
if (last) {
  const was = last.results || {};
  const broke = Object.keys(now).filter(k => now[k] === "FAIL" && was[k] === "pass");
  const fixed = Object.keys(now).filter(k => now[k] === "pass" && was[k] === "FAIL");
  const added = Object.keys(now).filter(k => !(k in was));
  const gone = Object.keys(was).filter(k => !(k in now));
  const still = Object.keys(now).filter(k => now[k] === "pass" && was[k] === "pass");
  regr = [
    `Compared with ${last.version} (${last.run}).`, ``,
    `- **Still passing:** ${still.length}`,
    `- **Broken since last time (regressions):** ${broke.length ? broke.map(k => title[k]).join("; ") : "none"}`,
    `- **Fixed since last time:** ${fixed.length ? fixed.map(k => title[k]).join("; ") : "none"}`,
    `- **New tests:** ${added.length ? added.length + " (" + added.join(", ") + ")" : "none"}`,
    `- **Tests removed:** ${gone.length ? gone.join(", ") + "  ⚠️ check this was on purpose" : "none"}`,
  ];
}

const areas = [...new Set(rows.map(r => r.area))];
const runAt = new Date().toLocaleString("en-CA", { timeZone: "America/Edmonton" });
const md = [
  `# Budgie QA report`,
  `**Version:** ${version}  `,
  `**Run:** ${runAt} (Calgary)  `,
  `**Result:** ${rows.length - fails.length}/${rows.length} passed. ${verdict}  `,
  `**Coverage:** ${covLine}`,
  ``,
  `## Regression check`, ...regr,
  ``,
  fails.length ? `## Failures to fix\n` + fails.map(f => `### ${f.title}  _(${f.area})_\n\`\`\`\n${f.err}\n\`\`\``).join("\n\n") : `## Failures to fix\nNone.`,
  ``,
  `## By area`,
  `| Area | Passed |`, `|---|---|`,
  ...areas.map(a => { const r = rows.filter(x => x.area === a); return `| ${a} | ${r.filter(x => x.status === "pass").length}/${r.length} |`; }),
  ``,
  `## All checks`,
  `| Area | Test | Result | Time |`, `|---|---|---|---|`,
  ...rows.map(r => `| ${r.area} | ${r.title} | ${r.status === "pass" ? "✅" : r.status === "skip" ? "⏭" : "❌"} | ${(r.ms / 1000).toFixed(1)}s |`),
  ``, `What each test checks: qa/TEST_CASES.md. What you can do in the app: qa/USE_CASES.md. Traces and screenshots for failures: qa/results/html.`,
].join("\n");
fs.writeFileSync(path.join(dir, "results/QA_REPORT.md"), md);
// a full run (not just smoke) becomes the new baseline and the committed report
if (rows.length > 20 && process.argv.includes("--save")) {
  fs.writeFileSync(lastFile, JSON.stringify({ version, run: runAt, results: now }, null, 1));
  fs.writeFileSync(path.join(dir, "QA_REPORT.md"), md);
}
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n");
console.log(md);
process.exit(fails.length ? 1 : 0);
