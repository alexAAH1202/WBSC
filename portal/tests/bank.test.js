// Structural checks on the question bank inside assessment-widget.html.
// Run: node portal/tests/bank.test.js   (exit 1 on any error; warnings do not fail)
const fs = require('fs'), path = require('path'), vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'assessment-widget.html'), 'utf8');
const a = html.indexOf('var QUIZ_BANK'), b = html.indexOf('var shuffleOptions') > -1 ? -1 : -1;
const end = html.indexOf('// Answer options are shuffled');
const BANK = vm.runInNewContext(html.slice(a, end) + '\n;QUIZ_BANK', {});

const errors = [], warnings = [];
const modules = ['m01', 'm02', 'm03', 'm04', 'm05', 'm06'];
const expected = { mkc: 5, pca: 10 };
for (const m of modules) for (const t of ['mkc', 'pca']) {
  const key = `${m}-${t}`, bank = BANK[key];
  if (!bank) { errors.push(`${key}: missing assessment`); continue; }
  for (const f of ['module', 'moduleShort', 'kind', 'title', 'nextLabel', 'nextHref']) if (!bank[f]) errors.push(`${key}: ${f} is empty`);
  if (bank.questions.length !== expected[t]) errors.push(`${key}: ${bank.questions.length} questions, expected ${expected[t]}`);
  if (/claude\.ai/.test(bank.nextHref)) warnings.push(`${key}: "Continue" links to a private claude.ai page`);
  bank.questions.forEach((q, i) => {
    const at = `${key} Q${i + 1}`;
    if (!q.q || !q.q.trim()) errors.push(`${at}: empty question`);
    if (!q.ref || !q.ref.trim()) errors.push(`${at}: no manual reference`);
    if (!Array.isArray(q.options) || q.options.length < 2) { errors.push(`${at}: needs 2+ options`); return; }
    if (q.options.some(o => !String(o).trim())) errors.push(`${at}: empty option`);
    if (new Set(q.options).size !== q.options.length) errors.push(`${at}: duplicate options`);
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length) errors.push(`${at}: correct out of range`);
    if (q.options.some(o => /\b(all|none) of the above\b/i.test(o))) errors.push(`${at}: option depends on position, which breaks shuffling`);
  });
}
// Required page furniture: the temporary-site disclosure, a privacy page that exists, and no ./ brand link.
const NOTICE = /This is not the official WBSC website/;
for (const f of ['assessment-widget.html', 'index.html', 'privacy.html']) {
  const fp = path.join(__dirname, '..', f);
  if (!fs.existsSync(fp)) { errors.push(f + ' is missing'); continue; }
  const h = fs.readFileSync(fp, 'utf8');
  if (!NOTICE.test(h)) errors.push('temporary-site notice is missing from ' + f);
  if (/claude\.ai/.test(h) && f !== 'assessment-widget.html') errors.push(f + ' links to a private claude.ai page');
  for (const m of h.matchAll(/href="([^"#]+\.html)(#[^"]*)?"/g)) {
    if (!fs.existsSync(path.join(__dirname, '..', m[1]))) errors.push(`${f}: link to missing page ${m[1]}`);
  }
}
// every module link on the home page must land on a real section of the assessments page
const home = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
for (const m of home.matchAll(/assessment-widget\.html#(module-\d+)/g)) {
  if (!html.includes(`id="${m[1]}"`)) errors.push('home page links to missing section ' + m[1]);
}
if (!/href="privacy\.html"/.test(html)) errors.push('assessment page does not link to privacy.html');
if (/class="brand" href="\.\/?"/.test(html)) errors.push('brand link points at a directory with no index page');
const extra = Object.keys(BANK).filter(k => !modules.some(m => k.startsWith(m)));
if (extra.length) errors.push('unexpected assessments: ' + extra.join(', '));
const dups = {}; Object.values(BANK).forEach(x => x.questions.forEach(q => { dups[q.q] = (dups[q.q] || 0) + 1; }));
Object.entries(dups).filter(([, n]) => n > 1).forEach(([q]) => errors.push('duplicate question text: ' + q.slice(0, 60)));

warnings.forEach(w => console.warn('warning: ' + w));
errors.forEach(e => console.error('error: ' + e));
const total = Object.values(BANK).reduce((n, x) => n + x.questions.length, 0);
console.log(`${Object.keys(BANK).length} assessments, ${total} questions, ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
