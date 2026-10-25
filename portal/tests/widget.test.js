// Browser tests for assessment-widget.html (needs Playwright: `npm i -D playwright`).
// Google's reply is simulated; this does NOT prove the real Apps Script reply path works.
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/assessment-widget.html'));
  fs.readFile(f, (e, d) => e ? (res.writeHead(404), res.end()) : (res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }), res.end(d)));
});
const { chromium } = require('playwright'); const assert = require('assert');
const URL_ = 'https://script.google.com/macros/s/AKfycbylyWtZwWLOhXVBj6O6zwlsh8xqVtLaZNtT-xfVuZeqHpqAqqhzGt2qi0u-DO_k80pROw/exec';
// The same ancestor-walking script Code.gs returns, with a chosen outcome.
const reply = (m) => `<!doctype html><body><script>(function(){var m=${JSON.stringify(m)};var w=window;try{while(w!==w.top){w=w.parent;try{w.postMessage(m,"*");}catch(e){}}}catch(e){}})();<\/script>`;

async function newPage(b, handler) {
  const ctx = await b.newContext(); const pg = await ctx.newPage();
  const posts = []; const fetches = [];
  pg.on('pageerror', e => console.log('PAGE ERROR', e.message));
  pg.on('request', r => { if (r.resourceType() === 'fetch' || r.resourceType() === 'xhr') fetches.push(r.url()); });
  await pg.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '' }));
  await pg.route('https://fonts.gstatic.com/**', r => r.fulfill({ body: '' }));
  await pg.route(URL_, async r => {
    const req = r.request(); const body = new URLSearchParams(req.postData() || '');
    const payload = JSON.parse(body.get('payload')); posts.push({ method: req.method(), ct: req.headers()['content-type'], payload });
    await handler(r, payload, posts.length);
  });
  await pg.clock.install();
  await pg.goto('http://localhost:' + PORT + '/assessment-widget.html');
  await pg.fill('#inp-name', 'Jo Ump'); await pg.fill('#inp-email', 'jo@x.com');
  return { pg, posts, fetches };
}
async function runQuiz(pg, key = 'm01-mkc') {
  await pg.click(`[data-assessment="${key}"]`);
  const n = key.endsWith('mkc') ? 5 : 10;
  for (let i = 0; i < n; i++) { await pg.click('.quiz-option'); await pg.click('#quiz-submit-btn'); await pg.click('#quiz-submit-btn'); }
}
const html = body => ({ status: 200, contentType: 'text/html', body });
let n = 0; const ok = m => { console.log('  ok -', m); n++; };

let PORT;
(async () => {
  await new Promise(r => server.listen(0, r)); PORT = server.address().port;
  const b = await chromium.launch();

  // 1) success
  let t = await newPage(b, (r, p) => r.fulfill(html(reply({ wbscSave: true, success: true, submissionId: p.submissionId, attemptNumber: 2 }))));
  await runQuiz(t.pg);
  await t.pg.waitForFunction(() => /recorded/.test(document.getElementById('quiz-save-state').textContent));
  let txt = await t.pg.textContent('#quiz-save-state');
  assert.ok(/Your result has been recorded \(attempt 2\)/.test(txt), txt);
  assert.strictEqual(t.posts.length, 1); assert.strictEqual(t.posts[0].method, 'POST');
  assert.ok(/x-www-form-urlencoded/.test(t.posts[0].ct), t.posts[0].ct);
  assert.strictEqual(t.fetches.length, 0, 'no fetch/XHR used');
  assert.ok(t.posts[0].payload.submissionId.length >= 8);
  assert.strictEqual(t.posts[0].payload.attemptNumber, undefined);
  assert.ok(!(await t.pg.isVisible('#quiz-retry-save')));
  assert.strictEqual(await t.pg.locator('iframe[name^=wbsc-save-frame]').count(), 0, 'hidden iframe cleaned up');
  ok('success: form POST (not fetch) sent once, "recorded (attempt 2)" shown only after the reply');


  // 3) server rejects -> failure text + retry resends the SAME submissionId; then succeeds
  let call = 0;
  t = await newPage(b, (r, p, i) => r.fulfill(html(reply(i === 1
    ? { wbscSave: true, success: false, submissionId: p.submissionId, error: 'Invalid score' }
    : { wbscSave: true, success: true, submissionId: p.submissionId, attemptNumber: 1 }))));
  await runQuiz(t.pg);
  await t.pg.waitForFunction(() => /could not be recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.ok(await t.pg.isVisible('#quiz-retry-save')); assert.ok(/Invalid score/.test(await t.pg.textContent('#quiz-save-state')));
  await t.pg.click('#quiz-retry-save');
  await t.pg.waitForFunction(() => /has been recorded/.test(document.getElementById('quiz-save-state').textContent));
  assert.strictEqual(t.posts.length, 2); assert.strictEqual(t.posts[0].payload.submissionId, t.posts[1].payload.submissionId);
  ok('server error shown with Retry; retry reuses the same submissionId and then confirms');

  // 4) spoofed message from the page's own (non-Google) origin is ignored; real reply never arrives -> timeout
  t = await newPage(b, async (r) => { await r.fulfill(html('<!doctype html><body>no message</body>')); });
  await runQuiz(t.pg);
  await t.pg.waitForFunction(() => document.querySelector('iframe[name^=wbsc-save-frame]') || true); while (!t.posts.length) await new Promise(r => setTimeout(r, 50));
  const id = t.posts[0].payload.submissionId;
  await t.pg.evaluate(id => window.postMessage({ wbscSave: true, success: true, submissionId: id, attemptNumber: 9 }, '*'), id);
  await t.pg.clock.runFor(1000);
  assert.ok(!/recorded/.test(await t.pg.textContent('#quiz-save-state')) || /could not confirm/.test(await t.pg.textContent('#quiz-save-state')), 'spoof ignored');
  assert.ok(/Recording your result/.test(await t.pg.textContent('#quiz-save-state')), 'still waiting after spoof');
  ok('a message from a non-Google origin cannot fake "recorded"');
  await t.pg.clock.runFor(26000);
  txt = await t.pg.textContent('#quiz-save-state');
  assert.ok(/could not confirm/.test(txt), txt); assert.ok(await t.pg.isVisible('#quiz-retry-save'));
  ok('no reply within 25s -> "could not confirm" with Retry (never a false "recorded")');

  // 5) a reply for a different submissionId is ignored
  t = await newPage(b, (r, p) => r.fulfill(html(reply({ wbscSave: true, success: true, submissionId: 'someone-else-1234', attemptNumber: 1 }))));
  await runQuiz(t.pg); while (!t.posts.length) await new Promise(r => setTimeout(r, 50)); await t.pg.clock.runFor(2000);
  assert.ok(!/has been recorded/.test(await t.pg.textContent('#quiz-save-state')));
  ok('reply for another submission id is ignored');

  // 6) cannot start a new assessment while the last save is unconfirmed
  await t.pg.clock.runFor(26000);
  await t.pg.click('[data-assessment="m02-mkc"]');
  assert.ok(/not been confirmed/.test(await t.pg.textContent('#validation-banner')));
  ok('starting another assessment is blocked while a save is unconfirmed');


  // 7) options are shuffled but scoring still follows the right text; ARIA state; identity kept for the visit
  {
    const ctx = await b.newContext(); const pg = await ctx.newPage();
    await pg.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '' })); await pg.route('https://fonts.gstatic.com/**', r => r.fulfill({ body: '' }));
    await pg.goto('http://localhost:' + PORT + '/assessment-widget.html');
    await pg.fill('#inp-name', 'Jo Ump'); await pg.fill('#inp-email', 'jo@x.com'); await pg.fill('#inp-umpid', '007');
    const RIGHT = 'Mobile \u2014 maintain hustle and be in position';
    const seen = new Set();
    for (let i = 0; i < 24; i++) {
      await pg.click('[data-assessment="m01-mkc"]');
      const opts = await pg.$$eval('.quiz-option .opt-text', a => a.map(x => x.textContent));
      const idx = opts.indexOf(RIGHT); assert.ok(idx >= 0); seen.add(idx);
      assert.strictEqual(await pg.getAttribute('#quiz-options', 'role'), 'radiogroup');
      assert.strictEqual(await pg.getAttribute('.quiz-option >> nth=0', 'role'), 'radio');
      await pg.click(`.quiz-option >> nth=${idx}`);
      assert.strictEqual(await pg.getAttribute(`.quiz-option >> nth=${idx}`, 'aria-checked'), 'true');
      await pg.click('#quiz-submit-btn');
      assert.ok(/Correct/.test(await pg.textContent('#quiz-feedback-head')), 'shuffled correct option scores as correct');
      await pg.reload(); await pg.waitForTimeout(0);
      if (i === 0) { assert.strictEqual(await pg.inputValue('#inp-name'), 'Jo Ump'); assert.strictEqual(await pg.inputValue('#inp-umpid'), '007'); }
    }
    assert.ok(seen.size >= 3, 'correct answer appeared in at least 3 positions over 24 attempts: ' + [...seen]);
    ok('options shuffle (correct seen in ' + seen.size + ' positions), still score correctly, ARIA radio state set, details kept after refresh');

    // leave-page warning only mid-quiz
    await pg.click('[data-assessment="m01-mkc"]');
    let prevented = await pg.evaluate(() => { const e = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e); return e.defaultPrevented; });
    assert.strictEqual(prevented, false, 'no warning before any answer');
    await pg.click('.quiz-option >> nth=0'); await pg.click('#quiz-submit-btn'); await pg.click('#quiz-submit-btn');
    prevented = await pg.evaluate(() => { const e = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e); return e.defaultPrevented; });
    assert.strictEqual(prevented, true, 'warning mid-quiz');
    ok('leave-page warning appears only once an assessment is under way');
  }

  await b.close(); server.close(); console.log(n + ' widget checks passed');
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
