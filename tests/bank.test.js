// Structural checks on the question bank inside assessment-widget.html.
// Run: node portal/tests/bank.test.js   (exit 1 on any error; warnings do not fail)
const fs = require('fs'), path = require('path'), vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'assessment-widget.html'), 'utf8');
const BANK = vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'questions.js'), 'utf8') + '\n;QUIZ_BANK', {});
if (!/<script src="questions\.js"><\/script>/.test(html)) { console.error('assessment-widget.html does not load questions.js'); process.exit(1); }

const errors = [], warnings = [];
const modules = ['m01', 'm02', 'm03', 'm04', 'm05', 'm06'];
const minimum = { mkc: 5, pca: 10 };   // more is fine: the pass mark is 85% of however many there are
const kinds = { mkc: 'Manual Knowledge Check', pca: 'Presentation Competency Assessment' };
for (const m of modules) for (const t of ['mkc', 'pca']) {
  const key = `${m}-${t}`, bank = BANK[key];
  if (!bank) { errors.push(`${key}: missing assessment`); continue; }
  for (const f of ['module', 'moduleShort', 'kind', 'title', 'nextLabel', 'nextHref']) if (!bank[f]) errors.push(`${key}: ${f} is empty`);
  if (bank.questions.length < minimum[t]) errors.push(`${key}: ${bank.questions.length} questions, at least ${minimum[t]} needed`);
  if (bank.questions.length > 100) errors.push(`${key}: more than 100 questions (Code.gs MAX_QUESTIONS)`);
  if (bank.kind !== kinds[t]) errors.push(`${key}: kind is "${bank.kind}", expected "${kinds[t]}"`);
  if (/claude\.ai/.test(bank.nextHref)) warnings.push(`${key}: "Continue" links to a private claude.ai page`);
  bank.questions.forEach((q, i) => {
    const at = `${key} Q${i + 1}`;
    if (!q.q || !q.q.trim()) errors.push(`${at}: empty question`);
    if (!q.ref || !q.ref.trim()) errors.push(`${at}: no manual reference`);
    if (q.why !== undefined && (typeof q.why !== 'string' || !q.why.trim())) errors.push(`${at}: why must be a non-empty string if present`);
    if (!Array.isArray(q.options) || q.options.length < 2) { errors.push(`${at}: needs 2+ options`); return; }
    if (q.options.some(o => !String(o).trim())) errors.push(`${at}: empty option`);
    if (new Set(q.options).size !== q.options.length) errors.push(`${at}: duplicate options`);
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length) errors.push(`${at}: correct out of range`);
    if (q.options.some(o => /\b(all|none) of the above\b/i.test(o))) errors.push(`${at}: option depends on position, which breaks shuffling`);
  });
}
// Required page furniture: the temporary-site disclosure, a privacy page that exists, and no ./ brand link.
const NOTICE = /This is not the official WBSC website/;
for (const f of ['assessment-widget.html', 'index.html', 'privacy.html', 'presentations.html', 'manuals.html', 'results.html']) {
  const fp = path.join(__dirname, '..', f);
  if (!fs.existsSync(fp)) { errors.push(f + ' is missing'); continue; }
  const h = fs.readFileSync(fp, 'utf8');
  if (!NOTICE.test(h)) errors.push('temporary-site notice is missing from ' + f);
  if (/claude\.ai/.test(h) && f !== 'assessment-widget.html') errors.push(f + ' links to a private claude.ai page');
  for (const m of h.matchAll(/href="([^"#]+\.html)(#[^"]*)?"/g)) {
    if (!fs.existsSync(path.join(__dirname, '..', m[1]))) errors.push(`${f}: link to missing page ${m[1]}`);
  }
}
// links into the assessments or presentations pages must name a real assessment / section
const presHtml = fs.readFileSync(path.join(__dirname, '..', 'presentations.html'), 'utf8');
for (const f of ['assessment-widget.html', 'index.html', 'privacy.html', 'presentations.html', 'manuals.html', 'results.html']) {
  const h = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  for (const m of h.matchAll(/assessment-widget\.html#assessment-([a-z0-9-]+)/g)) {
    if (!BANK[m[1]]) errors.push(`${f}: link to unknown assessment ${m[1]}`);
  }
  for (const m of h.matchAll(/presentations\.html#([a-z0-9-]+)/g)) {
    if (!presHtml.includes(`id="${m[1]}"`)) errors.push(`${f}: link to missing presentation section ${m[1]}`);
  }
}
const extra = Object.keys(BANK).filter(k => !modules.some(m => k.startsWith(m)));
if (extra.length) errors.push('unexpected assessments: ' + extra.join(', '));
const dups = {}; Object.values(BANK).forEach(x => x.questions.forEach(q => { dups[q.q] = (dups[q.q] || 0) + 1; }));
Object.entries(dups).filter(([, n]) => n > 1).forEach(([q]) => errors.push('duplicate question text: ' + q.slice(0, 60)));

warnings.forEach(w => console.warn('warning: ' + w));
errors.forEach(e => console.error('error: ' + e));
const total = Object.values(BANK).reduce((n, x) => n + x.questions.length, 0);
console.log(`${Object.keys(BANK).length} assessments, ${total} questions, ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
