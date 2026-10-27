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
| `images/` | Logos and photos (shared by the portal and the demo) |
| `tests/` | `bank`, `site` and `code-gs` tests run in CI; `widget` needs Playwright |
| `demo/` | The earlier generic quiz site (own README), kept at `/demo/`, not linked from the portal, `noindex` |

## Pages
- `index.html`: the program home page (hero, temporary-site notice, Four Pillars, Required Learning Sequence, how to complete, Appendix 4 and 5).
- `manuals.html`: the six official manuals (Read), each linked to its Manual Knowledge Check and its presentation. The PDFs are on Google Drive and are not hosted here.
- `presentations.html`: the four training presentations (modules 01-05 share one; module 06 has three parts). Each links to the matching Presentation Competency Assessment, and each Knowledge Check's Continue button lands on the right presentation. The videos and PowerPoints are on Google Drive and are not hosted here.
- `assessment-widget.html`: the 12 assessments. Each module has an anchor (`#module-01` to `#module-06`) that the home page links to.
- `privacy.html`: what the portal records and how long it is kept.

## Pass mark and attempts
- **Pass mark 85%.** Decided on the server from the score (`PASS_MARK` in `Code.gs`), never from the browser. For these assessments that means 5/5 on a Manual Knowledge Check and at least 9/10 on a Presentation Competency Assessment (4/5 is 80% and does not pass).
- **Maximum 2 attempts** per person for each module and assessment type (`MAX_ATTEMPTS` in `Code.gs`). A third attempt is refused by the server: nothing is saved or emailed, and the learner is told to contact the Director of Umpires.
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
- `node tests/bank.test.js`: 12 assessments, 5 questions per Knowledge Check and 10 per Competency Assessment, answer keys in range, no duplicate options or questions. Runs in CI.
- `node tests/site.test.js`: every local link, script, stylesheet and image on every page exists. Runs in CI.
- `node tests/code-gs.test.js`: `Code.gs` against a mock of Sheets, Mail and Lock (12 checks). Runs in CI.
- `node tests/widget.test.js` (needs `npm i -D playwright`): the widget in a real browser with Google's reply simulated (8 checks).

The browser tests do **not** prove the real Apps Script reply reaches the widget on the live site;
step 3 under "Deploying" is the check that does.
