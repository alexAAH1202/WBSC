const fs = require('fs'), vm = require('vm'), assert = require('assert');
const code = fs.readFileSync(require('path').join(__dirname, '..', 'Code.gs'), 'utf8');

function makeEnv({ failMail = false } = {}) {
  const rows = []; const raw = [];                          // rows[0] is the header row (1-based row = index+1)
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: r => { raw.push(r.slice()); rows.push(r.map(v => typeof v === 'string' && /^'\d+$/.test(v) ? v.slice(1) : (typeof v === 'string' && v[0] === "'" ? v.slice(1) : v))); },
    setFrozenRows() {},
    getRange(r, c, nr = 1, nc = 1) {
      return {
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (rows[r - 1 + i] || [])[c - 1 + j] ?? '')),
        getValue: () => (rows[r - 1] || [])[c - 1],
        setValue: v => { rows[r - 1] = rows[r - 1] || []; rows[r - 1][c - 1] = v; }
      };
    }
  };
  const mails = [];
  const ctx = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => sheet, getSheets: () => [sheet] }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    MailApp: { sendEmail: (...a) => { if (failMail) throw new Error('quota'); mails.push(a); } },
    HtmlService: { XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' }, createHtmlOutput: h => ({ html: h, setXFrameOptionsMode(m) { this.mode = m; return this; } }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: t => ({ text: t, setMimeType() { return this; } }) },
    console
  };
  vm.createContext(ctx); vm.runInContext(code, ctx);
  return { ctx, rows, raw, mails };
}
const base = o => Object.assign({ submissionId: 'sub-aaaa1111', participantName: 'Jo Ump', participantEmail: 'jo@x.com', umpireId: '007',
  association: 'Assoc', module: 'Module 01 — Foundations', assessmentType: 'Manual Knowledge Check', score: 4, totalQuestions: 5, percentage: 99, completionStatus: 'Complete' }, o);
const post = (env, d) => env.ctx.doPost({ parameter: { payload: JSON.stringify(d) } });
const msgOf = out => { const m = out.html.match(/var m=(\{.*?\});var w/)[1]; return JSON.parse(m); };

let n = 0; const ok = (name, fn) => { fn(); console.log('  ok -', name); n++; };

let env = makeEnv();
ok('saves, confirms, then emails; header + new columns written', () => {
  const out = post(env, base());
  const m = msgOf(out);
  assert.strictEqual(m.success, true); assert.strictEqual(m.attemptNumber, 1); assert.strictEqual(m.submissionId, 'sub-aaaa1111');
  assert.strictEqual(out.mode, 'ALLOWALL');
  assert.strictEqual(env.rows.length, 2); assert.strictEqual(env.rows[0][14], 'Submission ID'); assert.strictEqual(env.rows[0][15], 'Email Status');
  assert.strictEqual(env.rows[1][9], 80, 'percentage recomputed server-side (client sent 99)');
  assert.strictEqual(env.rows[1][15], 'sent'); assert.strictEqual(env.mails.length, 1);
});
ok('retry of the same submissionId: no new row, no second email, same attempt', () => {
  const m = msgOf(post(env, base()));
  assert.strictEqual(m.success, true); assert.strictEqual(m.duplicate, true); assert.strictEqual(m.attemptNumber, 1);
  assert.strictEqual(env.rows.length, 2); assert.strictEqual(env.mails.length, 1);
});
ok('second attempt counts 2 even with different email case/spaces and numeric-looking ID', () => {
  const m = msgOf(post(env, base({ submissionId: 'sub-bbbb2222', participantEmail: ' JO@X.com ' })));
  assert.strictEqual(m.attemptNumber, 2);
  const m2 = msgOf(post(env, base({ submissionId: 'sub-cccc3333', participantEmail: 'other@x.com' }))); // same umpire ID 007
  assert.strictEqual(m2.attemptNumber, 3);
});
ok('different module restarts at attempt 1', () => {
  assert.strictEqual(msgOf(post(env, base({ submissionId: 'sub-dddd4444', module: 'Module 02' }))).attemptNumber, 1);
});
ok('a numeric umpire ID already stored as a number still matches', () => {
  const e = makeEnv(); post(e, base({ umpireId: '12' }));
  e.rows[1][3] = 12;                                  // sheet had converted it to a number
  assert.strictEqual(msgOf(post(e, base({ submissionId: 'sub-eeee5555', participantEmail: 'x@y.com', umpireId: '12' }))).attemptNumber, 2);
});
ok('formula injection is neutralised (text marker added; Sheets stores it as text)', () => {
  const e = makeEnv(); post(e, base({ participantName: '=HYPERLINK("http://evil","x")', association: '+cmd', umpireId: '-5' }));
  const r = e.raw[1];
  assert.ok(r[1].startsWith("'="), 'name written with a leading apostrophe');
  assert.ok(r[4].startsWith("'+"), 'association too');
  assert.ok(r[3].startsWith("'-"), 'umpire id too');
});
ok('plain numeric umpire ID is written as text, not a number', () => {
  const e = makeEnv(); post(e, base({ umpireId: '007' }));
  assert.strictEqual(e.raw[1][3], "'007");
});
ok('invalid scores and emails are rejected and nothing is written', () => {
  const e = makeEnv();
  for (const bad of [{ score: 6 }, { score: -1 }, { totalQuestions: 0 }, { score: 2.5 }, { participantEmail: 'nope' }, { participantName: '' }, { submissionId: 'x' }]) {
    const m = msgOf(post(e, base(bad))); assert.strictEqual(m.success, false, JSON.stringify(bad)); assert.ok(m.error);
  }
  assert.strictEqual(e.rows.length, 0); assert.strictEqual(e.mails.length, 0);
});
ok('garbage body returns a failure message, not an exception', () => {
  const e = makeEnv(); const out = e.ctx.doPost({ parameter: { payload: '{not json' } });
  assert.strictEqual(msgOf(out).success, false); assert.strictEqual(msgOf(out).error, 'The server could not save the result');
});
ok('email failure: row stays saved, success still reported, status recorded', () => {
  const e = makeEnv({ failMail: true }); const m = msgOf(post(e, base()));
  assert.strictEqual(m.success, true); assert.strictEqual(e.rows.length, 2); assert.ok(/^FAILED: Error: quota/.test(e.rows[1][15]));
});
ok('legacy raw-JSON POST still works and returns both ok and success', () => {
  const e = makeEnv(); const out = e.ctx.doPost({ postData: { contents: JSON.stringify(base()) } });
  const j = JSON.parse(out.text); assert.strictEqual(j.ok, true); assert.strictEqual(j.success, true);
});
ok('reply page cannot be broken out of by hostile text', () => {
  const e = makeEnv(); const out = post(e, base({ submissionId: 'sub-ffff6666', participantName: '</script><script>alert(1)</script>' }));
  assert.ok(!/<\/script><script>alert/.test(out.html));
});
console.log(n + ' Code.gs checks passed');
