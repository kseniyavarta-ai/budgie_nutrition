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
const md = [
  `# Budgie QA report`,
  `**Version:** ${version}  `,
  `**Run:** ${new Date().toLocaleString("en-CA", { timeZone: "America/Edmonton" })} (Calgary)  `,
  `**Result:** ${rows.length - fails.length}/${rows.length} passed. ${verdict}`,
  ``,
  fails.length ? `## Failures to fix\n` + fails.map(f => `### ${f.title}  _(${f.area})_\n\`\`\`\n${f.err}\n\`\`\``).join("\n\n") : `## Failures to fix\nNone.`,
  ``,
  `## All checks`,
  `| Area | Test | Result | Time |`, `|---|---|---|---|`,
  ...rows.map(r => `| ${r.area} | ${r.title} | ${r.status === "pass" ? "✅" : r.status === "skip" ? "⏭" : "❌"} | ${(r.ms / 1000).toFixed(1)}s |`),
  ``, `Test cases are described in qa/TEST_CASES.md. Traces and screenshots for failures: qa/results/html.`,
].join("\n");
fs.writeFileSync(path.join(dir, "results/QA_REPORT.md"), md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n");
console.log(md);
process.exit(fails.length ? 1 : 0);
