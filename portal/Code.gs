/**
 * WBSC Umpire Mechanics Training: Assessment Results receiver AND host for
 * the embeddable Assessments widget used on the Google Site.
 *
 * Order of operations (matches the design brief):
 *   Complete assessment -> Save result -> Confirm save -> Send email -> Success.
 *
 *   1. Receives a completed result. The widget POSTs a hidden <form> (field
 *      "payload", a JSON string) into a hidden iframe, because Google Sites'
 *      Content Security Policy blocks fetch()/XHR but allows form posts.
 *   2. Validates it and saves it as a new row. This is the permanent record.
 *   3. Replies with a tiny page that postMessage()s the outcome to the
 *      widget (the browser cannot read a cross-origin iframe's reply any
 *      other way). The widget shows "recorded" only when this arrives.
 *   4. Only THEN emails the program administrator. A mail failure is caught,
 *      logged and written to the "Email Status" column; it never changes or
 *      hides the saved row.
 *   5. On a plain GET, serves assessment-widget.html (embeddable in Sites).
 *
 * Retries are safe: each result carries a "submissionId". If it is already in
 * the sheet, no second row or email is created and the original attempt
 * number is returned.
 *
 * SETUP and RE-DEPLOY: see portal/README.md. Re-deploying after any edit:
 * Deploy -> Manage deployments -> pencil -> New version -> Deploy.
 */

// Who is notified of every completed assessment.
var DIRECTOR_EMAIL = 'umpiredirector@wbscoceania.org';

var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/158AIqlbHMG7E55nMTk5r8wtZ2ujpYZpybIOmL95tCwI/edit';

// Column order. The first 14 are the existing sheet; the last two are new and
// their headers are added automatically to an existing sheet.
var COLUMNS = [
  'Timestamp',                 //  1
  'Participant Name',          //  2
  'Participant Email',         //  3
  'Umpire ID',                 //  4
  'Association / Federation',  //  5
  'Module',                    //  6
  'Assessment Type',           //  7
  'Score',                     //  8
  'Total Questions',           //  9
  'Percentage',                // 10
  'Completion Status',         // 11
  'Attempt Number',            // 12
  'Completion Date/Time',      // 13
  'Program / Manual Version',  // 14
  'Submission ID',             // 15 (new)
  'Email Status',              // 16 (new)
  'Result'                     // 17 (new): PASS or NOT PASSED, decided here from the score
];
var COL_ATTEMPT = 12, COL_SUBMISSION = 15, COL_EMAIL_STATUS = 16, COL_RESULT = 17;

// Pass mark (percent) and the most attempts allowed for each assessment (per
// person, module and assessment type). Both are enforced here, on the server.
var PASS_MARK = 85;
var MAX_ATTEMPTS = 2;
// Contact shown to a learner who has used all their attempts.
var CONTACT_EMAIL = 'umpiredirector@wbscoceania.org';

var MAX_TEXT = 200;
var MAX_QUESTIONS = 100;

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'attempts') return attemptsReply_(p);
  try {
    return HtmlService.createHtmlOutputFromFile('assessment-widget')
      .setTitle('Assessment - WBSC Umpire Mechanics Training')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    // The page is hosted on GitHub now; this project no longer needs to serve it.
    return ContentService.createTextOutput('WBSC Umpire Mechanics Training results service.');
  }
}

// How many attempts someone has used on one assessment. Returned as JSONP
// (callback=fn) so the page can read it with a <script> tag from any origin.
// Only counts for the one person/module/type asked about are returned.
function attemptsReply_(p) {
  var out;
  try {
    var probe = {
      email: text_(p.email), umpireId: idText_(p.umpireId),
      module: text_(p.module), assessmentType: text_(p.type)
    };
    if (!probe.module || !probe.assessmentType || (!probe.email && !probe.umpireId)) throw new Error('Missing details');
    var info = attemptInfo_(getSheet_(), probe);
    out = { ok: true, attempts: info.count, max: MAX_ATTEMPTS, remaining: Math.max(0, MAX_ATTEMPTS - info.count),
            passed: info.passed, passMark: PASS_MARK };
  } catch (err) {
    out = { ok: false, error: 'Could not check attempts' };
  }
  var cb = String(p.callback || '');
  var json = JSON.stringify(out);
  if (/^[A-Za-z_$][A-Za-z0-9_$]{0,40}$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var viaForm = !!(e && e.parameter && e.parameter.payload);
  var data = null, result = { success: false }, emailNeeded = null;

  try {
    var raw = viaForm ? e.parameter.payload
      : (e && e.postData && e.postData.contents) ? e.postData.contents : '';
    data = JSON.parse(raw);
    var clean = validate_(data);               // throws a user-readable Error if bad
    result.submissionId = clean.submissionId;

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var sheet = getSheet_();
      ensureHeaders_(sheet);

      var existing = findSubmission_(sheet, clean.submissionId);
      if (existing) {
        // A retry of a result that is already saved: confirm it, do nothing else.
        result.success = true;
        result.duplicate = true;
        result.attemptNumber = sheet.getRange(existing, COL_ATTEMPT).getValue();
        result.result = String(sheet.getRange(existing, COL_RESULT).getValue() || '');
        result.passed = result.result === 'PASS';
        result.maxAttempts = MAX_ATTEMPTS;
      } else if (attemptInfo_(sheet, clean).count >= MAX_ATTEMPTS) {
        // Hard limit: nothing is saved or emailed.
        result.success = false;
        result.code = 'max_attempts';
        result.attemptNumber = null;
        result.maxAttempts = MAX_ATTEMPTS;
        result.error = 'You have already used the maximum of ' + MAX_ATTEMPTS + ' attempts for this assessment. Please contact ' + CONTACT_EMAIL + '.';
      } else {
        var attemptNumber = attemptInfo_(sheet, clean).count + 1;
        var now = new Date();
        sheet.appendRow([
          now, clean.name, clean.email, clean.umpireId, clean.association,
          clean.module, clean.assessmentType, clean.score, clean.total, clean.percentage,
          clean.completionStatus, attemptNumber, now, clean.programVersion,
          clean.submissionId, 'pending', clean.result
        ]);
        var rowIndex = sheet.getLastRow();
        result.success = true;
        result.attemptNumber = attemptNumber;
        result.result = clean.result;
        result.passed = clean.passed;
        result.maxAttempts = MAX_ATTEMPTS;
        emailNeeded = { clean: clean, attemptNumber: attemptNumber, rowIndex: rowIndex };
      }
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    result.success = false;
    result.error = userMessage_(err);
    console.error('doPost failed: ' + err);
  }

  var response = viaForm ? replyPage_(result) : replyJson_(result);

  // The result is saved and the reply is built. Now the email. This runs after
  // the confirmation is prepared and in its own try/catch, so a mail problem
  // can never undo or hide a saved result.
  if (emailNeeded) {
    var status;
    try {
      sendAdminNotification_(emailNeeded.clean, emailNeeded.attemptNumber);
      status = 'sent';
    } catch (mailErr) {
      status = 'FAILED: ' + String(mailErr).slice(0, 150);
      console.error('Admin notification email failed: ' + mailErr);
    }
    try {
      getSheet_().getRange(emailNeeded.rowIndex, COL_EMAIL_STATUS).setValue(status);
    } catch (e2) { /* the row is saved; a stale status is harmless */ }
  }
  return response;
}

// ---------------------------------------------------------------- replies

// Page returned into the widget's hidden iframe. It tells every ancestor
// window the outcome. The widget only accepts messages from Google origins
// and only for the submissionId it sent.
function replyPage_(result) {
  var msg = {
    wbscSave: true,
    success: !!result.success,
    submissionId: result.submissionId || '',
    attemptNumber: result.attemptNumber || null,
    duplicate: !!result.duplicate,
    result: result.result || '',
    passed: !!result.passed,
    maxAttempts: result.maxAttempts || MAX_ATTEMPTS,
    code: result.code || '',
    error: result.error || ''
  };
  var json = JSON.stringify(msg).replace(/</g, '\\u003c');
  var html = '<!doctype html><html><body><script>' +
    '(function(){var m=' + json + ';var w=window;' +
    'try{while(w!==w.top){w=w.parent;try{w.postMessage(m,"*");}catch(e){}}}catch(e){}})();' +
    '<\/script></body></html>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Kept for any older client that still POSTs raw JSON. "ok" and "success" are
// both returned so either spelling of the check works.
function replyJson_(result) {
  result.ok = result.success;
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function userMessage_(err) {
  var m = String(err && err.message ? err.message : err);
  return /^(Missing|Invalid)/.test(m) ? m : 'The server could not save the result';
}

// ------------------------------------------------------------- validation

function validate_(data) {
  if (!data || typeof data !== 'object') throw new Error('Invalid request');
  var c = {};
  c.submissionId = String(data.submissionId || '').trim();
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(c.submissionId)) throw new Error('Invalid submission id');

  c.name = text_(data.participantName);
  c.email = text_(data.participantEmail);
  if (!c.name) throw new Error('Missing participant name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) throw new Error('Invalid participant email');

  c.umpireId = idText_(data.umpireId);
  c.association = text_(data.association);
  c.module = text_(data.module);
  c.assessmentType = text_(data.assessmentType);
  if (!c.module || !c.assessmentType) throw new Error('Missing module or assessment type');

  var score = Number(data.score), total = Number(data.totalQuestions);
  if (!(isFinite(score) && isFinite(total) && total >= 1 && total <= MAX_QUESTIONS &&
        score >= 0 && score <= total && score === Math.floor(score) && total === Math.floor(total))) {
    throw new Error('Invalid score');
  }
  c.score = score;
  c.total = total;
  c.percentage = Math.round(score / total * 100);   // computed here; the client's figure is not trusted
  c.passed = score * 100 >= PASS_MARK * total;      // exact, so 84.6% can never round up to a pass
  c.result = c.passed ? 'PASS' : 'NOT PASSED';
  c.completionStatus = text_(data.completionStatus) || 'Complete';
  c.programVersion = text_(data.programVersion) || '2026-2029';
  return c;
}

// Trim, cap the length, and stop text from being read as a spreadsheet formula.
function text_(v) {
  var s = String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, MAX_TEXT);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

// Umpire IDs are stored as text so "007" does not become the number 7.
function idText_(v) {
  var s = text_(v);
  return /^\d+$/.test(s) ? "'" + s : s;
}

// ------------------------------------------------------------------ sheet

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName('Sheet1') || ss.getSheets()[0];
}

// Writes the header row on an empty sheet, and adds any missing trailing
// headers (Submission ID, Email Status) to a sheet created before they existed.
function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
    return;
  }
  var have = sheet.getRange(1, 1, 1, COLUMNS.length).getValues()[0];
  for (var i = 0; i < COLUMNS.length; i++) {
    if (!have[i]) sheet.getRange(1, i + 1).setValue(COLUMNS[i]);
  }
}

function findSubmission_(sheet, submissionId) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var ids = sheet.getRange(2, COL_SUBMISSION, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === submissionId) return i + 2;
  }
  return 0;
}

function norm_(v) {
  return String(v == null ? '' : v).replace(/^'/, '').trim().toLowerCase();
}

// Looks at earlier rows for the same person (by email OR umpire ID), module and
// assessment type. Comparisons ignore case and spacing, and treat numbers and
// text alike. Returns { count, passed }. The client's attempt number is ignored.
function attemptInfo_(sheet, c) {
  var last = sheet.getLastRow();
  if (last < 2) return { count: 0, passed: false };
  var rows = sheet.getRange(2, 2, last - 1, 6).getValues(); // B:G = Name, Email, UmpireID, Assoc, Module, Type
  var results = sheet.getRange(2, COL_RESULT, last - 1, 1).getValues();
  var email = norm_(c.email), id = norm_(c.umpireId), mod = norm_(c.module), type = norm_(c.assessmentType);
  var count = 0, passed = false;
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var same = (email && norm_(r[1]) === email) || (id && norm_(r[2]) === id);
    if (same && norm_(r[4]) === mod && norm_(r[5]) === type) {
      count++;
      if (String(results[i][0]) === 'PASS') passed = true;
    }
  }
  return { count: count, passed: passed };
}

// ------------------------------------------------------------------ email

function sendAdminNotification_(c, attemptNumber) {
  var subject = 'WBSC Umpire Training - ' + c.result + ': ' + c.name + ' - ' + c.module;
  var body =
    'A WBSC Umpire Mechanics Training assessment has been completed.\n\n' +
    'Participant: ' + c.name + '\n' +
    'Email: ' + c.email + '\n' +
    'Umpire ID: ' + c.umpireId.replace(/^'/, '') + '\n' +
    'Association / Federation: ' + c.association + '\n' +
    'Module: ' + c.module + '\n' +
    'Assessment type: ' + c.assessmentType + '\n' +
    'Score: ' + c.score + ' / ' + c.total + ' (' + c.percentage + '%)\n' +
    'Result: ' + c.result + ' (pass mark ' + PASS_MARK + '%)\n' +
    'Attempt number: ' + attemptNumber + ' of ' + MAX_ATTEMPTS + '\n' +
    'Completed: ' + new Date().toString() + '\n\n' +
    'Full results: ' + SPREADSHEET_URL;
  MailApp.sendEmail(DIRECTOR_EMAIL, subject, body);
}
