/**
 * WBSC Umpire Mechanics Training: results service (Google Apps Script Web App).
 *
 * What it does
 *   - Saves each marked result as a row in the results Sheet. The server, not the
 *     browser, decides PASS / NOT PASSED (85%) and refuses a third attempt.
 *   - Email login: a learner must prove they control their email address with a
 *     one-time code before a result can be saved or their attempts looked up.
 *   - Emails the Director of Umpires about every result, and the learner a receipt.
 *     When a learner passes the last module the Director also gets a completion
 *     summary and the learner's receipt includes one.
 *   - Serves the Director's results page (password protected) its data.
 *   - Alerts the owner when something fails, and sends a daily health check.
 *
 * Order of operations for a result (matches the design brief):
 *   Complete assessment -> Save result -> Confirm save -> Send emails -> Success.
 *   An email problem never undoes or hides a saved result.
 *
 * Browser <-> server: the pages post a hidden <form> into a hidden <iframe> and the
 * reply page postMessage()s its answer to the page. (A browser cannot read a
 * cross-origin iframe's reply any other way, and this works wherever the site is
 * hosted.) Attempts are looked up with a <script> tag (JSONP).
 *
 * SETUP (once), see README.md:
 *   1. Paste this file into the Apps Script project, Save.
 *   2. Project Settings -> Script properties -> add RESULTS_PASSWORD (the Director's
 *      password). Optional: ALERT_EMAIL (default: the owner of this script) and
 *      HEALTH_REPORT = problems (default: a daily report even when all is well).
 *   3. Run installTriggers() once from the editor and approve the permissions.
 *   4. Run sendTestAlert() once and check the email arrives.
 *   5. Deploy -> Manage deployments -> pencil -> New version -> Deploy (keep the
 *      existing deployment so the URL does not change).
 */

// ------------------------------------------------------------------ settings

// Who is notified of every completed assessment and of program completions.
var DIRECTOR_EMAIL = 'umpiredirector@wbscoceania.org';
// Shown to a learner who has used all their attempts.
var CONTACT_EMAIL = 'umpiredirector@wbscoceania.org';

var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/158AIqlbHMG7E55nMTk5r8wtZ2ujpYZpybIOmL95tCwI/edit';

// Pass mark (percent) and the most attempts allowed for each assessment (per
// person, module and assessment type). Both are enforced here, on the server.
var PASS_MARK = 85;
var MAX_ATTEMPTS = 2;

// A learner has completed the program when they have PASSED this assessment
// for every one of these modules.
var TOTAL_MODULES = 8;   // Modules 01-08: the four Foundations modules, Appendix 4 (05) and Appendix 5a, 5b, 5c (06, 07, 08)
var COMPLETION_TYPE = 'Presentation Competency Assessment';

// Require a verified email (one-time code) to save a result or look up attempts.
var REQUIRE_VERIFIED = true;

// One-time code login. The cache can hold values for at most 6 hours.
var CODE_TTL_S = 600;            // a code lasts 10 minutes
var CODE_MAX_TRIES = 5;          // wrong guesses before the code is thrown away
var CODE_EMAIL_HOURLY = 3;       // codes per email address per hour
var CODE_EMAIL_6H = 6;           // ... and per 6 hours
var CODE_GLOBAL_HOURLY = 60;     // codes for everyone per hour (protects the mail quota)
var SESSION_TTL_S = 21600;       // a verified session lasts 6 hours

// Director's results page.
var RESULTS_FAIL_LIMIT = 10;     // wrong passwords ...
var RESULTS_FAIL_WINDOW_S = 900; // ... within 15 minutes lock the page ...
var RESULTS_LOCK_S = 900;        // ... for 15 minutes
var RESULTS_MAX_ROWS = 5000;

// Health check.
var HEALTH_MIN_MAIL_QUOTA = 20;
var HEALTH_PENDING_MINUTES = 30;

// Column order. Columns 1-14 are the original sheet; 15-18 are added automatically.
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
  'Submission ID',             // 15
  'Email Status',              // 16 notification to the Director
  'Result',                    // 17 PASS or NOT PASSED, decided here from the score
  'Receipt Status'             // 18 receipt to the learner
];
var COL_ATTEMPT = 12, COL_SUBMISSION = 15, COL_EMAIL_STATUS = 16, COL_RESULT = 17, COL_RECEIPT_STATUS = 18;

var MAX_TEXT = 200;
var MAX_QUESTIONS = 100;
var MIN_SECONDS_PER_QUESTION = 2;   // bot check: a result sent faster than this per question is refused

// ------------------------------------------------------------------ entry points

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'attempts') return attemptsReply_(p);
  try {
    return HtmlService.createHtmlOutputFromFile('assessment-widget')
      .setTitle('Assessment - WBSC Umpire Mechanics Training')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    // The pages are hosted on GitHub now; this project no longer needs to serve them.
    return ContentService.createTextOutput('WBSC Umpire Mechanics Training results service.');
  }
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'sendCode') return handleSendCode_(p);
  if (p.action === 'verifyCode') return handleVerifyCode_(p);
  if (p.action === 'results') return handleResults_(p);
  return handleSave_(e);
}

// ------------------------------------------------------------------ replies

// A tiny page returned into the caller's hidden iframe. It tells every ancestor
// window the answer. The pages only accept messages from Google origins and only
// for the request id they sent.
function messagePage_(msg) {
  // JSON is escaped so nothing in a message can end the script block or the line.
  var json = JSON.stringify(msg).replace(/</g, '\\u003c')
    .split(String.fromCharCode(8232)).join('\\u2028').split(String.fromCharCode(8233)).join('\\u2029');
  var html = '<!doctype html><html><body><script>' +
    '(function(){var m=' + json + ';var w=window;' +
    'try{while(w!==w.top){w=w.parent;try{w.postMessage(m,"*");}catch(e){}}}catch(e){}})();' +
    '<\/script></body></html>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function saveMessage_(result) {
  return {
    wbscSave: true,
    success: !!result.success,
    submissionId: result.submissionId || '',
    attemptNumber: result.attemptNumber || null,
    duplicate: !!result.duplicate,
    result: result.result || '',
    passed: !!result.passed,
    completedAll: !!result.completedAll,
    maxAttempts: result.maxAttempts || MAX_ATTEMPTS,
    code: result.code || '',
    error: result.error || ''
  };
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

// ------------------------------------------------------------------ attempts lookup

// How many attempts a verified learner has used on one assessment. Returned as
// JSONP (callback=fn) so a <script> tag can read it from any origin. Only the
// counts for that learner, module and type are returned.
function attemptsReply_(p) {
  var out;
  try {
    var email = sessionEmail_(p.token);
    if (REQUIRE_VERIFIED && !email) {
      out = { ok: false, code: 'auth', error: 'Please verify your email address first.' };
    } else {
      var probe = {
        email: REQUIRE_VERIFIED ? email : text_(p.email), umpireId: idText_(p.umpireId),
        module: text_(p.module), assessmentType: text_(p.type)
      };
      if (!probe.module || !probe.assessmentType || (!probe.email && !probe.umpireId)) throw new Error('Missing details');
      var info = attemptInfo_(getSheet_(), probe);
      out = { ok: true, attempts: info.count, max: MAX_ATTEMPTS, remaining: Math.max(0, MAX_ATTEMPTS - info.count),
              passed: info.passed, passMark: PASS_MARK };
    }
  } catch (err) {
    logError_('attempts', err);
    out = { ok: false, error: 'Could not check attempts' };
  }
  var cb = String(p.callback || '');
  var json = JSON.stringify(out);
  if (/^[A-Za-z_$][A-Za-z0-9_$]{0,40}$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

// ------------------------------------------------------------------ email login

function handleSendCode_(p) {
  var msg = { wbscAuth: true, id: String(p.id || '').slice(0, 64), action: 'sendCode', success: false };
  try {
    if (String(p.website || '') !== '') {   // honeypot: people never see or fill this field, so pretend it worked
      msg.success = true; msg.expiresIn = CODE_TTL_S;
      return messagePage_(msg);
    }
    var email = cleanEmail_(p.email);
    if (!rateHit_('codeH:' + sha_(email), CODE_EMAIL_HOURLY, 3600) ||
        !rateHit_('code6:' + sha_(email), CODE_EMAIL_6H, 21600)) {
      msg.code = 'rate';
      msg.error = 'Too many codes have been requested for this address. Please wait a while and try again.';
      return messagePage_(msg);
    }
    if (!rateHit_('codeG', CODE_GLOBAL_HOURLY, 3600)) {
      alertOwner_('code-flood', 'Unusually many login codes requested',
        'More than ' + CODE_GLOBAL_HOURLY + ' login codes were requested within an hour. Further requests are being refused until the hour passes. This protects the daily email limit; it may be a bot.');
      msg.code = 'rate';
      msg.error = 'The service is busy. Please try again in a few minutes.';
      return messagePage_(msg);
    }
    var code = newCode_();
    cachePutJson_('code:' + sha_(email), { h: sha_(code + ':' + email), tries: 0 }, CODE_TTL_S);
    MailApp.sendEmail(email, 'Your WBSC training verification code: ' + code,
      'Your verification code is ' + code + '\n\n' +
      'Enter it on the WBSC Umpire Mechanics Training site to confirm this email address. ' +
      'It expires in ' + Math.round(CODE_TTL_S / 60) + ' minutes and can be used once.\n\n' +
      'If you did not ask for this code, ignore this email: nothing happens unless the code is entered.\n\n' +
      'This is a temporary training site and is not the official WBSC website.');
    msg.success = true;
    msg.expiresIn = CODE_TTL_S;
  } catch (err) {
    var m = String(err && err.message ? err.message : err);
    if (/^Invalid/.test(m)) {
      msg.error = m;
    } else {
      logError_('sendCode', err);
      alertOwner_('send-code', 'A login code email could not be sent', String(err).slice(0, 300));
      msg.error = 'We could not send the email. Please check the address and try again.';
    }
  }
  return messagePage_(msg);
}

function handleVerifyCode_(p) {
  var msg = { wbscAuth: true, id: String(p.id || '').slice(0, 64), action: 'verifyCode', success: false };
  try {
    var email = cleanEmail_(p.email);
    var code = String(p.code || '').replace(/\s+/g, '');
    var key = 'code:' + sha_(email);
    var entry = cacheGetJson_(key);
    if (!entry) {
      msg.code = 'expired';
      msg.error = 'That code has expired or was not requested. Please ask for a new one.';
    } else if (entry.tries >= CODE_MAX_TRIES) {
      cacheRemove_(key);
      msg.code = 'expired';
      msg.error = 'Too many wrong codes. Please ask for a new one.';
    } else if (/^\d{6}$/.test(code) && sameText_(entry.h, sha_(code + ':' + email))) {
      cacheRemove_(key);
      var token = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
      cachePutJson_('sess:' + sha_(token), { email: email }, SESSION_TTL_S);
      msg.success = true;
      msg.token = token;
      msg.email = email;
      msg.expiresIn = SESSION_TTL_S;
    } else {
      entry.tries++;
      cachePutJson_(key, entry, CODE_TTL_S);
      msg.code = 'wrong';
      msg.error = 'That code is not right. ' + Math.max(0, CODE_MAX_TRIES - entry.tries) + ' tries left.';
    }
  } catch (err) {
    var m = String(err && err.message ? err.message : err);
    if (/^Invalid/.test(m)) {
      msg.error = m;
    } else {
      logError_('verifyCode', err);
      msg.error = 'Something went wrong. Please try again.';
    }
  }
  return messagePage_(msg);
}

// The verified email behind a session token, or '' if there is none.
function sessionEmail_(token) {
  var t = String(token || '');
  if (!/^[a-f0-9]{64}$/.test(t)) return '';
  var s = cacheGetJson_('sess:' + sha_(t));
  return s && s.email ? String(s.email) : '';
}

function cleanEmail_(v) {
  var e = String(v == null ? '' : v).trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(e)) throw new Error('Invalid email address');
  return e;
}

function newCode_() {
  var n = parseInt(Utilities.getUuid().replace(/-/g, '').slice(0, 8), 16);
  return ('000000' + (n % 1000000)).slice(-6);
}

// ------------------------------------------------------------------ save a result

function handleSave_(e) {
  var viaForm = !!(e && e.parameter && e.parameter.payload);
  var data = null, result = { success: false }, post = null;

  try {
    var raw = viaForm ? e.parameter.payload
      : (e && e.postData && e.postData.contents) ? e.postData.contents : '';
    data = JSON.parse(raw);
    if (!data || typeof data !== 'object') throw new Error('Invalid request');
    result.submissionId = String(data.submissionId || '').slice(0, 64);

    if (REQUIRE_VERIFIED) {
      var verified = sessionEmail_(data.token);
      if (!verified) {
        result.code = 'auth';
        throw new Error('Invalid session. Please verify your email address with a code first.');
      }
      data.participantEmail = verified;   // results are always recorded against the verified address
    }
    var clean = validate_(data);               // throws a user-readable Error if bad

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
        result.completedAll = completionSummary_(sheet, clean).passedCount >= TOTAL_MODULES;
      } else if (attemptInfo_(sheet, clean).count >= MAX_ATTEMPTS) {
        // Hard limit: nothing is saved or emailed.
        result.success = false;
        result.code = 'max_attempts';
        result.attemptNumber = null;
        result.maxAttempts = MAX_ATTEMPTS;
        result.error = 'You have already used the maximum of ' + MAX_ATTEMPTS + ' attempts for this assessment. Please contact ' + CONTACT_EMAIL + '.';
      } else {
        var before = completionSummary_(sheet, clean);
        var attemptNumber = attemptInfo_(sheet, clean).count + 1;
        var now = new Date();
        sheet.appendRow([
          now, clean.name, clean.email, clean.umpireId, clean.association,
          clean.module, clean.assessmentType, clean.score, clean.total, clean.percentage,
          clean.completionStatus, attemptNumber, now, clean.programVersion,
          clean.submissionId, 'pending', clean.result, 'pending'
        ]);
        var rowIndex = sheet.getLastRow();
        var after = completionSummary_(sheet, clean);
        result.success = true;
        result.attemptNumber = attemptNumber;
        result.result = clean.result;
        result.passed = clean.passed;
        result.maxAttempts = MAX_ATTEMPTS;
        result.completedAll = after.passedCount >= TOTAL_MODULES;
        post = {
          clean: clean, attemptNumber: attemptNumber, rowIndex: rowIndex, summary: after,
          completedNow: after.passedCount >= TOTAL_MODULES && before.passedCount < TOTAL_MODULES
        };
      }
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    result.success = false;
    result.error = userMessage_(err);
    if (!/^(Missing|Invalid)/.test(String(err && err.message ? err.message : err))) {
      logError_('save', err);
      alertOwner_('save-error', 'A result could not be saved', String(err).slice(0, 300));
    }
  }

  var response = viaForm ? messagePage_(saveMessage_(result)) : replyJson_(result);

  // The result is saved and the reply is built. Now the emails, each in its own
  // try/catch so a mail problem can never undo or hide a saved result.
  if (post) sendAfterSave_(post);
  return response;
}

function sendAfterSave_(post) {
  var directorStatus, receiptStatus;
  try {
    sendAdminNotification_(post.clean, post.attemptNumber);
    directorStatus = 'sent';
  } catch (mailErr) {
    directorStatus = 'FAILED: ' + String(mailErr).slice(0, 150);
    logError_('director-email', mailErr);
    alertOwner_('director-mail', 'The Director\'s result email failed',
      'A result was saved but the notification to ' + DIRECTOR_EMAIL + ' could not be sent: ' + String(mailErr).slice(0, 300) +
      '\nSee the "Email Status" column in the Sheet.');
  }
  try {
    sendReceipt_(post.clean, post.attemptNumber, post.summary);
    receiptStatus = 'sent';
  } catch (mailErr2) {
    receiptStatus = 'FAILED: ' + String(mailErr2).slice(0, 150);
    logError_('receipt-email', mailErr2);
    alertOwner_('receipt-mail', 'A learner receipt email failed',
      'A result was saved but the receipt could not be sent: ' + String(mailErr2).slice(0, 300) +
      '\nSee the "Receipt Status" column in the Sheet.');
  }
  if (post.completedNow) {
    try {
      sendCompletionNotice_(post.clean, post.summary);
    } catch (mailErr3) {
      logError_('completion-email', mailErr3);
      alertOwner_('completion-mail', 'A program completion email failed',
        'A learner passed all ' + TOTAL_MODULES + ' modules but the completion notice to ' + DIRECTOR_EMAIL + ' could not be sent: ' + String(mailErr3).slice(0, 300));
    }
  }
  try {
    var sheet = getSheet_();
    sheet.getRange(post.rowIndex, COL_EMAIL_STATUS).setValue(directorStatus);
    sheet.getRange(post.rowIndex, COL_RECEIPT_STATUS).setValue(receiptStatus);
  } catch (e2) { /* the row is saved; a stale status is harmless (the health check flags it) */ }
}

// ------------------------------------------------------------------ validation

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
  // Only the marked assessment is recorded. Manual Knowledge Checks are practice and are never saved.
  if (c.assessmentType.toLowerCase() !== COMPLETION_TYPE.toLowerCase()) throw new Error('Invalid assessment type: only the ' + COMPLETION_TYPE + ' is recorded');

  var score = Number(data.score), total = Number(data.totalQuestions);
  if (!(isFinite(score) && isFinite(total) && total >= 1 && total <= MAX_QUESTIONS &&
        score >= 0 && score <= total && score === Math.floor(score) && total === Math.floor(total))) {
    throw new Error('Invalid score');
  }
  var elapsed = Number(data.elapsedSeconds);
  if (String(data.website || '') !== '' || !(isFinite(elapsed) && elapsed >= MIN_SECONDS_PER_QUESTION * total)) {
    throw new Error('Invalid submission: the assessment was completed too quickly to be a real attempt');
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
// headers to a sheet created before they existed.
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

// "Module 03 - Foundations ..." -> 3
function moduleNumber_(s) {
  var m = /^\s*module\s*0*(\d+)/i.exec(String(s || ''));
  return m ? parseInt(m[1], 10) : 0;
}

// For one person (email OR umpire ID): how each module's marked assessment stands.
// Returns { modules: { 1: {n, module, attempts, passed, best, passedAt}, ... }, passedCount }
function completionSummary_(sheet, c) {
  var modules = {}, passedCount = 0;
  var last = sheet.getLastRow();
  if (last >= 2) {
    var rows = sheet.getRange(2, 1, last - 1, COLUMNS.length).getValues();
    var email = norm_(c.email), id = norm_(c.umpireId), type = norm_(COMPLETION_TYPE);
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var same = (email && norm_(r[2]) === email) || (id && norm_(r[3]) === id);
      if (!same || norm_(r[6]) !== type) continue;
      var n = moduleNumber_(r[5]);
      if (!n || n > TOTAL_MODULES) continue;
      var m = modules[n] || (modules[n] = { n: n, module: '', attempts: 0, passed: false, best: 0, passedAt: null });
      m.module = String(r[5]);
      m.attempts++;
      var pct = Number(r[9]) || 0;
      if (pct > m.best) m.best = pct;
      if (String(r[16]) === 'PASS' && !m.passed) { m.passed = true; m.passedAt = r[0]; }
    }
  }
  for (var k in modules) if (modules[k].passed) passedCount++;
  return { modules: modules, passedCount: passedCount };
}

function summaryLines_(summary) {
  var lines = [];
  for (var n = 1; n <= TOTAL_MODULES; n++) {
    var m = summary.modules[n];
    var label = 'Module ' + ('0' + n).slice(-2) + ': ';
    if (!m) lines.push(label + 'not attempted yet');
    else if (m.passed) lines.push(label + 'PASSED (' + m.best + '%, ' + m.attempts + ' attempt' + (m.attempts === 1 ? '' : 's') + ' used)');
    else lines.push(label + 'not passed yet (best ' + m.best + '%, ' + m.attempts + ' of ' + MAX_ATTEMPTS + ' attempts used)');
  }
  return lines.join('\n');
}

// ------------------------------------------------------------------ emails

function sendAdminNotification_(c, attemptNumber) {
  var subject = 'WBSC Umpire Training - ' + c.result + ': ' + c.name + ' - ' + c.module;
  var body =
    'A WBSC Umpire Mechanics Training assessment has been completed.\n\n' +
    'Participant: ' + c.name + '\n' +
    'Email (verified): ' + c.email + '\n' +
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

// The learner's receipt for one marked attempt.
function sendReceipt_(c, attemptNumber, summary) {
  var left = MAX_ATTEMPTS - attemptNumber;
  var next;
  if (c.passed) next = 'You have passed this assessment.';
  else if (left > 0) next = 'You did not reach the pass mark. You have ' + left + ' attempt' + (left === 1 ? '' : 's') + ' left for this assessment. Revisit the manual and presentation before trying again.';
  else next = 'You did not reach the pass mark and have used all ' + MAX_ATTEMPTS + ' attempts. Please contact ' + CONTACT_EMAIL + '.';
  var complete = summary.passedCount >= TOTAL_MODULES;
  var body =
    'Hello ' + c.name + ',\n\n' +
    'This is your receipt from the WBSC Umpire Mechanics Training site.\n\n' +
    'Module: ' + c.module + '\n' +
    'Assessment: ' + c.assessmentType + '\n' +
    'Score: ' + c.score + ' / ' + c.total + ' (' + c.percentage + '%)\n' +
    'Result: ' + c.result + ' (pass mark ' + PASS_MARK + '%)\n' +
    'Attempt: ' + attemptNumber + ' of ' + MAX_ATTEMPTS + '\n' +
    'Date and time: ' + new Date().toString() + '\n' +
    'Reference: ' + c.submissionId.slice(0, 8).toUpperCase() + '\n\n' +
    next + '\n\n' +
    (complete ? 'You have now passed all ' + TOTAL_MODULES + ' modules. Congratulations!\n\n' : '') +
    'Your progress so far:\n' + summaryLines_(summary) + '\n\n' +
    'This is an automated receipt from a temporary training site. It is not an official WBSC certificate and the site is not the official WBSC website. ' +
    'Questions: ' + CONTACT_EMAIL + '.';
  MailApp.sendEmail(c.email, 'Your WBSC Umpire Mechanics Training receipt: ' + c.module + ' - ' + c.result, body);
}

// To the Director, once, when a learner passes the last required module.
function sendCompletionNotice_(c, summary) {
  var body =
    c.name + ' has passed all ' + TOTAL_MODULES + ' modules of the WBSC Umpire Mechanics Training.\n\n' +
    'Participant: ' + c.name + '\n' +
    'Email (verified): ' + c.email + '\n' +
    'Umpire ID: ' + c.umpireId.replace(/^'/, '') + '\n' +
    'Association / Federation: ' + c.association + '\n' +
    'Completed: ' + new Date().toString() + '\n\n' +
    'Module results:\n' + summaryLines_(summary) + '\n\n' +
    'Full results: ' + SPREADSHEET_URL;
  MailApp.sendEmail(DIRECTOR_EMAIL, 'WBSC Umpire Training - PROGRAM COMPLETED: ' + c.name, body);
}

// ------------------------------------------------------------------ Director's results page

// Returns the data for the Director's page, only for the right password.
function handleResults_(p) {
  var msg = { wbscResults: true, id: String(p.id || '').slice(0, 64), success: false };
  try {
    var expected = PropertiesService.getScriptProperties().getProperty('RESULTS_PASSWORD');
    if (!expected) {
      msg.code = 'not_configured';
      msg.error = 'The results password has not been set up yet. Add RESULTS_PASSWORD in the Apps Script project settings.';
      return messagePage_(msg);
    }
    if (cacheGetJson_('rlock')) {
      msg.code = 'locked';
      msg.error = 'Too many incorrect attempts. Please try again in 15 minutes.';
      return messagePage_(msg);
    }
    if (!sameText_(sha_(String(p.password || '')), sha_(expected))) {
      if (!rateHit_('rfail', RESULTS_FAIL_LIMIT, RESULTS_FAIL_WINDOW_S)) {
        cachePutJson_('rlock', { at: Date.now() }, RESULTS_LOCK_S);
        alertOwner_('results-lock', 'The results page was locked after repeated wrong passwords',
          'There were ' + RESULTS_FAIL_LIMIT + ' wrong passwords within ' + Math.round(RESULTS_FAIL_WINDOW_S / 60) + ' minutes. The results page is locked for ' + Math.round(RESULTS_LOCK_S / 60) + ' minutes. If this was not the Director, someone may be guessing the password: consider changing RESULTS_PASSWORD.');
      }
      msg.code = 'wrong';
      msg.error = 'Incorrect password.';
      return messagePage_(msg);
    }
    cacheRemove_('rfail');
    var sheet = getSheet_();
    var last = sheet.getLastRow();
    var rows = [];
    if (last >= 2) {
      var first = Math.max(2, last - RESULTS_MAX_ROWS + 1);
      var values = sheet.getRange(first, 1, last - first + 1, COLUMNS.length).getValues();
      for (var i = 0; i < values.length; i++) {
        var r = values[i], t = r[0];
        var ts = t instanceof Date ? t.toISOString() : String(t || '');
        rows.push([ts, String(r[1]), String(r[2]), norm_(r[3]) === '' ? '' : String(r[3]), String(r[4]), String(r[5]), String(r[6]),
          Number(r[7]), Number(r[8]), Number(r[9]), Number(r[11]) || 0, String(r[16] || ''), String(r[15] || ''), String(r[17] || '')]);
      }
    }
    msg.success = true;
    msg.cols = ['timestamp', 'name', 'email', 'umpireId', 'association', 'module', 'type', 'score', 'total', 'percent', 'attempt', 'result', 'emailStatus', 'receiptStatus'];
    msg.rows = rows;
    msg.truncated = last - 1 > RESULTS_MAX_ROWS;
    msg.config = { passMark: PASS_MARK, maxAttempts: MAX_ATTEMPTS, totalModules: TOTAL_MODULES, completionType: COMPLETION_TYPE };
  } catch (err) {
    logError_('results', err);
    alertOwner_('results-error', 'The results page failed to load', String(err).slice(0, 300));
    msg.error = 'The results could not be loaded. The owner has been told.';
  }
  return messagePage_(msg);
}

// ------------------------------------------------------------------ alerts and health check

function alertEmail_() {
  var configured = PropertiesService.getScriptProperties().getProperty('ALERT_EMAIL');
  return configured || Session.getEffectiveUser().getEmail();
}

// Emails the owner. At most one email per `key` per hour, so a repeating fault
// cannot flood the inbox or use up the daily mail limit. Never throws.
function alertOwner_(key, subject, detail) {
  try {
    if (!rateHit_('alert:' + key, 1, 3600)) return;
    MailApp.sendEmail(alertEmail_(), '[WBSC portal] ' + subject,
      detail + '\n\nWhen: ' + new Date().toString() + '\nSheet: ' + SPREADSHEET_URL +
      '\nExecutions: open the Apps Script project and choose Executions.');
  } catch (e) {
    console.error('Could not send alert: ' + e);
  }
}

// Keeps a small per-day error count so the daily check can report it.
function logError_(where, err) {
  console.error(where + ': ' + err);
  try {
    var props = PropertiesService.getScriptProperties();
    var log = JSON.parse(props.getProperty('errlog') || '{}');
    var day = new Date().toISOString().slice(0, 10);
    var entry = log[day] || { n: 0, last: '' };
    entry.n++;
    entry.last = (where + ': ' + String(err)).slice(0, 200);
    log[day] = entry;
    var keep = Object.keys(log).sort().slice(-7), pruned = {};
    for (var i = 0; i < keep.length; i++) pruned[keep[i]] = log[keep[i]];
    props.setProperty('errlog', JSON.stringify(pruned));
  } catch (e) { /* logging must never break a request */ }
}

// Runs every day (see installTriggers). Emails the owner a short report, and
// flags anything that needs attention.
function dailyHealthCheck() {
  var problems = [], notes = [];
  var props = PropertiesService.getScriptProperties();
  var now = Date.now();
  try {
    var sheet = getSheet_();
    var last = sheet.getLastRow();
    var header = last >= 1 ? sheet.getRange(1, 1, 1, COLUMNS.length).getValues()[0] : [];
    for (var h = 0; h < COLUMNS.length; h++) {
      if (String(header[h]) !== COLUMNS[h]) { problems.push('The Sheet header is not as expected: column ' + (h + 1) + ' should be "' + COLUMNS[h] + '". Saving may be failing.'); break; }
    }
    var recent = 0, passes = 0, failedMail = 0, failedReceipt = 0, stuck = 0, rows = Math.max(0, last - 1);
    if (rows > 0) {
      var values = sheet.getRange(2, 1, rows, COLUMNS.length).getValues();
      for (var i = 0; i < values.length; i++) {
        var r = values[i], t = new Date(r[0]).getTime();
        var age = isNaN(t) ? 0 : now - t;
        if (age <= 86400000) { recent++; if (String(r[16]) === 'PASS') passes++; }
        if (age <= 7 * 86400000) {
          if (/^FAILED/.test(String(r[15]))) failedMail++;
          if (/^FAILED/.test(String(r[17]))) failedReceipt++;
        }
        if ((String(r[15]) === 'pending' || String(r[17]) === 'pending') && age > HEALTH_PENDING_MINUTES * 60000) stuck++;
      }
    }
    if (failedMail) problems.push(failedMail + ' result(s) in the last 7 days where the email to the Director FAILED (see "Email Status").');
    if (failedReceipt) problems.push(failedReceipt + ' learner receipt(s) in the last 7 days FAILED (see "Receipt Status").');
    if (stuck) problems.push(stuck + ' result(s) still "pending" after ' + HEALTH_PENDING_MINUTES + ' minutes: a save may have been interrupted before its emails finished.');
    notes.push('Results in the last 24 hours: ' + recent + ' (' + passes + ' passed). Total rows: ' + rows + '.');
  } catch (err) {
    problems.push('The Sheet could not be read: ' + String(err).slice(0, 200));
  }
  try {
    var quota = MailApp.getRemainingDailyQuota();
    notes.push('Email quota left today: ' + quota + '.');
    if (quota < HEALTH_MIN_MAIL_QUOTA) problems.push('Only ' + quota + ' emails left in today\'s quota. Receipts, codes and notices will fail when it reaches zero.');
  } catch (err2) {
    problems.push('The email quota could not be checked.');
  }
  try {
    var log = JSON.parse(props.getProperty('errlog') || '{}');
    var yesterday = new Date(now - 86400000).toISOString().slice(0, 10), today = new Date(now).toISOString().slice(0, 10);
    var n = (log[yesterday] ? log[yesterday].n : 0) + (log[today] ? log[today].n : 0);
    if (n) {
      var lastErr = (log[today] && log[today].last) || (log[yesterday] && log[yesterday].last) || '';
      problems.push(n + ' server error(s) in the last two days. Latest: ' + lastErr);
    }
  } catch (err3) { /* ignore */ }
  if (!props.getProperty('RESULTS_PASSWORD')) notes.push('RESULTS_PASSWORD is not set, so the Director\'s results page cannot be opened.');

  var ok = problems.length === 0;
  if (ok && props.getProperty('HEALTH_REPORT') === 'problems') return { ok: ok, problems: problems, notes: notes, sent: false };
  var body = (ok ? 'Everything looks fine.\n\n' : 'These need attention:\n- ' + problems.join('\n- ') + '\n\n') +
    notes.join('\n') + '\n\nSheet: ' + SPREADSHEET_URL;
  MailApp.sendEmail(alertEmail_(), '[WBSC portal] Daily check: ' + (ok ? 'OK' : 'ATTENTION NEEDED'), body);
  return { ok: ok, problems: problems, notes: notes, sent: true };
}

// Run once from the editor: schedules dailyHealthCheck for about 7am (the
// project's time zone) and approves the permissions the script needs.
function installTriggers() {
  removeTriggers();
  ScriptApp.newTrigger('dailyHealthCheck').timeBased().everyDays(1).atHour(7).create();
  return 'Daily health check scheduled for about 07:00.';
}

function removeTriggers() {
  var all = ScriptApp.getProjectTriggers();
  for (var i = 0; i < all.length; i++) {
    if (all[i].getHandlerFunction() === 'dailyHealthCheck') ScriptApp.deleteTrigger(all[i]);
  }
}

// Run once from the editor to check that alert emails reach you.
function sendTestAlert() {
  MailApp.sendEmail(alertEmail_(), '[WBSC portal] Test alert',
    'If you can read this, failure alerts and the daily health check will reach this address.\n\nSheet: ' + SPREADSHEET_URL);
  return 'Test alert sent to ' + alertEmail_();
}

// ------------------------------------------------------------------ small helpers

function cache_() { return CacheService.getScriptCache(); }

function cacheGetJson_(key) {
  var v = cache_().get(key);
  if (!v) return null;
  try { return JSON.parse(v); } catch (e) { return null; }
}

function cachePutJson_(key, obj, ttlSeconds) {
  cache_().put(key, JSON.stringify(obj), Math.min(21600, Math.max(1, Math.ceil(ttlSeconds))));
}

function cacheRemove_(key) { cache_().remove(key); }

// Counts events in a window. Returns false once `limit` is reached.
function rateHit_(key, limit, windowSeconds) {
  var now = Date.now();
  var o = cacheGetJson_(key);
  if (!o || now - o.t >= windowSeconds * 1000) o = { n: 0, t: now };
  if (o.n >= limit) return false;
  o.n++;
  cachePutJson_(key, o, windowSeconds - (now - o.t) / 1000);
  return true;
}

function sha_(s) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8);
  var hex = '';
  for (var i = 0; i < bytes.length; i++) hex += ('0' + (bytes[i] & 0xff).toString(16)).slice(-2);
  return hex;
}

// Compares two strings in time that does not depend on where they differ.
function sameText_(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
