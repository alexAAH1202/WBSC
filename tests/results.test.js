// Browser tests for results.html (needs Playwright). Google's replies are simulated.
const http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  const type = f.endsWith('.woff2') ? 'font/woff2' : f.endsWith('.css') ? 'text/css' : f.endsWith('.svg') ? 'image/svg+xml' : 'text/html; charset=utf-8';
  fs.readFile(f, (e, d) => e ? (res.writeHead(404), res.end()) : (res.writeHead(200, { 'Content-Type': type }), res.end(d)));
});
const POST_URL = 'https://script.google.com/macros/s/AKfycbxm_gObsmIO7RUn1wcKS22r6Gsp0ccrhdm7kgVfmw9-DIDS4ndstk_DYtQAYL80DP0f/exec';
const reply = m => `<!doctype html><body><script>(function(){var m=${JSON.stringify(m)};var w=window;try{while(w!==w.top){w=w.parent;try{w.postMessage(m,"*");}catch(e){}}}catch(e){}})();<\/script>`;
const COLS = ['timestamp', 'name', 'email', 'umpireId', 'association', 'module', 'type', 'score', 'total', 'percent', 'attempt', 'result', 'emailStatus', 'receiptStatus'];
const PCA = 'Presentation Competency Assessment', KC = 'Manual Knowledge Check';
const now = Date.now(), day = 864e5;
const row = (ago, name, email, id, mod, type, pct, attempt, result, es, rs) =>
  [new Date(now - ago * day).toISOString(), name, email, id, 'NZ', mod, type, pct / 10, 10, pct, attempt, result, es || 'sent', rs || 'sent'];
const MODS = [1, 2, 3, 4, 5, 6].map(n => 'Module 0' + n + ' Something');
const ROWS = [];
MODS.forEach((m, i) => ROWS.push(row(10 - i, 'Alice Done', 'alice@x.com', 'A1', m, PCA, 90, 1, 'PASS')));
ROWS.push(row(3, 'Bob Stuck', 'bob@x.com', '', MODS[0], PCA, 60, 1, 'NOT PASSED'));
ROWS.push(row(2, 'Bob Stuck', 'bob@x.com', '', MODS[0], PCA, 70, 2, 'NOT PASSED', 'sent', 'FAILED: boom'));
ROWS.push(row(1, 'Cara Mid', 'cara@x.com', 'C9', MODS[1], PCA, 100, 1, 'PASS'));
ROWS.push(row(1, 'Cara M (same ID, new email)', 'cara2@y.com', 'C9', MODS[2], KC, 100, 1, 'PASS'));
ROWS.push(row(1, '<img src=x onerror=window.__xss=1>', 'evil@x.com', '', MODS[0], PCA, 100, 1, 'PASS'));
ROWS.push(row(1, '=HYPERLINK("http://e")', 'f@x.com', '', MODS[0], PCA, 100, 1, 'PASS'));
const CONFIG = { passMark: 85, maxAttempts: 2, totalModules: 6, completionType: PCA };
let n = 0; const ok = m => { console.log('  ok -', m); n++; };

async function open(b, handler) {
  const ctx = await b.newContext({ acceptDownloads: true }); await ctx.addInitScript(() => { try { localStorage.setItem('wbscNoticeSeen', '1'); } catch (e) {} }); const pg = await ctx.newPage(), hosts = new Set(), calls = [];
  pg.on('pageerror', e => console.log('PAGE ERROR', e.message));
  pg.on('request', r => { try { hosts.add(new URL(r.url()).host); } catch (e) {} });
  await pg.route(POST_URL, r => {
    const p = new URLSearchParams(r.request().postData() || ''); calls.push(Object.fromEntries(p));
    r.fulfill({ status: 200, contentType: 'text/html', body: reply(Object.assign({ wbscResults: true, id: p.get('id') }, handler(p))) });
  });
  await pg.goto('http://localhost:' + PORT + '/results.html');
  return { pg, hosts, calls };
}
const good = () => ({ success: true, cols: COLS, rows: ROWS, config: CONFIG });
let PORT;
(async () => {
  await new Promise(r => server.listen(0, r)); PORT = server.address().port;
  const b = await chromium.launch();
  try {
    // wrong password
    let { pg, calls } = await open(b, p => p.get('password') === 'right' ? good() : { success: false, code: 'wrong', error: 'That password is not right.' });
    assert(await pg.locator('meta[name=robots]').getAttribute('content') === 'noindex, nofollow'); ok('page is noindex');
    assert(/not the official WBSC website/i.test(await pg.textContent('body'))); ok('temporary-site notice present');
    await pg.fill('#pw', 'nope'); await pg.click('#login-btn');
    await pg.waitForFunction(() => /not right/.test(document.getElementById('login-msg').textContent));
    assert(await pg.isVisible('#login-view') && !(await pg.isVisible('#dash-view'))); ok('wrong password stays on login with message');
    assert.strictEqual(await pg.evaluate(() => sessionStorage.getItem('wbscResultsPw')), null); ok('wrong password not stored');

    // right password
    await pg.fill('#pw', 'right'); await pg.click('#login-btn'); await pg.waitForSelector('#dash-view', { state: 'visible' });
    assert.strictEqual(calls[calls.length - 1].action, 'results'); ok('posts action=results');
    const tiles = await pg.$$eval('.tile', t => t.map(x => x.querySelector('.k').textContent + '=' + x.querySelector('.v').textContent));
    // people: Alice, Bob, Cara (merged by ID), evil, formula = 5
    assert.deepStrictEqual(tiles.slice(0, 4), ['Umpires=5', 'Completed all 6=1', 'In progress=4', 'Need attention=1']); ok('tiles: ' + tiles.slice(0, 4).join(', '));
    assert.strictEqual(await pg.locator('#people-table .prow').count(), 5); ok('people merged by Umpire ID');
    assert.strictEqual(await pg.evaluate(() => window.__xss), undefined); ok('hostile name is not executed');
    assert(await pg.locator('#people-table').textContent().then(t => t.includes('<img src=x'))); ok('hostile name shown as text');
    // filters
    await pg.click('.chip[data-f=completed]'); assert.strictEqual(await pg.locator('#people-table .prow').count(), 1);
    await pg.click('.chip[data-f=attention]'); assert.strictEqual(await pg.locator('#people-table .prow').count(), 1);
    assert(/Bob Stuck/.test(await pg.textContent('#people-table'))); ok('filters: completed 1, attention = Bob');
    await pg.click('.chip[data-f=all]'); await pg.fill('#search', 'cara2@'); assert.strictEqual(await pg.locator('#people-table .prow').count(), 1); ok('search matches any of a person\'s emails');
    await pg.fill('#search', 'zzz'); assert(/No umpires match/.test(await pg.textContent('#people-table'))); ok('empty search message');
    await pg.fill('#search', 'alice');
    // detail
    await pg.click('.person-btn'); await pg.waitForSelector('.detail');
    const d = await pg.textContent('.detail');
    assert(/Completed all 6 modules on/.test(d) && (d.match(/Passed \(90%\)/g) || []).length === 6); ok('detail shows completion and 6 passes');
    // csv
    let [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('[data-act=csv-one]')]);
    assert(/^wbsc-summary-alice-done-\d{4}-\d\d-\d\d\.csv$/.test(dl.suggestedFilename())); ok('single-umpire CSV filename ' + dl.suggestedFilename());
    await pg.fill('#search', '');
    [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('#csv-summary-btn')]);
    const csv = fs.readFileSync(await dl.path(), 'utf8');
    assert(csv.includes("\"'=HYPERLINK(") && !/(^|,)"=HYPERLINK/m.test(csv)); ok('summary CSV neutralises formulas');
    assert(csv.split('\r\n').filter(Boolean).length === 6); ok('summary CSV has a header plus 5 people');
    [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('#csv-all-btn')]);
    assert(fs.readFileSync(await dl.path(), 'utf8').split('\r\n').filter(Boolean).length === ROWS.length + 1); ok('all-attempts CSV has every row');
    // print
    await pg.evaluate(() => { window.print = () => { window.__printed = true; }; });
    await pg.fill('#search', 'alice'); if (!(await pg.locator('.detail').count())) await pg.click('.person-btn');
    await pg.click('[data-act=print]');
    const sheet = await pg.textContent('#print-sheet');
    assert(await pg.evaluate(() => window.__printed) && /Alice Done/.test(sheet) && /not an official WBSC certificate/.test(sheet)); ok('print sheet built and print called');
    // attempts tab
    await pg.click('#tab-attempts'); assert(await pg.isVisible('#attempts-table'));
    assert(/Failed/.test(await pg.textContent('#attempts-table'))); ok('attempts tab flags a failed email');
    // logout
    await pg.click('#logout-btn'); assert(await pg.isVisible('#login-view')); assert.strictEqual(await pg.evaluate(() => sessionStorage.getItem('wbscResultsPw')), null); ok('logout clears the stored password');
    // only google hosts
    ({ pg, calls } = await open(b, () => ({ success: true, cols: COLS, rows: [], config: CONFIG })));
    await pg.fill('#pw', 'x'); await pg.click('#login-btn'); await pg.waitForSelector('#dash-view', { state: 'visible' });
    assert(/No results have been recorded/.test(await pg.textContent('#people-table'))); ok('empty data shows a friendly message');
    // stored password re-used on reload; lock message
    await pg.reload(); await pg.waitForSelector('#dash-view', { state: 'visible' }); ok('session password reloads the dashboard');
    // spoofed message
    const o = await open(b, () => ({ success: false, code: 'locked', error: 'Too many wrong passwords. Try again in 15 minutes.' }));
    await o.pg.fill('#pw', 'x'); await o.pg.click('#login-btn'); await o.pg.waitForFunction(() => /Too many/.test(document.getElementById('login-msg').textContent)); ok('lockout message shown');
    await o.pg.evaluate(() => window.postMessage({ wbscResults: true, id: 'x', success: true, cols: [], rows: [] }, '*'));
    await o.pg.waitForTimeout(200); assert(await o.pg.isVisible('#login-view')); ok('spoofed same-origin message ignored');
    // association filter, "went quiet", by-association table
    const withAssoc = (r, a) => { const c = r.slice(); c[4] = a; return c; };
    const ROWS2 = [
      ...MODS.map((m, i) => withAssoc(row(10 - i, 'Alice Done', 'alice@x.com', 'A1', m, PCA, 90, 1, 'PASS'), 'Australia')),
      withAssoc(row(3, 'Bob Stuck', 'bob@x.com', 'B1', MODS[0], PCA, 60, 1, 'NOT PASSED'), 'New Zealand'),
      withAssoc(row(2, 'Bob Stuck', 'bob@x.com', 'B1', MODS[0], PCA, 70, 2, 'NOT PASSED'), 'New Zealand'),
      withAssoc(row(30, 'Dan Quiet', 'dan@x.com', 'D1', MODS[0], PCA, 90, 1, 'PASS'), 'New Zealand'),
      withAssoc(row(5, 'Eve Active', 'eve@x.com', 'E1', MODS[0], PCA, 90, 1, 'PASS'), 'Australia'),
      withAssoc(row(1, 'Fay Nowhere', 'fay@x.com', 'F1', MODS[0], PCA, 90, 1, 'PASS'), '')
    ];
    const q = await open(b, p => p.get('password') === 'right' ? { success: true, cols: COLS, rows: ROWS2, config: CONFIG } : { success: false, code: 'wrong', error: 'no' });
    await q.pg.fill('#pw', 'right'); await q.pg.click('#login-btn'); await q.pg.waitForSelector('#dash-view', { state: 'visible' });
    const assoc = await q.pg.$$eval('#assoc-table tbody tr', a => a.map(r => [...r.children].map(c => c.textContent).join('|')));
    assert.deepStrictEqual(assoc, ['(none given)|1|0|1|0|0', 'Australia|2|1|1|0|0', 'New Zealand|2|0|1|1|1'], assoc.join(' ; ')); ok('by-association table counts completed, in progress, need attention and went quiet');
    const tiles2 = await q.pg.$$eval('#tiles .tile', a => a.map(t => t.querySelector('.k').textContent + '=' + t.querySelector('.v').textContent));
    assert.ok(tiles2.includes('Went quiet=1'), tiles2.join(',')); ok('a "Went quiet" tile counts people with no activity for 14 days');
    await q.pg.click('.chip[data-f=quiet]'); assert.strictEqual(await q.pg.locator('#people-table .prow').count(), 1); assert(/Dan Quiet/.test(await q.pg.textContent('#people-table'))); assert(/Went quiet/.test(await q.pg.textContent('#people-table'))); ok('the "Went quiet" filter lists only Dan, with a Went quiet badge');
    await q.pg.click('.chip[data-f=all]');
    await q.pg.selectOption('#assoc-filter', 'Australia'); assert.strictEqual(await q.pg.locator('#people-table .prow').count(), 2); assert.strictEqual(await q.pg.textContent('#shown'), '2 of 5 shown'); ok('the association filter narrows the list');
    await q.pg.click('.chip[data-f=progress]'); assert.strictEqual(await q.pg.locator('#people-table .prow').count(), 1); assert(/Eve Active/.test(await q.pg.textContent('#people-table'))); ok('the association filter combines with the status filter and the search');
    await q.pg.click('.chip[data-f=all]'); await q.pg.selectOption('#assoc-filter', '(none given)'); assert.strictEqual(await q.pg.locator('#people-table .prow').count(), 1); ok('umpires with no association can be filtered too');
    await q.pg.selectOption('#assoc-filter', ''); assert.strictEqual(await q.pg.locator('#people-table .prow').count(), 5);
    const [dl2] = await Promise.all([q.pg.waitForEvent('download'), q.pg.click('#csv-summary-btn')]); const csv2 = fs.readFileSync(await dl2.path(), 'utf8');
    assert(/"Needs attention","Went quiet","Last activity"/.test(csv2) && /"Dan Quiet".*"No","Yes"/.test(csv2)); ok('the summary CSV has a Went quiet column');
    const bad = [...o.hosts].filter(h => !/^localhost:|^script\.google\.com$/.test(h)); assert.deepStrictEqual(bad, []); ok('no requests to other hosts');
  } finally { await b.close(); server.close(); }
  console.log(n + ' checks passed');
})().catch(e => { console.error('FAIL', e); process.exit(1); });
