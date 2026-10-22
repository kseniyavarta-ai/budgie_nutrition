/**
 * Budgie — Google Sheets backend (Apps Script web app).
 *
 * Setup (once):
 * 1. Create a Google Sheet, open Extensions → Apps Script, paste this file, save.
 * 2. Project Settings → Script properties → add:
 *      BUDGIE_TOKEN       any long secret phrase (the app asks for it once)
 *      ANTHROPIC_API_KEY  your key from console.anthropic.com (for photo → food)
 * 3. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
 * 4. Paste the Web app URL and your token into Budgie → Settings.
 *
 * Nothing secret lives in the app or the GitHub repo: the URL, token and
 * API key stay in your Sheet and on your phone.
 *
 * Data: one tab per collection (foods, days, body, settings), each row = id + JSON.
 */

var COLLECTIONS = ['foods', 'days', 'body', 'settings'];
var MODEL = 'claude-sonnet-5-5';

function doGet() {
  return json_({ ok: true, app: 'budgie', hint: 'POST with a token' });
}

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents || '{}');
    var props = PropertiesService.getScriptProperties();
    var token = props.getProperty('BUDGIE_TOKEN');
    if (!token || req.token !== token) return json_({ ok: false, error: 'bad_token' });

    switch (req.action) {
      case 'ping':  return json_({ ok: true });
      case 'load':  return json_({ ok: true, data: loadAll_() });
      case 'put':   put_(req.collection, req.id, req.data); return json_({ ok: true });
      case 'del':   del_(req.collection, req.id); return json_({ ok: true });
      case 'bulk':  bulk_(req.items || []); return json_({ ok: true, count: (req.items || []).length });
      case 'ai':    return json_({ ok: true, text: ai_(req, props.getProperty('ANTHROPIC_API_KEY')) });
      default:      return json_({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

/* ---------- storage ---------- */

function sheet_(name) {
  if (COLLECTIONS.indexOf(name) < 0) throw new Error('bad_collection');
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(['id', 'json', 'updated']);
    sh.setFrozenRows(1);
  }
  sh.getRange('A:A').setNumberFormat('@'); // keep ids like 2026-10-19 as text, not dates
  return sh;
}

function key_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(v);
}

function rowIndex_(sh, id) {
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (key_(ids[i][0]) === String(id)) return i + 2;
  return -1;
}

function put_(collection, id, data) {
  if (!id) throw new Error('missing_id');
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var sh = sheet_(collection);
    var row = [String(id), JSON.stringify(data || {}), new Date()];
    var r = rowIndex_(sh, id);
    if (r > 0) sh.getRange(r, 1, 1, 3).setValues([row]); else sh.appendRow(row);
  } finally { lock.releaseLock(); }
}

function del_(collection, id) {
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var sh = sheet_(collection);
    var r = rowIndex_(sh, id);
    if (r > 0) sh.deleteRow(r);
  } finally { lock.releaseLock(); }
}

function bulk_(items) {
  items.forEach(function (it) { put_(it.collection, it.id, it.data); });
}

function loadAll_() {
  var out = {};
  COLLECTIONS.forEach(function (c) {
    var sh = sheet_(c), last = sh.getLastRow(), rows = {};
    if (last >= 2) {
      sh.getRange(2, 1, last - 1, 2).getValues().forEach(function (v) {
        try { rows[key_(v[0])] = JSON.parse(v[1]); } catch (e) {}
      });
    }
    out[c] = rows;
  });
  return out;
}

/* ---------- Claude (photo → food, recipe parsing) ---------- */

function ai_(req, key) {
  if (!key) throw new Error('no_api_key');
  var content = [];
  (req.images || []).slice(0, 4).forEach(function (b64) {
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } });
  });
  content.push({ type: 'text', text: String(req.prompt || '').slice(0, 20000) });

  var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: String(req.system || ''),
      messages: [{ role: 'user', content: content }]
    }),
    muteHttpExceptions: true
  });
  var body = JSON.parse(res.getContentText());
  if (res.getResponseCode() !== 200) throw new Error((body.error && body.error.message) || 'ai_failed');
  return body.content.map(function (b) { return b.text || ''; }).join('');
}

/**
 * Run this once from the Apps Script editor (pick testAI at the top → Run) to grant
 * permission to reach the Anthropic API. The log shows whether your key works.
 */
function testAI() {
  var key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  Logger.log(ai_({ system: 'Reply with only: ok', prompt: 'test', images: [] }, key));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
