// In-memory stand-in for apps-script/Code.gs, served through Playwright request interception.
// Lets tests make the Sheet slow, offline, or reject specific records.
export const SHEET_URL = "https://script.google.com/macros/s/QA_FAKE/exec";
export const TOKEN = "qa-token";

export const SEED = {
  foods: {
    "greek-yogurt": { id: "greek-yogurt", name: "Greek yogurt 2%", basis: "100g", unit: "", group: "Dairy", kcal: 73, p: 10, c: 4, f: 2, fb: 0 },
    "egg": { id: "egg", name: "Egg, large", basis: "unit", unit: "egg", pieceG: 50, group: "Protein", kcal: 72, p: 6.3, c: 0.4, f: 4.8, fb: 0 },
    "oats": { id: "oats", name: "Rolled oats", basis: "100g", unit: "", group: "Grains & starches", kcal: 379, p: 13, c: 68, f: 6.5, fb: 10 },
  },
  days: {},
  body: {},
  settings: { plan: { kcalLow: 1750, kcalHigh: 1800, protein: 115, fibre: 28, pace: 0.35 } },
};

export const SAY_REPLY = {
  meal: "breakfast",
  items: [
    { name: "Greek yogurt", grams: 150, pieces: null, libraryId: "greek-yogurt", kcal: 110, p: 15, c: 6, f: 3, fb: 0 },
    { name: "Blueberries", grams: 50, pieces: null, libraryId: null, kcal: 29, p: 0.4, c: 7.2, f: 0.2, fb: 1.2 },
    { name: "Eggs", grams: 100, pieces: 2, libraryId: "egg", kcal: 144, p: 12.6, c: 0.8, f: 9.6, fb: 0 },
  ],
  note: "Assumed a medium bowl.",
};
export const PHOTO_REPLY = {
  items: [{ name: "Oatmeal", grams: 40, libraryId: "oats", kcal: 152, p: 5.2, c: 27, f: 2.6, fb: 4 },
          { name: "Banana", grams: 100, libraryId: null, kcal: 89, p: 1.1, c: 23, f: 0.3, fb: 2.6 }],
  note: "Banana size estimated.",
};

export class FakeSheet {
  constructor(seed = SEED) {
    this.data = JSON.parse(JSON.stringify(seed));
    this.delayMs = 0;        // per request
    this.loadDelayMs = 0;    // extra delay for load only
    this.offline = false;    // network failure
    this.reject = null;      // fn(req) -> error string to reject that write
    this.log = [];
  }
  async handle(route) {
    const req = JSON.parse(route.request().postData() || "{}");
    this.log.push(req.action);
    if (this.offline) return route.abort("internetdisconnected");
    // snapshot for load happens at the START of the request (like a real read)
    const snapshot = req.action === "load" ? JSON.parse(JSON.stringify(this.data)) : null;
    const wait = this.delayMs + (req.action === "load" ? this.loadDelayMs : 0);
    if (wait) await new Promise(r => setTimeout(r, wait));
    const reply = this.answer(req, snapshot);
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(reply) });
  }
  answer(req, snapshot) {
    if (req.token !== TOKEN) return { ok: false, error: "bad_token" };
    const cols = ["foods", "days", "body", "settings"];
    const bad = this.reject && this.reject(req);
    if (bad) return { ok: false, error: bad };
    switch (req.action) {
      case "ping": return { ok: true };
      case "load": return { ok: true, data: snapshot };
      case "put":
        if (!cols.includes(req.collection)) return { ok: false, error: "bad_collection" };
        if (!req.id) return { ok: false, error: "missing_id" };
        this.data[req.collection][String(req.id)] = req.data || {};
        return { ok: true };
      case "del":
        delete this.data[req.collection][String(req.id)];
        return { ok: true };
      case "bulk":
        (req.items || []).forEach(it => { this.data[it.collection][String(it.id)] = it.data; });
        return { ok: true, count: (req.items || []).length };
      case "ai": {
        const sys = String(req.system || "");
        if (/spoken or typed/.test(sys)) return { ok: true, text: JSON.stringify(SAY_REPLY) };
        if (/nutrition facts label/.test(sys)) return { ok: true, text: JSON.stringify({ name: "Test bar", servingG: 40, per100: { kcal: 400, p: 20, c: 45, f: 15, fb: 8 } }) };
        if (/recipe/i.test(sys)) return { ok: true, text: JSON.stringify({ name: "", ingredients: [] }) };
        return { ok: true, text: JSON.stringify(PHOTO_REPLY) };
      }
      default: return { ok: false, error: "unknown_action" };
    }
  }
  day(date) { return this.data.days[date]; }
}
