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
 *   - Saves the progress of an unfinished marked assessment (hashed email, 24 hours) so it can be resumed on another device.
 *   - Emails the Director a weekly summary (who finished, who needs attention, who went quiet, totals by association).
 *   - Sends a learner's login code and receipt in the language the site was showing.
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
 *   3. Run installTriggers() once from the editor and approve the permissions (it schedules the daily check and the
 *      Monday weekly summary; run it again after any update that adds a trigger).
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

// Saved progress for an unfinished marked assessment (so a learner can carry on from another device).
var PROGRESS_SHEET = 'Progress';
var PROGRESS_TTL_MS = 24 * 3600000;    // a saved attempt can be resumed for 24 hours
var PROGRESS_KEEP_MS = 48 * 3600000;   // rows older than this are deleted by the daily check
var PROGRESS_MAX_CHARS = 30000;        // a cell holds 50,000 characters
var PROGRESS_HOURLY = 240;             // saves per learner per hour (a 20-question attempt is about 20)

// Weekly summary for the Director.
var STALLED_DAYS = 14;                 // started, not finished and no activity for this long

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
  if (p.action === 'saveProgress') return handleSaveProgress_(p);
  if (p.action === 'clearProgress') return handleClearProgress_(p);
  if (p.action === 'results') return handleResults_(p);
  return handleSave_(e);
}

// ------------------------------------------------------------------ learner emails in the learner's language

// The two emails a learner receives (the login code and the receipt) are sent in the language the site was
// showing when they asked. English is the source and the fallback: a missing key or an unknown language gives
// English. Emails to the Director and the owner are always English. {x} marks a value filled in at send time.
// Keep these in step with i18n/README.md (glossary). Native-speaker reviewers should check them with the site text.
var EMAIL_LANGS = ['en', 'es', 'fr', 'ja', 'ko', 'zh'];
var EMAIL_TEXT = {
  en: {
    codeSubject: 'Your WBSC training verification code: {code}',
    codeBody: 'Your verification code is {code}\n\n' +
      'Enter it on the WBSC Umpire Mechanics Training site to confirm this email address. It expires in {min} minutes and can be used once.\n\n' +
      'If you did not ask for this code, ignore this email: nothing happens unless the code is entered.\n\n' +
      'This is a temporary training site and is not the official WBSC website.',
    receiptSubject: 'Your WBSC Umpire Mechanics Training receipt: {module} - {result}',
    hello: 'Hello {name},',
    intro: 'This is your receipt from the WBSC Umpire Mechanics Training site.',
    lModule: 'Module', lAssessment: 'Assessment', lScore: 'Score', lResult: 'Result', lAttempt: 'Attempt', lDate: 'Date and time', lRef: 'Reference',
    resultLine: '{result} (pass mark {mark}%)',
    attemptLine: '{n} of {max}',
    PASS: 'PASS', FAIL: 'NOT PASSED',
    nextPass: 'You have passed this assessment.',
    nextLeft: 'You did not reach the pass mark. Attempts left for this assessment: {n}. Revisit the manual and presentation before trying again.',
    nextNone: 'You did not reach the pass mark and have used all {max} attempts. Please contact {email}.',
    complete: 'You have now passed all {n} modules. Congratulations!',
    progress: 'Your progress so far:',
    modNone: 'Module {nn}: not attempted yet',
    modPass: 'Module {nn}: PASSED ({best}%, attempts used: {a})',
    modFail: 'Module {nn}: not passed yet (best {best}%, attempts used: {a} of {max})',
    footer: 'This is an automated receipt from a temporary training site. It is not an official WBSC certificate and the site is not the official WBSC website. Questions: {email}.'
  },
  es: {
    codeSubject: 'Tu código de verificación de la formación WBSC: {code}',
    codeBody: 'Tu código de verificación es {code}\n\n' +
      'Introdúcelo en el sitio de formación en mecánica arbitral de la WBSC para confirmar esta dirección de correo electrónico. Caduca en {min} minutos y solo se puede usar una vez.\n\n' +
      'Si no has solicitado este código, ignora este mensaje: no ocurre nada a menos que se introduzca el código.\n\n' +
      'Este es un sitio de formación temporal, no el sitio web oficial de la WBSC.',
    receiptSubject: 'Tu comprobante de la formación en mecánica arbitral de la WBSC: {module} - {result}',
    hello: 'Hola, {name}:',
    intro: 'Este es tu comprobante del sitio de formación en mecánica arbitral de la WBSC.',
    lModule: 'Módulo', lAssessment: 'Evaluación', lScore: 'Puntuación', lResult: 'Resultado', lAttempt: 'Intento', lDate: 'Fecha y hora', lRef: 'Referencia',
    resultLine: '{result} (nota mínima para aprobar: {mark}%)',
    attemptLine: '{n} de {max}',
    PASS: 'APROBADO', FAIL: 'NO APROBADO',
    nextPass: 'Has aprobado esta evaluación.',
    nextLeft: 'No has alcanzado la nota mínima para aprobar. Intentos restantes en esta evaluación: {n}. Repasa el manual y la presentación antes de volver a intentarlo.',
    nextNone: 'No has alcanzado la nota mínima para aprobar y has usado los {max} intentos. Ponte en contacto con {email}.',
    complete: 'Has aprobado ya los {n} módulos. ¡Enhorabuena!',
    progress: 'Tu progreso hasta ahora:',
    modNone: 'Módulo {nn}: aún sin intentar',
    modPass: 'Módulo {nn}: APROBADO ({best}%, intentos usados: {a})',
    modFail: 'Módulo {nn}: aún no aprobado (mejor resultado {best}%, intentos usados: {a} de {max})',
    footer: 'Este es un comprobante automático de un sitio de formación temporal. No es un certificado oficial de la WBSC y el sitio no es el sitio web oficial de la WBSC. Consultas: {email}.'
  },
  fr: {
    codeSubject: 'Votre code de vérification pour la formation WBSC : {code}',
    codeBody: 'Votre code de vérification est {code}\n\n' +
      'Saisissez-le sur le site de formation à la mécanique d’arbitrage de la WBSC pour confirmer cette adresse e-mail. Il expire dans {min} minutes et ne peut être utilisé qu’une seule fois.\n\n' +
      'Si vous n’avez pas demandé ce code, ignorez ce message : il ne se passe rien tant que le code n’est pas saisi.\n\n' +
      'Ceci est un site de formation temporaire, et non le site web officiel de la WBSC.',
    receiptSubject: 'Votre reçu de la formation à la mécanique d’arbitrage de la WBSC : {module} - {result}',
    hello: 'Bonjour {name},',
    intro: 'Voici votre reçu du site de formation à la mécanique d’arbitrage de la WBSC.',
    lModule: 'Module', lAssessment: 'Évaluation', lScore: 'Score', lResult: 'Résultat', lAttempt: 'Tentative', lDate: 'Date et heure', lRef: 'Référence',
    resultLine: '{result} (note de passage : {mark} %)',
    attemptLine: '{n} sur {max}',
    PASS: 'RÉUSSI', FAIL: 'NON RÉUSSI',
    nextPass: 'Vous avez réussi cette évaluation.',
    nextLeft: 'Vous n’avez pas atteint la note de passage. Tentatives restantes pour cette évaluation : {n}. Relisez le manuel et la présentation avant de réessayer.',
    nextNone: 'Vous n’avez pas atteint la note de passage et avez utilisé les {max} tentatives. Veuillez contacter {email}.',
    complete: 'Vous avez maintenant réussi les {n} modules. Félicitations !',
    progress: 'Votre progression jusqu’ici :',
    modNone: 'Module {nn} : pas encore tenté',
    modPass: 'Module {nn} : RÉUSSI ({best} %, tentatives utilisées : {a})',
    modFail: 'Module {nn} : pas encore réussi (meilleur résultat {best} %, tentatives utilisées : {a} sur {max})',
    footer: 'Ceci est un reçu automatique d’un site de formation temporaire. Ce n’est pas un certificat officiel de la WBSC et le site n’est pas le site web officiel de la WBSC. Questions : {email}.'
  },
  ja: {
    codeSubject: 'WBSC 研修の確認コード: {code}',
    codeBody: '確認コードは {code} です。\n\n' +
      'このメールアドレスを確認するため、WBSC 審判メカニクス研修サイトに入力してください。コードの有効期限は {min} 分で、1回のみ使用できます。\n\n' +
      'このコードを請求していない場合は、このメールを無視してください。コードが入力されない限り、何も起こりません。\n\n' +
      'これは臨時の研修サイトであり、WBSC の公式ウェブサイトではありません。',
    receiptSubject: 'WBSC 審判メカニクス研修の受領書: {module} - {result}',
    hello: '{name} 様',
    intro: 'WBSC 審判メカニクス研修サイトからの受領書です。',
    lModule: 'モジュール', lAssessment: '評価', lScore: 'スコア', lResult: '結果', lAttempt: '受験回数', lDate: '日時', lRef: '参照番号',
    resultLine: '{result}（合格基準 {mark}%）',
    attemptLine: '{max} 回中 {n} 回目',
    PASS: '合格', FAIL: '不合格',
    nextPass: 'この評価に合格しました。',
    nextLeft: '合格基準に達しませんでした。この評価の残り受験回数: {n}。マニュアルとプレゼンテーションを見直してから、もう一度受験してください。',
    nextNone: '合格基準に達せず、{max} 回の受験をすべて使い切りました。{email} までご連絡ください。',
    complete: '{n} 個のモジュールすべてに合格しました。おめでとうございます！',
    progress: 'これまでの進捗:',
    modNone: 'モジュール {nn}: まだ受験していません',
    modPass: 'モジュール {nn}: 合格（{best}%、使用した受験回数: {a}）',
    modFail: 'モジュール {nn}: まだ合格していません（最高 {best}%、使用した受験回数: {a} / {max}）',
    footer: 'これは臨時の研修サイトからの自動送信の受領書です。WBSC の公式な修了証ではなく、このサイトは WBSC の公式ウェブサイトではありません。お問い合わせ: {email}'
  },
  ko: {
    codeSubject: 'WBSC 교육 인증 코드: {code}',
    codeBody: '인증 코드는 {code} 입니다.\n\n' +
      '이 이메일 주소를 확인하려면 WBSC 심판 메커닉스 교육 사이트에 입력하세요. 코드는 {min}분 후에 만료되며 한 번만 사용할 수 있습니다.\n\n' +
      '이 코드를 요청하지 않으셨다면 이 이메일을 무시하세요. 코드를 입력하지 않으면 아무 일도 일어나지 않습니다.\n\n' +
      '이곳은 임시 교육 사이트이며 WBSC 공식 웹사이트가 아닙니다.',
    receiptSubject: 'WBSC 심판 메커닉스 교육 확인서: {module} - {result}',
    hello: '{name} 님, 안녕하세요.',
    intro: 'WBSC 심판 메커닉스 교육 사이트에서 보내는 확인서입니다.',
    lModule: '모듈', lAssessment: '평가', lScore: '점수', lResult: '결과', lAttempt: '응시', lDate: '날짜 및 시간', lRef: '참조 번호',
    resultLine: '{result} (합격 기준 {mark}%)',
    attemptLine: '{max}회 중 {n}회',
    PASS: '합격', FAIL: '불합격',
    nextPass: '이 평가에 합격하셨습니다.',
    nextLeft: '합격 기준에 도달하지 못했습니다. 이 평가의 남은 응시 횟수: {n}. 다시 응시하기 전에 매뉴얼과 프레젠테이션을 복습하세요.',
    nextNone: '합격 기준에 도달하지 못했고 {max}회의 응시 기회를 모두 사용했습니다. {email}(으)로 문의해 주세요.',
    complete: '{n}개 모듈을 모두 통과하셨습니다. 축하합니다!',
    progress: '지금까지의 진행 상황:',
    modNone: '모듈 {nn}: 아직 응시하지 않음',
    modPass: '모듈 {nn}: 합격 ({best}%, 사용한 응시 횟수: {a})',
    modFail: '모듈 {nn}: 아직 합격하지 못함 (최고 {best}%, 사용한 응시 횟수: {a}/{max})',
    footer: '이 확인서는 임시 교육 사이트에서 자동으로 발송되었습니다. WBSC 공식 수료증이 아니며, 이 사이트는 WBSC 공식 웹사이트가 아닙니다. 문의: {email}'
  },
  zh: {
    codeSubject: 'WBSC 培训验证码：{code}',
    codeBody: '您的验证码是 {code}\n\n' +
      '请在 WBSC 裁判员机制培训网站输入该验证码，以确认此电子邮件地址。验证码将在 {min} 分钟后失效，且只能使用一次。\n\n' +
      '如果您没有请求此验证码，请忽略本邮件：不输入验证码，不会发生任何事情。\n\n' +
      '这是一个临时培训网站，不是 WBSC 官方网站。',
    receiptSubject: 'WBSC 裁判员机制培训回执：{module} - {result}',
    hello: '{name}，您好：',
    intro: '这是来自 WBSC 裁判员机制培训网站的回执。',
    lModule: '模块', lAssessment: '评估', lScore: '得分', lResult: '结果', lAttempt: '第几次尝试', lDate: '日期和时间', lRef: '参考编号',
    resultLine: '{result}（及格线 {mark}%）',
    attemptLine: '共 {max} 次，第 {n} 次',
    PASS: '通过', FAIL: '未通过',
    nextPass: '您已通过本次评估。',
    nextLeft: '您未达到及格线。本评估剩余尝试次数：{n}。请先复习手册和演示文稿，再重新尝试。',
    nextNone: '您未达到及格线，且已用完全部 {max} 次尝试机会。请联系 {email}。',
    complete: '您已通过全部 {n} 个模块。恭喜！',
    progress: '您目前的进度：',
    modNone: '模块 {nn}：尚未尝试',
    modPass: '模块 {nn}：通过（{best}%，已用尝试次数：{a}）',
    modFail: '模块 {nn}：尚未通过（最高 {best}%，已用尝试次数：{a}/{max}）',
    footer: '这是来自临时培训网站的自动回执。它不是 WBSC 官方证书，本网站也不是 WBSC 官方网站。如有疑问：{email}'
  }
};

// The language the learner was using (the site sends it); anything unknown is English.
function lang_(v) {
  var l = String(v || '').toLowerCase().slice(0, 5);
  return EMAIL_LANGS.indexOf(l) >= 0 ? l : 'en';
}

// One email phrase in a language, with {values} filled in. Falls back to English for a missing key.
function et_(lang, key, vars) {
  var t = (EMAIL_TEXT[lang] && EMAIL_TEXT[lang][key] != null) ? EMAIL_TEXT[lang][key] : EMAIL_TEXT.en[key];
  for (var k in (vars || {})) t = t.split('{' + k + '}').join(String(vars[k]));
  return t;
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
      // An unfinished attempt saved from any device, for the assessment the learner is starting.
      if (email && isProgressKey_(p.pkey)) {
        try { out.progress = loadProgress_(email, String(p.pkey)); } catch (perr) { logError_('progress-load', perr); }
      }
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
    var lg = lang_(p.lang);
    MailApp.sendEmail(email, et_(lg, 'codeSubject', { code: code }),
      et_(lg, 'codeBody', { code: code, min: Math.round(CODE_TTL_S / 60) }));
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

// ------------------------------------------------------------------ saved progress

// An unfinished marked attempt, saved against the verified email so it can be resumed on another device.
// What is kept: the question reached, the score so far, which questions were drawn, the answer order and the missed
// questions. The email address is stored only as a hash. A row is ignored after 24 hours and deleted after 48.
function isProgressKey_(k) { return /^m\d\d-pca$/.test(String(k || '')); }

function progressSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(PROGRESS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(PROGRESS_SHEET);
    sh.appendRow(['Learner (hash)', 'Assessment', 'Saved at', 'Progress']);
    try { sh.setFrozenRows(1); } catch (e) { /* cosmetic */ }
  }
  return sh;
}

function progressRow_(sh, who, key) {
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var ids = sh.getRange(2, 1, last - 1, 2).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === who && String(ids[i][1]) === key) return i + 2;
  return 0;
}

function int_(v, lo, hi) {
  var n = Number(v);
  if (!(isFinite(n) && n === Math.floor(n) && n >= lo && n <= hi)) throw new Error('Invalid progress');
  return n;
}
function str_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').slice(0, max); }

// Only the expected fields, with sizes capped, are kept.
function cleanProgress_(o) {
  if (!o || typeof o !== 'object' || o.v !== 2) throw new Error('Invalid progress');
  var n = int_(o.qi && o.qi.length, 1, MAX_QUESTIONS);
  var c = { v: 2, index: int_(o.index, 1, n), score: int_(o.score, 0, n), elapsedMs: int_(Math.round(Number(o.elapsedMs) || 0), 0, 6 * 3600000),
            qi: [], qs: [], order: [], missed: [] };
  if (o.qs.length !== n || o.order.length !== n) throw new Error('Invalid progress');
  for (var i = 0; i < n; i++) {
    c.qi.push(int_(o.qi[i], 0, 999));
    c.qs.push(str_(o.qs[i], 60));
    var ord = [];
    if (!o.order[i] || o.order[i].length < 2 || o.order[i].length > 8) throw new Error('Invalid progress');
    for (var j = 0; j < o.order[i].length; j++) ord.push(int_(o.order[i][j], 0, 7));
    c.order.push(ord);
  }
  var missed = o.missed || [];
  if (missed.length > n) throw new Error('Invalid progress');
  for (var m = 0; m < missed.length; m++) {
    c.missed.push({ q: str_(missed[m].q, 800), answer: str_(missed[m].answer, 800), ref: str_(missed[m].ref, 400), why: str_(missed[m].why, 900) });
  }
  return c;
}

function handleSaveProgress_(p) {
  var msg = { wbscAuth: true, id: String(p.id || '').slice(0, 64), action: 'saveProgress', success: false };
  try {
    var email = sessionEmail_(p.token);
    if (!email) { msg.code = 'auth'; msg.error = 'Please verify your email address first.'; return messagePage_(msg); }
    if (!isProgressKey_(p.key)) throw new Error('Invalid assessment');
    if (!rateHit_('prog:' + sha_(email), PROGRESS_HOURLY, 3600)) { msg.code = 'rate'; msg.error = 'Too many saves. Please try again later.'; return messagePage_(msg); }
    var data = cleanProgress_(JSON.parse(String(p.data || '')));
    data.savedAt = Date.now();
    var json = JSON.stringify(data);
    if (json.length > PROGRESS_MAX_CHARS) throw new Error('Invalid progress');
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sh = progressSheet_(), who = sha_(email), row = progressRow_(sh, who, String(p.key));
      if (row) { sh.getRange(row, 3).setValue(new Date(data.savedAt)); sh.getRange(row, 4).setValue(json); }
      else sh.appendRow([who, String(p.key), new Date(data.savedAt), json]);
    } finally { lock.releaseLock(); }
    msg.success = true;
  } catch (err) {
    var m = String(err && err.message ? err.message : err);
    if (/^Invalid/.test(m) || err instanceof SyntaxError) msg.error = 'Invalid progress';
    else { logError_('saveProgress', err); msg.error = 'Progress could not be saved.'; }
  }
  return messagePage_(msg);
}

function deleteProgress_(email, key) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = progressSheet_(), row = progressRow_(sh, sha_(email), key);
    if (row) sh.deleteRow(row);
  } finally { lock.releaseLock(); }
}

function handleClearProgress_(p) {
  var msg = { wbscAuth: true, id: String(p.id || '').slice(0, 64), action: 'clearProgress', success: false };
  try {
    var email = sessionEmail_(p.token);
    if (!email) { msg.code = 'auth'; msg.error = 'Please verify your email address first.'; return messagePage_(msg); }
    if (!isProgressKey_(p.key)) throw new Error('Invalid assessment');
    deleteProgress_(email, String(p.key));
    msg.success = true;
  } catch (err) {
    if (!/^Invalid/.test(String(err && err.message))) logError_('clearProgress', err);
    msg.error = 'Progress could not be cleared.';
  }
  return messagePage_(msg);
}

// The saved attempt for this learner and assessment, or null if there is none or it is older than 24 hours.
function loadProgress_(email, key) {
  var sh = progressSheet_(), row = progressRow_(sh, sha_(email), key);
  if (!row) return null;
  var o = JSON.parse(String(sh.getRange(row, 4).getValue()));
  if (!(Date.now() - Number(o.savedAt) < PROGRESS_TTL_MS)) return null;
  return o;
}

// Deletes saved attempts older than 48 hours. Returns how many were removed.
function purgeProgress_() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  var removed = 0;
  try {
    var sh = progressSheet_(), last = sh.getLastRow();
    for (var r = last; r >= 2; r--) {
      var t = new Date(sh.getRange(r, 3).getValue()).getTime();
      if (isNaN(t) || Date.now() - t > PROGRESS_KEEP_MS) { sh.deleteRow(r); removed++; }
    }
  } finally { lock.releaseLock(); }
  return removed;
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
  if (post) {
    try { if (isProgressKey_(data && data.assessmentKey)) deleteProgress_(post.clean.email, String(data.assessmentKey)); } catch (perr) { logError_('progress-clear', perr); }
    sendAfterSave_(post);
  }
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
  c.lang = lang_(data.lang);   // only used to choose the language of the learner's receipt
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

function summaryLines_(summary, lg) {
  var lines = [];
  lg = lg || 'en';
  for (var n = 1; n <= TOTAL_MODULES; n++) {
    var m = summary.modules[n], nn = ('0' + n).slice(-2);
    if (!m) lines.push(et_(lg, 'modNone', { nn: nn }));
    else if (m.passed) lines.push(et_(lg, 'modPass', { nn: nn, best: m.best, a: m.attempts }));
    else lines.push(et_(lg, 'modFail', { nn: nn, best: m.best, a: m.attempts, max: MAX_ATTEMPTS }));
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

// The learner's receipt for one marked attempt, in the language the learner was using.
function sendReceipt_(c, attemptNumber, summary) {
  var lg = lang_(c.lang), left = MAX_ATTEMPTS - attemptNumber;
  var result = et_(lg, c.passed ? 'PASS' : 'FAIL');
  var next;
  if (c.passed) next = et_(lg, 'nextPass');
  else if (left > 0) next = et_(lg, 'nextLeft', { n: left });
  else next = et_(lg, 'nextNone', { max: MAX_ATTEMPTS, email: CONTACT_EMAIL });
  var complete = summary.passedCount >= TOTAL_MODULES;
  var body =
    et_(lg, 'hello', { name: c.name }) + '\n\n' +
    et_(lg, 'intro') + '\n\n' +
    et_(lg, 'lModule') + ': ' + c.module + '\n' +
    et_(lg, 'lAssessment') + ': ' + c.assessmentType + '\n' +
    et_(lg, 'lScore') + ': ' + c.score + ' / ' + c.total + ' (' + c.percentage + '%)\n' +
    et_(lg, 'lResult') + ': ' + et_(lg, 'resultLine', { result: result, mark: PASS_MARK }) + '\n' +
    et_(lg, 'lAttempt') + ': ' + et_(lg, 'attemptLine', { n: attemptNumber, max: MAX_ATTEMPTS }) + '\n' +
    et_(lg, 'lDate') + ': ' + new Date().toString() + '\n' +
    et_(lg, 'lRef') + ': ' + c.submissionId.slice(0, 8).toUpperCase() + '\n\n' +
    next + '\n\n' +
    (complete ? et_(lg, 'complete', { n: TOTAL_MODULES }) + '\n\n' : '') +
    et_(lg, 'progress') + '\n' + summaryLines_(summary, lg) + '\n\n' +
    et_(lg, 'footer', { email: CONTACT_EMAIL });
  MailApp.sendEmail(c.email, et_(lg, 'receiptSubject', { module: c.module, result: result }), body);
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

// ------------------------------------------------------------------ weekly summary for the Director

// One person = rows linked by the same email OR the same Umpire ID (the same rule the results page uses).
function people_() {
  var sheet = getSheet_(), last = sheet.getLastRow(), rows = [];
  if (last >= 2) {
    var first = Math.max(2, last - RESULTS_MAX_ROWS + 1);
    var values = sheet.getRange(first, 1, last - first + 1, COLUMNS.length).getValues();
    for (var i = 0; i < values.length; i++) {
      var r = values[i], t = new Date(r[0]).getTime();
      rows.push({ ts: isNaN(t) ? 0 : t, name: String(r[1]), email: String(r[2]).trim().toLowerCase(), id: norm_(r[3]), assoc: String(r[4]),
                  module: String(r[5]), type: String(r[6]), n: moduleNumber_(r[5]), result: String(r[16]) });
    }
  }
  var parent = {};
  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
  rows.forEach(function (r, idx) {
    var keys = [];
    if (r.email) keys.push('e:' + r.email);
    if (r.id) keys.push('i:' + r.id);
    r.keys = keys;
    keys.forEach(function (k) { if (!(k in parent)) parent[k] = k; });
    for (var j = 1; j < keys.length; j++) parent[find(keys[0])] = find(keys[j]);
  });
  var groups = {};
  rows.forEach(function (r, idx) { var g = r.keys.length ? find(r.keys[0]) : 'row:' + idx; (groups[g] = groups[g] || []).push(r); });
  return Object.keys(groups).map(function (g) {
    var list = groups[g].sort(function (a, b) { return a.ts - b.ts; });
    var p = { name: list[list.length - 1].name, email: list[list.length - 1].email, assoc: '', modules: {}, passed: 0, last: list[list.length - 1].ts,
              completed: false, completedAt: 0, attention: false };
    list.forEach(function (r) {
      if (r.assoc) p.assoc = r.assoc;
      if (r.type.toLowerCase() !== COMPLETION_TYPE.toLowerCase() || !r.n || r.n > TOTAL_MODULES) return;
      var m = p.modules[r.n] || (p.modules[r.n] = { attempts: 0, passed: false, at: 0 });
      m.attempts++;
      if (r.result === 'PASS' && !m.passed) { m.passed = true; m.at = r.ts; }
    });
    Object.keys(p.modules).forEach(function (k) {
      var m = p.modules[k];
      if (m.passed) { p.passed++; if (m.at > p.completedAt) p.completedAt = m.at; }
      else if (m.attempts >= MAX_ATTEMPTS) p.attention = true;
    });
    p.completed = p.passed >= TOTAL_MODULES;
    return p;
  });
}

// Run weekly (installTriggers schedules it for Monday morning). Emails the Director a plain-text summary:
// who finished this week, who has used every attempt without passing, who started and then went quiet, and a
// breakdown by association / federation. Nothing is sent to learners.
function weeklySummary() {
  var DAY = 86400000, now = Date.now(), people = people_();
  if (!people.length) return { sent: false, reason: 'no results yet' };
  var done = people.filter(function (p) { return p.completed && now - p.completedAt <= 7 * DAY; });
  var attention = people.filter(function (p) { return p.attention && !p.completed; });
  var stalled = people.filter(function (p) { return !p.completed && !p.attention && p.last && now - p.last >= STALLED_DAYS * DAY; });
  var completedAll = people.filter(function (p) { return p.completed; }).length;
  function line(p) { return '- ' + p.name + ' (' + (p.assoc || 'no association given') + '), ' + p.passed + ' of ' + TOTAL_MODULES + ' modules passed'; }
  function days(p) { return Math.floor((now - p.last) / DAY); }
  var byAssoc = {};
  people.forEach(function (p) {
    var a = p.assoc || '(none given)';
    var o = byAssoc[a] || (byAssoc[a] = { umpires: 0, completed: 0, progress: 0, attention: 0 });
    o.umpires++;
    if (p.completed) o.completed++; else if (p.attention) o.attention++; else o.progress++;
  });
  var assocLines = Object.keys(byAssoc).sort().map(function (a) {
    var o = byAssoc[a];
    return '- ' + a + ': ' + o.umpires + ' umpire' + (o.umpires === 1 ? '' : 's') + ', ' + o.completed + ' completed, ' + o.progress + ' in progress, ' + o.attention + ' need attention';
  });
  var body =
    'WBSC Umpire Mechanics Training: weekly summary\n\n' +
    people.length + ' umpires have a result; ' + completedAll + ' have completed all ' + TOTAL_MODULES + ' modules.\n\n' +
    'COMPLETED THIS WEEK (' + done.length + ')\n' + (done.length ? done.map(line).join('\n') : '- none') + '\n\n' +
    'NEED ATTENTION: used every attempt on a module without passing (' + attention.length + ')\n' + (attention.length ? attention.map(line).join('\n') : '- none') + '\n\n' +
    'WENT QUIET: started, not finished, no activity for ' + STALLED_DAYS + ' days or more (' + stalled.length + ')\n' +
    (stalled.length ? stalled.map(function (p) { return line(p) + ', last active ' + days(p) + ' days ago, ' + p.email; }).join('\n') : '- none') + '\n\n' +
    'BY ASSOCIATION / FEDERATION\n' + assocLines.join('\n') + '\n\n' +
    'Full results: ' + SPREADSHEET_URL + '\n' +
    'Only umpires who have saved a result appear here. The site does not hold a list of everyone who should do the training.';
  var subject = 'WBSC Umpire Training - weekly summary: ' + done.length + ' completed this week, ' + attention.length + ' need attention';
  MailApp.sendEmail(DIRECTOR_EMAIL, subject, body);
  return { sent: true, completedThisWeek: done.length, attention: attention.length, stalled: stalled.length };
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
  try { var purged = purgeProgress_(); if (purged) notes.push('Removed ' + purged + ' expired saved attempt(s).'); } catch (err4) { logError_('progress-purge', err4); }
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
  ScriptApp.newTrigger('weeklySummary').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();
  return 'Daily health check scheduled for about 07:00 and the Director\'s weekly summary for Monday about 08:00.';
}

function removeTriggers() {
  var all = ScriptApp.getProjectTriggers();
  for (var i = 0; i < all.length; i++) {
    var fn = all[i].getHandlerFunction();
    if (fn === 'dailyHealthCheck' || fn === 'weeklySummary') ScriptApp.deleteTrigger(all[i]);
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
