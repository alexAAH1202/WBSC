# WBSC Umpire Mechanics Training: results save (rebuilt)

`Code.gs` and `assessment-widget.html` for the Google Apps Script Web App behind the Google Site.
Only the **save step** was rebuilt; the questions and page layout are as supplied.

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
1. Paste `Code.gs` into the Apps Script project and `assessment-widget.html` into its `assessment-widget` file.
2. Deploy -> Manage deployments -> pencil -> **New version** -> Deploy. The Web App URL does not change.
3. Submit one test result from the live Sites page and check: the page says "recorded", a row appears with
   `Email Status` = `sent`, and pressing Retry (or submitting again) adds no duplicate row.

## Widget behaviour
- Answer options are shuffled on every attempt (the answer key is remapped), because the correct answer was B in 53 of 90 questions.
- Options are announced as a radio group; focus moves to each new question and to the result.
- A browser warning appears if you leave mid-assessment or before a result is confirmed.
- Name, email, ID and association are remembered for the visit (this tab only) so a refresh does not mean retyping them.

## Tests
- `node portal/tests/bank.test.js`: 12 assessments, 5 questions per Knowledge Check and 10 per Competency Assessment, answer keys in range, no duplicate options or questions. Runs in CI.
- `node portal/tests/code-gs.test.js`: `Code.gs` against a mock of Sheets, Mail and Lock (12 checks). Runs in CI.
- `node portal/tests/widget.test.js` (needs `npm i -D playwright`): the widget in a real browser with Google's reply simulated (8 checks).

The widget tests That does **not** prove the real
Apps Script reply reaches the widget inside the Sites embed; step 3 above is the check that does.
