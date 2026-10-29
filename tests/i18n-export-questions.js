// Lists the English quiz text to translate as "id<TAB>text" lines (i18n/q-en.tsv). The id is assessment.question.field.
// Fields: q (question), o0..o3 (answer options, same order as in questions.js), why (explanation). Manual references stay in English.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const BANK = vm.runInNewContext(fs.readFileSync(path.join(root, 'questions.js'), 'utf8') + '\n;QUIZ_BANK', {});
const lines = [];
for (const k of Object.keys(BANK)) {
  const b = BANK[k];
  lines.push(`${k}.title\t${b.title}`, `${k}.nextLabel\t${b.nextLabel}`);
  b.questions.forEach((q, i) => {
    lines.push(`${k}.${i}.q\t${q.q}`);
    q.options.forEach((o, j) => lines.push(`${k}.${i}.o${j}\t${o}`));
    if (q.why) lines.push(`${k}.${i}.why\t${q.why}`);
  });
}
fs.writeFileSync(path.join(root, 'i18n', 'src', 'q-en.tsv'), lines.join('\n') + '\n');
console.log(lines.length + ' strings');
