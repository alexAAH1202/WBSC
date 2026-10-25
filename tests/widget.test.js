// Browser tests for assessment-widget.html (needs Playwright: `npm i -D playwright`).
// Google's replies are simulated; this does NOT prove the real Apps Script reply path works.
const http = require('http'), fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/assessment-widget.html'));
  fs.readFile(f, (e, d) => e ? (res.writeHead(404), res.end()) : (res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }), res.end(d)));
});
const html = fs.readFileSync(path.join(root, 'assessment-widget.html'), 'utf8');
const BANK = vm.runInNewContext(html.slice(html.indexOf('var QUIZ_BANK'), html.indexOf('// Answer options are shuffled')) + '\n;QUIZ_BANK', {});
const RIGHT = {};   // question text -> right answer text
Object.values(BANK).forEach(b => b.questions.forEach(q => { RIGHT[q.q] = q.options[q.correct]; }));

const POST_URL = 'https://script.google.com/macros/s/AKfycbxm_gObsmIO7RUn1wcKS22r6Gsp0ccrhdm7kgVfmw9-DIDS4ndstk_DYtQAYL80DP0f/exec';
const reply = m => `<!doctype html><body><script>(function(){var m=${JSON.stringify(m)};var w=window;try{while(w!==w.top){w=w.parent;try{w.postMessage(m,"*");}catch(e){}}}catch(e){}})();<\/script>`;
const page_ = body => ({ status: 200, contentType: 'text/html', body });
let PORT, n = 0;
const ok = m => { console.log('  ok -', m); n++; };

// opts.attempts: what the attempts lookup returns {attempts, remaining, passed} (mutable), opts.lookup: 'fail' to simulate no answer
async function newPage(b, opts, handler) {
  const pg = await (await b.newContext()).newPage(); const posts = [], fetches = [], lookups = [];
  pg.on('pageerror', e => console.log('PAGE ERROR', e.message));
  pg.on('request', r => { if (r.resourceType() === 'fetch' || r.resourceType() === 'xhr') fetches.push(r.url()); });
  await pg.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '' })); await pg.route('https://fonts.gstatic.com/**', r => r.fulfill({ body: '' }));
  await pg.route(/script\.google\.com\/macros\/s\/.*\/exec\?action=attempts/, r => {
    const u = new URL(r.request().url()); lookups.push(Object.fromEntries(u.searchParams));
    if (opts.lookup === 'fail') return r.abort();
    const a = opts.attempts || { attempts: 0, remaining: 2, passed: false };
    r.fulfill({ status: 200, contentType: 'application/javascript', body: `${u.searchParams.get('callback')}(${JSON.stringify(Object.assign({ ok: true, max: 2, passMark: 85 }, a))});` });
  });
  await pg.route(POST_URL, async r => {
    const payload = JSON.parse(new URLSearchParams(r.request().postData() || '').get('payload')); posts.push({ method: r.request().method(), ct: r.request().headers()['content-type'], payload });
    await (handler || (() => r.fulfill(page_(reply({ wbscSave: true, success: true, submissionId: payload.submissionId, attemptNumber: 1, maxAttempts: 2, result: payload.percentage >= 85 ? 'PASS' : 'NOT PASSED' })))))(r, payload, posts.length);
  });
  await pg.clock.install();
  await pg.goto('http://localhost:' + PORT + '/assessment-widget.html');
  await pg.fill('#inp-name', 'Jo Ump'); await pg.fill('#inp-email', 'jo@x.com');
  return { pg, posts, fetches, lookups };
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
const until = async (t, f) => { for (let i = 0; i < 100 && !t.posts.length; i++) await new Promise(r => setTimeout(r, 50)); };
const saveText = pg => pg.textContent('#quiz-save-state');

(async () => {
  await new Promise(r => server.listen(0, r)); PORT = server.address().port;
  const b = await chromium.launch(); let t, txt;

  // 1) nothing is shown until an assessment is started with details entered
  t = await newPage(b, {});
  assert.ok(!(await t.pg.isVisible('#quiz')), 'quiz hidden on arrival');
  await t.pg.fill('#inp-email', ''); await t.pg.click('[data-assessment="m01-mkc"]');
  assert.ok(!(await t.pg.isVisible('#quiz')) && /full name and email/.test(await t.pg.textContent('#validation-banner')));
  assert.strictEqual(t.lookups.length, 0, 'no lookup without details');
  ok('quiz stays hidden on arrival and without name + email');

  // 2) attempts lookup: label, params, and a pass
  t = await newPage(b, { attempts: { attempts: 1, remaining: 1, passed: false } });
  await t.pg.click('[data-assessment="m01-mkc"]'); await t.pg.waitForSelector('#quiz-question', { state: 'visible' });
  assert.strictEqual((await t.pg.textContent('#quiz-attempt-label')).trim(), 'Attempt 2 of 2 · Pass mark 85%');
  assert.strictEqual(t.lookups[0].email, 'jo@x.com'); assert.strictEqual(t.lookups[0].type, 'Manual Knowledge Check'); assert.ok(/Module 01/.test(t.lookups[0].module));
  ok('attempt label comes from the server count; lookup sends email, module and type');

  // 3) no attempts left: start is blocked, quiz never shown
  t = await newPage(b, { attempts: { attempts: 2, remaining: 0, passed: false } });
  await t.pg.click('[data-assessment="m01-mkc"]'); await t.pg.waitForFunction(() => /maximum of 2 attempts/.test(document.getElementById('validation-banner').textContent));
  assert.ok(!(await t.pg.isVisible('#quiz')) && /umpiredirector@wbscoceania\.org/.test(await t.pg.textContent('#validation-banner')));
  ok('with 2 attempts used, starting is blocked and shows the contact address');

  // 4) lookup failure does not lock the learner out (server still enforces on save)
  t = await newPage(b, { lookup: 'fail' });
  await t.pg.click('[data-assessment="m01-mkc"]'); await t.pg.waitForSelector('#quiz-question', { state: 'visible' });
  assert.ok(/Maximum 2 attempts/.test(await t.pg.textContent('#quiz-attempt-label')));
  ok('if the attempts lookup fails the quiz still starts (the server checks again when saving)');

  // 5) perfect score: PASS, server confirms, Continue shown, no Try again; form post not fetch
  t = await newPage(b, {});
  await runQuiz(t.pg); await t.pg.waitForFunction(() => /recorded/.test(document.getElementById('quiz-save-state').textContent));
  txt = await saveText(t.pg); assert.ok(/recorded \(attempt 1 of 2\)/.test(txt), txt);
  assert.strictEqual((await t.pg.textContent('#quiz-result-pill')).trim(), 'Passed');
  assert.ok(await t.pg.isVisible('#quiz-next-block')); assert.ok(!(await t.pg.isVisible('#quiz-try-again')));
  assert.strictEqual(t.posts.length, 1); assert.ok(/x-www-form-urlencoded/.test(t.posts[0].ct)); assert.strictEqual(t.fetches.length, 0);
  assert.strictEqual(t.posts[0].payload.percentage, 100);
  ok('5/5 = Passed, "recorded (attempt 1 of 2)" only after the reply; form POST, no fetch');

  // 6) 4/5 = 80% is NOT a pass; one attempt left; Try again starts attempt 2 with a fresh submission
  const state = { attempts: { attempts: 0, remaining: 2, passed: false } };
  t = await newPage(b, state);
  await runQuiz(t.pg, 'm01-mkc', 1); await t.pg.waitForFunction(() => /recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.strictEqual(t.posts[0].payload.percentage, 80);
  assert.strictEqual((await t.pg.textContent('#quiz-result-pill')).trim(), 'Not passed');
  assert.ok(/1 attempt left/.test(await t.pg.textContent('#quiz-result-text')), await t.pg.textContent('#quiz-result-text'));
  assert.ok(await t.pg.isVisible('#quiz-try-again')); assert.ok(!(await t.pg.isVisible('#quiz-next-block')));
  state.attempts = { attempts: 1, remaining: 1, passed: false };
  await t.pg.click('#quiz-try-again'); await t.pg.waitForSelector('#quiz-question', { state: 'visible' });
  assert.strictEqual((await t.pg.textContent('#quiz-attempt-label')).trim(), 'Attempt 2 of 2 · Pass mark 85%');
  ok('4/5 = 80% is Not passed; "1 attempt left"; Try again begins attempt 2 of 2');

  // 7) second failed attempt: confirmed attempt 2 -> no attempts left, contact shown, no Try again
  t = await newPage(b, { attempts: { attempts: 1, remaining: 1, passed: false } }, (r, p) => r.fulfill(page_(reply({ wbscSave: true, success: true, submissionId: p.submissionId, attemptNumber: 2, maxAttempts: 2, result: 'NOT PASSED' }))));
  await runQuiz(t.pg, 'm01-mkc', 2); await t.pg.waitForFunction(() => /recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.ok(/used all 2 attempts/.test(await t.pg.textContent('#quiz-result-text')) && /umpiredirector@wbscoceania\.org/.test(await t.pg.textContent('#quiz-result-text')));
  assert.ok(!(await t.pg.isVisible('#quiz-try-again')));
  ok('failing attempt 2 of 2 shows no Try again and the contact address');

  // 8) server refuses a third attempt: shown as final, nothing "recorded", no Retry
  t = await newPage(b, { lookup: 'fail' }, (r, p) => r.fulfill(page_(reply({ wbscSave: true, success: false, code: 'max_attempts', submissionId: p.submissionId, maxAttempts: 2, error: 'You have already used the maximum of 2 attempts for this assessment. Please contact umpiredirector@wbscoceania.org.' }))));
  await runQuiz(t.pg); await t.pg.waitForFunction(() => /maximum of 2/.test(document.getElementById('quiz-save-state').textContent));
  assert.ok(!(await t.pg.isVisible('#quiz-retry-save')) && !(await t.pg.isVisible('#quiz-try-again')));
  assert.strictEqual((await t.pg.textContent('#quiz-result-pill')).trim(), 'Not recorded');
  assert.ok(!/has been recorded/.test(await saveText(t.pg)));
  ok('a refused third attempt is final: "Not recorded", no Retry, no Try again');

  // 9) server disagrees with the browser: the server's result wins
  t = await newPage(b, {}, (r, p) => r.fulfill(page_(reply({ wbscSave: true, success: true, submissionId: p.submissionId, attemptNumber: 1, maxAttempts: 2, result: 'NOT PASSED' }))));
  await runQuiz(t.pg); await t.pg.waitForFunction(() => /recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.strictEqual((await t.pg.textContent('#quiz-result-pill')).trim(), 'Not passed');
  ok("the server's pass/fail overrides the browser's");

  // 10) server error + Retry reuses the same submission id
  t = await newPage(b, {}, (r, p, i) => r.fulfill(page_(reply(i === 1
    ? { wbscSave: true, success: false, submissionId: p.submissionId, error: 'Invalid score' }
    : { wbscSave: true, success: true, submissionId: p.submissionId, attemptNumber: 1, maxAttempts: 2, result: 'PASS' }))));
  await runQuiz(t.pg); await t.pg.waitForFunction(() => /could not be recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.ok(await t.pg.isVisible('#quiz-retry-save')); await t.pg.click('#quiz-retry-save');
  await t.pg.waitForFunction(() => /has been recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.strictEqual(t.posts.length, 2); assert.strictEqual(t.posts[0].payload.submissionId, t.posts[1].payload.submissionId);
  ok('server error shows Retry; retry reuses the same submissionId and then confirms');

  // 11) a spoofed message from a non-Google origin, and a reply for another submission, are ignored; timeout -> "could not confirm"
  t = await newPage(b, {}, r => r.fulfill(page_('<!doctype html><body>no message</body>')));
  await runQuiz(t.pg); await until(t);
  const id = t.posts[0].payload.submissionId;
  await t.pg.evaluate(id => window.postMessage({ wbscSave: true, success: true, submissionId: id, attemptNumber: 9, result: 'PASS' }, '*'), id);
  await t.pg.clock.runFor(1000); assert.ok(/Recording your result/.test(await saveText(t.pg)), 'spoof ignored');
  await t.pg.clock.runFor(26000); txt = await saveText(t.pg);
  assert.ok(/could not confirm/.test(txt) && await t.pg.isVisible('#quiz-retry-save'), txt);
  await t.pg.click('[data-assessment="m02-mkc"]'); assert.ok(/not been confirmed/.test(await t.pg.textContent('#validation-banner')));
  ok('non-Google message ignored; no reply in 25 s -> "could not confirm" + Retry; starting another assessment is blocked meanwhile');

  // 12) options shuffle but still score by text; ARIA; details kept; leave warning
  {
    const pg = await (await b.newContext()).newPage();
    await pg.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '' })); await pg.route('https://fonts.gstatic.com/**', r => r.fulfill({ body: '' }));
    await pg.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: `${new URL(r.request().url()).searchParams.get('callback')}({"ok":true,"attempts":0,"remaining":2,"max":2,"passed":false});` }));
    await pg.goto('http://localhost:' + PORT + '/assessment-widget.html');
    await pg.fill('#inp-name', 'Jo Ump'); await pg.fill('#inp-email', 'jo@x.com'); await pg.fill('#inp-umpid', '007');
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
