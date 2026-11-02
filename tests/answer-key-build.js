// Builds the ANSWER_KEY value for the Apps Script (Script property) from questions.js + the private answers.
//   node tests/answer-key-build.js            -> writes private/ANSWER_KEY.json and prints a summary
// The answers for the marked assessments are NOT in the public repo. They live in private/answers.json (git-ignored):
//   { "m01-pca": [correctIndex for question 1, for question 2, ...], ... }   (index into that question's options, in the order written in questions.js)
// To rebuild that file from the last public version that still had them:  git show b481983:questions.js > /tmp/old-questions.js
//   node tests/answer-key-build.js --from-legacy /tmp/old-questions.js
// Each question is fingerprinted from its text and options, so the server refuses a result if the page and the key disagree
// (for example after a question was edited and the key not updated).
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const load = f => vm.runInNewContext(fs.readFileSync(f, 'utf8') + '\n;QUIZ_BANK', {});
function fp(q) { let h = 0x811c9dc5, s = q.q + '|' + q.options.join('|'); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('00000000' + h.toString(16)).slice(-8); }
function build(bank, answers) {
  const key = {};
  Object.keys(bank).filter(k => /-pca$/.test(k)).forEach(k => {
    const qs = bank[k].questions, a = answers[k];
    if (!a || a.length !== qs.length) throw new Error(`${k}: ${a ? a.length : 0} answers for ${qs.length} questions`);
    qs.forEach((q, i) => { if (!(Number.isInteger(a[i]) && a[i] >= 0 && a[i] < q.options.length)) throw new Error(`${k} Q${i + 1}: answer out of range`); });
    key[k] = { draw: bank[k].draw || qs.length, f: qs.map(fp), c: a.slice() };
  });
  return key;
}
module.exports = { fp, build };
if (require.main === module) {
  const bank = load(path.join(root, 'questions.js'));
  const legacy = process.argv.indexOf('--from-legacy');
  if (legacy > 0) {
    const old = load(process.argv[legacy + 1]), a = {};
    Object.keys(old).filter(k => /-pca$/.test(k)).forEach(k => { a[k] = old[k].questions.map(q => q.correct); });
    fs.mkdirSync(path.join(root, 'private'), { recursive: true });
    fs.writeFileSync(path.join(root, 'private', 'answers.json'), JSON.stringify(a));
  }
  const answers = JSON.parse(fs.readFileSync(path.join(root, 'private', 'answers.json'), 'utf8'));
  const key = build(bank, answers);
  fs.writeFileSync(path.join(root, 'private', 'ANSWER_KEY.json'), JSON.stringify(key));
  console.log(Object.keys(key).length + ' assessments, ' + Object.values(key).reduce((n, k) => n + k.c.length, 0) + ' answers -> private/ANSWER_KEY.json (' + JSON.stringify(key).length + ' characters)');
}
