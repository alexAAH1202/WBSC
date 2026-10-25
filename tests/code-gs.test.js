const fs = require('fs'), vm = require('vm'), assert = require('assert');
const code = fs.readFileSync(require('path').join(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8');

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
ok('second attempt counts 2 even with different email case/spaces; a third (even via the umpire ID) is refused', () => {
  const m = msgOf(post(env, base({ submissionId: 'sub-bbbb2222', participantEmail: ' JO@X.com ' })));
  assert.strictEqual(m.attemptNumber, 2); assert.strictEqual(m.success, true);
  const before = env.rows.length, mails = env.mails.length;
  const m2 = msgOf(post(env, base({ submissionId: 'sub-cccc3333', participantEmail: 'other@x.com' }))); // same umpire ID 007
  assert.strictEqual(m2.success, false); assert.strictEqual(m2.code, 'max_attempts');
  assert.ok(/maximum of 2 attempts/.test(m2.error) && /umpiredirector@wbscoceania\.org/.test(m2.error));
  assert.strictEqual(env.rows.length, before, 'no row written for the refused attempt'); assert.strictEqual(env.mails.length, mails, 'no email sent');
});
ok('retrying the saved second attempt after the limit is reached still confirms it (no duplicate)', () => {
  const m = msgOf(post(env, base({ submissionId: 'sub-bbbb2222', participantEmail: ' JO@X.com ' })));
  assert.strictEqual(m.success, true); assert.strictEqual(m.duplicate, true); assert.strictEqual(m.attemptNumber, 2);
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

// ---- pass mark (85%) and result column
ok('pass mark 85% is exact: 5/5 and 9/10 and 17/20 pass; 4/5, 8/10 and 16/20 do not; client percentage ignored', () => {
  const cases = [[5, 5, 'PASS'], [4, 5, 'NOT PASSED'], [9, 10, 'PASS'], [8, 10, 'NOT PASSED'], [17, 20, 'PASS'], [16, 20, 'NOT PASSED'], [0, 5, 'NOT PASSED']];
  cases.forEach(([sc, tot, want], i) => {
    const e = makeEnv(); const m = msgOf(post(e, base({ submissionId: 'sub-pass-' + i + '-xxxx', score: sc, totalQuestions: tot, percentage: 100 })));
    assert.strictEqual(m.result, want, sc + '/' + tot); assert.strictEqual(m.passed, want === 'PASS');
    assert.strictEqual(e.rows[1][16], want, 'Result column'); assert.ok(e.rows[0][16] === 'Result');
    assert.ok(new RegExp('Result: ' + want).test(e.mails[0][2]) && /Attempt number: 1 of 2/.test(e.mails[0][2]) && e.mails[0][1].includes(want));
  });
});
ok('each assessment type has its own two attempts', () => {
  const e = makeEnv();
  for (const [id, type] of [['a1', 'Manual Knowledge Check'], ['a2', 'Manual Knowledge Check'], ['b1', 'Presentation Competency Assessment'], ['b2', 'Presentation Competency Assessment']]) {
    assert.strictEqual(msgOf(post(e, base({ submissionId: 'sub-type-' + id + '-xx', assessmentType: type }))).success, true, id);
  }
  assert.strictEqual(msgOf(post(e, base({ submissionId: 'sub-type-a3-xx', assessmentType: 'Manual Knowledge Check' }))).code, 'max_attempts');
  assert.strictEqual(msgOf(post(e, base({ submissionId: 'sub-type-b3-xx', assessmentType: 'Presentation Competency Assessment' }))).code, 'max_attempts');
});
ok('attempts lookup (JSONP) reports used / remaining / passed for exactly one person, module and type', () => {
  const e = makeEnv();
  const q = (extra) => e.ctx.doGet({ parameter: Object.assign({ action: 'attempts', callback: 'cb1', email: 'JO@x.com', module: 'Module 01 — Foundations', type: 'Manual Knowledge Check' }, extra) });
  let t = q({}).text; assert.ok(/^cb1\(.*\);$/.test(t)); let j = JSON.parse(t.slice(4, -2));
  assert.deepStrictEqual([j.ok, j.attempts, j.remaining, j.max, j.passed], [true, 0, 2, 2, false]);
  post(e, base({ submissionId: 'sub-look-a1-xx', score: 4 }));
  j = JSON.parse(q({}).text.slice(4, -2)); assert.deepStrictEqual([j.attempts, j.remaining, j.passed], [1, 1, false]);
  post(e, base({ submissionId: 'sub-look-a2-xx', score: 5 }));
  j = JSON.parse(q({}).text.slice(4, -2)); assert.deepStrictEqual([j.attempts, j.remaining, j.passed], [2, 0, true]);
  j = JSON.parse(q({ type: 'Presentation Competency Assessment' }).text.slice(4, -2)); assert.strictEqual(j.attempts, 0, 'other type unaffected');
  j = JSON.parse(q({ email: 'someone.else@x.com' }).text.slice(4, -2)); assert.strictEqual(j.attempts, 0, 'other person unaffected');
  assert.ok(!('name' in j) && !('email' in j), 'no personal data returned');
});
ok('attempts lookup rejects unsafe callbacks and missing details', () => {
  const e = makeEnv();
  const bad = e.ctx.doGet({ parameter: { action: 'attempts', callback: 'alert(1);//', email: 'a@b.co', module: 'M', type: 'T' } });
  assert.ok(!/alert/.test(bad.text) && bad.text.startsWith('{'), 'falls back to plain JSON');
  const miss = JSON.parse(e.ctx.doGet({ parameter: { action: 'attempts', callback: 'cb', module: 'M' } }).text.slice(3, -2));
  assert.strictEqual(miss.ok, false);
});
ok('plain GET without the page file still answers (page is hosted on GitHub now)', () => {
  const e = makeEnv(); e.ctx.HtmlService.createHtmlOutputFromFile = () => { throw new Error('no file'); };
  assert.ok(/results service/.test(e.ctx.doGet({ parameter: {} }).text));
});
console.log(n + ' Code.gs checks passed');
