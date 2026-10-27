// Browser tests for assessment-widget.html (needs Playwright: `npm i -D playwright`).
// Google's replies are simulated; this does NOT prove the real Apps Script reply path works.
const http = require('http'), fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/assessment-widget.html'));
  const type = f.endsWith('.woff2') ? 'font/woff2' : f.endsWith('.css') ? 'text/css' : f.endsWith('.svg') ? 'image/svg+xml' : 'text/html; charset=utf-8';
  fs.readFile(f, (e, d) => e ? (res.writeHead(404), res.end()) : (res.writeHead(200, { 'Content-Type': type }), res.end(d)));
});
const html = fs.readFileSync(path.join(root, 'assessment-widget.html'), 'utf8');
const BANK = vm.runInNewContext(html.slice(html.indexOf('var QUIZ_BANK'), html.indexOf('// Answer options are shuffled')) + '\n;QUIZ_BANK', {});
const RIGHT = {};   // question text -> right answer text
Object.values(BANK).forEach(b => b.questions.forEach(q => { RIGHT[q.q] = q.options[q.correct]; }));

const POST_URL = 'https://script.google.com/macros/s/AKfycbxm_gObsmIO7RUn1wcKS22r6Gsp0ccrhdm7kgVfmw9-DIDS4ndstk_DYtQAYL80DP0f/exec';
const TOKEN = 'a'.repeat(64), TOKEN2 = 'b'.repeat(64);
const reply = m => `<!doctype html><body><script>(function(){var m=${JSON.stringify(m)};var w=window;try{while(w!==w.top){w=w.parent;try{w.postMessage(m,"*");}catch(e){}}}catch(e){}})();<\/script>`;
const page_ = body => ({ status: 200, contentType: 'text/html', body });
let PORT, n = 0;
const ok = m => { console.log('  ok -', m); n++; };

// opts: attempts (what the lookup returns, mutable), lookup ('fail' to simulate no answer), unverified (skip the login),
//       sendCode ('rate' to refuse), tokens (queue of tokens to hand out on successful verification)
async function newPage(b, opts, saveHandler) {
  opts = opts || {};
  const pg = await (await b.newContext()).newPage(); const posts = [], fetches = [], lookups = [], calls = [];
  pg.on('pageerror', e => console.log('PAGE ERROR', e.message));
  pg.on('request', r => { if (r.resourceType() === 'fetch' || r.resourceType() === 'xhr') fetches.push(r.url()); });
  await pg.route(/script\.google\.com\/macros\/s\/.*\/exec\?action=attempts/, r => {
    const u = new URL(r.request().url()); lookups.push(Object.fromEntries(u.searchParams));
    if (opts.lookup === 'fail') return r.abort();
    const cb = u.searchParams.get('callback');
    if (opts.lookupAuth === 'expired') return r.fulfill({ status: 200, contentType: 'application/javascript', body: `${cb}({"ok":false,"code":"auth","error":"Please verify your email address first."});` });
    const a = opts.attempts || { attempts: 0, remaining: 2, passed: false };
    r.fulfill({ status: 200, contentType: 'application/javascript', body: `${cb}(${JSON.stringify(Object.assign({ ok: true, max: 2, passMark: 85 }, a))});` });
  });
  await pg.route(POST_URL, async r => {
    const params = new URLSearchParams(r.request().postData() || '');
    const action = params.get('action');
    if (action) {                                   // login calls
      const id = params.get('id'); calls.push({ action, email: params.get('email'), code: params.get('code') });
      if (action === 'sendCode') {
        return r.fulfill(page_(reply(opts.sendCode === 'rate'
          ? { wbscAuth: true, id, action, success: false, code: 'rate', error: 'Too many codes have been requested for this address. Please wait a while and try again.' }
          : { wbscAuth: true, id, action, success: true, expiresIn: 600 })));
      }
      if (action === 'verifyCode') {
        if (params.get('code') !== '123456') return r.fulfill(page_(reply({ wbscAuth: true, id, action, success: false, code: 'wrong', error: 'That code is not right. 4 tries left.' })));
        const tok = (opts.tokens && opts.tokens.length) ? opts.tokens.shift() : TOKEN;
        return r.fulfill(page_(reply({ wbscAuth: true, id, action, success: true, token: tok, email: params.get('email').toLowerCase(), expiresIn: 21600 })));
      }
      return r.fulfill(page_(''));
    }
    const payload = JSON.parse(params.get('payload')); posts.push({ method: r.request().method(), ct: r.request().headers()['content-type'], payload });
    await (saveHandler || (() => r.fulfill(page_(reply({ wbscSave: true, success: true, submissionId: payload.submissionId, attemptNumber: 1, maxAttempts: 2, result: payload.percentage >= 85 ? 'PASS' : 'NOT PASSED' })))))(r, payload, posts.length);
  });
  await pg.clock.install();
  await pg.goto('http://localhost:' + PORT + '/assessment-widget.html');
  await pg.fill('#inp-name', 'Jo Ump'); await pg.fill('#inp-email', 'Jo@X.com');
  if (!opts.unverified) await verifyEmail(pg);
  return { pg, posts, fetches, lookups, calls };
}
async function verifyEmail(pg, code = '123456') {
  await pg.click('#verify-send-btn'); await pg.waitForSelector('#verify-code-row', { state: 'visible' });
  await pg.fill('#inp-code', code); await pg.click('#verify-check-btn');
  await pg.waitForFunction(() => /Email verified|not right/.test(document.getElementById('verify-state').textContent));
}
// answers every question; `wrong` = how many to get wrong (from the start)
async function runQuiz(pg, key = 'm01-mkc', wrong = 0) {
  await pg.click(`[data-assessment="${key}"]`); await pg.waitForSelector('#quiz-question', { state: 'visible' });
  const count = BANK[key].questions.length;
  for (let i = 0; i < count; i++) {
    const q = await pg.textContent('#quiz-question'); const opts = await pg.$$eval('.quiz-option .opt-text', a => a.map(x => x.textContent));
    const right = opts.indexOf(RIGHT[q]); assert.ok(right >= 0, 'known question'); const pick = i < wrong ? (right + 1) % opts.length : right;
    await pg.click(`.quiz-option >> nth=${pick}`); await pg.click('#quiz-submit-btn'); await pg.click('#quiz-submit-btn');
  }
}
const until = async (t) => { for (let i = 0; i < 100 && !t.posts.length; i++) await new Promise(r => setTimeout(r, 50)); };
const saveText = pg => pg.textContent('#quiz-save-state');
const verifyText = pg => pg.textContent('#verify-state');

(async () => {
  await new Promise(r => server.listen(0, r)); PORT = server.address().port;
  const b = await chromium.launch(); let t, txt;

  // ====================================================================  email verification
  t = await newPage(b, { unverified: true });
  assert.ok(!(await t.pg.isVisible('#quiz')), 'quiz hidden on arrival');
  await t.pg.click('[data-assessment="m01-mkc"]');
  assert.ok(/Confirm your email address first/.test(await t.pg.textContent('#validation-banner')));
  assert.ok(!(await t.pg.isVisible('#quiz'))); assert.strictEqual(t.lookups.length, 0, 'no lookup before verification');
  ok('Start is blocked until the email is verified (no lookup, quiz hidden)');

  t = await newPage(b, { unverified: true, sendCode: 'rate' });
  await t.pg.click('#verify-send-btn'); await t.pg.waitForFunction(() => /Too many codes/.test(document.getElementById('verify-state').textContent));
  assert.ok(!(await t.pg.isVisible('#verify-code-row')), 'no code box when the server refused');
  await t.pg.fill('#inp-email', 'not-an-email'); await t.pg.click('#verify-send-btn');
  assert.ok(/valid email address/.test(await verifyText(t.pg))); assert.strictEqual(t.calls.length, 1, 'an invalid address is not sent to the server');
  ok('a refused code request and a bad address are explained, and no code box appears');

  t = await newPage(b, { unverified: true });
  await verifyEmail(t.pg, '000000');
  assert.ok(/not right/.test(await verifyText(t.pg))); assert.ok(await t.pg.isVisible('#verify-code-row'), 'can try again');
  await t.pg.fill('#inp-code', '123456'); await t.pg.click('#verify-check-btn');
  await t.pg.waitForFunction(() => /Email verified/.test(document.getElementById('verify-state').textContent));
  assert.ok(/Email verified: jo@x\.com/.test(await verifyText(t.pg)), 'shows the lower-cased verified address');
  assert.deepStrictEqual(t.calls.map(c => c.action), ['sendCode', 'verifyCode', 'verifyCode']);
  assert.strictEqual(t.calls[0].email, 'Jo@X.com');
  ok('a wrong code is refused with the reason; the right code verifies and the address is shown');

  // changing the address un-verifies; a verified session survives a reload
  await t.pg.fill('#inp-email', 'other@x.com');
  assert.ok(!/Email verified/.test(await verifyText(t.pg)), 'verification dropped'); assert.ok(await t.pg.isVisible('#verify-send-btn'));
  await t.pg.click('[data-assessment="m01-mkc"]'); assert.ok(/Confirm your email address first/.test(await t.pg.textContent('#validation-banner')));
  await t.pg.fill('#inp-email', 'jo@x.com');   // same person again, but the session was dropped
  assert.ok(!/Email verified/.test(await verifyText(t.pg)));
  ok('changing the email address cancels the verification');

  t = await newPage(b, {});
  await t.pg.evaluate(() => history.replaceState(null, '', location.pathname)); await t.pg.reload();
  assert.ok(/Email verified: jo@x\.com/.test(await verifyText(t.pg)), 'still verified after a reload');
  await t.pg.click('[data-assessment="m01-mkc"]'); await t.pg.waitForSelector('#quiz-question', { state: 'visible' });
  ok('the verified session survives a reload (this tab only)');

  // the lookup and the save carry the session, never rely on the typed address
  t = await newPage(b, {});
  await t.pg.fill('#inp-email', 'jo@x.com');
  await runQuiz(t.pg); await t.pg.waitForFunction(() => /recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.strictEqual(t.lookups[0].token, TOKEN); assert.ok(!('email' in t.lookups[0]), 'the lookup sends the session, not an email');
  assert.strictEqual(t.posts[0].payload.token, TOKEN); assert.strictEqual(t.posts[0].payload.participantEmail, 'jo@x.com');
  txt = await saveText(t.pg); assert.ok(/recorded \(attempt 1 of 2\)\. A receipt will be emailed to jo@x\.com\./.test(txt), txt);
  ok('lookup and save send the session token; the verified address is what is recorded; the receipt is announced');

  // ====================================================================  attempts, pass mark
  t = await newPage(b, { attempts: { attempts: 1, remaining: 1, passed: false } });
  await t.pg.click('[data-assessment="m01-mkc"]'); await t.pg.waitForSelector('#quiz-question', { state: 'visible' });
  assert.strictEqual((await t.pg.textContent('#quiz-attempt-label')).trim(), 'Attempt 2 of 2 · Pass mark 85%');
  assert.ok(/Module 01/.test(t.lookups[0].module)); assert.strictEqual(t.lookups[0].type, 'Manual Knowledge Check');
  ok('attempt label comes from the server count; the lookup names the module and type');

  t = await newPage(b, { attempts: { attempts: 2, remaining: 0, passed: false } });
  await t.pg.click('[data-assessment="m01-mkc"]'); await t.pg.waitForFunction(() => /maximum of 2 attempts/.test(document.getElementById('validation-banner').textContent));
  assert.ok(!(await t.pg.isVisible('#quiz')) && /umpiredirector@wbscoceania\.org/.test(await t.pg.textContent('#validation-banner')));
  ok('with 2 attempts used, starting is blocked and shows the contact address');

  t = await newPage(b, { lookup: 'fail' });
  await t.pg.click('[data-assessment="m01-mkc"]'); await t.pg.waitForSelector('#quiz-question', { state: 'visible' });
  assert.ok(/Maximum 2 attempts/.test(await t.pg.textContent('#quiz-attempt-label')));
  ok('if the attempts lookup fails the quiz still starts (the server checks again when saving)');

  t = await newPage(b, { lookupAuth: 'expired' });
  await t.pg.click('[data-assessment="m01-mkc"]'); await t.pg.waitForFunction(() => /verification has expired/.test(document.getElementById('validation-banner').textContent));
  assert.ok(!(await t.pg.isVisible('#quiz'))); assert.ok(!/Email verified/.test(await verifyText(t.pg)), 'asks to verify again');
  ok('an expired session is caught when starting: the learner is asked to verify again');

  t = await newPage(b, {});
  await runQuiz(t.pg); await t.pg.waitForFunction(() => /recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.strictEqual((await t.pg.textContent('#quiz-result-pill')).trim(), 'Passed');
  assert.ok(await t.pg.isVisible('#quiz-next-block')); assert.ok(!(await t.pg.isVisible('#quiz-try-again')));
  assert.strictEqual(t.posts.length, 1); assert.ok(/x-www-form-urlencoded/.test(t.posts[0].ct)); assert.strictEqual(t.fetches.length, 0);
  assert.strictEqual(t.posts[0].payload.percentage, 100);
  ok('5/5 = Passed, recorded only after the reply; form POST, no fetch');

  const state = { attempts: { attempts: 0, remaining: 2, passed: false } };
  t = await newPage(b, state);
  await runQuiz(t.pg, 'm01-mkc', 1); await t.pg.waitForFunction(() => /recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.strictEqual(t.posts[0].payload.percentage, 80);
  assert.strictEqual((await t.pg.textContent('#quiz-result-pill')).trim(), 'Not passed');
  assert.ok(/1 attempt left/.test(await t.pg.textContent('#quiz-result-text')));
  assert.ok(await t.pg.isVisible('#quiz-try-again')); assert.ok(!(await t.pg.isVisible('#quiz-next-block')));
  state.attempts = { attempts: 1, remaining: 1, passed: false };
  await t.pg.click('#quiz-try-again'); await t.pg.waitForSelector('#quiz-question', { state: 'visible' });
  assert.strictEqual((await t.pg.textContent('#quiz-attempt-label')).trim(), 'Attempt 2 of 2 · Pass mark 85%');
  ok('4/5 = 80% is Not passed; "1 attempt left"; Try again begins attempt 2 of 2');

  t = await newPage(b, { attempts: { attempts: 1, remaining: 1, passed: false } }, (r, p) => r.fulfill(page_(reply({ wbscSave: true, success: true, submissionId: p.submissionId, attemptNumber: 2, maxAttempts: 2, result: 'NOT PASSED' }))));
  await runQuiz(t.pg, 'm01-mkc', 2); await t.pg.waitForFunction(() => /recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.ok(/used all 2 attempts/.test(await t.pg.textContent('#quiz-result-text')) && /umpiredirector@wbscoceania\.org/.test(await t.pg.textContent('#quiz-result-text')));
  assert.ok(!(await t.pg.isVisible('#quiz-try-again')));
  ok('failing attempt 2 of 2 shows no Try again and the contact address');

  t = await newPage(b, { lookup: 'fail' }, (r, p) => r.fulfill(page_(reply({ wbscSave: true, success: false, code: 'max_attempts', submissionId: p.submissionId, maxAttempts: 2, error: 'You have already used the maximum of 2 attempts for this assessment. Please contact umpiredirector@wbscoceania.org.' }))));
  await runQuiz(t.pg); await t.pg.waitForFunction(() => /maximum of 2/.test(document.getElementById('quiz-save-state').textContent));
  assert.ok(!(await t.pg.isVisible('#quiz-retry-save')) && !(await t.pg.isVisible('#quiz-try-again')));
  assert.strictEqual((await t.pg.textContent('#quiz-result-pill')).trim(), 'Not recorded');
  ok('a refused third attempt is final: "Not recorded", no Retry, no Try again');

  t = await newPage(b, {}, (r, p) => r.fulfill(page_(reply({ wbscSave: true, success: true, submissionId: p.submissionId, attemptNumber: 1, maxAttempts: 2, result: 'NOT PASSED' }))));
  await runQuiz(t.pg); await t.pg.waitForFunction(() => /recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.strictEqual((await t.pg.textContent('#quiz-result-pill')).trim(), 'Not passed');
  ok("the server's pass/fail overrides the browser's");

  t = await newPage(b, {}, (r, p) => r.fulfill(page_(reply({ wbscSave: true, success: true, submissionId: p.submissionId, attemptNumber: 1, maxAttempts: 2, result: 'PASS', completedAll: true }))));
  await runQuiz(t.pg, 'm06-pca'); await t.pg.waitForFunction(() => /recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.ok(/passed all 6 modules/.test(await t.pg.textContent('#quiz-result-text')));
  ok('passing the sixth module tells the learner the program is complete');

  // ====================================================================  expired session during a save
  t = await newPage(b, { tokens: [TOKEN, TOKEN2] }, (r, p, i) => r.fulfill(page_(reply(i === 1
    ? { wbscSave: true, success: false, code: 'auth', submissionId: p.submissionId, error: 'Invalid session. Please verify your email address with a code first.' }
    : { wbscSave: true, success: true, submissionId: p.submissionId, attemptNumber: 1, maxAttempts: 2, result: 'PASS' }))));
  await runQuiz(t.pg); await t.pg.waitForFunction(() => /verification has expired/.test(document.getElementById('quiz-save-state').textContent));
  assert.ok(await t.pg.isVisible('#quiz-retry-save')); assert.ok(!/Email verified/.test(await verifyText(t.pg)), 'verification cleared');
  await t.pg.click('#quiz-retry-save');
  assert.ok(/Verify your email address/.test(await saveText(t.pg)), 'retry is refused until the email is verified again'); assert.strictEqual(t.posts.length, 1);
  await verifyEmail(t.pg); await t.pg.click('#quiz-retry-save');
  await t.pg.waitForFunction(() => /has been recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.strictEqual(t.posts.length, 2); assert.strictEqual(t.posts[0].payload.submissionId, t.posts[1].payload.submissionId, 'same submission');
  assert.strictEqual(t.posts[0].payload.token, TOKEN); assert.strictEqual(t.posts[1].payload.token, TOKEN2, 'the retry carries the new session');
  ok('an expired session during a save: score kept, verify again, then Retry sends the same result with the new session');

  // ====================================================================  save errors, spoofing, timeout (unchanged behaviour)
  t = await newPage(b, {}, (r, p, i) => r.fulfill(page_(reply(i === 1
    ? { wbscSave: true, success: false, submissionId: p.submissionId, error: 'Invalid score' }
    : { wbscSave: true, success: true, submissionId: p.submissionId, attemptNumber: 1, maxAttempts: 2, result: 'PASS' }))));
  await runQuiz(t.pg); await t.pg.waitForFunction(() => /could not be recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.ok(await t.pg.isVisible('#quiz-retry-save')); await t.pg.click('#quiz-retry-save');
  await t.pg.waitForFunction(() => /has been recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.strictEqual(t.posts[0].payload.submissionId, t.posts[1].payload.submissionId);
  ok('server error shows Retry; retry reuses the same submissionId and then confirms');

  t = await newPage(b, {}, r => r.fulfill(page_('<!doctype html><body>no message</body>')));
  await runQuiz(t.pg); await until(t);
  const id = t.posts[0].payload.submissionId;
  await t.pg.evaluate(id => window.postMessage({ wbscSave: true, success: true, submissionId: id, attemptNumber: 9, result: 'PASS' }, '*'), id);
  await t.pg.evaluate(() => window.postMessage({ wbscAuth: true, id: 'x', success: true, token: 'f'.repeat(64), email: 'evil@x.com' }, '*'));
  await t.pg.clock.runFor(1000); assert.ok(/Recording your result/.test(await saveText(t.pg)), 'spoofed save reply ignored');
  assert.ok(/Email verified: jo@x\.com/.test(await verifyText(t.pg)), 'a spoofed login reply is ignored too');
  await t.pg.clock.runFor(26000); txt = await saveText(t.pg);
  assert.ok(/could not confirm/.test(txt) && await t.pg.isVisible('#quiz-retry-save'), txt);
  await t.pg.click('[data-assessment="m02-mkc"]'); assert.ok(/not been confirmed/.test(await t.pg.textContent('#validation-banner')));
  ok('messages from a non-Google origin cannot fake a result or a login; no reply in 25 s -> "could not confirm"; starting another is blocked meanwhile');

  // ====================================================================  options, accessibility, details, leave warning
  {
    t = await newPage(b, {});
    const pg = t.pg; await pg.fill('#inp-umpid', '007');
    const seen = new Set(); const Q1 = Object.keys(RIGHT).find(q => /umpire acronym/.test(q));
    for (let i = 0; i < 24; i++) {
      await pg.click('[data-assessment="m01-mkc"]'); await pg.waitForSelector('#quiz-question', { state: 'visible' });
      const opts = await pg.$$eval('.quiz-option .opt-text', a => a.map(x => x.textContent)); const idx = opts.indexOf(RIGHT[Q1]); assert.ok(idx >= 0); seen.add(idx);
      assert.strictEqual(await pg.getAttribute('#quiz-options', 'role'), 'radiogroup'); assert.strictEqual(await pg.getAttribute('.quiz-option >> nth=0', 'role'), 'radio');
      await pg.click(`.quiz-option >> nth=${idx}`); assert.strictEqual(await pg.getAttribute(`.quiz-option >> nth=${idx}`, 'aria-checked'), 'true');
      await pg.click('#quiz-submit-btn'); assert.ok(/Correct/.test(await pg.textContent('#quiz-feedback-head')));
      await pg.evaluate(() => history.replaceState(null, '', location.pathname));   // so the reload does not auto-start from the fragment
      await pg.reload(); if (i === 0) { assert.strictEqual(await pg.inputValue('#inp-name'), 'Jo Ump'); assert.strictEqual(await pg.inputValue('#inp-umpid'), '007'); }
    }
    assert.ok(seen.size >= 3, 'correct answer in >=3 positions: ' + [...seen]);
    await pg.click('[data-assessment="m01-mkc"]'); await pg.waitForSelector('#quiz-question', { state: 'visible' });
    const warn = () => pg.evaluate(() => { const e = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e); return e.defaultPrevented; });
    assert.strictEqual(await warn(), false); await pg.click('.quiz-option >> nth=0'); await pg.click('#quiz-submit-btn'); await pg.click('#quiz-submit-btn'); assert.strictEqual(await warn(), true);
    ok('options shuffle (right answer in ' + seen.size + ' positions) and still score; ARIA radios; details kept; leave warning only mid-quiz');
  }

  await b.close(); server.close(); console.log(n + ' widget checks passed');
})().catch(e => { console.error('FAIL', e.message); console.error(e.stack.split('\n').slice(1, 4).join('\n')); process.exit(1); });
