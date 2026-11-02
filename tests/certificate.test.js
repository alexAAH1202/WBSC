// The certificate template: the official PDF is present, still has its two fill-in fields, and the base64 copy the website
// loads (certificate/template.js) is up to date. Run: node tests/certificate.test.js
const fs = require('fs'), path = require('path'), assert = require('assert'), cp = require('child_process');
const { PDFDocument } = require('../vendor/pdf-lib.min.js');
(async () => {
  const pdf = fs.readFileSync(path.join(__dirname, '..', 'certificate', 'certificate-template.pdf'));
  const doc = await PDFDocument.load(pdf);
  assert.strictEqual(doc.getPageCount(), 1);
  assert.deepStrictEqual(doc.getForm().getFields().map(f => f.getName()).sort(), ['completion_date', 'umpire_name'], 'the certificate needs exactly the fields umpire_name and completion_date');
  assert.strictEqual(cp.spawnSync('node', [path.join(__dirname, 'certificate-build.js'), '--check']).status, 0, 'certificate/template.js is out of date: run node tests/certificate-build.js');
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'vendor', 'pdf-lib.LICENSE.md')), 'the pdf-lib licence must stay with the library');
  console.log('3 certificate checks passed');
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
