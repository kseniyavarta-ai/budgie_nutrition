// Coverage gate: every button, field, switch and list action in index.html must be used by at least one test.
// Add a control to the app without a test → this fails and names it.
// Writes results/coverage.json for report.mjs.
import { test, expect } from "@playwright/test";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";

const dir = path.dirname(url.fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(dir, "../../index.html"), "utf8");
const testsText = fs.readdirSync(dir).filter(f => f.endsWith(".spec.mjs") && f !== "coverage.spec.mjs")
  .map(f => fs.readFileSync(path.join(dir, f), "utf8")).join("\n")
  + fs.readFileSync(path.join(dir, "../fixtures.mjs"), "utf8");

// controls with a fixed id: <input|button|select|textarea|form id="…">
const ids = [...new Set([...html.matchAll(/<(input|button|select|textarea|form)\b[^>]*\sid="([A-Za-z][\w-]*)"/g)].map(m => m[2]))];
// controls the app builds on the fly (list rows, chips, review cards): their data-* attribute names
const dyn = [...new Set([...html.matchAll(/<(button|input|select)\b[^>]*?\s(data-[a-z]+)(?=[=\s>])/g)].map(m => m[2]))];
// containers whose buttons are generated (they have no data-* of their own)
const containers = ["gChips"];

const usedId = id => new RegExp(`#${id}\\b|["'\`]${id}["'\`]`).test(testsText);
const usedAttr = a => testsText.includes(`[${a}`);

test.describe("Coverage", () => {
  test("CV1 every control in the app is used by a test", () => {
    const missing = [...ids.filter(i => !usedId(i)).map(i => "#" + i), ...dyn.filter(a => !usedAttr(a)).map(a => `[${a}]`),
      ...containers.filter(c => !usedId(c)).map(c => "#" + c)];
    const total = ids.length + dyn.length + containers.length;
    fs.mkdirSync(path.join(dir, "../results"), { recursive: true });
    fs.writeFileSync(path.join(dir, "../results/coverage.json"), JSON.stringify({ total, covered: total - missing.length, ids: ids.length, dynamic: dyn.length + containers.length, missing }, null, 1));
    expect(ids.length, "found the app's controls").toBeGreaterThan(60);
    expect(missing, "controls with no test").toEqual([]);
  });
});
