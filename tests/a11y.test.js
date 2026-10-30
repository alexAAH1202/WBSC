// Browser test for keyboard use and basic accessibility. Needs Playwright. (An automated axe-core scan was also run when
// these were added; it found no WCAG 2.1 A/AA issues on any page or quiz state. This test keeps the fixes in place.)
const http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  const type = f.endsWith('.woff2') ? 'font/woff2' : f.endsWith('.css') ? 'text/css' : f.endsWith('.js') ? 'text/javascript' : f.endsWith('.svg') ? 'image/svg+xml' : 'text/html; charset=utf-8';
  fs.readFile(f, (e, d) => e ? (res.writeHead(404), res.end()) : (res.writeHead(200, { 'Content-Type': type }), res.end(d)));
});
let n = 0; const ok = m => { console.log('  ok -', m); n++; };
const PAGES = ['index.html', 'manuals.html', 'presentations.html', 'privacy.html', 'assessment-widget.html', 'results.html'];
(async () => {
  await new Promise(r => server.listen(0, r)); const base = 'http://localhost:' + server.address().port + '/';
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); await ctx.addInitScript(() => { try { localStorage.setItem('wbscNoticeSeen', '1'); } catch (e) {} });
  const pg = await ctx.newPage(); const errors = []; pg.on('pageerror', e => errors.push(e.message));

  for (const f of PAGES) {
    await pg.goto(base + f);
    assert.strictEqual(await pg.locator('h1').count() >= 1, true, f + ' has a heading 1');
    assert.strictEqual(await pg.locator('main, [role="main"]').count() >= 1, true, f + ' has a main landmark');
    assert.ok(await pg.locator('a.skip-link, a[href="#main"], a[href^="#main"]').count() >= 1, f + ' has a skip link');
    assert.strictEqual(await pg.locator('.footer-col h4').count(), 0, f + ' footer headings are not level 4');
    const levels = await pg.$$eval('h1,h2,h3,h4,h5,h6', a => a.filter(e => e.offsetParent !== null).map(e => +e.tagName[1]));
    for (let i = 1; i < levels.length; i++) assert.ok(levels[i] - levels[i - 1] <= 1, f + ': heading levels jump ' + levels.slice(i - 1, i + 1).join('->') + ' at position ' + i);
    const noAlt = await pg.$$eval('img', a => a.filter(i => !i.hasAttribute('alt')).length); assert.strictEqual(noAlt, 0, f + ' every image has an alt attribute');
    const unlabelled = await pg.$$eval('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), select, textarea', a => a.filter(e => e.offsetParent !== null && !e.labels.length && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby')).map(e => e.id || e.name));
    assert.deepStrictEqual(unlabelled, [], f + ' every visible field has a label');
  }
  ok('every page: heading 1, main landmark, skip link, heading order without jumps, alt text, labelled fields');

  for (const f of PAGES) { const c = await b.newContext({ viewport: { width: 320, height: 700 } }); await c.addInitScript(() => { try { localStorage.setItem('wbscNoticeSeen', '1'); } catch (e) {} });
    const p = await c.newPage(); await p.goto(base + f); assert.ok(await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 1, f + ' scrolls sideways at 320px'); await c.close(); }
  ok('every page reflows to a 320px wide screen with no sideways scrolling');

  // language menu by keyboard
  await pg.goto(base + 'index.html?langs=all');
  assert.strictEqual(await pg.getAttribute('.lang-btn', 'aria-haspopup'), null);
  await pg.focus('.lang-btn'); await pg.keyboard.press('ArrowDown');
  assert.ok(await pg.isVisible('.lang-menu')); assert.strictEqual(await pg.evaluate(() => document.activeElement.className), 'lang-item');
  await pg.keyboard.press('ArrowDown'); assert.strictEqual(await pg.evaluate(() => document.activeElement.getAttribute('lang')), 'es');
  await pg.keyboard.press('End'); assert.strictEqual(await pg.evaluate(() => document.activeElement.getAttribute('lang')), 'zh');
  await pg.keyboard.press('ArrowDown'); assert.strictEqual(await pg.evaluate(() => document.activeElement.getAttribute('lang')), 'en');
  await pg.keyboard.press('Escape'); assert.ok(!(await pg.isVisible('.lang-menu'))); assert.strictEqual(await pg.evaluate(() => document.activeElement.className), 'lang-btn');
  ok('the language menu opens with the arrow keys, moves with arrows/Home/End and closes with Escape back to its button');

  // quiz answers by keyboard
  await pg.goto(base + 'assessment-widget.html'); await pg.fill('#inp-name', ''); await pg.click('[data-assessment="m01-mkc"]'); await pg.waitForSelector('#quiz-question', { state: 'visible' });
  assert.deepStrictEqual(await pg.$$eval('.quiz-option', a => a.map(x => x.tabIndex)), [0, -1, -1, -1], 'one tab stop for the answers');
  assert.strictEqual(await pg.getAttribute('#quiz-dots', 'aria-hidden'), 'true');
  await pg.focus('.quiz-option >> nth=0'); await pg.keyboard.press('ArrowDown');
  assert.deepStrictEqual(await pg.$$eval('.quiz-option', a => a.map(x => x.getAttribute('aria-checked'))), ['false', 'true', 'false', 'false']);
  assert.deepStrictEqual(await pg.$$eval('.quiz-option', a => a.map(x => x.tabIndex)), [-1, 0, -1, -1]);
  await pg.keyboard.press('ArrowUp'); await pg.keyboard.press('ArrowUp'); assert.strictEqual(await pg.evaluate(() => document.activeElement.querySelector('.opt-letter').textContent), 'D', 'arrows wrap round');
  await pg.keyboard.press('Home'); assert.strictEqual(await pg.evaluate(() => document.activeElement.querySelector('.opt-letter').textContent), 'A');
  assert.ok(await pg.isEnabled('#quiz-submit-btn'));
  await pg.click('#quiz-submit-btn'); await pg.click('#quiz-submit-btn');
  assert.strictEqual(await pg.evaluate(() => document.activeElement.id), 'quiz-question', 'focus moves to the next question');
  assert.deepStrictEqual(await pg.$$eval('.quiz-option', a => a.map(x => x.tabIndex)), [0, -1, -1, -1]);
  ok('quiz answers work from the keyboard (arrows, Home, wrap-around), one tab stop, and focus moves to each new question');
  assert.deepStrictEqual(errors, []);
  await b.close(); server.close(); console.log(n + ' accessibility checks passed');
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
