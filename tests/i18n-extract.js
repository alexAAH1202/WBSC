// Lists every English string that needs a translation: text on the pages and the messages in the page scripts.
// Run: node tests/i18n-extract.js   (writes i18n/en-strings.json; needs Playwright)
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const PAGES = ['index.html', 'manuals.html', 'presentations.html', 'assessment-widget.html', 'privacy.html'];   // results.html is the Director's page and stays in English
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  const type = f.endsWith('.woff2') ? 'font/woff2' : f.endsWith('.css') ? 'text/css' : f.endsWith('.js') ? 'text/javascript' : f.endsWith('.svg') ? 'image/svg+xml' : 'text/html; charset=utf-8';
  fs.readFile(f, (e, d) => e ? (res.writeHead(404), res.end()) : (res.writeHead(200, { 'Content-Type': type }), res.end(d)));
});
function messages() {
  const out = new Set();
  for (const f of ['assessment-widget.html', 'notice.js', 'i18n.js']) {
    const src = fs.readFileSync(path.join(root, f), 'utf8');
    for (const m of src.matchAll(/\bT\(\s*('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")/g)) { try { out.add(new Function('return ' + m[1])().replace(/\s+/g, ' ').trim()); } catch (e) { console.error('skip', m[1]); } }
  }
  // server messages that a learner can see (translated through S() in the widget)
  ['Please verify your email address first.', 'Too many codes have been requested for this address. Please wait a while and try again.', 'The service is busy. Please try again in a few minutes.',
   'We could not send the email. Please check the address and try again.', 'That code has expired or was not requested. Please ask for a new one.', 'Too many wrong codes. Please ask for a new one.',
   'Something went wrong. Please try again.', 'Invalid email address', 'Invalid session. Please verify your email address with a code first.'].forEach(s => out.add(s));
  return [...out];
}
(async () => {
  await new Promise(r => server.listen(0, r)); const base = 'http://localhost:' + server.address().port + '/';
  const b = await chromium.launch(); const pg = await (await b.newContext()).newPage();
  const result = { pages: {}, messages: messages() }; const all = new Set(result.messages);
  for (const f of PAGES) {
    await pg.goto(base + f);
    const strings = await pg.evaluate(() => {
      const keys = new Set();
      WBSC_I18N.units(document.body, (el, key) => keys.add(key));
      WBSC_I18N.attrs(document.body, (el, a, key) => keys.add(key));
      const d = document.querySelector('meta[name="description"]'); if (d) keys.add(WBSC_I18N.norm(d.getAttribute('content')));
      keys.add(WBSC_I18N.norm(document.title));
      return [...keys];
    });
    result.pages[f] = strings; strings.forEach(s => all.add(s));
  }
  // strings added by i18n.js itself (kept last so the earlier numbering stays stable)
  ['This page is translated from English. The manuals and presentations are in English. If the translation and the English text differ, the English text applies.'].forEach(s => { all.add(s); result.messages.push(s); });
  // keep the numbering of the strings already listed (translations are numbered by position); new strings go last
  let previous = []; try { previous = JSON.parse(fs.readFileSync(path.join(root, 'i18n', 'en-strings.json'), 'utf8')).all; } catch (e) {}
  const order = previous.filter(s => all.has(s)).length === previous.length ? previous.slice() : previous.slice();
  const inPrev = new Set(previous); const added = [...all].filter(s => !inPrev.has(s));
  result.stale = previous.filter(s => !all.has(s));
  result.all = previous.concat(added);
  if (added.length) console.log('new strings (appended): ' + added.length + '\n  ' + added.join('\n  '));
  if (result.stale.length) console.log('no longer on the pages (kept so numbering stays): ' + result.stale.length);
  fs.writeFileSync(path.join(root, 'i18n', 'en-strings.json'), JSON.stringify(result, null, 1));
  console.log(PAGES.map(f => f + ': ' + result.pages[f].length).join('\n') + '\nmessages: ' + result.messages.length + '\nunique strings: ' + result.all.length);
  await b.close(); server.close();
})();
