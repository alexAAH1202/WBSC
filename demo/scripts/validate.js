#!/usr/bin/env node
// Checks questions.js and the page <script>/<link> tags before the site is published.
// Run: node scripts/validate.js   (exits 1 on any error; warnings do not fail the build)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const errors = [];
const warnings = [];
const fail = m => errors.push(m);
const warn = m => warnings.push(m);

// ---- questions.js -------------------------------------------------------
let QUIZ;
try {
  QUIZ = vm.runInNewContext(fs.readFileSync(path.join(root, 'questions.js'), 'utf8') + '\n;QUIZ', {});
} catch (e) {
  console.error('questions.js does not run: ' + e.message);
  process.exit(1);
}

const CATEGORIES = ['general', 'plate', 'base', 'situations'];
const DIFFICULTIES = ['foundation', 'intermediate', 'advanced'];
const MIN_PER_GROUP = 3;

if (!(QUIZ.passMark > 0 && QUIZ.passMark <= 100)) fail('passMark must be a number from 1 to 100');
if (!/^https:\/\/\S+$/.test(QUIZ.WORKER_URL || '')) fail('WORKER_URL must be an https URL');
if (!QUIZ.title) fail('title is empty');
if (!Array.isArray(QUIZ.questions) || !QUIZ.questions.length) fail('questions is empty');

const seen = new Set();
const groups = {};
const positions = {};
for (const q of QUIZ.questions || []) {
  const at = `question ${q.id || '(no id)'}`;
  if (!q.id) fail(`${at}: missing id`);
  else if (seen.has(q.id)) fail(`${at}: duplicate id`);
  seen.add(q.id);
  if (!CATEGORIES.includes(q.category)) fail(`${at}: category must be one of ${CATEGORIES.join('|')}`);
  if (!DIFFICULTIES.includes(q.difficulty)) fail(`${at}: difficulty must be one of ${DIFFICULTIES.join('|')}`);
  if (typeof q.active !== 'boolean') fail(`${at}: active must be true or false`);
  for (const f of ['question', 'ruling', 'explanation', 'ruleRef', 'edition']) {
    if (typeof q[f] !== 'string' || !q[f].trim()) fail(`${at}: ${f} is missing or empty`);
  }
  if (!Array.isArray(q.options) || q.options.length < 2) {
    fail(`${at}: needs at least 2 options`);
  } else {
    if (q.options.some(o => typeof o !== 'string' || !o.trim())) fail(`${at}: an option is empty`);
    if (new Set(q.options).size !== q.options.length) fail(`${at}: duplicate options`);
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length) {
      fail(`${at}: correct must be a whole number from 0 to ${q.options.length - 1}`);
    } else if (q.active) {
      positions[q.correct] = (positions[q.correct] || 0) + 1;
    }
  }
  if (q.active) {
    const g = `${q.category}/${q.difficulty}`;
    groups[g] = (groups[g] || 0) + 1;
  }
}

for (const c of CATEGORIES) {
  for (const d of DIFFICULTIES) {
    const n = groups[`${c}/${d}`] || 0;
    if (n < MIN_PER_GROUP) warn(`${c}/${d} has ${n} active question(s); fewer than ${MIN_PER_GROUP} makes the pass mark very coarse`);
  }
}
const active = Object.values(positions).reduce((a, b) => a + b, 0);
const top = Math.max(0, ...Object.values(positions));
if (active >= 8 && top / active > 0.6) {
  warn(`${Math.round(top / active * 100)}% of correct answers sit in one position in questions.js (the quiz shuffles them for each attempt, but vary them anyway)`);
}

// ---- cache-busting versions must agree ----------------------------------
const versions = {};
const pages = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.name === '.git' || f.name === 'node_modules') continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.html')) pages.push(p);
  }
})(root);
for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8');
  for (const m of html.matchAll(/(?:src|href)="[^"]*\b(questions\.js|site\.js|site\.css)\?v=([^"]+)"/g)) {
    (versions[m[2]] = versions[m[2]] || []).push(`${path.relative(root, p)} (${m[1]})`);
  }
  for (const m of html.matchAll(/(?:src|href)="[^"?#]*\b(questions\.js|site\.js|site\.css)"/g)) {
    warn(`${path.relative(root, p)}: ${m[1]} has no ?v= cache-busting value`);
  }
}
if (Object.keys(versions).length > 1) {
  fail('the ?v= values differ between pages: ' + Object.entries(versions).map(([v, w]) => `${v} in ${w.join(', ')}`).join(' | '));
}

// ---- report -------------------------------------------------------------
warnings.forEach(w => console.warn('warning: ' + w));
errors.forEach(e => console.error('error: ' + e));
console.log(`${QUIZ.questions.length} questions checked, ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
