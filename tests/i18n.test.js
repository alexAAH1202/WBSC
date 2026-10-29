// Browser test for the language support (i18n.js and i18n/*). Needs Playwright.
// Languages other than English are switched off for the public until reviewed (LIVE in i18n.js); the reviewer
// preview (?langs=all) is what is exercised here.
const http = require('http'), fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  const type = f.endsWith('.woff2') ? 'font/woff2' : f.endsWith('.css') ? 'text/css' : f.endsWith('.js') ? 'text/javascript' : f.endsWith('.svg') ? 'image/svg+xml' : 'text/html; charset=utf-8';
  fs.readFile(f, (e, d) => e ? (res.writeHead(404), res.end()) : (res.writeHead(200, { 'Content-Type': type }), res.end(d)));
});
let n = 0; const ok = m => { console.log('  ok -', m); n++; };
const LANGS = ['es', 'fr', 'ja', 'ko', 'zh'];
const PAGES = ['index.html', 'manuals.html', 'presentations.html', 'privacy.html', 'assessment-widget.html'];   // results.html is the Director's page and stays in English
const dict = {}, qdict = {};
LANGS.forEach(l => {
  let w = { WBSC_DICT: {}, WBSC_QDICT: {} }; w.window = w; vm.runInNewContext(fs.readFileSync(path.join(root, 'i18n', l + '.js'), 'utf8'), w);
  dict[l] = w.WBSC_DICT[l].t;
  w = { WBSC_DICT: {}, WBSC_QDICT: {} }; w.window = w; vm.runInNewContext(fs.readFileSync(path.join(root, 'i18n', 'q-' + l + '.js'), 'utf8'), w);
  qdict[l] = w.WBSC_QDICT[l];
});
(async () => {
  await new Promise(r => server.listen(0, r)); const base = 'http://localhost:' + server.address().port + '/';
  const b = await chromium.launch();
  const mk = async (opts) => { const c = await b.newContext(opts); await c.addInitScript(() => { try { localStorage.setItem('wbscNoticeSeen', '1'); } catch (e) {} }); const p = await c.newPage(); p.errors = []; p.on('pageerror', e => p.errors.push(e.message)); return [c, p]; };

  // 1. English only for the public
  let [c, pg] = await mk();
  for (const f of PAGES) { await pg.goto(base + f); assert.strictEqual(await pg.locator('.lang-switch').count(), 0, f + ' has no selector yet'); assert.strictEqual(await pg.getAttribute('html', 'lang'), 'en'); }
  ok('with only English switched on there is no selector');
  await pg.goto(base + 'index.html?lang=fr'); assert.strictEqual(await pg.getAttribute('html', 'lang'), 'fr');   // ?lang= is the reviewer preview
  await pg.goto(base + 'index.html'); assert.strictEqual(await pg.getAttribute('html', 'lang'), 'en'); ok('?lang= previews a language for a reviewer, but a stored choice is ignored for the public while the language is not switched on');
  assert.deepStrictEqual(pg.errors, []); await c.close();

  // 2. reviewer preview: six languages, choice persists
  [c, pg] = await mk(); await pg.goto(base + 'index.html?langs=all');
  assert.strictEqual(await pg.locator('.lang-item').count(), 6); ok('?langs=all shows English plus five languages');
  await pg.click('.lang-btn'); await pg.click('.lang-item[lang="es"]'); await pg.waitForLoadState();
  assert.strictEqual(await pg.getAttribute('html', 'lang'), 'es');
  assert.strictEqual(await pg.evaluate(() => localStorage.getItem('wbscLang')), 'es');
  await pg.goto(base + 'manuals.html'); assert.strictEqual(await pg.getAttribute('html', 'lang'), 'es'); assert.strictEqual(await pg.locator('.lang-note').count(), 1); ok('choosing a language switches the page, is remembered on other pages and shows the reviewer note');
  await pg.click('.lang-btn'); await pg.click('.lang-item[lang="en"]'); await pg.waitForLoadState(); assert.strictEqual(await pg.getAttribute('html', 'lang'), 'en'); ok('English can be chosen again');
  assert.deepStrictEqual(pg.errors, []); await c.close();

  // 3. every language: no missing translations on the static pages, no script errors, no sideways scroll
  [c, pg] = await mk(); await pg.goto(base + 'index.html');
  for (const f of ['index.html', 'manuals.html', 'presentations.html', 'privacy.html']) {
    await pg.goto(base + f);
    const keys = await pg.evaluate(() => { const k = []; WBSC_I18N.units(document.body, (el, key) => k.push(key)); WBSC_I18N.attrs(document.body, (el, a, key) => k.push(key)); return k; });
    for (const l of LANGS) { const miss = keys.filter(k => dict[l][k] == null); assert.deepStrictEqual(miss, [], l + ' misses ' + miss.length + ' strings on ' + f + ': ' + miss.slice(0, 3).join(' | ')); }
  }
  ok('every visible string on the four static pages has a translation in all five languages');
  await c.close();
  for (const l of LANGS) for (const w of [1280, 375]) {
    [c, pg] = await mk({ viewport: { width: w, height: 800 } });
    for (const f of PAGES) {
      await pg.goto(base + f + '?langs=all&lang=' + l); assert.strictEqual(await pg.getAttribute('html', 'lang'), l, f);
      const over = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(over <= 1, `${l} ${f} at ${w}px scrolls sideways by ${over}px`);
    }
    assert.deepStrictEqual(pg.errors, [], l + ' script errors'); await c.close();
  }
  ok('all pages open in all five languages at desktop and phone width with no script errors or sideways scrolling');

  // 4. quiz questions: every question, option and explanation is translated
  const BANK = vm.runInNewContext(fs.readFileSync(path.join(root, 'questions.js'), 'utf8') + '\n;QUIZ_BANK', {});
  let count = 0;
  for (const l of LANGS) for (const [id, bank] of Object.entries(BANK)) {
    const d = qdict[l][id]; assert.ok(d && d.title, `${l} ${id} title`);
    bank.questions.forEach((q, i) => {
      const t = d.questions[i]; assert.ok(t && t.q, `${l} ${id}.${i} question`);
      assert.strictEqual(t.options.length, q.options.length, `${l} ${id}.${i} option count`);
      t.options.forEach((o, j) => assert.ok(o, `${l} ${id}.${i}.o${j}`));
      if (q.why) assert.ok(t.why, `${l} ${id}.${i} why`);
      count++;
    });
  }
  ok(`all ${count / LANGS.length} questions (question, every option and explanation) are translated into all five languages`);

  // 5. the practice quiz runs in each language and the right answer is still the one marked right
  for (const l of LANGS) for (const key of ['m01-mkc', 'm06-mkc']) {
    [c, pg] = await mk(); await pg.goto(base + 'assessment-widget.html?langs=all&lang=' + l);
    await pg.fill('#inp-name', ''); await pg.fill('#inp-email', '');
    await pg.click(`[data-assessment="${key}"]`); await pg.waitForSelector('#quiz-question', { state: 'visible' });
    const bank = BANK[key];
    for (let i = 0; i < bank.questions.length; i++) {
      const q = bank.questions[i], t = qdict[l][key].questions[i];
      assert.strictEqual(await pg.textContent('#quiz-question'), t.q, `${l} ${key} question ${i} shown in ${l}`);
      const opts = await pg.$$eval('.quiz-option .opt-text', a => a.map(x => x.textContent));
      assert.deepStrictEqual([...opts].sort(), [...t.options].sort(), `${l} ${key} q${i} options are the translated ones`);
      const right = opts.indexOf(t.options[q.correct]); assert.ok(right >= 0);
      await pg.click(`.quiz-option >> nth=${right}`); await pg.click('#quiz-submit-btn');
      assert.ok(await pg.locator(`.quiz-option >> nth=${right}`).evaluate(e => e.classList.contains('correct')), `${l} ${key} q${i} right answer marked right`);
      await pg.click('#quiz-submit-btn');
    }
    assert.deepStrictEqual(pg.errors, [], l + ' ' + key); await c.close();
  }
  ok('the practice quizzes run in all five languages with translated text and the correct answer still marked correct');

  await b.close(); server.close(); console.log(n + ' i18n checks passed');
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
