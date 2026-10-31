// Tests for apps-script/Code.gs against a mock of Google's services (Sheets, Mail, Cache,
// Properties, Triggers, Lock, Utilities). Run: node tests/code-gs.test.js
const fs = require('fs'), vm = require('vm'), assert = require('assert'), crypto = require('crypto'), path = require('path');
const code = fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8');

function makeEnv({ failMail = null, quota = 100, quiet = true } = {}) {
  const clock = { now: Date.UTC(2026, 9, 27, 0, 0, 0) };
  class FakeDate extends Date {
    constructor(...a) { if (a.length) super(...a); else super(clock.now); }
    static now() { return clock.now; }
  }
  const rows = [], raw = [], mails = [], cacheStore = new Map(), props = new Map(), triggers = [];
  const env = { quota, throwOnSheet: false };
  const makeSheet = (r, w, main) => ({
    getLastRow: () => { if (main && env.throwOnSheet) throw new Error('Sheet unavailable'); return r.length; },
    appendRow: row => {
      if (main && env.throwOnSheet) throw new Error('Sheet unavailable');
      w.push(row.slice());
      r.push(row.map(v => typeof v === 'string' && v[0] === "'" ? v.slice(1) : v));
    },
    deleteRow: n => { r.splice(n - 1, 1); w.splice(n - 1, 1); },
    setFrozenRows() {},
    getRange(rr, c, nr = 1, nc = 1) {
      return {
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (r[rr - 1 + i] || [])[c - 1 + j] ?? '')),
        getValue: () => (r[rr - 1] || [])[c - 1],
        setValue: v => { r[rr - 1] = r[rr - 1] || []; r[rr - 1][c - 1] = v; }
      };
    }
  });
  const sheet = makeSheet(rows, raw, true);
  const progressRows = [], extraSheets = new Map();
  const spreadsheet = {
    getSheetByName: n => n === 'Progress' ? (env.progressCreated ? extraSheets.get('Progress') : null) : sheet,
    insertSheet: n => { const sh = makeSheet(progressRows, [], false); extraSheets.set(n, sh); env.progressCreated = true; return sh; },
    getSheets: () => [sheet]
  };
  const digestBytes = (s) => [...crypto.createHash('sha256').update(String(s)).digest()].map(b => (b > 127 ? b - 256 : b));
  const ctx = {
    Date: FakeDate, console: quiet ? { error() {}, log() {} } : console,
    SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    MailApp: {
      sendEmail: (to, subject, body) => {
        if (failMail && failMail(to, subject)) throw new Error('Service invoked too many times: email');
        mails.push({ to, subject, body });
      },
      getRemainingDailyQuota: () => env.quota
    },
    CacheService: { getScriptCache: () => ({
      get: k => { const e = cacheStore.get(k); if (!e) return null; if (e.exp <= clock.now) { cacheStore.delete(k); return null; } return e.v; },
      put: (k, v, ttl) => { assert.ok(ttl <= 21600, 'cache TTL must not exceed 6 hours, got ' + ttl); cacheStore.set(k, { v, exp: clock.now + ttl * 1000 }); },
      remove: k => cacheStore.delete(k)
    }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props.has(k) ? props.get(k) : null, setProperty: (k, v) => props.set(k, v) }) },
    ScriptApp: {
      WeekDay: { MONDAY: "MONDAY" },
      getProjectTriggers: () => triggers.slice(),
      deleteTrigger: t => { const i = triggers.indexOf(t); if (i >= 0) triggers.splice(i, 1); },
      newTrigger: fn => {
        const t = { getHandlerFunction: () => fn, spec: { fn } };
        const b = { timeBased: () => b, everyDays: d => { t.spec.days = d; return b; }, onWeekDay: d => { t.spec.weekday = d; return b; }, atHour: h => { t.spec.hour = h; return b; }, create: () => { triggers.push(t); return t; } };
        return b;
      }
    },
    Session: { getEffectiveUser: () => ({ getEmail: () => 'owner@example.com' }) },
    Utilities: { getUuid: () => crypto.randomUUID(), computeDigest: (a, s) => digestBytes(s), DigestAlgorithm: { SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8' } },
    HtmlService: { XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' }, createHtmlOutput: h => ({ html: h, setXFrameOptionsMode(m) { this.mode = m; return this; } }) },
    ContentService: { MimeType: { JSON: 'json', JAVASCRIPT: 'js' }, createTextOutput: t => ({ text: t, setMimeType(m) { this.mime = m; return this; } }) }
  };
  vm.createContext(ctx); vm.runInContext(code, ctx);
  return Object.assign(env, { ctx, rows, raw, mails, props, triggers, clock, progressRows, cache: cacheStore });
}

// ---- helpers
let seq = 0; const uid = () => 'sub-' + (++seq).toString().padStart(6, '0') + '-xx';
const msgOf = out => JSON.parse(out.html.match(/var m=(\{.*?\});var w/)[1]);
const act = (env, action, fields) => msgOf(env.ctx.doPost({ parameter: Object.assign({ action, id: 'req1' }, fields) }));
const lastMailTo = (env, to) => [...env.mails].reverse().find(m => m.to === to);
function login(env, email = 'jo@x.com') {
  const s = act(env, 'sendCode', { email });
  assert.strictEqual(s.success, true, s.error);
  const c = lastMailTo(env, email.trim().toLowerCase()).body.match(/code is (\d{6})/)[1];
  const v = act(env, 'verifyCode', { email, code: c });
  assert.strictEqual(v.success, true, v.error);
  return v.token;
}
const base = o => Object.assign({ submissionId: uid(), participantName: 'Jo Ump', participantEmail: 'typed-by-learner@x.com', umpireId: '007',
  association: 'Assoc', module: 'Module 01 — Foundations', assessmentType: 'Presentation Competency Assessment', score: 9, totalQuestions: 10, percentage: 99, completionStatus: 'Complete', elapsedSeconds: 90 }, o);
const save = (env, token, d) => msgOf(env.ctx.doPost({ parameter: { payload: JSON.stringify(Object.assign(base(), d, { token })) } }));
const mod = k => `Module 0${k} — Module name ${k}`;

let n = 0; const ok = (name, fn) => { fn(); console.log('  ok -', name); n++; };
const MIN = 60 * 1000, HOUR = 60 * MIN;

// =====================================================================  login
let env = makeEnv();
ok('email code: sent to the address; wrong code counts a try; right code gives a 64-hex session; single use', () => {
  assert.strictEqual(act(env, 'sendCode', { email: 'Jo@X.com ' }).success, true);
  const mail = lastMailTo(env, 'jo@x.com'); assert.ok(mail, 'mail goes to the lower-cased address');
  assert.ok(/Your WBSC training verification code: \d{6}/.test(mail.subject) && /expires in 10 minutes/.test(mail.body));
  const good = mail.body.match(/code is (\d{6})/)[1], bad = good === '000000' ? '111111' : '000000';
  const w = act(env, 'verifyCode', { email: 'jo@x.com', code: bad });
  assert.strictEqual(w.success, false); assert.strictEqual(w.code, 'wrong'); assert.ok(/4 tries left/.test(w.error));
  const v = act(env, 'verifyCode', { email: 'JO@x.com', code: good });
  assert.strictEqual(v.success, true); assert.ok(/^[a-f0-9]{64}$/.test(v.token)); assert.strictEqual(v.email, 'jo@x.com');
  const again = act(env, 'verifyCode', { email: 'jo@x.com', code: good });
  assert.strictEqual(again.success, false); assert.strictEqual(again.code, 'expired');
  assert.ok(![...env.cache.keys()].some(k => k.includes('jo@x.com')), 'no email address used as a cache key');
});
ok('a code expires after 10 minutes', () => {
  const e = makeEnv(); act(e, 'sendCode', { email: 'a@x.com' });
  const c = lastMailTo(e, 'a@x.com').body.match(/code is (\d{6})/)[1];
  e.clock.now += 10 * MIN + 1000;
  assert.strictEqual(act(e, 'verifyCode', { email: 'a@x.com', code: c }).code, 'expired');
});
ok('five wrong guesses burn the code, even if the right one is then entered', () => {
  const e = makeEnv(); act(e, 'sendCode', { email: 'a@x.com' });
  const c = lastMailTo(e, 'a@x.com').body.match(/code is (\d{6})/)[1], bad = c === '123456' ? '654321' : '123456';
  for (let i = 0; i < 5; i++) assert.strictEqual(act(e, 'verifyCode', { email: 'a@x.com', code: bad }).code, 'wrong');
  const m = act(e, 'verifyCode', { email: 'a@x.com', code: c });
  assert.strictEqual(m.success, false); assert.strictEqual(m.code, 'expired');
});
ok('codes are rate limited per address (3 an hour) and the window resets', () => {
  const e = makeEnv();
  for (let i = 0; i < 3; i++) assert.strictEqual(act(e, 'sendCode', { email: 'a@x.com' }).success, true);
  const r = act(e, 'sendCode', { email: 'a@x.com' }); assert.strictEqual(r.success, false); assert.strictEqual(r.code, 'rate');
  assert.strictEqual(e.mails.length, 3, 'no fourth email');
  e.clock.now += HOUR + MIN;
  assert.strictEqual(act(e, 'sendCode', { email: 'a@x.com' }).success, true);
});
ok('a flood of codes to many addresses is refused and the owner is alerted once', () => {
  const e = makeEnv();
  for (let i = 0; i < 60; i++) assert.strictEqual(act(e, 'sendCode', { email: `u${i}@x.com` }).success, true, 'request ' + i);
  assert.strictEqual(act(e, 'sendCode', { email: 'u61@x.com' }).code, 'rate');
  assert.strictEqual(act(e, 'sendCode', { email: 'u62@x.com' }).code, 'rate');
  const alerts = e.mails.filter(m => m.to === 'owner@example.com' && /login codes/.test(m.subject));
  assert.strictEqual(alerts.length, 1, 'one alert, not one per refused request');
});
ok('bad addresses are refused and nothing is emailed', () => {
  const e = makeEnv();
  for (const bad of ['', 'nope', 'a@b', 'a@b.c,d@e.fg', '<x>@y.com']) assert.strictEqual(act(e, 'sendCode', { email: bad }).success, false, bad);
  assert.strictEqual(e.mails.length, 0);
});
ok('a session lasts 6 hours', () => {
  const e = makeEnv(); const t = login(e);
  e.clock.now += 5 * HOUR; assert.strictEqual(save(e, t, {}).success, true);
  e.clock.now += 2 * HOUR; const r = save(e, t, { module: mod(2) });
  assert.strictEqual(r.success, false); assert.strictEqual(r.code, 'auth');
});

// =====================================================================  saving needs a verified email
env = makeEnv();
const token = login(env);
ok('no token or a made-up token: nothing saved; code "auth"', () => {
  for (const t of [undefined, '', 'x'.repeat(64), 'a'.repeat(64)]) {
    const m = save(env, t, {}); assert.strictEqual(m.success, false, String(t)); assert.strictEqual(m.code, 'auth');
  }
  assert.strictEqual(env.rows.length, 0);
});
ok('a verified save is recorded against the VERIFIED address, whatever was typed', () => {
  const m = save(env, token, { submissionId: 'sub-first-0001', score: 10, percentage: 5 });
  assert.strictEqual(m.success, true); assert.strictEqual(m.attemptNumber, 1); assert.strictEqual(m.result, 'PASS'); assert.strictEqual(m.passed, true);
  assert.strictEqual(env.rows.length, 2); assert.strictEqual(env.rows[1][2], 'jo@x.com');
  assert.strictEqual(env.rows[0].length, 18); assert.strictEqual(env.rows[0][17], 'Receipt Status'); assert.strictEqual(env.rows[1][9], 100);
});
ok('attempts lookup needs a verified session and answers for that session only', () => {
  const q = (extra) => env.ctx.doGet({ parameter: Object.assign({ action: 'attempts', callback: 'cb1', token, email: 'someone.else@x.com', module: 'Module 01 — Foundations', type: 'Presentation Competency Assessment' }, extra) });
  let j = JSON.parse(q({}).text.slice(4, -2)); assert.deepStrictEqual([j.ok, j.attempts, j.remaining, j.passed], [true, 1, 1, true], 'counts the verified address, ignoring the email parameter');
  j = JSON.parse(q({ token: 'a'.repeat(64) }).text.slice(4, -2)); assert.deepStrictEqual([j.ok, j.code], [false, 'auth']);
  j = JSON.parse(q({ token: undefined }).text.slice(4, -2)); assert.strictEqual(j.code, 'auth');
  assert.ok(!/name|email/.test(JSON.stringify(JSON.parse(q({}).text.slice(4, -2)))), 'no personal data returned');
});

// =====================================================================  receipts, Director notice
ok('a result emails the Director and a receipt to the learner; statuses recorded', () => {
  const e = makeEnv(); const t = login(e, 'Jo@X.com');
  const before = e.mails.length;
  const m = save(e, t, { score: 8, module: 'Module 02 — Foundations: One-Umpire' });   // 80% = not passed
  assert.strictEqual(m.result, 'NOT PASSED');
  const sent = e.mails.slice(before);
  assert.strictEqual(sent.length, 2);
  const [dir, rec] = sent;
  assert.strictEqual(dir.to, 'umpiredirector@wbscoceania.org'); assert.ok(/NOT PASSED: Jo Ump/.test(dir.subject));
  assert.strictEqual(rec.to, 'jo@x.com'); assert.ok(/receipt/i.test(rec.subject) && /NOT PASSED/.test(rec.subject));
  for (const need of ['Hello Jo Ump', 'Score: 8 / 10 (80%)', 'Result: NOT PASSED (pass mark 85%)', 'Attempt: 1 of 2', 'Attempts left for this assessment: 1', 'not an official WBSC certificate', 'Module 02: not passed yet (best 80%, attempts used: 1 of 2)', 'Module 01: not attempted yet']) {
    assert.ok(rec.body.includes(need), 'receipt contains: ' + need);
  }
  assert.ok(/Reference: [A-Z0-9-]{8}\n/.test(rec.body));
  assert.strictEqual(e.rows[1][15], 'sent'); assert.strictEqual(e.rows[1][17], 'sent');
});
ok('the final failed attempt tells the learner who to contact', () => {
  const e = makeEnv(); const t = login(e);
  save(e, t, { score: 5 }); const before = e.mails.length; save(e, t, { score: 6 });
  const rec = e.mails.slice(before).find(m => m.to === 'jo@x.com');
  assert.ok(/used all 2 attempts/.test(rec.body) && /umpiredirector@wbscoceania\.org/.test(rec.body));
});
ok('a receipt failure never undoes the save; the owner is alerted (once an hour) and the status says FAILED', () => {
  const e = makeEnv({ failMail: (to, subject) => to === 'jo@x.com' && /receipt/i.test(subject) });
  const t = login(e);
  const a = save(e, t, { module: mod(1) }); assert.strictEqual(a.success, true);
  assert.ok(/^FAILED: Error: Service invoked too many times/.test(e.rows[1][17])); assert.strictEqual(e.rows[1][15], 'sent');
  const b = save(e, t, { module: mod(2) }); assert.strictEqual(b.success, true);
  const alerts = () => e.mails.filter(m => m.to === 'owner@example.com' && /receipt/i.test(m.subject));
  assert.strictEqual(alerts().length, 1, 'one alert per hour for the same fault');
  e.clock.now += HOUR + MIN; save(e, t, { module: mod(3) });
  assert.strictEqual(alerts().length, 2, 'alerts again after the hour');
});
ok("a failed Director email alerts the owner and is recorded; the learner still gets a receipt", () => {
  const e = makeEnv({ failMail: (to) => to === 'umpiredirector@wbscoceania.org' });
  const t = login(e); const m = save(e, t, {});
  assert.strictEqual(m.success, true); assert.ok(/^FAILED/.test(e.rows[1][15])); assert.strictEqual(e.rows[1][17], 'sent');
  assert.ok(e.mails.some(x => x.to === 'owner@example.com' && /Director/.test(x.subject)));
});

// =====================================================================  completion summary
ok('passing the sixth module: completion notice to the Director once, summary in the receipt, completedAll in the reply', () => {
  const e = makeEnv(); const t = login(e);
  for (let i = 1; i <= 7; i++) { const m = save(e, t, { module: mod(i) }); assert.strictEqual(m.completedAll, false, 'module ' + i); }
  assert.strictEqual(e.mails.filter(m => /PROGRAM COMPLETED/.test(m.subject)).length, 0);
  const before = e.mails.length;
  const m6 = save(e, t, { module: mod(8) });
  assert.strictEqual(m6.completedAll, true);
  const sent = e.mails.slice(before);
  const done = sent.filter(m => /PROGRAM COMPLETED: Jo Ump/.test(m.subject));
  assert.strictEqual(done.length, 1); assert.strictEqual(done[0].to, 'umpiredirector@wbscoceania.org');
  for (let i = 1; i <= 8; i++) assert.ok(done[0].body.includes(`Module 0${i}: PASSED (90%, attempts used: 1)`), 'summary line ' + i);
  const rec = sent.find(m => m.to === 'jo@x.com'); assert.ok(/passed all 8 modules/.test(rec.body));
  const b2 = e.mails.length; save(e, t, { module: mod(8), score: 10 });
  assert.strictEqual(e.mails.slice(b2).filter(m => /PROGRAM COMPLETED/.test(m.subject)).length, 0, 'not repeated');
});
ok('only the marked assessment counts: a different person does not complete the program', () => {
  const e = makeEnv(); const t = login(e), t2 = login(e, 'other@x.com');
  for (let i = 1; i <= 7; i++) save(e, t, { module: mod(i) });
    save(e, t2, { module: mod(8), umpireId: '999' });
  assert.strictEqual(e.mails.filter(m => /PROGRAM COMPLETED/.test(m.subject)).length, 0);
  const m = save(e, t, { module: mod(8) }); assert.strictEqual(m.completedAll, true);
});
ok('a failed attempt in the last module does not complete the program; a later pass does', () => {
  const e = makeEnv(); const t = login(e);
  for (let i = 1; i <= 7; i++) save(e, t, { module: mod(i) });
  assert.strictEqual(save(e, t, { module: mod(8), score: 8 }).completedAll, false);
  assert.strictEqual(save(e, t, { module: mod(8), score: 9 }).completedAll, true);
  assert.strictEqual(e.mails.filter(m => /PROGRAM COMPLETED/.test(m.subject)).length, 1);
});

// =====================================================================  attempts and pass mark (unchanged rules)
ok('attempt counting is case/space-insensitive across the verified address and the Umpire ID; a third attempt is refused', () => {
  const e = makeEnv(); const t = login(e, 'jo@x.com');
  assert.strictEqual(save(e, t, { score: 8 }).attemptNumber, 1);
  assert.strictEqual(save(e, t, { score: 8, umpireId: ' 007 ' }).attemptNumber, 2);
  const mails = e.mails.length, rows = e.rows.length;
  const t2 = login(e, 'other@x.com');                       // a different verified address, same Umpire ID
  const mailsAfterLogin = e.mails.length;
  const r = save(e, t2, { score: 10, umpireId: '007' });
  assert.strictEqual(r.success, false); assert.strictEqual(r.code, 'max_attempts');
  assert.ok(/maximum of 2 attempts/.test(r.error) && /umpiredirector@wbscoceania\.org/.test(r.error));
  assert.strictEqual(e.rows.length, rows); assert.strictEqual(e.mails.length, mailsAfterLogin, 'no result or receipt email for a refused attempt');
  assert.ok(mails <= mailsAfterLogin);
});
ok('retrying a saved attempt after the limit still confirms it, with no duplicate row or email', () => {
  const e = makeEnv(); const t = login(e);
  save(e, t, { submissionId: 'sub-aaaaaaaa', score: 8 }); save(e, t, { submissionId: 'sub-bbbbbbbb', score: 8 });
  const rows = e.rows.length, mails = e.mails.length;
  const m = save(e, t, { submissionId: 'sub-bbbbbbbb', score: 8 });
  assert.strictEqual(m.success, true); assert.strictEqual(m.duplicate, true); assert.strictEqual(m.attemptNumber, 2);
  assert.strictEqual(e.rows.length, rows); assert.strictEqual(e.mails.length, mails);
});
ok('85% is exact: 9/10 and 17/20 pass, 8/10 and 16/20 do not; the browser percentage is ignored', () => {
  for (const [sc, tot, want] of [[5, 5, 'PASS'], [4, 5, 'NOT PASSED'], [9, 10, 'PASS'], [8, 10, 'NOT PASSED'], [17, 20, 'PASS'], [16, 20, 'NOT PASSED'], [0, 5, 'NOT PASSED']]) {
    const e = makeEnv(); const t = login(e); const m = save(e, t, { score: sc, totalQuestions: tot, percentage: 100 });
    assert.strictEqual(m.result, want, sc + '/' + tot); assert.strictEqual(e.rows[1][16], want);
  }
});
ok('each module has its own two attempts on the marked assessment', () => {
  const e = makeEnv(); const t = login(e);
  assert.strictEqual(save(e, t, { module: mod(1) }).success, true); assert.strictEqual(save(e, t, { module: mod(1) }).success, true);
  assert.strictEqual(save(e, t, { module: mod(1) }).code, 'max_attempts');
  assert.strictEqual(save(e, t, { module: mod(2) }).success, true);
});
ok('Knowledge Checks are practice: the server refuses to record one', () => {
  const e = makeEnv(); const t = login(e); const mails = e.mails.length;
  const m = save(e, t, { assessmentType: 'Manual Knowledge Check', totalQuestions: 5, score: 5 });
  assert.strictEqual(m.success, false); assert.ok(/only the Presentation Competency Assessment is recorded/.test(m.error));
  assert.strictEqual(e.rows.length, 0, 'nothing written'); assert.strictEqual(e.mails.length, mails);
});
ok('bot check: honeypot filled, or finished faster than 2 seconds a question, or no timing at all, is refused', () => {
  const e = makeEnv(); const t = login(e);
  for (const bad of [{ website: 'http://spam' }, { elapsedSeconds: 19 }, { elapsedSeconds: undefined }, { elapsedSeconds: 'x' }]) {
    const m = save(e, t, bad); assert.strictEqual(m.success, false, JSON.stringify(bad)); assert.ok(/too quickly/.test(m.error));
  }
  assert.strictEqual(e.rows.length, 0);
  assert.strictEqual(save(e, t, { elapsedSeconds: 20 }).success, true, 'exactly 2 s a question is fine');
});
ok('bot check: a filled honeypot on the code request pretends to succeed but sends nothing', () => {
  const e = makeEnv(); const before = e.mails.length;
  const r = act(e, 'sendCode', { email: 'bot@x.com', website: 'x' });
  assert.strictEqual(r.success, true); assert.strictEqual(e.mails.length, before);
});
ok('the bank can grow: 20 and 30 question assessments are scored by percentage', () => {
  for (const [sc, tot, want] of [[17, 20, 'PASS'], [16, 20, 'NOT PASSED'], [26, 30, 'PASS'], [25, 30, 'NOT PASSED']]) {
    const e = makeEnv(); const t = login(e); assert.strictEqual(save(e, t, { score: sc, totalQuestions: tot, elapsedSeconds: 600 }).result, want, sc + '/' + tot);
  }
});
ok('invalid scores and names are rejected and nothing is written or emailed', () => {
  const e = makeEnv(); const t = login(e); const mails = e.mails.length;
  for (const bad of [{ score: 11 }, { score: -1 }, { totalQuestions: 0 }, { score: 2.5 }, { participantName: '' }, { submissionId: 'x' }]) {
    const m = save(e, t, bad); assert.strictEqual(m.success, false, JSON.stringify(bad)); assert.ok(m.error);
  }
  assert.strictEqual(e.rows.length, 0); assert.strictEqual(e.mails.length, mails);
});
ok('text starting = + - @ is stored as text; numeric Umpire IDs are stored as text', () => {
  const e = makeEnv(); const t = login(e);
  save(e, t, { participantName: '=HYPERLINK("http://evil","x")', association: '+cmd', umpireId: '007' });
  assert.ok(e.raw[1][1].startsWith("'=") && e.raw[1][4].startsWith("'+") && e.raw[1][3] === "'007");
});
ok('hostile text cannot break out of the reply page', () => {
  const e = makeEnv(); const t = login(e);
  const out = e.ctx.doPost({ parameter: { payload: JSON.stringify(Object.assign(base({ participantName: 'x' }), { submissionId: '</script><script>alert(1)</script>', token: t })) } });
  assert.ok(!/<\/script><script>alert/.test(out.html));
  const LS = String.fromCharCode(8232), PS = String.fromCharCode(8233);   // line and paragraph separators
  const ls = e.ctx.doPost({ parameter: { payload: JSON.stringify(Object.assign(base(), { submissionId: 'a' + LS + 'b' + PS + 'c-12345', token: t })) } });
  assert.ok(!ls.html.includes(LS) && !ls.html.includes(PS), 'line separators are escaped');
});
ok('garbage and legacy raw-JSON posts behave', () => {
  const e = makeEnv(); const t = login(e);
  assert.strictEqual(msgOf(e.ctx.doPost({ parameter: { payload: '{not json' } })).error, 'The server could not save the result');
  const j = JSON.parse(e.ctx.doPost({ postData: { contents: JSON.stringify(Object.assign(base(), { token: t })) } }).text);
  assert.strictEqual(j.ok, true); assert.strictEqual(j.success, true);
  const noTok = JSON.parse(e.ctx.doPost({ postData: { contents: JSON.stringify(base()) } }).text);
  assert.strictEqual(noTok.success, false); assert.strictEqual(noTok.code, 'auth');
});
ok('plain GET without the page file still answers (the page is hosted on GitHub)', () => {
  const e = makeEnv(); e.ctx.HtmlService.createHtmlOutputFromFile = () => { throw new Error('no file'); };
  assert.ok(/results service/.test(e.ctx.doGet({ parameter: {} }).text));
  const bad = e.ctx.doGet({ parameter: { action: 'attempts', callback: 'alert(1);//', token: 'x' } });
  assert.ok(!/alert/.test(bad.text) && bad.text.startsWith('{'), 'unsafe callback falls back to plain JSON');
});

// =====================================================================  Director's results page
ok('results: not configured, wrong password, then the data for the right one (no secrets, compact)', () => {
  const e = makeEnv(); const t = login(e); save(e, t, { score: 8 }); save(e, t, { module: mod(2) });
  assert.strictEqual(act(e, 'results', { password: 'x' }).code, 'not_configured');
  e.props.set('RESULTS_PASSWORD', 'correct horse');
  const w = act(e, 'results', { password: 'nope' }); assert.strictEqual(w.success, false); assert.strictEqual(w.code, 'wrong'); assert.ok(!('rows' in w));
  const r = act(e, 'results', { password: 'correct horse' });
  assert.strictEqual(r.success, true); assert.strictEqual(r.rows.length, 2);
  assert.deepStrictEqual(r.cols.slice(0, 4), ['timestamp', 'name', 'email', 'umpireId']);
  const row = Object.fromEntries(r.cols.map((c, i) => [c, r.rows[0][i]]));
  assert.strictEqual(row.email, 'jo@x.com'); assert.strictEqual(row.result, 'NOT PASSED'); assert.strictEqual(row.attempt, 1); assert.strictEqual(row.percent, 80);
  assert.deepStrictEqual(r.config, { passMark: 85, maxAttempts: 2, totalModules: 8, completionType: 'Presentation Competency Assessment' });
  assert.ok(!JSON.stringify(r).includes('correct horse'));
});
ok('results: 10 wrong passwords lock the page for 15 minutes (even for the right password) and alert the owner', () => {
  const e = makeEnv(); e.props.set('RESULTS_PASSWORD', 'pw');
  for (let i = 0; i < 10; i++) assert.strictEqual(act(e, 'results', { password: 'bad' + i }).code, 'wrong');
  assert.strictEqual(act(e, 'results', { password: 'bad-11' }).code, 'wrong');   // the attempt that trips the lock
  const locked = act(e, 'results', { password: 'pw' }); assert.strictEqual(locked.code, 'locked'); assert.strictEqual(locked.success, false);
  assert.strictEqual(e.mails.filter(m => m.to === 'owner@example.com' && /locked/.test(m.subject)).length, 1);
  e.clock.now += 16 * MIN;
  assert.strictEqual(act(e, 'results', { password: 'pw' }).success, true, 'unlocks after 15 minutes');
});
ok('results: a good login clears the wrong-password count', () => {
  const e = makeEnv(); e.props.set('RESULTS_PASSWORD', 'pw');
  for (let i = 0; i < 8; i++) act(e, 'results', { password: 'bad' });
  assert.strictEqual(act(e, 'results', { password: 'pw' }).success, true);
  for (let i = 0; i < 8; i++) assert.strictEqual(act(e, 'results', { password: 'bad' }).code, 'wrong');
  assert.strictEqual(act(e, 'results', { password: 'pw' }).success, true, 'not locked: the count restarted');
});

// =====================================================================  alerts and health check
ok('an unexpected server error alerts the owner and is counted; the learner gets a generic message', () => {
  const e = makeEnv(); const t = login(e); e.throwOnSheet = true;
  const m = save(e, t, {}); assert.strictEqual(m.success, false); assert.strictEqual(m.error, 'The server could not save the result');
  const a = e.mails.filter(x => x.to === 'owner@example.com' && /could not be saved/.test(x.subject));
  assert.strictEqual(a.length, 1); assert.ok(/Sheet unavailable/.test(a[0].body));
  save(e, t, {}); assert.strictEqual(e.mails.filter(x => x.to === 'owner@example.com' && /could not be saved/.test(x.subject)).length, 1, 'rate limited');
  const log = JSON.parse(e.props.get('errlog')); assert.strictEqual(Object.values(log)[0].n, 2);
});
ok('alerts go to ALERT_EMAIL when set, otherwise to the script owner', () => {
  const e = makeEnv(); e.ctx.alertOwner_('k1', 'Hello', 'detail'); assert.strictEqual(e.mails.pop().to, 'owner@example.com');
  e.props.set('ALERT_EMAIL', 'tech@example.org'); e.ctx.alertOwner_('k2', 'Hello', 'detail'); assert.strictEqual(e.mails.pop().to, 'tech@example.org');
});
ok('daily check: all well -> an [OK] email; HEALTH_REPORT=problems stays quiet', () => {
  const e = makeEnv(); const t = login(e); save(e, t, {}); const before = e.mails.length;
  const r = e.ctx.dailyHealthCheck(); assert.strictEqual(r.ok, true);
  const mail = e.mails[before]; assert.strictEqual(mail.to, 'owner@example.com'); assert.ok(/Daily check: OK/.test(mail.subject));
  assert.ok(/Results in the last 24 hours: 1 \(1 passed\)/.test(mail.body) && /Email quota left today: 100/.test(mail.body) && /RESULTS_PASSWORD is not set/.test(mail.body));
  e.props.set('HEALTH_REPORT', 'problems'); const n2 = e.mails.length; const q = e.ctx.dailyHealthCheck();
  assert.strictEqual(q.sent, false); assert.strictEqual(e.mails.length, n2);
});
ok('daily check flags failed emails, stuck results, low quota, logged errors and a damaged header', () => {
  const e = makeEnv({ quota: 5 }); const t = login(e); save(e, t, {});
  e.rows[1][15] = 'FAILED: Error: x'; e.rows[1][17] = 'FAILED: Error: y';
  save(e, t, { module: mod(2) }); e.rows[2][15] = 'pending'; e.clock.now += 40 * MIN;
  e.ctx.logError_('save', new Error('boom'));
  e.rows[0][9] = 'Wrong';
  const before = e.mails.length; const r = e.ctx.dailyHealthCheck();
  assert.strictEqual(r.ok, false);
  const body = e.mails[before].body, subj = e.mails[before].subject;
  assert.ok(/ATTENTION NEEDED/.test(subj));
  for (const need of ['email to the Director FAILED', 'receipt(s) in the last 7 days FAILED', 'still "pending"', 'Only 5 emails left', '1 server error(s)', 'column 10 should be "Percentage"']) assert.ok(body.includes(need), need);
  e.props.set('HEALTH_REPORT', 'problems'); const n2 = e.mails.length; e.ctx.dailyHealthCheck(); assert.strictEqual(e.mails.length, n2 + 1, 'problems are still reported in problems-only mode');
});
ok('installTriggers schedules the daily check and the weekly summary (and can be re-run); sendTestAlert reaches the owner', () => {
  const e = makeEnv(); e.ctx.installTriggers(); e.ctx.installTriggers();
  assert.strictEqual(e.triggers.length, 2); assert.deepStrictEqual(e.triggers[0].spec, { fn: 'dailyHealthCheck', days: 1, hour: 7 }); assert.deepStrictEqual(e.triggers[1].spec, { fn: 'weeklySummary', weekday: 'MONDAY', hour: 8 });
  e.ctx.removeTriggers(); assert.strictEqual(e.triggers.length, 0);
  assert.ok(/owner@example.com/.test(e.ctx.sendTestAlert())); assert.ok(/Test alert/.test(e.mails.pop().subject));
});
ok('no secret or address ends up in the cache key names', () => {
  const e = makeEnv(); e.props.set('RESULTS_PASSWORD', 'S3cret-pw'); const t = login(e, 'priv@x.com'); save(e, t, {});
  act(e, 'results', { password: 'S3cret-pw' });
  const keys = [...e.cache.keys()].join('|'); assert.ok(!/priv@x\.com|S3cret/.test(keys), keys);
});

// =====================================================================  learner emails in the learner's language
ok('the login code email and the receipt come in the learner\'s language; the Director\'s email stays English; unknown language = English', () => {
  for (const lg of ['es', 'fr', 'ja', 'ko', 'zh']) {
    const e = makeEnv();
    assert.strictEqual(act(e, 'sendCode', { email: 'jo@x.com', lang: lg }).success, true);
    const mail = lastMailTo(e, 'jo@x.com');
    assert.ok(/\d{6}/.test(mail.subject) && /\d{6}/.test(mail.body) && !/Your verification code|verification code is/.test(mail.body), lg + ' code email is translated');
    assert.ok(mail.body.includes('10') && !/\{\w+\}/.test(mail.subject + mail.body), lg + ' values filled in, no leftover {placeholders}');
    const code = (mail.body.match(/\d{6}/) || [])[0];
    const v = act(e, 'verifyCode', { email: 'jo@x.com', code }); assert.strictEqual(v.success, true, lg);
    const before = e.mails.length;
    const m = save(e, v.token, { score: 8, module: 'Module 02 — Foundations: One-Umpire', lang: lg }); assert.strictEqual(m.result, 'NOT PASSED', 'the server result is the same in every language');
    const [dir, rec] = e.mails.slice(before);
    assert.ok(/NOT PASSED: Jo Ump/.test(dir.subject) && /Participant: Jo Ump/.test(dir.body), 'the Director email stays English');
    assert.ok(!/NOT PASSED|Hello|Result:/.test(rec.subject + rec.body), lg + ' receipt is translated');
    assert.ok(rec.body.includes('Jo Ump') && rec.body.includes('8 / 10 (80%)') && /85\s?%/.test(rec.body), lg + ' receipt has name, score and pass mark');
    assert.ok(!/\{\w+\}/.test(rec.subject + rec.body), lg + ' no leftover placeholders');
    assert.strictEqual((rec.body.match(/\b0[1-8]\b|０[1-8]/g) || []).length >= 8, true, lg + ' lists all 8 modules');
  }
  const e = makeEnv(); act(e, 'sendCode', { email: 'jo@x.com', lang: 'xx; drop' });
  assert.ok(/Your WBSC training verification code/.test(lastMailTo(e, 'jo@x.com').subject), 'unknown language falls back to English');
  const t = login(e); const before = e.mails.length; save(e, t, { score: 9 });
  assert.ok(/Hello Jo Ump/.test(e.mails.slice(before)[1].body), 'no language sent = English');
});
ok('every language has every email phrase, and the same {placeholders} as English', () => {
  const T = vm.runInContext('EMAIL_TEXT', makeEnv().ctx);
  const ph = s => (String(s).match(/\{\w+\}/g) || []).sort().join();
  for (const lg of Object.keys(T)) for (const k of Object.keys(T.en)) {
    assert.ok(T[lg][k] != null, lg + ' is missing ' + k);
    assert.strictEqual(ph(T[lg][k]), ph(T.en[k]), lg + '.' + k + ' placeholders');
  }
});

// =====================================================================  saved progress (resume on another device)
const prog = (o) => Object.assign({ v: 2, index: 3, score: 2, elapsedMs: 40000, qi: [0, 2, 5, 7, 9], qs: ['a', 'b', 'c', 'd', 'e'],
  order: [[1, 0, 2, 3], [0, 1, 2, 3], [3, 2, 1, 0], [2, 0, 1, 3], [1, 2, 3, 0]], missed: [{ q: 'Q?', answer: 'A', ref: 'R', why: 'W' }] }, o);
const putProg = (e, t, key, o) => act(e, 'saveProgress', { token: t, key, data: JSON.stringify(o) });
const getProg = (e, t, key) => JSON.parse(e.ctx.attemptsReply_({ token: t, module: 'Module 01', type: 'Presentation Competency Assessment', pkey: key, callback: '' }).text).progress;
ok('progress: saved against the verified email, returned with the attempts lookup, replaced on the next save, never keyed by the address itself', () => {
  const e = makeEnv(); const t = login(e, 'jo@x.com');
  assert.strictEqual(getProg(e, t, 'm06-pca') == null, true);
  const r = putProg(e, t, 'm06-pca', prog()); assert.strictEqual(r.success, true, r.error);
  const got = getProg(e, t, 'm06-pca'); assert.strictEqual(got.index, 3); assert.strictEqual(got.score, 2); assert.deepStrictEqual(got.qi, [0, 2, 5, 7, 9]);
  assert.strictEqual(getProg(e, t, 'm07-pca') == null, true, 'another assessment has none');
  putProg(e, t, 'm06-pca', prog({ index: 4, score: 3 })); assert.strictEqual(getProg(e, t, 'm06-pca').index, 4); assert.strictEqual(e.progressRows.length, 2, 'header + one row');
  const t2 = login(e, 'other@x.com'); assert.strictEqual(getProg(e, t2, 'm06-pca') == null, true, 'another learner sees nothing');
  assert.ok(!JSON.stringify(e.progressRows).includes('jo@x.com'), 'the email address is not stored in the Progress sheet');
});
ok('progress: expires after 24 hours, deleted after 48 by the daily check, cleared on request and when the attempt is recorded', () => {
  const e = makeEnv(); const t = login(e, 'jo@x.com');
  putProg(e, t, 'm06-pca', prog()); e.clock.now += 23 * HOUR; const tA = login(e, 'jo@x.com'); assert.ok(getProg(e, tA, 'm06-pca'), 'still there after 23 hours, from a new login');
  e.clock.now += 2 * HOUR; const tB = login(e, 'jo@x.com'); assert.strictEqual(getProg(e, tB, 'm06-pca') == null, true, 'older than 24 hours is ignored');
  assert.strictEqual(e.progressRows.length, 2);
  e.clock.now += 24 * HOUR; e.ctx.dailyHealthCheck(); assert.strictEqual(e.progressRows.length, 1, 'older than 48 hours is deleted');
  const t3 = login(e, 'jo@x.com'); putProg(e, t3, 'm06-pca', prog()); const c = act(e, 'clearProgress', { token: t3, key: 'm06-pca' }); assert.strictEqual(c.success, true);
  assert.strictEqual(e.progressRows.length, 1);
  putProg(e, t3, 'm01-pca', prog()); assert.strictEqual(e.progressRows.length, 2);
  save(e, t3, { assessmentKey: 'm01-pca' }); assert.strictEqual(e.progressRows.length, 1, 'recording the result clears the saved attempt');
});
ok('progress: needs a verified session; only marked-assessment keys; bad or oversized data is refused; rate limited', () => {
  const e = makeEnv(); const t = login(e, 'jo@x.com');
  assert.strictEqual(putProg(e, '', 'm06-pca', prog()).code, 'auth'); assert.strictEqual(putProg(e, 'f'.repeat(64), 'm06-pca', prog()).code, 'auth');
  assert.strictEqual(act(e, 'clearProgress', { token: 'nope', key: 'm06-pca' }).code, 'auth');
  for (const k of ['m06-mkc', '../x', 'm06', 'M06-PCA']) assert.strictEqual(putProg(e, t, k, prog()).success, false, k);
  for (const bad of [prog({ v: 1 }), prog({ index: 99 }), prog({ score: 9 }), prog({ qs: ['a'] }), prog({ order: [[0, 1]] }), prog({ qi: [0, 1, 2, 3, 4000] }), prog({ missed: new Array(9).fill({ q: 'x' }) })])
    assert.strictEqual(putProg(e, t, 'm06-pca', bad).success, false);
  assert.strictEqual(act(e, 'saveProgress', { token: t, key: 'm06-pca', data: 'not json' }).success, false);
  const big = putProg(e, t, 'm06-pca', prog({ missed: [{ q: 'x'.repeat(5000), answer: 'y'.repeat(5000), ref: 'r'.repeat(5000), why: 'w'.repeat(5000) }] })); assert.strictEqual(big.success, true);
  assert.ok(e.progressRows[1][3].length < 4000, 'long text is cut to the cap');
  assert.strictEqual(e.progressRows.length, 2);
  let last; for (let i = 0; i < 241; i++) last = putProg(e, t, 'm06-pca', prog()); assert.strictEqual(last.code, 'rate');
});
ok('progress: attempts lookup without a key is unchanged and an unverified lookup gets no progress', () => {
  const e = makeEnv(); const t = login(e, 'jo@x.com'); putProg(e, t, 'm06-pca', prog());
  const plain = JSON.parse(e.ctx.attemptsReply_({ token: t, module: 'Module 01', type: 'Presentation Competency Assessment', callback: '' }).text);
  assert.strictEqual(plain.ok, true); assert.ok(!('progress' in plain));
  const anon = JSON.parse(e.ctx.attemptsReply_({ token: '', module: 'Module 01', type: 'Presentation Competency Assessment', pkey: 'm06-pca', callback: '' }).text);
  assert.strictEqual(anon.code, 'auth'); assert.ok(!('progress' in anon));
});

// =====================================================================  weekly summary for the Director
ok('weekly summary: who finished this week, who needs attention, who went quiet, by association; only the Director is emailed', () => {
  const e = makeEnv();
  const T = (email, name, assoc, mods, score) => { const t = login(e, email); mods.forEach(k => save(e, t, { participantName: name, association: assoc, module: mod(k), score: score || 9, umpireId: email.split('@')[0] })); return t; };
  e.clock.now = Date.UTC(2026, 9, 1);
  T('quiet@x.com', 'Quiet Qi', 'Assoc A', [1, 2]);                                  // started 26 days ago, then nothing
  T('stuck@x.com', 'Stuck Sam', 'Assoc A', [1]); { const t = login(e, 'stuck@x.com'); save(e, t, { participantName: 'Stuck Sam', association: 'Assoc A', module: mod(2), score: 5, umpireId: 'stuck' }); save(e, t, { participantName: 'Stuck Sam', association: 'Assoc A', module: mod(2), score: 6, umpireId: 'stuck' }); }
  e.clock.now = Date.UTC(2026, 9, 24);
  T('done@x.com', 'Done Dee', 'Assoc B', [1, 2, 3, 4, 5, 6, 7, 8]);
  e.clock.now = Date.UTC(2026, 9, 27);
  const before = e.mails.length; const r = e.ctx.weeklySummary(); assert.strictEqual(r.sent, true);
  const m = e.mails.slice(before); assert.strictEqual(m.length, 1); assert.strictEqual(m[0].to, 'umpiredirector@wbscoceania.org');
  assert.ok(/1 completed this week, 1 need attention/.test(m[0].subject), m[0].subject);
  const b = m[0].body;
  assert.ok(/COMPLETED THIS WEEK \(1\)\n- Done Dee \(Assoc B\), 8 of 8/.test(b), b);
  assert.ok(/NEED ATTENTION[^\n]*\(1\)\n- Stuck Sam \(Assoc A\), 1 of 8/.test(b), b);
  assert.ok(/WENT QUIET[^\n]*\(1\)\n- Quiet Qi \(Assoc A\), 2 of 8[^\n]*last active 26 days ago, quiet@x\.com/.test(b), b);
  assert.ok(/- Assoc A: 2 umpires, 0 completed, 1 in progress, 1 need attention/.test(b) && /- Assoc B: 1 umpire, 1 completed, 0 in progress, 0 need attention/.test(b), b);
  assert.ok(/does not hold a list of everyone/.test(b));
  assert.deepStrictEqual(e.mails.slice(before).map(x => x.to), ['umpiredirector@wbscoceania.org'], 'no learner is emailed');
});
ok('weekly summary: nothing is sent while there are no results', () => {
  const e = makeEnv(); const r = e.ctx.weeklySummary(); assert.strictEqual(r.sent, false); assert.strictEqual(e.mails.length, 0);
});

console.log(n + ' Code.gs checks passed');
