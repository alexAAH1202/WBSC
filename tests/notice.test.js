// Browser test for the cookies / privacy pop-up (notice.js). Needs Playwright.
const http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  const type = f.endsWith('.woff2') ? 'font/woff2' : f.endsWith('.css') ? 'text/css' : f.endsWith('.js') ? 'text/javascript' : f.endsWith('.svg') ? 'image/svg+xml' : 'text/html; charset=utf-8';
  fs.readFile(f, (e, d) => e ? (res.writeHead(404), res.end()) : (res.writeHead(200, { 'Content-Type': type }), res.end(d)));
});
let n = 0; const ok = m => { console.log('  ok -', m); n++; };
(async () => {
  await new Promise(r => server.listen(0, r)); const base = 'http://localhost:' + server.address().port + '/';
  const b = await chromium.launch(); const ctx = await b.newContext(); const pg = await ctx.newPage();
  const errors = []; pg.on('pageerror', e => errors.push(e.message));
  for (const f of ['index.html', 'manuals.html', 'presentations.html', 'assessment-widget.html', 'privacy.html', 'results.html']) {
    await pg.evaluate(() => localStorage.clear()).catch(() => {});
    await pg.goto(base + f); await pg.evaluate(() => localStorage.removeItem('wbscNoticeSeen')); await pg.reload();
    assert.ok(await pg.isVisible('.cookie-note'), f + ' shows the pop-up'); 
  }
  ok('the pop-up shows on all six pages for a new visitor');
  assert.deepStrictEqual(await ctx.cookies(), [], 'no cookies are set'); ok('no cookies are set');
  assert.ok(/does not use cookies or tracking/.test(await pg.textContent('.cookie-note'))); assert.strictEqual(await pg.getAttribute('.cookie-note', 'role'), 'region');
  assert.strictEqual(await pg.getAttribute('.cookie-note a', 'href'), 'privacy.html'); ok('it says what the site does and links to the privacy page');
  assert.ok(await pg.isVisible('.cookie-note') && (await pg.locator('.cookie-note').boundingBox()).width < 400, 'a small card, not a full-screen overlay'); ok('it is a small card that does not block the page');
  await pg.click('.cookie-note button'); assert.strictEqual(await pg.locator('.cookie-note').count(), 0); ok('OK dismisses it');
  await pg.goto(base + 'index.html'); assert.strictEqual(await pg.locator('.cookie-note').count(), 0);
  await pg.goto(base + 'assessment-widget.html'); assert.strictEqual(await pg.locator('.cookie-note').count(), 0); ok('it stays dismissed on other pages and later visits');
  assert.deepStrictEqual(await ctx.cookies(), []); assert.deepStrictEqual(errors, []); ok('still no cookies and no script errors');
  // phone width
  const ph = await (await b.newContext({ viewport: { width: 375, height: 700 } })).newPage(); await ph.goto(base + 'index.html');
  const box = await ph.locator('.cookie-note').boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= 375 && box.y + box.height <= 700); ok('it fits on a phone screen');
  // storage blocked: still works
  const ctx3 = await b.newContext(); await ctx3.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  const p3 = await ctx3.newPage(); await p3.goto(base + 'index.html'); assert.ok(await p3.isVisible('.cookie-note')); await p3.click('.cookie-note button'); assert.strictEqual(await p3.locator('.cookie-note').count(), 0); ok('works even when browser storage is blocked');
  await b.close(); server.close(); console.log(n + ' notice checks passed');
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
