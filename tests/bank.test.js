// Structural checks on the question bank inside assessment-widget.html.
// Run: node portal/tests/bank.test.js   (exit 1 on any error; warnings do not fail)
const fs = require('fs'), path = require('path'), vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'assessment-widget.html'), 'utf8');
const BANK = vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'questions.js'), 'utf8') + '\n;QUIZ_BANK', {});
if (!/<script src="questions\.js"><\/script>/.test(html)) { console.error('assessment-widget.html does not load questions.js'); process.exit(1); }

const errors = [], warnings = [];
const modules = ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08'];
const hasPractice = m => true;   // every module has a practice Knowledge Check
const minimum = { mkc: 5, pca: 10 };   // more is fine: the pass mark is 85% of however many there are
const kinds = { mkc: 'Manual Knowledge Check', pca: 'Presentation Competency Assessment' };
for (const m of modules) for (const t of hasPractice(m) ? ['mkc', 'pca'] : ['pca']) {
  const key = `${m}-${t}`, bank = BANK[key];
  if (!bank) { errors.push(`${key}: missing assessment`); continue; }
  for (const f of ['module', 'moduleShort', 'kind', 'title', 'nextLabel', 'nextHref']) if (!bank[f]) errors.push(`${key}: ${f} is empty`);
  // A pool: `draw` questions are asked each attempt, chosen from all of `questions` (see assessment-widget.html).
  if (bank.draw !== undefined && (!Number.isInteger(bank.draw) || bank.draw < minimum[t] || bank.draw > bank.questions.length)) errors.push(`${key}: draw must be a whole number from ${minimum[t]} up to the number of questions`);
  if (bank.draw !== undefined && t === 'mkc') errors.push(`${key}: practice quizzes do not use a draw`);
  const asked = bank.draw || bank.questions.length;
  if (bank.drawGroups) {
    let sum = 0;
    for (const [g, n] of Object.entries(bank.drawGroups)) { const have = bank.questions.filter(q => q.group === g).length; sum += n; if (!(Number.isInteger(n) && n >= 1 && n <= have)) errors.push(`${key}: drawGroups ${g} asks ${n} but has ${have}`); }
    const rest = bank.questions.filter(q => !q.group).length;
    if (sum >= asked || rest < asked - sum) errors.push(`${key}: drawGroups leave ${asked - sum} to draw from ${rest} ungrouped questions`);
  }
  if (asked < minimum[t]) errors.push(`${key}: ${asked} questions asked, at least ${minimum[t]} needed`);
  if (asked > 100) errors.push(`${key}: more than 100 questions asked (Code.gs MAX_QUESTIONS)`);
  if (bank.questions.length > 200) errors.push(`${key}: more than 200 questions in the pool`);
  if (['m05', 'm06', 'm07', 'm08'].includes(m) && t === 'pca' && !/^presentations\.html#pres-/.test(bank.watchFirst || '')) errors.push(`${key}: watchFirst must link to its presentation`);
  if (!new RegExp('^Module 0' + m.slice(2) + ' ').test(bank.module.replace(/\\u2014/g, '-'))) errors.push(`${key}: module name does not start with its number`);
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
    if (t === 'pca') { if (q.correct !== undefined) errors.push(`${at}: a marked question must not carry its answer (the site is public; the server holds the key)`); }
    else if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length) errors.push(`${at}: correct out of range`);
    if (q.shuffle !== undefined && q.shuffle !== false) errors.push(`${at}: shuffle may only be false`);
    if (q.options.some(o => /\b(all|none) of the above\b/i.test(o)) && q.shuffle !== false) errors.push(`${at}: option depends on position: add shuffle: false`);
    if (q.statements !== undefined && (!Array.isArray(q.statements) || q.statements.length < 2 || q.statements.some(t => typeof t !== 'string' || !t.trim()))) errors.push(`${at}: statements must be a list of 2 or more`);
  });
}
// The private answer key (not in the repo): present on the owner's machine, absent in CI. When present it must fit the questions exactly.
const priv = path.join(__dirname, '..', 'private', 'answers.json');
if (fs.existsSync(priv)) {
  try { require('./answer-key-build.js').build(BANK, JSON.parse(fs.readFileSync(priv, 'utf8'))); } catch (e) { errors.push('private/answers.json: ' + e.message); }
} else warnings.push('private/answers.json not found: the answer key was not checked (it is not stored in the repository)');
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
// A question may appear twice only as the same question in a module's practice quiz and its marked pool (the reviewers chose
// this for Module 01); that question then shows its answer in practice. Anywhere else a repeat is an error.
const seenQ = {};
Object.keys(BANK).forEach(k => BANK[k].questions.forEach(q => { (seenQ[q.q] = seenQ[q.q] || []).push({ k, q }); }));
Object.entries(seenQ).filter(([, l]) => l.length > 1).forEach(([t, l]) => {
  const ok = l.length === 2 && l[0].k.slice(0, 3) === l[1].k.slice(0, 3) && l[0].k !== l[1].k;
  if (!ok) errors.push('duplicate question text: ' + t.slice(0, 60));
  else warnings.push(`${l[0].k.slice(0, 3)}: practice question also in the marked pool (its answer is shown in practice): ${t.slice(0, 50)}`);
});

warnings.forEach(w => console.warn('warning: ' + w));
errors.forEach(e => console.error('error: ' + e));
const total = Object.values(BANK).reduce((n, x) => n + x.questions.length, 0);
console.log(`${Object.keys(BANK).length} assessments, ${total} questions, ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
