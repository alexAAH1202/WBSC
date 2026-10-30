# WBSC Umpire Mechanics Training portal

A temporary training site (not the official WBSC website) for the WBSC 2026-2029 Softball Umpire Mechanics
program, hosted on GitHub Pages at <https://alexaah1202.github.io/WBSC/>. Results are saved by a Google Apps
Script Web App into a Google Sheet.

| Path | What it is |
|---|---|
| `index.html` | Home page (front page of the site) |
| `manuals.html` | The six official manuals (PDFs on Google Drive), each with its Knowledge Check |
| `presentations.html` | The training presentations (MP4 and PowerPoint, opened from the Umpires Commission drive) |
| `assessment-widget.html` | The 12 assessments |
| `privacy.html` | What is recorded and how long it is kept |
| `apps-script/Code.gs` | The Apps Script backend (deployed in Google, not served by Pages) |
| `images/` | The WBSC logo and the demo's photos. Only the WBSC logo is allowed on this site |
| `fonts/` | Roboto and Roboto Condensed (SIL Open Font License), hosted here so visitors do not contact Google |
| `tests/` | `bank`, `site` and `code-gs` tests run in CI; `widget` needs Playwright |
| `demo/` | The earlier generic quiz site (own README), kept at `/demo/`, not linked from the portal, `noindex` |

## Pages
- `index.html`: the program home page (hero, temporary-site notice, Four Pillars, Required Learning Sequence, how to complete, Appendix 4 and 5).
- `manuals.html`: the six official manuals (Read), each linked to its Manual Knowledge Check and its presentation. The PDFs are on Google Drive and are not hosted here.
- `presentations.html`: the four training presentations (modules 01-05 share one; module 06 has three parts). Each links to the matching Presentation Competency Assessment, and each Knowledge Check's Continue button lands on the right presentation. The videos and PowerPoints are on Google Drive and are not hosted here.
- `questions.js`: the question bank (edit this to add questions; see its header). `assessment-widget.html` loads it.
- `assessment-widget.html`: the 14 assessments (6 Knowledge Checks, 8 Presentation Competency Assessments). Each module has an anchor (`#module-01` to `#module-06`) that the home page links to.
- `privacy.html`: who is responsible (Leigh Evans, Director of Umpires), what is recorded, why, who sees it, retention (to end 2031), cookies and browser storage, rights. Update it whenever what the site collects changes.
- `notice.js`: the cookies and privacy pop-up shown once per browser on every page. The site sets no cookies, so it is an information notice with an OK button; it remembers the dismissal in one localStorage setting. If analytics or embeds are ever added, it must become a real consent choice.
- `results.html`: the Director of Umpires' results page (password, `noindex`, linked only from the footer as "Director login"): completion tiles, per-module progress, per-umpire detail, printable completion summary, CSV downloads.

## Pass mark and attempts
- **Pass mark 85%.** Decided on the server from the score (`PASS_MARK` in `Code.gs`), never from the browser. It is 85% of however many questions an assessment has (9 of 10, 17 of 20, 26 of 30), so the bank can grow without code changes.
- **Two kinds of assessment.** The **Presentation Competency Assessment** is the marked one: it needs the email code, is limited to 2 attempts, is recorded, and is the only thing that counts towards completion. The **Manual Knowledge Check** is unmarked practice: no details or code, unlimited tries, correct answers shown, nothing saved. The server refuses to record a Knowledge Check.
- **Feedback on the marked assessment.** A wrong answer points to the manual section to revisit and does not show the answer. The missed questions are reviewed with their answers only once both attempts are used without a pass.
- **Maximum 2 attempts** per person for each module (`MAX_ATTEMPTS` in `Code.gs`). A third attempt is refused by the server: nothing is saved or emailed, and the learner is told to contact the Director of Umpires.
- Before an assessment starts, the page asks the server how many attempts are used (`doGet?action=attempts`, JSONP). If that lookup fails the learner can still start; the server checks again when saving. The quiz is not shown until an assessment is started.
- A new **Result** column (PASS / NOT PASSED) is added to the Sheet. The notification email shows the result and "Attempt n of 2".
- Attempts are matched by email **or** Umpire ID (ignoring case and spacing). This is only as strong as the details entered: someone who enters a different email and no Umpire ID looks like a new person. A login (for example My.WBSC) would be needed to make the limit tamper-proof.
- Rows already in the Sheet count towards attempts. Delete your own test rows, or test with a different email.
- `PASS_MARK`, `MAX_ATTEMPTS` and the contact address are repeated in `assessment-widget.html` for display only. Keep them equal to `Code.gs`.

## How a result is saved
1. The widget posts a hidden `<form>` (field `payload`, JSON) into a hidden `<iframe>`. Google Sites blocks
   `fetch()`/XHR (`connect-src`) but allows form posts (`form-action`).
2. The form is submitted immediately after the iframe is attached. It never waits for the iframe's `load`
   event, which a new iframe with no `src` never fires.
3. `doPost` validates, saves the row, then replies with a small page that `postMessage()`s the outcome to the
   widget. **"Recorded" is shown only when that message arrives** for that attempt's `submissionId`.
4. Only then is the administrator emailed. A mail failure is written to the `Email Status` column and never
   affects the saved row.
5. If no reply arrives in 25 s the learner sees "could not confirm" and a **Try saving again** button. Retrying
   is safe: a repeated `submissionId` creates no second row or email.

## Email code login, receipts, results page, alerts
- **Login.** Before an assessment, the learner enters their email and a 6-digit code emailed to them (valid 10 minutes, 5 tries, 3 codes per address per hour). The server then issues a 6-hour session token; saves and attempt lookups need it, and the **verified** email replaces whatever was typed. Learners must be able to read that inbox.
- **Receipts.** After each saved attempt the learner is emailed a receipt (result, attempt n of 2, reference, progress, "not an official WBSC certificate"). The Director is emailed the notice as before. When a learner first passes all 6 modules, a completion notice goes to the Director. Statuses are in the `Email Status` and `Receipt Status` columns. A mail failure never undoes a save.
- **Results page.** `/results.html` asks for the password held in the Script property `RESULTS_PASSWORD` (never in the repo). 10 wrong passwords in 15 minutes locks it for 15 minutes (this is global, so it can lock the Director out too; the owner is alerted).
- **Bot checks.** A hidden honeypot field (a filled one gets a fake success and no email), per-address and global limits on login codes, and a minimum of 2 seconds per question before a marked result is accepted (the page sends the time taken). These stop simple scripts only. If bots become a problem, Cloudflare Turnstile can be added to the login step; it needs a free Cloudflare account and a server-side check in `Code.gs`, so it is not built in.
- **Alerts and daily health check.** Failures (mail, unexpected errors, code floods, results lockout) email the owner, at most one per kind per hour. `dailyHealthCheck` runs about 07:00 and reports header mismatches, FAILED emails in the last 7 days, results stuck `pending`, low mail quota and logged errors.
- Mail quota: each attempt sends a receipt and a Director notice, plus login codes. A consumer Google account allows about 100 emails a day; Workspace allows 1500.

### One-time setup after pasting Code.gs
1. Project Settings -> Script properties: add `RESULTS_PASSWORD`. Optional: `ALERT_EMAIL` (default is the script owner) and `HEALTH_REPORT` = `problems` (only email when something is wrong).
2. Run `installTriggers` once (approve the permissions), then `sendTestAlert` and check the email arrives.
3. Deploy -> Manage deployments -> pencil -> **New version**.
4. The Sheet gains the new columns on the first save. Delete old test rows first, as they count towards attempts.

## Changes to Code.gs
- Reads `e.parameter.payload` (form) and still accepts a raw JSON body.
- New columns at the end: `Submission ID`, `Email Status`. Headers are added to the existing sheet automatically.
- Score is validated and `Percentage` is recomputed on the server.
- Attempt number is computed on the server (ignoring case/spacing; numeric Umpire IDs are stored as text).
- Text starting with `= + - @` is stored as text, so it cannot run as a spreadsheet formula.
- The write is wrapped in a script lock so simultaneous submissions get different attempt numbers.

## Deploying
1. Paste `apps-script/Code.gs` into the Apps Script project and `assessment-widget.html` into its `assessment-widget` file.
2. Deploy -> Manage deployments -> pencil -> **New version** -> Deploy. The Web App URL does not change.
3. Submit one test result from the live page and check: the page says "recorded", a row appears with
   `Email Status` = `sent`, and pressing Retry (or submitting again) adds no duplicate row.

## Widget behaviour
- Answer options are shuffled on every attempt (the answer key is remapped), because the correct answer was B in 53 of 90 questions.
- Options are announced as a radio group; focus moves to each new question and to the result.
- A browser warning appears if you leave mid-assessment or before a result is confirmed.
- Name, email, ID and association are remembered for the visit (this tab only) so a refresh does not mean retyping them.

## Tests
- `node tests/bank.test.js`: 14 assessments in `questions.js` (Appendix 5 is split into Modules 06, 07 and 08 for Appendix 5a, 5b and 5c, 10 questions each), at least 5 questions per Knowledge Check and 10 per Competency Assessment (more is fine, up to 100), answer keys in range, no duplicate options or questions. Runs in CI.
- `node tests/site.test.js`: every local link, script, stylesheet and image on every page exists. Runs in CI.
- `node tests/code-gs.test.js`: `Code.gs` against a mock of Sheets, Mail and Lock (39 checks, including login, receipts, results password, alerts and the health check). Runs in CI.
- `node tests/widget.test.js` (needs `npm i -D playwright`): the widget in a real browser with Google's reply simulated (27 checks).
- `node tests/notice.test.js` (needs Playwright): the pop-up on every page, no cookies, dismissal, phone width, blocked storage (9 checks).
- `node tests/results.test.js` (needs Playwright): `results.html` with simulated replies (25 checks).
- `node tests/a11y.test.js` (needs Playwright): heading order, landmarks, skip link, alt text and labels on every page, 320px reflow, the language menu and quiz answers by keyboard.
- `node tests/i18n.test.js` (needs Playwright): the language selector, that every visible string and every quiz question has a translation in all five languages, pages open in each language at desktop and phone width, and the practice quizzes run in each language with the right answer still marked right.

The browser tests do **not** prove the real Apps Script reply reaches the widget on the live site;
step 3 under "Deploying" is the check that does.

## Modules, watch-first and presentations
- **Eight required modules.** 01-04 Foundations, 05 Appendix 4, 06 Appendix 5a (Key Concepts), 07 Appendix 5b (Three-Umpire System), 08 Appendix 5c (Four, Five and Six-Umpire Systems). Completion means a PASS on the Presentation Competency Assessment for all eight (`TOTAL_MODULES` in `Code.gs`; `TOTAL_MODULES` in the widget is display only).
- **Watch first.** The Appendix 4, 5a, 5b and 5c assessments set `watchFirst` in `questions.js`; the page asks the learner to confirm they watched the full presentation before the questions appear. This is a confirmation, not proof: Google Drive does not tell us whether a video was watched.
- **Presentations are MP4 only.** The PowerPoint downloads were removed (animations and sound did not play reliably, and Mac rendering was poor).
- **Question explanations.** A question may have an optional `why` (see the header of `questions.js`).
- **Resume.** An unfinished marked attempt is kept in the browser's localStorage (`wbscResume`, one attempt at a time) for 24 hours: question reached, score, missed questions and the shuffled option order. It is tied to the verified email, ignored if the question bank changed, and cleared on finish or "Start again". It does not follow the learner to another device. Practice quizzes are not saved.

## Languages
The site and the quiz questions can be shown in English, Spanish, French, Japanese, Korean and Chinese, using the same
language menu idea as the WBSC site. English is the source and the fallback: a string without a translation stays in English,
so a gap can never break a page. Manuals, presentations, emails and the Director results page stay in English.
Spanish and French are switched on for now; Japanese, Korean and Chinese are built but switched off until a native speaker has reviewed them.
To switch a language on or off, add or remove its code in `LIVE` in `i18n.js` (now `en`, `es`, `fr`; hiding them again means setting it back to `['en']`).
Reviewers can look at any language before that with `?langs=all` on any page (adds the menu) or `?lang=es`.
How it works, how to edit a translation, and the glossary are in [`i18n/README.md`](./i18n/README.md).

## Emails in the learner's language
The login code email and the receipt are sent in the language the learner was using (the site sends `lang`; `EMAIL_TEXT` in `Code.gs` holds the wording for English, Spanish, French, Japanese, Korean and Chinese, with English as the fallback). Emails to the Director and the owner stay English. The pass/fail decision never depends on language. **Changing this needs the Apps Script redeployed as a new version of the existing deployment.**
