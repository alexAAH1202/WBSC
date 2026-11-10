// The question bank for assessment-widget.html. Add or edit questions here; the page itself does not need to change.
// Each assessment is one entry: { module, moduleShort, kind, title, nextLabel, nextHref, questions: [...] }.
// A question is { q, options: [..], correct: <index into options>, ref: 'manual section to revisit', why: 'optional explanation' }.
// MARKED assessments ('-pca') have NO `correct` here: the site is public and the answers are marked by the server (Code.gs).
// The right answers live in private/answers.json (git-ignored) and in the ANSWER_KEY Script property. After adding or editing a
// marked question, add its answer to private/answers.json (same position), run `node tests/answer-key-build.js`, and paste
// private/ANSWER_KEY.json into the ANSWER_KEY Script property. Practice ('-mkc') questions keep `correct`: they are unmarked.
// Optional: `statements: ['...', '...']` lists numbered statements under the question (for "Which statements..." questions whose
// options say "Statements 1 and 2 only"), and `shuffle: false` keeps the options in the written order (needed for "All of the above").
// `why` is optional. It is shown after the answer in practice, after a correct answer in the marked assessment,
// and in the end-of-attempts review. Leave it out and nothing extra is shown.
// Any number of questions works: the pass mark is 85% of however many are asked (the server decides).
// draw: optional, on a marked assessment. If present, each attempt asks that many questions chosen at random from the longer
// list in `questions` (preferring ones the learner did not see last time). The pass mark is 85% of `draw`. In a language other
// than English only questions that have a translation are drawn, so a new question can be added in English first.
// watchFirst: "presentations.html#..." makes the page ask the learner to confirm they have watched that presentation before the questions start.
// kind 'Presentation Competency Assessment' is the marked, recorded one; 'Manual Knowledge Check' is unmarked practice.
// Run `node tests/bank.test.js` after editing.

var QUIZ_BANK = {
  "m01-mkc": {
    "module": "Module 01 — Foundations Learning Guide",
    "moduleShort": "Module 01",
    "kind": "Manual Knowledge Check",
    "title": "Foundations Learning Guide",
    "nextLabel": "Continue to Presentations - Foundations to Appendix 4",
    "nextHref": "presentations.html#pres-01-05",
    "questions": [
      {
        "q": "Which statements describe the plate setup taught in the January 2026 Foundations Learning Guide?",
        "options": [
          "Position the eyes just inside the inside edge of the plate, rather than using the inside ear as the alignment reference.",
          "Use Good Pelvic Alignment (GPA), with the navel pointing between the centre of the front of home plate and no farther than the outside front corner.",
          "Use a balanced stance with the feet about shoulder-width apart or more, adjusting the width to suit the umpire to see the strike zone from the batters sternum, knee, inside and outside edge.",
          "All of the above."
        ],
        "correct": 3,
        "ref": "January 2026 Foundations Learning Guide, section 9.6.4 to 9.6.8, pages 79, 80, 81, 82.",
        "why": "The guide changes the slot alignment reference from the inside ear to the eyes just inside the plate edge, explicitly teaches GPA, and revises the stance-width recommendation. Pelvic alignment itself was already described in the earlier manual; the GPA label and fuller instruction are additions.",
        "shuffle": false
      },
      {
        "q": "You are working from a close runner-on-base starting position when a force play develops. Which first movement best follows the added guidance in the January 2026 Foundations Learning Guide?",
        "options": [
          "Move diagonally toward the base to retain the same close working distance.",
          "Move at right angles or more to the baseline to create working distance and open the viewing angle as necessary keeping all four essential elements in view.",
          "Stay in the starting position because a force play should be judged from the same distance as a tag play.",
          "Move closer until the base fills your field of vision."
        ],
        "correct": 1,
        "ref": "January 2026 Foundations Learning Guide, section 9.9.3, Moving from Runner on base starting positions to force play positioning, page 93.",
        "why": "The added instruction focuses on the movement path. A first movement at right angles or more to the baseline creates distance and improves visual separation. Moving diagonally toward the base largely preserves the close tag-play distance."
      },
      {
        "q": "A wild throw draws the first baseman toward home plate for a possible swipe tag. You are the responsible Base Umpire, but your view of the tag is blocked. Which procedure follows the January 2026 Foundations Learning Guide?",
        "options": [
          "Ask for help before making a call and automatically transfer the decision to the Plate Umpire.",
          "Call the runner out because the ball reached the fielder before the runner reached the base.",
          "Move dynamically to keep all four essential elements in view where possible. Make a decision on the play, then consult the entire crew if help is needed; do not pass the call to another umpire unless certain they have all the information needed for the entire call.",
          "Leave the play uncalled until a coach requests a conference."
        ],
        "correct": 2,
        "ref": "January 2026 Foundations Learning Guide, section 9.9.3, Swipe Tag, pages 94, 95.",
        "why": "The responsible umpire should make a decision and then consult the crew if needed. A partner may have seen the tag but missed another part of the play, so the call should not simply be transferred. Never guess an out."
      },
      {
        "q": "A called third strike is not caught. First base is occupied and there is one out. Which communication follows the explicit third-strike guidance in the January 2026 Foundations Learning Guide?",
        "options": [
          "Clearly call \"Strike three... Out!\" and reinforce the out call if the batter starts toward first base.",
          "Give only the strike signal and leave the players to determine whether the batter is out.",
          "Call \"No catch\" and direct the batter to first base.",
          "Wait for the defense to appeal before declaring the batter out."
        ],
        "correct": 0,
        "ref": "January 2026 Foundations Learning Guide, section 9.6.2, Strike 3, page 78.",
        "why": "With first base occupied and fewer than two outs, the batter is automatically out on the third strike even if it is not caught. The guide expressly requires clear communication of the strike and the out, including reinforcement if the batter starts toward first base."
      },
      {
        "q": "There are two outs. A runner is approaching home plate while another runner faces a tag play at a different base. What preferred additional verbal communication does the January 2026 Foundations Learning Guide recommend for the Base Umpire?",
        "options": [
          "Delay all verbal communication until after checking the scoring runner.",
          "Say \"Tag\" loudly at the exact point of the tag to help the Plate Umpire judge the timing, then complete the ruling after judging control of the ball. The Plate Umpire will point to home plate and signal with one finger if the umpire judges the run scored, or use the arms crossed over the shoulders for no run scores.",
          "Call \"Out\" as soon as the glove touches the runner, before judging possession.",
          "Announce whether the run counts from the base where the tag occurs."
        ],
        "correct": 1,
        "ref": "January 2026 Foundations Learning Guide, section 10.6, pages 104, 105 and Section 7.1.21 & 7.1.22.",
        "why": "The guide recommends an immediate, loud \"Tag\" cue at the point of contact. This helps the Plate Umpire compare the tag with the touch of home plate while the calling umpire judges ball control. The cue does not by itself declare an out; if the runner is safe, use the safe signal and verbal call as required."
      }
    ]
  },
  "m01-pca": {
    "module": "Module 01 — Foundations Learning Guide",
    "moduleShort": "Module 01",
    "kind": "Presentation Competency Assessment",
    "title": "Foundations Learning Guide",
    "nextLabel": "Continue to Module 02 - One-Umpire Field Mechanics",
    "nextHref": "manuals.html#module-02",
    "questions": [
      {
        "q": "Which statements describe the plate setup taught in the January 2026 Foundations Learning Guide?",
        "options": [
          "Position the eyes just inside the inside edge of the plate, rather than using the inside ear as the alignment reference.",
          "Use Good Pelvic Alignment (GPA), with the navel pointing between the center of the front of home plate and no farther than the outside front corner.",
          "Use a balanced stance with the feet about shoulder-width apart or more, adjusting the width to suit the umpire to see the strike zone from the batters sternum, knee, inside and outside edge.",
          "All of the above."
        ],
        "ref": "January 2026 Foundations Learning Guide, section 9.6.4 to 9.6.8, pages 79, 80, 81, 82.",
        "why": "The guide changes the slot alignment reference from the inside ear to the eyes just inside the plate edge, explicitly teaches GPA, and revises the stance-width recommendation. Pelvic alignment itself was already described in the earlier manual; the GPA label and fuller instruction are additions.",
        "shuffle": false
      },
      {
        "q": "You are working from a close runner-on-base starting position when a force play develops. Which first movement best follows the added guidance in the January 2026 Foundations Learning Guide?",
        "options": [
          "Move diagonally toward the base to retain the same close working distance.",
          "Move at right angles or more to the baseline to create working distance and open the viewing angle as necessary keeping all four essential elements in view.",
          "Stay in the starting position because a force play should be judged from the same distance as a tag play.",
          "Move closer until the base fills your field of vision."
        ],
        "ref": "January 2026 Foundations Learning Guide, section 9.9.3, Moving from Runner on base starting positions to force play positioning, page 93.",
        "why": "The added instruction focuses on the movement path. A first movement at right angles or more to the baseline creates distance and improves visual separation. Moving diagonally toward the base largely preserves the close tag-play distance."
      },
      {
        "q": "A wild throw draws the first baseman toward home plate for a possible swipe tag. You are the responsible Base Umpire, but your view of the tag is blocked. Which procedure follows the January 2026 Foundations Learning Guide?",
        "options": [
          "Ask for help before making a call and automatically transfer the decision to the Plate Umpire.",
          "Call the runner out because the ball reached the fielder before the runner reached the base.",
          "Move dynamically to keep all four essential elements in view where possible. Make a decision on the play, then consult the entire crew if help is needed; do not pass the call to another umpire unless certain they have all the information needed for the entire call.",
          "Leave the play uncalled until a coach requests a conference."
        ],
        "ref": "January 2026 Foundations Learning Guide, section 9.9.3, Swipe Tag, pages 94, 95.",
        "why": "The responsible umpire should make a decision and then consult the crew if needed. A partner may have seen the tag but missed another part of the play, so the call should not simply be transferred. Never guess an out."
      },
      {
        "q": "A called third strike is not caught. First base is occupied and there is one out. Which communication follows the explicit third-strike guidance in the January 2026 Foundations Learning Guide?",
        "options": [
          "Clearly call \"Strike three... Out!\" and reinforce the out call if the batter starts toward first base.",
          "Give only the strike signal and leave the players to determine whether the batter is out.",
          "Call \"No catch\" and direct the batter to first base.",
          "Wait for the defense to appeal before declaring the batter out."
        ],
        "ref": "January 2026 Foundations Learning Guide, section 9.6.2, Strike 3, page 78.",
        "why": "With first base occupied and fewer than two outs, the batter is automatically out on the third strike even if it is not caught. The guide expressly requires clear communication of the strike and the out, including reinforcement if the batter starts toward first base."
      },
      {
        "q": "There are two outs. A runner is approaching home plate while another runner faces a tag play at a different base. What preferred additional verbal communication does the January 2026 Foundations Learning Guide recommend for the Base Umpire?",
        "options": [
          "Delay all verbal communication until after checking the scoring runner.",
          "Say \"Tag\" loudly at the exact point of the tag to help the Plate Umpire judge the timing, then complete the ruling after judging control of the ball. The Plate Umpire will point to home plate and signal with one finger if the umpire judges the run scored, or use the arms crossed over the shoulders for no run scores.",
          "Call \"Out\" as soon as the glove touches the runner, before judging possession.",
          "Announce whether the run counts from the base where the tag occurs."
        ],
        "ref": "January 2026 Foundations Learning Guide, section 10.6, pages 104, 105 and Section 7.1.21 & 7.1.22.",
        "why": "The guide recommends an immediate, loud \"Tag\" cue at the point of contact. This helps the Plate Umpire compare the tag with the touch of home plate while the calling umpire judges ball control. The cue does not by itself declare an out; if the runner is safe, use the safe signal and verbal call as required."
      },
      {
        "q": "A runner is advancing from first to second on a tag play. Your view is nearly directly over second base, causing the ball, fielder, runner and base to appear lined up. What adjustment follows the guide?",
        "options": [
          "Move closer until the base is directly below your eyes.",
          "Work just short of the leading edge, with a slight angle and enough depth to keep the Four Essential Elements visually separated.",
          "Move directly into line with the throw and remain there.",
          "Keep the same position and judge the play mainly from the sound of the catch."
        ],
        "ref": "Section 3.2.1; pages 17, 18.",
        "why": "Working just short of the leading edge, with an appropriate angle and depth, keeps the elements visually separated and helps you judge the timing of the tag and the touch of the base."
      },
      {
        "q": "On a developing tag play, you reach a good observation position but the fielder then moves across your sightline. How should you use the observation and calling positions described in the guide?",
        "options": [
          "Treat the observation position as a fixed spot and make the call from there.",
          "Move to the holding zone and call from there.",
          "Remain at the original spot and assume the tag was applied.",
          "Use the observation position to read the developing play, then adjust to a calling position that gives an unobstructed view before signaling."
        ],
        "ref": "Section 3.1.8 and 3.1.9; 9.1; pages 17, 70, 71.",
        "why": "The observation position is an area from which to read the play, not necessarily the final calling position. Adjust as the play develops so you can see the complete action before signaling."
      },
      {
        "q": "On a tag play, the nominal 90-degree position leaves the fielder between you and the tag. Which approach follows the guide's treatment of the 90-degree angle?",
        "options": [
          "Use 90 degrees as a reference, then adjust to obtain an unobstructed view of the Four Essential Elements.",
          "Keep the exact 90-degree angle even though the tag is hidden.",
          "Move directly over the base to remove the need for an angle.",
          "Keep the angle and call the runner out if the throw arrives first."
        ],
        "ref": "Section 3.2.2; 9.1.5; pages 18, 73.",
        "why": "The 90-degree angle is a guideline, not an absolute requirement. Seeing the play clearly takes priority over reaching an exact angle. The earlier manual already required angle adjustments; the 2026 guide makes this reference concept explicit."
      },
      {
        "q": "As a runner slides away from a tag and the fielder reaches across, what focus and movement best follow the guide's tag-play instruction?",
        "options": [
          "Watch only the runner's foot and infer the tag from the fielder's reaction.",
          "Stay fixed even if the fielder hides the glove.",
          "Follow the ball or ball-glove combination into the tag, adjusting in sync with the developing play while keeping the head as still as possible and the other elements in view.",
          "Watch only the glove and ignore the runner's position relative to the base."
        ],
        "ref": "Section 9.1.3; page 72.",
        "why": "The guide explicitly links movement to the ball-glove combination and tag application. Keep the Four Essential Elements in view, adjust when required, and maintain head and eye focus throughout."
      },
      {
        "q": "During pre-pitch preparation, you assess the outfielders' depth and ability. A fly ball is then hit into your coverage area with no real likelihood of being caught. What does the added outfield-coverage guidance emphasize?",
        "options": [
          "Go out on every ball hit to the outfield, regardless of catch potential.",
          "Use the pre-pitch assessment and crew communication to avoid unnecessary going out and preserve effective base coverage, noting on any fly ball that could be caught, trapped or close to the fair foul line or pole umpires must go out.",
          "Call \"No catch\" immediately, before the ball lands.",
          "Go out first, then return through another umpire's area while a base play develops."
        ],
        "ref": "Section 9.2.1; page 74, 3.3.4, 9.9.1",
        "why": "Section 9.2.1 specifically cautions against going out on balls with no real likelihood of being caught. Read the play, consider designated coverage, and communicate so the crew retains effective outfield and base coverage."
      },
      {
        "q": "A fly ball near the foul line is first touched by an outfielder while the ball is over fair territory. The fielder juggles it, moves into foul territory and drops it. What timing and status follow the guide's first-touch instruction?",
        "options": [
          "Wait for a completed catch before giving any fair or foul indication.",
          "Declare it foul because it was dropped in foul territory.",
          "Use the fielder's feet at the moment the ball is dropped to determine fair or foul.",
          "Track the ball and observe the ball's position at first touch and indicate fair then; the later drop in foul territory does not change that status."
        ],
        "ref": "Section 9.1.6; pages 73, 74.",
        "why": "The added section separates fair/foul timing from catch/no-catch timing. For this fly ball, fair/foul status is determined by the ball's position at first touch, and the indication should not wait for a completed catch."
      },
      {
        "q": "At first base, the fielder is clearly off the base well before the throw arrives. The runner reaches first without being tagged. How should you apply the guide's revised emphasis on pulled-foot calls?",
        "options": [
          "Make the safe ruling with appropriate routine emphasis; reserve the descriptive point and strong \"Off\" sell for a play that needs that emphasis and explanation.",
          "Always make a vigorous point and loud \"Off\" call, no matter how obvious the play is.",
          "Call the runner out because the ball arrived before the runner.",
          "Avoid making any ruling because the pulled foot was obvious."
        ],
        "ref": "Section 9.9.3, Pulled Foot; 9.10; pages 93, 98.",
        "why": "The 2026 guide says not to sell an obvious pulled foot unnecessarily. The stronger descriptive mechanic is for a late or close pulled foot where the reason for the safe ruling needs to be clear. Saving this type of mechanic for the best impact, only when required."
      },
      {
        "q": "During an inning, the Plate Umpire is occupied with substitutions. The ball is dead and extra offensive players gather near home plate with the on-deck batter. What should the Base Umpires do?",
        "options": [
          "Wait for the Plate Umpire to finish before addressing the players.",
          "Allow extra players near the plate because the ball is dead.",
          "Manage the on-deck area and keep the plate area safe, normally with the Base Umpire nearest the offensive dugout taking responsibility and partners adjusting as needed.",
          "Restart play so the extra players will return to the dugout."
        ],
        "ref": "Section 11.5.1; page 113.",
        "why": "The added dead-ball section gives Base Umpires specific responsibilities while the Plate Umpire handles notifications. Use preventive officiating, manage unauthorized players and maintain a safe working area around home plate."
      },
      {
        "q": "Play has been suspended for lightning. Twenty minutes after the last lightning sighting, thunder is heard again. Under the guide, when may play resume?",
        "options": [
          "Ten minutes later, because the original 30-minute period is nearly complete.",
          "No sooner than 30 minutes after that thunder, provided there is no later lightning or thunder and resumption is approved under the competition procedures.",
          "Immediately, because thunder without visible lightning does not affect resumption.",
          "As soon as both head coaches agree to restart."
        ],
        "ref": "Section 6.8.2; page 38.",
        "why": "The 2026 protocol measures the waiting period from the last lightning sighting or thunder heard. Later thunder starts a fresh 30-minute wait. Consult the UIC or tournament officials and apply the competition procedures."
      },
      {
        "q": "In the changing area after the game, you want to question a partner's decision on a difficult play. Which approach follows the guide's crew-debrief guidance?",
        "options": [
          "Raise it publicly with the teams so everyone hears the explanation.",
          "Tell the partner what they did wrong before allowing them to describe the play.",
          "Avoid discussing difficult decisions because a debrief should cover only successful plays.",
          "Allow the partner to share their observations, ask permission before questioning their decision, and discuss the play honestly, respectfully and confidentially with a focus on learning."
        ],
        "ref": "Section 6.9.2; pages 38, 39.",
        "why": "The expanded debrief guidance asks umpires to let partners share their observations and seek permission before questioning them. Keep the discussion confidential and constructive, and listen to all perspectives."
      },
      {
        "q": "A player is removed for a rule violation rather than ejected for misconduct. Which distinction does the Foundations Learning Guide require the crew to recognize?",
        "options": [
          "A player removed for a rule violation may remain in the dugout and may coach, an ejected person must leave the game and go to the change room or leave the venue entirely.",
          "Both the removed player and an ejected person must remain in the dugout.",
          "A removed player may continue playing if the coach agrees.",
          "An ejection applies only to coaches, while removal applies only to players."
        ],
        "ref": "Section 6.7, Important Distinction; pages 36, 37. Rule 3.5.1 c)",
        "why": "The guide distinguishes ejection from removal. Its stated instruction is that an ejected person leaves the venue; a player removed for a rule violation may remain in the dugout and coach. This does not make the removed player eligible to continue playing."
      },
      {
        "q": "You have credible additional information from a partner and, after crew consultation, decide to change your call. What communication sequence does the guide specify?",
        "options": [
          "Announce the new ruling to the spectators first and leave the coaches to ask for details.",
          "Ask both coaches to join the crew discussion before reaching a decision.",
          "Inform the team affected first, give a simple explanation, then clearly communicate the final ruling.",
          "Change the signal without explaining it so play can resume faster."
        ],
        "ref": "Section 10.1.4; page 101.",
        "why": "Crew consultation occurs away from players and coaches. If the call changes, inform the affected team first, explain simply and communicate the final ruling clearly. The consultation must be based on information, not pressure alone."
      },
      {
        "q": "The DP takes the FLEX player's defensive position and the FLEX leaves the game. What specific confirmation does the guide add to the lineup-management process?",
        "options": [
          "Tell the scorer the team still has ten players because the DP remains in the batting order.",
          "When the DP plays defence for the FLEX, this is treated like a substitution for the FLEX or the FLEX’s substitute and must be reported to the Umpire. Confirm with the coach and scorer that the team is now playing with nine, as well as recording and reporting the adjustment.",
          "Allow the coach to report the change directly to the scorer without involving the Plate Umpire.",
          "Wait until the end of the inning to record whether the FLEX left the game."
        ],
        "ref": "Section 12.1; 12.3; pages 118, 119.",
        "why": "For an adjustment involving the DP or FLEX leaving or resuming the game, the guide explicitly directs the umpire to confirm with the coach and scorer whether the team is playing with nine or ten. Here the FLEX has left, so the team has nine."
      },
      {
        "q": "After several demanding pitches, you notice your concentration fading. Which between-pitch routine does the guide recommend to help maintain focus?",
        "options": [
          "Stay locked in the set position throughout the entire at-bat.",
          "Change your call timing on the next pitch to force yourself to concentrate.",
          "Review the previous pitch mentally while the next pitch is being delivered.",
          "After completing the call and checking for continuing action, step back, relax, breathe and briefly notice your surroundings, then refocus before the next pitch."
        ],
        "ref": "Section 9.6.2; 9.6.10; pages 78, 82.",
        "why": "The guide adds a deliberate cycle of focusing for each pitch and briefly resetting between pitches. The reset follows the completed pitch and call and must not distract from continuing plays by the catcher or runners."
      },
      {
        "q": "At a tournament, a coach says a clear violation should be ignored because it is routinely tolerated in the team's domestic competition. What approach follows the guide's WBSC framework?",
        "options": [
          "Apply the WBSC standard consistently and impartially, addressing clear violations that affect fairness without searching for marginal or trivial technicalities.",
          "Apply the domestic standard used by whichever team is batting.",
          "Relax enforcement for teams unfamiliar with international competition.",
          "Change the standard late in the game to avoid influencing a close result."
        ],
        "ref": "Section 6.1; pages 33, 34.",
        "why": "The added framework states that championship play does not vary with domestic enforcement customs. Apply a consistent WBSC standard from the first pitch to the final out, balancing clear enforcement with avoiding over-officiating trivial technicalities."
      }
    ],
    "draw": 10
  },
  "m02-mkc": {
    "module": "Module 02 — Foundations: One-Umpire Field Mechanics",
    "moduleShort": "Module 02",
    "kind": "Manual Knowledge Check",
    "title": "Foundations - One-Umpire Field Mechanics",
    "nextLabel": "Continue to Presentations - Foundations to Appendix 4",
    "nextHref": "presentations.html#pres-01-05",
    "questions": [
      {
        "q": "According to the One-Umpire System overview, what are the \"Four Essential Elements\" the umpire should always try to keep in view?",
        "options": [
          "The ball, the defensive players, the offensive players, and the base or the area of play",
          "The ball, the runners, the coaches, and the scoreboard",
          "The pitcher, the catcher, the batter, and the infield",
          "The ball, the fielders, the foul lines, and the dugouts"
        ],
        "correct": 0,
        "ref": "Foundations - One-Umpire Field Mechanics, \"One Umpire System\" section."
      },
      {
        "q": "In the One-Umpire System, what must the umpire do on every hit ball, before making any call?",
        "options": [
          "Remain behind the plate until the ball is fielded",
          "Quickly move out from behind the plate and into the infield for the best view of the play",
          "Call \"Time\" immediately to reset the defense",
          "Move directly to first base regardless of where the ball is hit"
        ],
        "correct": 1,
        "ref": "Foundations - One-Umpire Field Mechanics, \"One Umpire System\" section."
      },
      {
        "q": "Per the Conventions section, how is the plate umpire referred to throughout this manual?",
        "options": [
          "\"Umpire-in-Chief\" or \"UIC\"",
          "\"Home\" or \"HU\"",
          "\"Base Umpire\" or \"BU\"",
          "\"Plate\" or \"PU\""
        ],
        "correct": 3,
        "ref": "Foundations - One-Umpire Field Mechanics, \"Conventions\" section."
      },
      {
        "q": "According to the Plate Umpire Starting Position guidance, how many warm-up pitches are allowed for each pitcher in the first inning and with each new pitcher?",
        "options": [
          "Three",
          "Seven",
          "Five",
          "Ten"
        ],
        "correct": 2,
        "ref": "Foundations - One-Umpire Field Mechanics, \"Starting Position - Plate umpire\" section."
      },
      {
        "q": "On every hit ball, which side does the manual instruct the plate umpire to exit from behind the catcher?",
        "options": [
          "The right side, unless the batter is left-handed",
          "Whichever side is closer to where the ball was hit",
          "Directly up the middle, between catcher and batter",
          "The left side, even on a left-handed batter"
        ],
        "correct": 3,
        "ref": "Foundations - One-Umpire Field Mechanics, \"Plate Umpire Starting Position\" (general mechanics) section."
      }
    ]
  },
  "m02-pca": {
    "module": "Module 02 — Foundations: One-Umpire Field Mechanics",
    "moduleShort": "Module 02",
    "kind": "Presentation Competency Assessment",
    "title": "Foundations - One-Umpire Field Mechanics",
    "nextLabel": "Continue to Module 03 - Two-Umpire Field Mechanics",
    "nextHref": "manuals.html#module-03",
    "questions": [
      {
        "q": "There are no runners on base, and the batter hits a routine ground ball to the shortstop. Per the mechanics for \"No Runners on Base,\" where should the plate umpire move to get the best view of the play?",
        "options": [
          "Into foul ball territory toward third base",
          "With purpose, out in front of home plate towards the pitcher's area",
          "Straight up the first base line, following the batter-runner",
          "Stay behind the catcher and make the call from the plate"
        ],
        "ref": "Foundations - One-Umpire Field Mechanics, \"No Runners on Base,\" Ball hit to the infield."
      },
      {
        "q": "A runner is on third base only, and the batter hits a ground ball to the third baseman. Per the mechanics for \"Runner at Third Base,\" what movement should the plate umpire make?",
        "options": [
          "Move into foul ball territory toward third base",
          "Move out in front of home plate towards the pitcher's area, as with no runners on base",
          "Remain stationary behind the catcher",
          "Sprint directly to first base"
        ],
        "ref": "Foundations - One-Umpire Field Mechanics, \"Runner at Third Base,\" Ball hit in the infield."
      },
      {
        "q": "With the bases loaded, the batter hits a fly ball to shallow right field. Consistent with the \"Bases Loaded\" mechanics (which follow the same pattern as Runner at Third Base), where should the umpire move?",
        "options": [
          "Out in front of home plate toward the pitcher's area",
          "Toward the right field foul line",
          "Directly behind second base",
          "Into foul ball territory toward third base"
        ],
        "ref": "Foundations - One-Umpire Field Mechanics, \"Bases Loaded,\" Ball hit to the outfield."
      },
      {
        "q": "The plate umpire has moved into position for a potential play at first base on a ground ball. What sequence does the manual prescribe for making the call?",
        "options": [
          "Call immediately upon seeing the throw, then confirm with a signal",
          "Signal first, then verbally call",
          "Stop… Wait… Call and Signal",
          "Move continuously while calling to keep angle on the play"
        ],
        "ref": "Foundations - One-Umpire Field Mechanics, \"No Runners on Base,\" Ball hit to the infield."
      },
      {
        "q": "A fly ball is hit to the outfield with no runners on base. Before moving toward the base where the play will be made, what must the umpire judge?",
        "options": [
          "Whether the ball is fair or foul only",
          "The runner's lead-off distance",
          "Whether the fielder is left- or right-handed",
          "Catch or no catch"
        ],
        "ref": "Foundations - One-Umpire Field Mechanics, \"No Runners on Base,\" Ball hit to the outfield."
      },
      {
        "q": "The ball has returned to the infield after a play in the outfield, and all play has ceased. What should the plate umpire do, per the manual?",
        "options": [
          "May call and signal \"Time\"",
          "Continue actively pursuing the play in case a runner attempts another advance",
          "Immediately return to the dugout area",
          "Call an automatic conference with the coaches"
        ],
        "ref": "Foundations - One-Umpire Field Mechanics, \"No Runners on Base,\" Ball hit to the outfield."
      },
      {
        "q": "With runners on first and second base, a fly ball is hit to left field that may or may not be caught. Consistent with the One-Umpire System's instruction to give priority in positioning, which runner should most influence the umpire's positioning?",
        "options": [
          "The batter-runner heading to first base",
          "The runner on first base",
          "The runner on second base (the lead runner)",
          "Whichever runner is physically closest to the umpire's current position"
        ],
        "ref": "Foundations - One-Umpire Field Mechanics, \"One Umpire System\" section (\"give the lead runner priority in your positioning\")."
      },
      {
        "q": "A ground ball is hit with a runner on first base. The throw to first base for the batter-runner appears to be a routine, uncontested play, but the runner from first may try to advance on the throw. What does the manual instruct the umpire to do?",
        "options": [
          "Stay fixed on the play at first base until it is fully completed",
          "Shift towards where the next play may occur, especially since it is a possible tag play",
          "Call \"Time\" immediately once the throw to first is released",
          "Move to the outfield to prepare for the next batter"
        ],
        "ref": "Foundations - One-Umpire Field Mechanics, \"One Umpire System\" section."
      },
      {
        "q": "A ground ball is hit sharply down the third base line with a runner on third base. Besides moving into foul ball territory toward third base, what additional responsibility does the manual assign the umpire in this situation?",
        "options": [
          "Stay close to the line to call fair/foul",
          "Immediately signal \"Out\" before the play concludes",
          "Call the runner out for running outside the baseline",
          "Request assistance from the third base coach"
        ],
        "ref": "Foundations - One-Umpire Field Mechanics, \"Runner at Third Base,\" Ball hit in the infield."
      },
      {
        "q": "While moving with purpose to get into position for a developing play, what positioning principle must the umpire observe, according to the One-Umpire System overview?",
        "options": [
          "Always stand exactly halfway between the two bases involved in the play",
          "Ensure the chosen position does not put the umpire in the way of a player or a thrown ball",
          "Always face the pitcher regardless of where the play is developing",
          "Remain a fixed distance from the base at all times"
        ],
        "ref": "Foundations - One-Umpire Field Mechanics, \"One Umpire System\" section."
      },
      {
        "q": "Where does the plate umpire stand between innings in the One-Umpire System?",
        "options": [
          "At the pitcher's plate, facing home",
          "Behind the catcher at all times",
          "About one third of the way from home plate toward first base in one half inning and toward third base in the other, about 30 cm (12 inches) off the line in foul territory",
          "At second base, facing home plate"
        ],
        "ref": "Appendix 1, One-Umpire System, Starting Position - Plate umpire.",
        "why": "The umpire stands facing the diamond with the hands relaxed at the sides, with the mask under the left arm."
      },
      {
        "q": "Between innings in the One-Umpire System, which side does the plate umpire stand on?",
        "options": [
          "Always on the third base side",
          "Always on the first base side",
          "On the side of the team going onto the field",
          "On the side of the team coming off the field"
        ],
        "ref": "Appendix 1, One-Umpire System, Starting Position - Plate umpire.",
        "why": "The umpire also hustles the teams on and off the field."
      },
      {
        "q": "How many warm-up pitches are allowed at the start of each inning after the first inning?",
        "options": [
          "Five",
          "Two",
          "Three",
          "Eight"
        ],
        "ref": "Appendix 1, One-Umpire System, Starting Position - Plate umpire.",
        "why": "Five warm-up pitches are allowed for each pitcher in the first inning and with each new pitcher."
      },
      {
        "q": "During the warm-up pitches, what should the plate umpire tell the catcher?",
        "options": [
          "When the second to last warm-up pitch has been thrown",
          "When the first warm-up pitch has been thrown",
          "Nothing; the catcher counts the pitches",
          "Which pitch is the last, only if asked"
        ],
        "ref": "Appendix 1, One-Umpire System, Starting Position - Plate umpire.",
        "why": "After the warm-up pitches the umpire sweeps the plate and takes a position behind the catcher."
      },
      {
        "q": "On every hit in the One-Umpire System, how does the plate umpire exit from behind the catcher?",
        "options": [
          "By stepping straight backwards",
          "Via the right, even on a right-handed batter",
          "Via the side of the batter",
          "Via the left, even on a left-handed batter"
        ],
        "ref": "Appendix 1, One-Umpire System, Plate Umpire Starting Position.",
        "why": "If the ball is close to the foul line the umpire moves to the line and straddles it to make the fair/foul call."
      },
      {
        "q": "With runners on base, whom does the One-Umpire System say to give priority in the umpire's positioning?",
        "options": [
          "The runner on third base only",
          "The lead runner",
          "The fielder with the ball",
          "The batter-runner"
        ],
        "ref": "Appendix 1, One-Umpire System - introduction.",
        "why": "On every hit the umpire moves out from behind the plate into the infield for the best view of the play that develops."
      },
      {
        "q": "What does the One-Umpire System manual say about making a call other than calling balls and strikes?",
        "options": [
          "Wait for the coach to ask",
          "You should never make a call without moving out from behind the plate unless at home",
          "Make calls from behind the plate to stay out of the way",
          "Make the call before the ball arrives"
        ],
        "ref": "Appendix 1, One-Umpire System - introduction.",
        "why": "The single umpire has no partner to assist, so must move with purpose to get the best possible position to stop and make the call."
      },
      {
        "q": "Why must the One-Umpire System umpire know where the runners are every time the ball is thrown?",
        "options": [
          "To signal the coaches",
          "To count the number of throws",
          "To know which base to sweep",
          "In case the ball is thrown out of play"
        ],
        "ref": "Appendix 1, One-Umpire System - introduction.",
        "why": "The umpire must also take a quick look at the runners as they touch bases, especially when scoring at home."
      },
      {
        "q": "Where does the plate umpire carry the mask between innings in the One-Umpire System?",
        "options": [
          "On the head",
          "Under the right arm",
          "Under the left arm",
          "In the ball bag"
        ],
        "ref": "Appendix 1, One-Umpire System, Starting Position - Plate umpire.",
        "why": "During the first half inning and when there is a change of pitchers the umpire may put on the mask to observe the warm-up pitches."
      },
      {
        "q": "In the One-Umpire System, which calls is the plate umpire responsible for?",
        "options": [
          "Every call in the game, including illegal pitches, fair/foul balls, batting infractions, and safes and outs",
          "Only balls and strikes",
          "Only calls at home plate",
          "Only fair/foul balls"
        ],
        "ref": "Appendix 1, One-Umpire System - Plate Umpire Starting Position.",
        "why": "It is obvious that not everything that happens will be seen, so the single umpire must hustle around and inside the diamond for the best position."
      }
    ],
    "draw": 10
  },
  "m03-mkc": {
    "module": "Module 03 — Foundations: Two-Umpire Field Mechanics",
    "moduleShort": "Module 03",
    "kind": "Manual Knowledge Check",
    "title": "Foundations - Two-Umpire Field Mechanics",
    "nextLabel": "Continue to Presentations - Foundations to Appendix 4",
    "nextHref": "presentations.html#pres-01-05",
    "questions": [
      {
        "q": "According to the Two-Umpire System manual, which of the following is NOT one of the 'Four Essential Elements' an umpire must keep in unobstructed view?",
        "options": [
          "The ball.",
          "The scoreboard.",
          "The offensive players.",
          "The defensive players."
        ],
        "correct": 1,
        "ref": "Appendix 2, Two Umpire System - Four Essential Elements; page 3.",
        "why": "The Four Essential Elements are the ball, defensive players, offensive players, and the base or area of play."
      },
      {
        "q": "Under the Division Principle, and subject to its stated exceptions, which umpire normally takes calls at home plate and third base?",
        "options": [
          "Both umpires jointly.",
          "Base Umpire.",
          "Whichever umpire arrives first.",
          "Plate Umpire."
        ],
        "correct": 3,
        "ref": "Appendix 2, Three Basic Principles - Division Principle; page 3.",
        "why": "The Plate Umpire normally covers home and third; the Base Umpire normally covers first and second. The stated exceptions modify this division."
      },
      {
        "q": "Per the Infield/Outfield Principle, where does the Base Umpire move when the ball is hit to the outfield?",
        "options": [
          "Into the infield",
          "Further into the outfield, toward the ball",
          "To a position on the foul line",
          "Behind home plate"
        ],
        "correct": 0,
        "ref": "Appendix 2, Three Basic Principles - Infield/Outfield Principle; page 3.",
        "why": "With the ball in the outfield, the Base Umpire moves into the infield to keep the play in front."
      },
      {
        "q": "What is the rationale behind the Leading Runner Principle in the Two-Umpire System?",
        "options": [
          "The lead runner is always the fastest runner on base and needs closer supervision",
          "The Base Umpire must always start closest to second base regardless of runners",
          "The Base Umpire positions with the lead runner because the catcher is expected to attempt a pick-off play on that runner",
          "The Plate Umpire delegates lead-runner coverage to avoid fatigue"
        ],
        "correct": 2,
        "ref": "Appendix 2, Leading Runner Principle; page 4.",
        "why": "The expected pickoff on the lead runner determines the Base Umpire's starting-position priority."
      },
      {
        "q": "With no runners on base, what is the Base Umpire's starting position per the manual?",
        "options": [
          "4-5 meters (15 feet) behind the base line, in fair territory",
          "Directly behind the pitcher's plate, facing home plate",
          "3.5 meters (10-12 feet) behind first base, on the foul line",
          "5.5 meters (18 feet) behind first base in foul territory, 150 mm (6 inches) off the line"
        ],
        "correct": 3,
        "ref": "Appendix 2, Base Umpire Position for Calls; No Runners on Base - Starting position; pages 5, 7.",
        "why": "With no runners, the Base Umpire starts about 5.5 meters (18 feet) behind first base in foul territory and 150 mm (6 inches) off the line."
      }
    ]
  },
  "m03-pca": {
    "module": "Module 03 — Foundations: Two-Umpire Field Mechanics",
    "moduleShort": "Module 03",
    "kind": "Presentation Competency Assessment",
    "title": "Foundations - Two-Umpire Field Mechanics",
    "nextLabel": "Continue to Module 04 - Three-Umpire Field Mechanics",
    "nextHref": "manuals.html#module-04",
    "questions": [
      {
        "q": "With no runners on base, the batter hits a routine ground ball to shortstop, who throws to first base. Who calls the play at first?",
        "options": [
          "Plate Umpire, because it is a force play.",
          "Whichever umpire is closer to the base.",
          "Base Umpire.",
          "Plate Umpire, because the batted ball was fair."
        ],
        "ref": "Appendix 2, No Runners on Base - Ball hit in the infield; page 8.",
        "why": "The Base Umpire moves into fair territory, lets the ball turn them into the play, then stops, waits, calls and signals. The Base Umpire has the play at first."
      },
      {
        "q": "With a runner on first base, the batter hits a ground ball that develops into a potential double play. Per the manual, what should the Base Umpire do?",
        "options": [
          "Anticipate the double play, move quickly toward the base where the first play will be made, and call all plays made on the first throw",
          "Remain in the ready position at first base until the throw is complete",
          "Immediately move to third base to cover R1's advance",
          "Hand off first-base coverage to the Plate Umpire"
        ],
        "ref": "Appendix 2, Runner at First Base - Ball hit in the infield; page 11.",
        "why": "Anticipate the double play and move toward the base where the first play will occur. Let the ball turn you into the play, then stop, wait, call and signal."
      },
      {
        "q": "With a runner on first base, the batter hits a fly ball to the outfield that is caught. Which umpire is responsible for the tag-up call at first base?",
        "options": [
          "Plate Umpire",
          "Base Umpire",
          "Both umpires jointly",
          "Neither - tag-ups are not judged on caught fly balls"
        ],
        "ref": "Appendix 2, Runner at First Base - Ball hit to the outfield; page 12.",
        "why": "With a runner at first and a fly ball to the outfield, the Base Umpire moves inside and takes the tag-up at first. The Plate Umpire judges catch/no catch."
      },
      {
        "q": "With runners on first and second, the runner who began on second attempts to steal third on the pitch. Which umpire has the call at third?",
        "options": [
          "Plate Umpire, because the normal division always applies at third.",
          "Whichever umpire is nearest home plate.",
          "Whichever umpire has the clearer angle at that moment.",
          "Base Umpire, under the stated steal exception."
        ],
        "ref": "Appendix 2, Three Basic Principles - Division Principle, Exceptions; page 3.",
        "why": "A steal from second to third is an explicit exception to the normal division: the Base Umpire makes the call."
      },
      {
        "q": "With runners on second and third, the batter hits a ball to the outfield. Which complete assignment follows the guide?",
        "options": [
          "Base Umpire takes the runner who started on second into third and the batter-runner through first, second and third; Plate Umpire watches the tag-up at third and prepares for a play at third or home.",
          "Base Umpire takes only the batter-runner through first and second; Plate Umpire takes both original runners and the batter-runner at third.",
          "Base Umpire takes the runner who started on third to home; Plate Umpire takes the batter-runner through all bases.",
          "Both umpires follow the runner who started on third and leave the batter-runner to advance without coverage."
        ],
        "ref": "Appendix 2, Runners at Second & Third Base - Ball hit to the outfield; page 27.",
        "why": "Page 27 assigns the original runner from second to the Base Umpire at third, along with the batter-runner through third. The Plate Umpire watches the tag-up at third and anticipates third/home action. Communicate any necessary deviation."
      },
      {
        "q": "With the bases loaded, a ground ball is fielded and the first throw goes directly home for a force play. Which umpire calls the play at home?",
        "options": [
          "Base Umpire, because every first throw belongs to the Base Umpire.",
          "Whichever umpire is nearest the pitcher.",
          "Both umpires simultaneously.",
          "Plate Umpire, who anticipates and covers the play at home."
        ],
        "ref": "Appendix 2, Division Principle; Runner at Third Base - Ball hit in the infield; Bases Loaded - Ball hit to the infield; pages 3, 17, 29.",
        "why": "The Plate Umpire covers home and must anticipate the play there. Do not read the Base Umpire's first-throw assignment as transferring home-plate coverage."
      },
      {
        "q": "The batter hits a ball to the outfield and, as the Batter Runner, advances all the way to third base. Under the exceptions to the Division Principle, who takes the call on the Batter Runner at third base?",
        "options": [
          "Plate Umpire, since third-base calls always belong to the Plate Umpire under the Division Principle",
          "Base Umpire",
          "Whichever umpire started the play closer to third base",
          "Plate Umpire, because the Base Umpire only covers first and second base calls"
        ],
        "ref": "Appendix 2, Division Principle, Exceptions; No Runners on Base - Ball hit to the outfield; pages 3, 9.",
        "why": "The batter-runner advancing to third is an explicit exception to the normal division. The Base Umpire takes the batter-runner through first, second and third."
      },
      {
        "q": "With a runner on second base only, and before the pitch, where should the Base Umpire be positioned?",
        "options": [
          "5.5 meters (18 feet) behind first base in foul territory",
          "Behind and off the second base fielder, shading toward first base",
          "Behind and off the shortstop, shading toward the runner on second base, with a view of the pitcher, runner and home plate area",
          "In the outfield grass behind second base"
        ],
        "ref": "Appendix 2, Runner at Second Base - Starting Position; page 13.",
        "why": "With a runner at second only, the Base Umpire starts behind and off the shortstop, shading toward that runner, while maintaining a view of the pitcher, runner and home-plate area."
      },
      {
        "q": "The Base Umpire is set up for a potential play at first base and it becomes clear the throw will require a tag rather than a force. Per the manual, what adjustment should the Base Umpire make?",
        "options": [
          "Move to approximately 3.5 meters (10-12 feet) to see and make the call",
          "Remain at 5.5 meters (18 feet), since that distance applies to all calls",
          "Move to 4-5 meters (15 feet) behind the baseline",
          "Retreat further into foul territory for a wider angle"
        ],
        "ref": "Appendix 2, Base Umpire Position for Calls; page 5.",
        "why": "The guide gives approximately 5.5 meters (18 feet) for force plays and 3.5 meters (10-12 feet) for tag plays. Adjust for the tag play while keeping the Four Essential Elements in front."
      },
      {
        "q": "With runners on first and third base, a ground ball is hit to the infield. The defense makes the first play (a force at second base), then throws home attempting to get the runner from third. Which umpire is responsible for calling this second, subsequent play at home plate?",
        "options": [
          "Base Umpire, since the Base Umpire calls all plays including follow-up throws",
          "Both umpires must call it simultaneously",
          "Whichever umpire is positioned in fair territory",
          "Plate Umpire, who is responsible for succeeding plays at third base or home plate after the first infield play"
        ],
        "ref": "Appendix 2, Runners at First & Third Base - Ball hit in the infield; page 23.",
        "why": "After the first infield play, the Plate Umpire covers succeeding plays at third or home. In this scenario the throw home is the subsequent play."
      },
      {
        "q": "With runners on first and second, the batter hits a ground ball and the defense makes its first play at third base. Who has that first call at third?",
        "options": [
          "Plate Umpire, because third base always belongs to the Plate Umpire.",
          "Base Umpire, under the exception for the first infield call on a base.",
          "Both umpires must signal.",
          "Neither umpire until the next throw is made."
        ],
        "ref": "Appendix 2, Division Principle, Exceptions; Runners at First & Second - Ball hit in the infield; pages 3, 20.",
        "why": "The first infield call on a base belongs to the Base Umpire even when it is at third. The Plate Umpire prepares for succeeding plays at third or home."
      },
      {
        "q": "With no runners on base, a fly ball is hit close to the right-field foul line. What does the guide require of the Plate Umpire?",
        "options": [
          "Stay behind the catcher and leave fair/foul and catch/no catch to the Base Umpire.",
          "Follow the batter-runner to second and make no ruling on the fly ball.",
          "Move toward the flight of the ball, straddle the line for the close fair/foul decision, and judge catch/no catch.",
          "Move directly to third base without watching the ball."
        ],
        "ref": "Appendix 2, Plate Umpire Starting Position; No Runners on Base - Ball hit to the outfield; pages 5, 9.",
        "why": "The Plate Umpire moves toward the flight of the ball and judges its status. On a hit close to a foul line, straddle the line for the fair/foul decision. The Base Umpire takes the batter-runner through the bases."
      },
      {
        "q": "A developing play requires you to deviate from the normal division of coverage in the two-umpire system. What must you do?",
        "options": [
          "Communicate the deviation to your partner.",
          "Assume your partner will work out the change without communication.",
          "Call \"Time\" immediately on every deviation.",
          "Continue to call every play at both bases yourself."
        ],
        "ref": "Appendix 2, Three Basic Principles - Division Principle, Exceptions; page 3.",
        "why": "The exceptions section expressly requires communication when umpires must deviate. Clear communication helps the crew maintain coverage and avoid competing calls."
      },
      {
        "q": "As the pitcher assumes the set position, how should the Base Umpire place their feet?",
        "options": [
          "One foot well ahead of the other",
          "Together, with the weight on the heels",
          "As wide as possible",
          "A comfortable distance apart, at least shoulder width, relaxed but still"
        ],
        "ref": "Appendix 2, Base Umpire Ready Position; page 5.",
        "why": "As the pitcher brings the hands together, place the feet a comfortable distance apart, at least shoulder width, and remain relaxed but still. At release, unlock the knees slightly, with weight lightly on the balls of the feet and hands near the belt."
      },
      {
        "q": "The batter is left-handed and hits the ball. Which side of the catcher does the guide require the Plate Umpire to use when exiting?",
        "options": [
          "The right side, because the batter is left-handed.",
          "Whichever side leads directly into the catcher's movement.",
          "Remain behind the catcher until every runner reaches a base.",
          "The left side, including when the batter is left-handed."
        ],
        "ref": "Appendix 2, Plate Umpire Starting Position; page 5.",
        "why": "The guide states that on every hit the Plate Umpire exits to the left of the catcher, even with a left-handed batter, then moves to the required position."
      },
      {
        "q": "With no runners initially on base, the throw to first following an infield hit gets away but remains in play. The batter-runner advances. What should the Base Umpire do next?",
        "options": [
          "Remain outside first base and leave both second and third to the Plate Umpire.",
          "Cut into the infield and prepare to take the batter-runner at second and third.",
          "Call \"Dead Ball\" solely because the throw was an overthrow.",
          "Follow the ball into the outfield and abandon the batter-runner."
        ],
        "ref": "Appendix 2, No Runners on Base - Ball hit in the infield; page 8.",
        "why": "On an overthrow following this infield play, the Base Umpire cuts into the infield and prepares for second and third. The scenario states that the ball remains in play."
      },
      {
        "q": "What must the Base Umpire NOT do when setting up before the pitch?",
        "options": [
          "Stand relaxed",
          "Face home plate",
          "Keep a clear view of home plate",
          "Set up ahead of any infielder before the catcher receives the pitch or the ball is batted"
        ],
        "ref": "Appendix 2, Base Umpire - Starting Position in Relation to Fielders; page 5.",
        "why": "Before the catcher receives the pitch or the ball is batted, the Base Umpire must not set up ahead of an infielder and must retain an unobstructed view of home plate."
      },
      {
        "q": "On an infield hit with no runners on base, what does the plate umpire do?",
        "options": [
          "Go to second base",
          "Trail the batter-runner about one third of the way to first base, watching for possible interference or obstruction",
          "Move straight to third base",
          "Stay behind the plate"
        ],
        "ref": "Appendix 2, Plate Umpire Starting Position; No Runners on Base - Ball hit in the infield; pages 5, 8.",
        "why": "With no runners on an infield hit, the Plate Umpire trails the batter-runner about one third of the way to first, watching for possible interference or obstruction and assisting as needed."
      },
      {
        "q": "Between innings in the Two-Umpire System, where does the plate umpire stand?",
        "options": [
          "Just off the third base line in foul territory, about one third of the way to third base",
          "Just off the first base line, about one third of the way to first base",
          "Behind the catcher",
          "At the pitcher's plate"
        ],
        "ref": "Appendix 2, Between Inning Position - Starting position; page 6.",
        "why": "Between innings, the Plate Umpire stands in foul territory just off the third-base line, about one third of the way to third. The Base Umpire uses the corresponding position on the first-base side."
      },
      {
        "q": "In the Two-Umpire System, who is responsible for calling illegal pitches?",
        "options": [
          "The Plate Umpire only",
          "Whichever umpire is closer to the pitcher's plate",
          "Both umpires share the responsibility",
          "The Base Umpire only"
        ],
        "ref": "Appendix 2, Plate Umpire Starting Position; No Runners on Base - Starting position; pages 5, 7.",
        "why": "Both umpires share responsibility for illegal pitches. The Plate Umpire also has the listed fair/foul and batting-infraction responsibilities; specific pitching responsibilities are developed in the Foundations guide."
      }
    ],
    "draw": 10
  },
  "m04-mkc": {
    "module": "Module 04 — Foundations: Three-Umpire Field Mechanics",
    "moduleShort": "Module 04",
    "kind": "Manual Knowledge Check",
    "title": "Foundations - Three-Umpire Field Mechanics",
    "nextLabel": "Continue to Presentations - Foundations to Appendix 4",
    "nextHref": "presentations.html#pres-01-05",
    "questions": [
      {
        "q": "According to the Three-Umpire System manual's 'Four Essential Elements', which four things must an umpire maintain an unobstructed view of to keep the play in front of them?",
        "options": [
          "The ball, the defensive players, the offensive players, and the base or area of play",
          "The ball, the pitcher, the catcher, and the base",
          "The ball, the runner, the coach, and the scoreboard",
          "The ball, the fielder, the dugout, and the foul line"
        ],
        "correct": 0,
        "ref": "Appendix 3, Four Essential Elements; page 4.",
        "why": "The four elements are the ball, defensive players, offensive players, and the base or area of play."
      },
      {
        "q": "Under the general Division Principle, subject to the stated exceptions and specific scenario instructions, which umpire normally takes calls at home plate and third base when a Base Umpire goes out on a fly ball?",
        "options": [
          "The remaining Base Umpire",
          "The Plate Umpire",
          "Whichever umpire is closest to third base",
          "Both umpires jointly"
        ],
        "correct": 1,
        "ref": "Appendix 3, Two Basic Coverage Principles - Division Principle; page 4.",
        "why": "The general division gives home and third to the Plate Umpire and first and second to the remaining Base Umpire. Apply the stated exceptions and the detailed scenario instructions."
      },
      {
        "q": "What does 'clearing the catcher' mean for the Plate Umpire, as described in the Three-Umpire System manual?",
        "options": [
          "Sprinting to the backstop to check for interference",
          "Signalling the catcher to stand up before every pitch",
          "Taking a small step to the Plate Umpire's left to move out from behind the catcher",
          "Moving directly behind the catcher for the best angle"
        ],
        "correct": 2,
        "ref": "Appendix 3, Plate Umpire Responsibilities and Positions - Clearing the Catcher; page 5.",
        "why": "Clearing the catcher means a small step to the Plate Umpire's left, creating space and opening the view before the play develops."
      },
      {
        "q": "In the Base Umpire Ready Position described in this manual, when should the umpire adopt the 'ready' position by unlocking the knees slightly and resting weight on the balls of the feet?",
        "options": [
          "As soon as the pitcher assumes the set position",
          "During the pre-game meeting",
          "Only after the ball is put in play",
          "As the pitcher starts the pitch"
        ],
        "correct": 3,
        "ref": "Appendix 3, Base Umpire Ready Position; page 5.",
        "why": "The feet are placed comfortably apart when the pitcher sets. As the pitcher starts the pitch, unlock the knees slightly, with weight lightly on the balls of the feet and hands near the belt."
      },
      {
        "q": "Per the Infield/Outfield Principle in the Three-Umpire System, what should a base umpire who is NOT going out on a fly ball do once the ball is in the outfield?",
        "options": [
          "Move out beyond the base line to back up the play",
          "Remain in the ready position at their original base",
          "Rotate inside the diamond",
          "Follow the ball toward the outfield fence"
        ],
        "correct": 2,
        "ref": "Appendix 3, Two Basic Coverage Principles - Infield/Outfield Principle; page 4.",
        "why": "Base umpires not going out rotate inside when the ball is in the outfield. When an umpire goes out, the remaining Base Umpire must rotate inside."
      }
    ]
  },
  "m04-pca": {
    "module": "Module 04 — Foundations: Three-Umpire Field Mechanics",
    "moduleShort": "Module 04",
    "kind": "Presentation Competency Assessment",
    "title": "Foundations - Three-Umpire Field Mechanics",
    "nextLabel": "Continue to Module 05 - Appendix 4: Elite Positioning Philosophies",
    "nextHref": "manuals.html#module-05",
    "questions": [
      {
        "q": "With no runners on base, a ground ball is hit to the infield resulting in a possible force play at first base. If the batter-runner is called safe at first and continues toward second base, which umpire has rotated into position to make that call, per the Three-Umpire System manual?",
        "options": [
          "The Plate Umpire, trailing the runner to second base",
          "U1, staying at first base to also cover second",
          "U3, rotating to second base in line with the plate umpire",
          "U3 remains at third base and does not rotate"
        ],
        "ref": "Appendix 3, No Runners on Base - Ball Hit to Infield; page 18.",
        "why": "U3 rotates to second, in line with the Plate Umpire, ready for a call if the batter-runner is safe at first and continues to second."
      },
      {
        "q": "With no runners on base, U1 goes out on a fly ball to the outfield. If the ball is not caught, which umpire is responsible for taking the batter-runner into second base and around to third base?",
        "options": [
          "The Plate Umpire",
          "U3",
          "U1 returns from the outfield to take the runner",
          "Coverage is shared equally between the Plate Umpire and U3"
        ],
        "ref": "Appendix 3, No Runners on Base - Umpire 1 Goes Out; page 21.",
        "why": "For this specific scenario, U3 moves inside and takes the batter-runner into second and around to third if the ball is not caught. The Plate Umpire initially assists with a possible first-base play and then prepares for home."
      },
      {
        "q": "With a runner on first base, a ground ball is hit to the infield presenting a potential double play. What does U3 do in anticipation of the throw to second base?",
        "options": [
          "Steps forward towards second base to get an angle on the throw",
          "Moves to third base to cover a possible advance",
          "Remains in the original ready position off the third base line",
          "Goes out toward the outfield to back up the throw"
        ],
        "ref": "Appendix 3, Runner on First Base - Ball Hit to Infield - Potential Double Play; page 23.",
        "why": "U3 usually steps forward toward second and adjusts to obtain the best angle for the throw to second. U1 prepares for the subsequent play at first."
      },
      {
        "q": "With a runner on second base only, a ground ball is hit to the infield. Which umpire is responsible for calls at both first and second base in this situation?",
        "options": [
          "U3",
          "The Plate Umpire",
          "Both U1 and U3 share the calls",
          "U1"
        ],
        "ref": "Appendix 3, Runner on Second Base - Ball Hit to Infield; page 27.",
        "why": "U1 moves toward the initial play and is responsible for first and second. U3 prepares for the runner advancing from second toward third."
      },
      {
        "q": "With a runner on third base only, a ground ball is hit to the infield. If U3 is unable to release R1 at third base (R1 does not proceed home), which umpire may be required to take the batter-runner to second base and make the call?",
        "options": [
          "U1",
          "U3, after releasing third base",
          "The Plate Umpire, moving up the first base line",
          "No umpire - the play is a dead ball"
        ],
        "ref": "Appendix 3, Runner on Third Base - Ball Hit to Infield; page 31.",
        "why": "If the runner remains at third and U3 cannot release that coverage, U1 may need to take the batter-runner to second. Read the runners and the other umpires' positions."
      },
      {
        "q": "With a runner on third base, U1 goes out on a fly ball. Which umpire moves to the holding zone between home and third base to watch the tag-up of R1, while also preparing for a possible call at home plate?",
        "options": [
          "U3",
          "The Plate Umpire",
          "U1, before leaving for the outfield",
          "No umpire watches the tag-up in this situation"
        ],
        "ref": "Appendix 3, Runner on Third Base - Umpire 1 Goes Out; page 34.",
        "why": "The Plate Umpire uses the holding zone between home and third to observe the tag-up at third, then moves as needed for a play at third or home. U3 moves inside to cover the batter-runner."
      },
      {
        "q": "With the bases loaded, U1 goes out on a fly ball within U1's coverage, away from the right-field-line exception. How should the remaining umpires divide tag-up observations?",
        "options": [
          "Plate Umpire watches first and second; U3 watches third.",
          "U3 watches all three tag-ups while the Plate Umpire watches only the catch.",
          "Plate Umpire watches the tag-up at third; U3 moves inside and watches the tag-ups at first and second.",
          "No tag-up observations are needed until the ball is caught."
        ],
        "ref": "Appendix 3, Runners on First, Second and Third Base - Umpire 1 Goes Out; page 50.",
        "why": "When U1 goes out in this scenario, the Plate Umpire observes the tag-up at third and prepares for third/home action. U3 moves inside to observe first and second. Observe first touch and the runners' contact with their bases."
      },
      {
        "q": "With runners on second and third base, a ground ball is hit to the infield. If R1 (the runner on third) advances toward home, what does U3 do, per the manual?",
        "options": [
          "Remains at third base regardless of R1's advance",
          "Follows R1 toward home plate",
          "Immediately rotates to first base",
          "Moves into fair territory about one step in anticipation of a play on R2 progressing from second base"
        ],
        "ref": "Appendix 3, Runners on Second and Third Base - Ball Hit to the Infield; page 40.",
        "why": "If the lead runner advances home, U3 steps into fair territory to prepare for the runner coming from second. If the lead runner stays at third, U3 retains third-base coverage."
      },
      {
        "q": "With a runner on first base, the ball is hit through the infield to the outfield and no umpire goes out. As R1 progresses toward second base, where does the Plate Umpire rotate to in preparation for a possible call?",
        "options": [
          "First base",
          "Third base",
          "The Plate Umpire remains at home plate",
          "Second base, alongside U3"
        ],
        "ref": "Appendix 3, Runner on First Base - Ball Hit Through the Infield; page 24.",
        "why": "As the runner from first progresses to second, the Plate Umpire rotates toward third for a possible call. The crew must also maintain home coverage as the rotation develops."
      },
      {
        "q": "With a runner on second base, the ball is hit through the infield toward right field. Per the manual's note, if there is a possibility of a play at third base on the throw-back, what should U3 do?",
        "options": [
          "Release to cover home plate",
          "Move back out beyond the base line in fair territory",
          "Remain on the foul line even with the base",
          "Rotate inside the diamond"
        ],
        "ref": "Appendix 3, Runner on Second Base - Ball Hit Through the Infield, Note; page 28.",
        "why": "On a hit to right or right-center, U3 may read the play from near the line. If a throwback play at third is possible, rotate inside. If the throw is home with no immediate third-base play, the guide allows movement back beyond the baseline in fair territory."
      },
      {
        "q": "A Base Umpire has gone out and the fly ball is caught. The remaining Base Umpire comes inside the diamond in front of the last runner. Under the stated exception, when may that umpire take the runner into third?",
        "options": [
          "Automatically, without communicating with the Plate Umpire.",
          "Only if the outfield umpire returns to cover home.",
          "After communicating that coverage with the Plate Umpire.",
          "Never; the Plate Umpire must take every runner at third without exception."
        ],
        "ref": "Appendix 3, Two Basic Coverage Principles - Division Principle, Exceptions; page 4.",
        "why": "After a caught fly ball, the remaining Base Umpire who comes inside in front of the last runner may take that runner into third, but only after communicating with the Plate Umpire."
      },
      {
        "q": "Before turning their back to go out on a fly ball, what should the umpire do?",
        "options": [
          "Look at their partners, then indicate and verbalise 'going'",
          "Wait for the plate umpire to call the ball",
          "Ask the coach",
          "Run straight out without any signal"
        ],
        "ref": "Appendix 3, Outfield Coverage Key Points; page 7.",
        "why": "Watch the flight of the ball, make umpire-to-umpire eye contact, then indicate and verbalize \"Going\" before turning your back to take the fly ball."
      },
      {
        "q": "In which direction do umpires signal an out on a caught fly ball in the outfield?",
        "options": [
          "Towards the scorer",
          "Towards home plate",
          "Towards the ball, after stopping, deciding and communicating",
          "Towards the dugout"
        ],
        "ref": "Appendix 3, Outfield Coverage Key Points; page 7.",
        "why": "Stop, decide and communicate. Signal the out toward the ball. Give a no-catch signal for a trapped ball when needed; an obvious no-catch does not require a routine safe signal."
      },
      {
        "q": "Once an umpire has gone out to the outfield, what must they do?",
        "options": [
          "Remain in the outfield until all play has ceased, but keep observing infield plays so they can assist if requested",
          "Return to the infield immediately",
          "Go to second base",
          "Stay and look only at the outfield"
        ],
        "ref": "Appendix 3, Outfield Coverage Key Points; page 7.",
        "why": "The umpire who goes out remains in the outfield until all play has ceased, while continuing to observe infield action in case information is needed in a crew discussion."
      },
      {
        "q": "Who signals a home run in the Three-Umpire System?",
        "options": [
          "Always the umpire at first base",
          "The umpire nearest the dugout",
          "Always the plate umpire",
          "The umpire in the outfield, unless no base umpire moved to the outfield, in which case the plate umpire"
        ],
        "ref": "Appendix 3, Outfield Coverage Key Points; page 7.",
        "why": "The outfield umpire signals the home run. If no Base Umpire moves to the outfield, that responsibility belongs to the Plate Umpire."
      },
      {
        "q": "A base umpire mistakenly does not go out to a fly ball. Who makes the call?",
        "options": [
          "The umpire at second base, if there is one",
          "The plate umpire",
          "The coach",
          "The nearest outfielder"
        ],
        "ref": "Appendix 3, Outfield Coverage Key Points; page 7.",
        "why": "If a Base Umpire mistakenly does not go out on a fly ball, the Plate Umpire makes the call. Base umpires may assist on trapped balls. This does not require the crew to abandon its remaining coverage."
      },
      {
        "q": "With a runner at third, the runner's lead blocks U3's view of home plate. What starting-position adjustment does the guide permit?",
        "options": [
          "Move in front of the shortstop so the runner is behind the umpire.",
          "Stay directly on the foul line and accept the blocked view.",
          "Move behind the catcher to share the Plate Umpire's view.",
          "Work in foul territory behind third, up to about 2 meters (6 feet) off the foul line, to retain an unobstructed view of home plate and the batter."
        ],
        "ref": "Appendix 3, Mechanic for U3 at Third Base; Runner on Third Base - Starting Positions and Outfield Coverage; pages 6, 13.",
        "why": "U3 must avoid being screened by the runner leading off or returning to third. The wider starting position in foul territory preserves the view needed for dead-ball situations and assistance on checked swings."
      },
      {
        "q": "At the pre-game meeting in the Three-Umpire System, where does U1 stand?",
        "options": [
          "Behind the catcher",
          "At the infield end of the right-hander's batter's box",
          "At the infield end of the left-hander's batter's box, looking towards the back net",
          "On first base"
        ],
        "ref": "Appendix 3, Three Umpire Field Mechanics and Coverage - Pre-Game Meeting Positioning; page 8.",
        "why": "U1 stands at the infield end of the left-handed batter's box facing the back net. U3 takes the corresponding position at the right-handed batter's box."
      },
      {
        "q": "After the third out with no runners on base, who sweeps the pitcher's plate on the way to the base lines?",
        "options": [
          "U3",
          "Whoever is closest to the dugout",
          "The plate umpire",
          "U1"
        ],
        "ref": "Appendix 3, Completion of Innings; page 10.",
        "why": "The closest Base Umpire normally sweeps the pitching plate. With no runners on, or if both Base Umpires are equally distant, U3 takes the responsibility."
      },
      {
        "q": "On a playback tag at first base, the initial position does not give U1 a clear view of the tag and the leading edge. Which adjustment is permitted by the guide?",
        "options": [
          "Remain fixed and infer the tag from the runner's reaction.",
          "Adjust to keep the Four Essential Elements in view, including moving into foul territory if necessary while retaining sight of the leading edge.",
          "Move directly behind the fielder so the tag area is hidden.",
          "Ignore the leading edge and watch only the glove."
        ],
        "ref": "Appendix 3, Mechanic for a Tag Play at First Base in the Three-Umpire System; page 6.",
        "why": "The first-base playback is often a swipe tag. The guide permits a foul-territory position when needed to keep the Four Essential Elements in front, but U1 must still see the leading edge. Adjust as the play develops."
      }
    ],
    "draw": 10
  },
  "m05-mkc": {
    "module": "Module 05 — Appendix 4: Elite Umpire Mechanics, Positioning Philosophies",
    "moduleShort": "Module 05",
    "kind": "Manual Knowledge Check",
    "title": "Appendix 4: Elite Positioning Philosophies",
    "nextLabel": "Continue to Presentations - Foundations to Appendix 4",
    "nextHref": "presentations.html#pres-01-05",
    "questions": [
      {
        "q": "According to Appendix 4's Key Concepts and Glossary, what are the 'Four Essential Elements' an umpire must observe together to make an accurate decision?",
        "options": [
          "The umpire's position, the runner's speed, the crowd noise, and the scoreboard",
          "The pitcher, the catcher, the batter, and the plate",
          "The ball, the defensive player, the offensive player(s), and the base or area of play",
          "The starting position, the calling position, the focal point, and the leading edge"
        ],
        "correct": 2,
        "ref": "Appendix 4, Section 1 - Key Concepts and Glossary, \"Four Essential Elements.\""
      },
      {
        "q": "In Appendix 4's Key Concepts and Glossary, how is 'Parallax Error' defined?",
        "options": [
          "A visual distortion that occurs when the umpire views a play from a poor angle that prevents clear separation and timing of the elements of the play",
          "A rule violation that occurs when a pitcher's stepping foot lands outside the pitching lane",
          "The delay between an umpire seeing a play and signalling a decision",
          "A mechanical error caused by starting too far from the base"
        ],
        "correct": 0,
        "ref": "Appendix 4, Section 1 - Key Concepts and Glossary, \"Parallax Error\"; see also Section 8, Parallax Error in Softball Umpiring."
      },
      {
        "q": "Where is the Point of Plate (POP) Position generally located?",
        "options": [
          "Directly on the foul line, level with first base",
          "Approximately 3-4 metres (10-12 feet) directly behind home plate, aligned with the centre axis of the plate",
          "Inside the diamond, halfway between home plate and the pitcher's plate",
          "At the Second Base Diagonal Angle, 3-4 metres behind second base"
        ],
        "correct": 1,
        "ref": "Appendix 4, Section 1 - Key Concepts and Glossary, \"Point of Plate (POP) Position.\""
      },
      {
        "q": "What disciplined sequence does Appendix 4 identify as the technique umpires use to avoid anticipation and cognitive bias before making and communicating a decision?",
        "options": [
          "See - Move - React - Call",
          "Position - Track - Judge - Signal",
          "Watch - Wait - Confirm - Announce",
          "Stop - See - Decide - Signal"
        ],
        "correct": 3,
        "ref": "Appendix 4, Section 1 - Key Concepts and Glossary, \"Timing (Stop-See-Decide-Signal)\"; see also Section 9, Visual Discipline and Cognitive Bias in Umpire Judgment."
      },
      {
        "q": "How does Appendix 4 describe its relationship to Appendix 5?",
        "options": [
          "Appendix 4 replaces Appendix 5 for umpires below elite level",
          "Appendix 4 and Appendix 5 cover identical content in different formats",
          "Appendix 4 provides the why; Appendix 5 will provide the how",
          "Appendix 4 is only for trainers, while Appendix 5 is only for umpires"
        ],
        "correct": 2,
        "ref": "Appendix 4, Section 11 - Preparing for Appendix 5: Applying Elite Mechanics."
      }
    ]
  },
  "m05-pca": {
    "module": "Module 05 — Appendix 4: Elite Umpire Mechanics, Positioning Philosophies",
    "moduleShort": "Module 05",
    "kind": "Presentation Competency Assessment",
    "title": "Appendix 4: Elite Positioning Philosophies",
    "nextLabel": "Continue to Module 06 - Appendix 5: Elite Field Mechanics",
    "nextHref": "manuals.html#module-06",
    "watchFirst": "presentations.html#pres-01-05",
    "questions": [
      {
        "q": "During a bang-bang tag play at third base, the umpire clearly sees the fielder's glove make contact with the runner's leg but does not clearly track whether the runner's hand had already reached the base. The umpire calls the runner out based on the glove contact alone. Which principle from Appendix 4 best explains the risk in this decision-making process?",
        "options": [
          "Anticipatory signalling, because the umpire prepared the signal before the play began",
          "Affirmation bias, because fixating on the tag action can cause the brain to prematurely confirm an out and override the actual relationship between the ball, runner, and base",
          "Parallax error, because the umpire was positioned too far from the play",
          "A breach of primary responsibilities, because the umpire failed to rotate to the correct base"
        ],
        "ref": "Appendix 4, Section 9 - Visual Discipline and Cognitive Bias in Umpire Judgment, \"Affirmation Bias: Focusing Only on the Tag.\""
      },
      {
        "q": "A sharp line drive travels near the third-base bag. The Plate Umpire, positioned behind the catcher, is the only umpire with a view of the play. Based on Appendix 4's explanation of parallax error, why is this positioning a concern, and what does correct mechanics require?",
        "options": [
          "It is not a concern, because the Plate Umpire's slot position is aligned with every part of the field",
          "The Plate Umpire should call the play from memory of the pitch location rather than the batted ball",
          "It is only a concern for home run judgments, not for line drives near a base",
          "Parallax may make the ball appear fair or foul incorrectly from behind the plate; mechanics require an umpire to be on the foul line to accurately judge the call"
        ],
        "ref": "Appendix 4, Section 8 - Parallax Error in Softball Umpiring, \"Fair/Foul on Line Drives.\""
      },
      {
        "q": "A runner attempting to avoid a swipe tag at second base slides to the back corner of the bag, away from the umpire's position on the Second Base Diagonal Angle. What does Appendix 4 direct the umpire to do in this situation?",
        "options": [
          "Remain fixed on the Second Base Diagonal Angle regardless of how the play develops, since it is the designated starting reference",
          "Immediately move to the Point of Plate position to gain a better angle",
          "Adjust position along the diagonal or move off it as needed, since the priority is always maintaining an unobstructed view of the key elements",
          "Call time and reposition only after the play has concluded"
        ],
        "ref": "Appendix 4, Section 1 - Key Concepts and Glossary, \"Second Base Diagonal Angle.\""
      },
      {
        "q": "On a potential tag play, a runner runs directly at the umpire, forcing the umpire to move suddenly to avoid a collision. What does Appendix 4 say this situation indicates?",
        "options": [
          "The umpire was in the wrong position or did not wait for the play to develop properly",
          "The runner committed interference and should be called out automatically",
          "The umpire correctly anticipated the play and should hold their ground next time",
          "This is a normal and unavoidable part of elite mechanics requiring no adjustment"
        ],
        "ref": "Appendix 4, Section 4 - Observation and calling positions."
      },
      {
        "q": "During a game, the umpire positioned near second base has a clear, obvious view that the pitcher's stepping foot landed completely outside the pitching lane, while the Plate Umpire's angle does not allow a clear view of the violation. According to Appendix 4, what should the umpire near second base do?",
        "options": [
          "Say nothing, because only the Plate Umpire has authority to call an illegal pitch",
          "Wait until the next inning to raise the issue with the Plate Umpire privately",
          "If certain, call the illegal pitch, since WBSC mechanics permit the umpire near second base to manage the stepping foot when it is completely outside the pitching lane",
          "Signal the Plate Umpire discreetly but never call the violation directly"
        ],
        "ref": "Appendix 4, Section 6 - Managing Pitching Philosophy, Responsibility and the Pitching Lane."
      },
      {
        "q": "An umpire begins forming their 'out' signal mentally while the fielder is still completing the tag attempt, before the play has fully concluded. According to Appendix 4, what is the likely consequence of this habit?",
        "options": [
          "It disrupts timing and encourages early calling, because the brain shifts focus away from processing the final elements of the action",
          "It has no effect on accuracy, since experienced umpires can multitask effectively",
          "It improves reaction time and is a recommended technique for bang-bang plays",
          "It only affects balls and strikes calls, not tag plays"
        ],
        "ref": "Appendix 4, Section 9 - Visual Discipline and Cognitive Bias in Umpire Judgment, \"Anticipatory Signalling.\""
      },
      {
        "q": "In a Four-Umpire system, a fly ball is hit into the gap where both U1 and U2's coverage areas overlap, with U1 also converging on the ball. Which umpire should go out first, per Appendix 4?",
        "options": [
          "U2 should go out first because U2 has the more central starting position",
          "Both umpires should go out simultaneously to double-cover the play",
          "Neither umpire should go out; the Plate Umpire must cover all converging fly balls",
          "U1 should have the first opportunity to go out, since U2 should allow U1 or U3 the first opportunity and only go out if neither does"
        ],
        "ref": "Appendix 4, Section 7 - Outfield coverage, \"In a Four-Umpire system.\""
      },
      {
        "q": "An umpire's initial angle on a developing tag play is poor, but the umpire moves purposefully to a better angle as the throw arrives. Which technique described in Appendix 4 does this reflect, and what is its purpose?",
        "options": [
          "Active feet, used solely to maintain balance while standing still",
          "The mental snapshot technique, in which the umpire takes a mental photograph from the initial angle, then a second from the improved angle, combining them into a clearer 3D picture of the play",
          "Parallax correction, which eliminates the need to change position",
          "The leading edge principle, which requires the umpire to remain at 90 degrees to the runner's path at all times"
        ],
        "ref": "Appendix 4, Section 8 - Parallax Error in Softball Umpiring, \"Mental Snapshots: A Technique to Improve Judgment.\""
      },
      {
        "q": "A Base Umpire in a 3- or 4-umpire system must decide whether to go out on a fly ball. One available position is closer to the play but offers a compromised sightline; another is farther away but offers a clean, unobstructed angle. Which choice reflects Appendix 4's stated principle for outfield coverage decisions?",
        "options": [
          "The farther position with the clean angle, because in all cases angles take priority over distance",
          "The closer position, because proximity always produces the most accurate judgment",
          "Neither position; the umpire should request a video review",
          "The closer position, because distance takes priority over angle in outfield coverage"
        ],
        "ref": "Appendix 4, Section 7 - Outfield coverage."
      },
      {
        "q": "A developing umpire treats their textbook starting position at second base as the position from which every call must be made, even as a throw and tag pull the play toward the leading edge. Which key principle from Appendix 4 does this approach fail to reflect?",
        "options": [
          "Primary Responsibilities, because the umpire must always rotate to another base first",
          "Dynamic Positioning and Adjustments, because there is no 'X marks the spot' position - starting and observation positions must never be assumed to be the final calling position",
          "Pre-Pitch Preparation and Outfield Coverage, because the umpire failed to anticipate outfielder depth",
          "Parallax Error, because the umpire was aligned with the wrong plane"
        ],
        "ref": "Appendix 4, Section 2.1 - Dynamic Positioning and Adjustments."
      },
      {
        "q": "What is the 'mental snapshot' technique described in Appendix 4?",
        "options": [
          "Count the pitches in each at-bat",
          "Memorise the batter's stance before each pitch",
          "Take a photograph with a phone after the play",
          "Take a mental photograph of the play from the initial angle, move quickly to a better angle, take a second photograph, and combine them into a clearer 3D picture"
        ],
        "ref": "Appendix 4, Section 8 - Parallax Error in Softball Umpiring, Mental Snapshots.",
        "why": "Good judgement comes from gathering as much visual information as possible; obtaining the correct angle often matters more than physical proximity."
      },
      {
        "q": "Which sequence does Appendix 4 give for good timing on a play?",
        "options": [
          "Signal, see the play, decide, stop",
          "See the play, signal, decide, process the play",
          "Stop, see the play, process the play, decide, signal",
          "Decide, stop, signal, see the play"
        ],
        "ref": "Appendix 4, Section 9 - Visual Discipline and Cognitive Bias in Umpire Judgment, Anticipatory Signalling.",
        "why": "Preparing the signal before the play is complete shifts the brain's focus away from the final elements of the action and encourages early calling."
      },
      {
        "q": "According to Appendix 4, what is the risk of focusing only on the tag action?",
        "options": [
          "The umpire will move too early to the leading edge",
          "The umpire will lose track of the count",
          "The brain may prematurely 'affirm' an out because it sees the glove contact the runner, overriding the relationship between the ball, runner and base, such as the runner already touching the base",
          "The umpire will see the ball too well"
        ],
        "ref": "Appendix 4, Section 9 - Visual Discipline and Cognitive Bias in Umpire Judgment, Affirmation Bias.",
        "why": "Poor angle or parallax combined with affirmation bias increases the likelihood of an incorrect call; when the eyes are not aligned with the play, the brain fills in missing information, often incorrectly."
      },
      {
        "q": "Under Appendix 4, when can the umpire near second base call an illegal pitch for the pitcher's stepping foot?",
        "options": [
          "Only when the plate umpire asks",
          "Whenever the foot touches the edge of the lane",
          "Only in the first inning",
          "When the stepping foot lands wholly outside the pitching lane and the violation is clear and obvious"
        ],
        "ref": "Appendix 4, Section 6 - Managing Pitching Philosophy, Responsibility and the Pitching Lane.",
        "why": "Only the stepping foot must land within the pitching lane. The standard for enforcement is clear and obvious; the adjustment to see it is temporary and must not compromise primary responsibilities."
      },
      {
        "q": "According to Appendix 4, who can accurately judge whether a deep fly ball passes inside or outside the foul pole?",
        "options": [
          "The plate umpire from behind the catcher",
          "An umpire on the foul line with an unobstructed view of the foul pole",
          "Any umpire inside the diamond",
          "The umpire near second base"
        ],
        "ref": "Appendix 4, Section 8 - Parallax Error in Softball Umpiring, Home Run Judgments.",
        "why": "Adding distance, or viewing from inside the diamond, increases parallax error; an umpire near second base is at an angle that distorts the judgement."
      },
      {
        "q": "From the slot, which parts of the strike zone does Appendix 4 say the plate umpire sees most clearly?",
        "options": [
          "The inside and the top; the outside corner and the bottom are harder to judge",
          "The outside and the bottom; the inside and the top are harder to judge",
          "Only the middle of the plate",
          "All parts equally"
        ],
        "ref": "Appendix 4, Section 8 - Parallax Error in Softball Umpiring, Balls & Strikes.",
        "why": "The plate umpire's eyes are aligned with the inside and top planes; for the outside and low pitches the pitcher's release point and the catcher's glove movement give additional inputs."
      },
      {
        "q": "How far behind second base is the standard starting position for U2 or U3 at second base, according to Appendix 4?",
        "options": [
          "On the base itself",
          "Approximately 3-4 m (10-12 ft), within the area formed by the Second Base Diagonal Angle and the extension of the third base line",
          "Approximately 8-10 m (26-33 ft) directly behind the base",
          "About 1 m (3 ft), beside the base"
        ],
        "ref": "Appendix 4, Section 5 - Starting position at second base: U2 or U3.",
        "why": "This position establishes a proactive observation point and lets the umpire move efficiently around the base; starting further away increases the movement arc."
      },
      {
        "q": "According to Appendix 4, on which hits must a base umpire in a 3- or 4-umpire system go out?",
        "options": [
          "Only hits that go over the fence",
          "Only when the plate umpire asks",
          "Any hit that could be caught by an outfielder in their coverage area, requires a fair/foul decision in the outfield, or could be a home run",
          "Only hits that are caught"
        ],
        "ref": "Appendix 4, Section 7 - Outfield coverage.",
        "why": "In all cases angles take priority over distance."
      },
      {
        "q": "In a Four-Umpire system, what does U2 do when U1 goes out on a fly ball toward the right-field area?",
        "options": [
          "Moves inside to cover both first and second base, which reduces the need for a full crew rotation",
          "Goes out as well",
          "Stays at second base",
          "Rotates to home plate"
        ],
        "ref": "Appendix 4, Section 7 - Outfield coverage.",
        "why": "U1 going out on hits to right field improves coverage of the bases closer to home plate."
      },
      {
        "q": "In a Three-Umpire system with U1 at first base and U3 at third base, how is the outfield divided for going out?",
        "options": [
          "U3 takes the whole outfield",
          "U1 takes the whole outfield",
          "The plate umpire takes all fly balls",
          "It is split down the middle: U1 goes out from centre field to the right-field foul line and U3 from centre field to the left-field foul line"
        ],
        "ref": "Appendix 4, Section 7 - Outfield coverage.",
        "why": "If an umpire starts at second base the split changes: the plate umpire covers fly balls from the left fielder (or right fielder) to the foul line."
      }
    ],
    "draw": 10
  },
  "m06-mkc": {
    "module": "Module 06 — Appendix 5: Elite Three, Four, Five and Six-Umpire Field Mechanics",
    "moduleShort": "Module 06",
    "kind": "Manual Knowledge Check",
    "title": "Appendix 5: Elite Field Mechanics",
    "nextLabel": "Continue to Presentations - Appendix 5, Part A: Key Concepts",
    "nextHref": "presentations.html#pres-5a",
    "questions": [
      {
        "q": "In Appendix 5a's Four Essential Element Theory (FEET), what are the four elements umpires must observe together to make a correct call?",
        "options": [
          "The pitcher, the catcher, the batter, and the base umpire",
          "The ball, the defensive player, the offensive players, and the base or the area of the play",
          "The strike zone, the runner's lead, the tag, and the fielder's glove",
          "The starting position, the observation position, the calling position, and the base"
        ],
        "correct": 1,
        "ref": "Appendix 5a, Key Concepts Introduction - Four Essential Element Theory (FEET); page 7.",
        "why": "The ball, defensive player, offensive players and base or area of play must be seen together, including control of the ball and the tag/base relationship."
      },
      {
        "q": "Per Appendix 5a, the Point of Plate (POP) position is located approximately how far behind home plate?",
        "options": [
          "1-2 meters (3-6 feet)",
          "6-12 meters (20-40 feet)",
          "3-5 meters (9-15 feet)",
          "2-4 meters (6-12 feet)"
        ],
        "correct": 3,
        "ref": "Appendix 5a, Point of Plate (POP) Position; page 17.",
        "why": "POP is an area approximately 2-4 meters behind home, not a fixed calling spot. Use it when primary duties permit and adjust as the play develops."
      },
      {
        "q": "According to Appendix 5a, what does 'Backfilling' refer to?",
        "options": [
          "An umpire clearing the catcher to obtain an unobstructed view of the field",
          "An umpire moving to the leading edge of a base to judge a tag play",
          "An umpire counter-rotating to cover a position not filled by another umpire who is required to cover a play elsewhere",
          "An umpire returning to their between-innings position after a play concludes"
        ],
        "correct": 2,
        "ref": "Appendix 5a, Backfilling; pages 17, 18.",
        "why": "Backfilling counter-rotates an umpire into coverage left vacant because another umpire must cover a play elsewhere. Read the play and communicate."
      },
      {
        "q": "What does Appendix 5a give as the purpose for use of the Five and Six-Umpire Systems?",
        "options": [
          "To allow two dedicated outfield umpires to cover fly-ball responsibilities so the remaining umpires can stay in the infield and cover bases at all times",
          "To replace the Plate Umpire with two additional outfield umpires",
          "To eliminate the need for any rotations between bases",
          "To allow all umpires to officiate exclusively from foul territory"
        ],
        "correct": 0,
        "ref": "Appendix 5a, Purpose of the Five and Six-Umpire Systems; page 22.",
        "why": "Dedicated outfield coverage allows the remaining umpires to maintain infield/base coverage, particularly at third and home. This purpose is stated in Appendix 5a itself; detailed system mechanics are not assessed here."
      },
      {
        "q": "What is the purpose of the holding position described in Appendix 5a?",
        "options": [
          "To provide a flexible observation area in foul territory from which the umpire reads which base, 3B or HP, needs coverage and can move to that base.",
          "To replace all rotation responsibilities with a fixed calling spot.",
          "To keep U1 waiting near first instead of completing a required rotation home.",
          "To keep the plate umpire in a position where he can make a call at both bases from a distance."
        ],
        "correct": 0,
        "ref": "Appendix 5a, Holding Position; page 17.",
        "why": "The holding position is an oval area that permits active observation and adjustment. It can be nearer the likely play while still allowing movement to the other base if needed."
      }
    ]
  },
  "m06-pca": {
    "module": "Module 06 — Appendix 5a: Key Concepts",
    "moduleShort": "Module 06",
    "kind": "Presentation Competency Assessment",
    "title": "Appendix 5a: Key Concepts",
    "nextLabel": "Continue to Presentation - Appendix 5b: Three-Umpire System",
    "nextHref": "presentations.html#pres-5b",
    "watchFirst": "presentations.html#pres-5a",
    "questions": [
      {
        "q": "You are set to judge a force play when the fielder leaves the base to catch an errant throw and attempts a swipe tag. What should you do?",
        "options": [
          "Keep the original view and judge only whether the throw arrived first.",
          "Watch only the runner because the ball and fielder's possession can be assumed peripherally.",
          "Read the change in the play, use controlled adjustment to see the ball-glove, tag, runner and base relationship, and judge the complete play as all elements come together before signaling.",
          "Move directly over the base to shorten the view as angle is preferred over distance."
        ],
        "ref": "Appendix 5a, Four Essential Element Theory; Dynamic Movement; Force Plays; Making the Call; pages 7, 8, 11, 14.",
        "why": "A developing tag can require a different angle from the initial force-play view. Preserve sight of all four elements, including control and the base touch, rather than assuming the original calling position remains sufficient."
      },
      {
        "q": "According to Appendix 5a, when does parallax error most commonly occur?",
        "options": [
          "Parallax error is mainly caused by distance. Moving closer improves judgment regardless of the angle, provided the umpire can see the runner and fielder.",
          "An unsuitable viewing angle can distort the relationship between the runner, base and tag point. Greater distance can compound this, with straight-lining of all the elements causing the greatest loss of visual separation.",
          "Parallax error occurs only when the elements are completely straight-lined. Until then, the umpire can accurately judge the sequence without adjusting their position.",
          "Remaining stationary at the original observation position prevents parallax error. Moving during the play changes the perspective and makes the sequence less reliable, even when the original view becomes partly blocked."
        ],
        "ref": "Appendix 5a, Parallax Error; page 9.",
        "why": "Parallax error can affect judgment before the umpire becomes completely straight-lined. An unsuitable angle can distort the apparent relationship between the runner, base and tag point, and greater distance can compound the problem. Straight-lining is particularly dangerous because the elements overlap, reducing depth perception and potentially hiding whether the runner touched the base before the tag. Use the leading edge when it provides the required view, and adjust purposefully to maintain an unobstructed angle and visual separation."
      },
      {
        "q": "An umpire wants to remove parallax error on a fair/foul call. What does Appendix 5a say they should do?",
        "options": [
          "Stand as far back as possible to see the whole field",
          "Rely on the base umpire to make the call",
          "Wait for the ball to stop before deciding",
          "Position themselves on the plane of the call, such as on the fair/foul line"
        ],
        "ref": "Appendix 5a, Parallax Error; page 9.",
        "why": "For a fair/foul decision, move onto the relevant fair/foul line so the ball can be judged against that plane directly. Additional timing and angle adjustments may still be needed for other elements of the play."
      },
      {
        "q": "With a runner on second, the umpire working 2BDA may need to cover first if U1 goes out. Which starting choice does Appendix 5a prefer?",
        "options": [
          "Start on the 1B side and/or be ready to move toward the first-base side of 2BDA, maintaining an unobstructed view of home and the batter, so the umpire can move inside promptly for possible first-base coverage.",
          "Use the third-base-side alternate position to obtain the best angle on a possible pickoff at second, then move across the diamond if first-base coverage becomes necessary.",
          "Start farther behind second on 2BDA to obtain a wider view of the outfield, accepting the additional movement needed to establish a calling position at first.",
          "Start toward the third-base-line extension to prioritise the runner advancing to third, leaving U1 responsible for first until the outfield play is completed."
        ],
        "ref": "Appendix 5a, Second Base Diagonal Angle; page 21.",
        "why": "With a runner on second, starting on 1B side, the preferred side or slightly toward the first-base side of 2BDA helps the umpire move inside and cover first if U1 goes out. The position must still provide an unobstructed view of home and the batter and allow the umpire to establish the required angle and distance for the developing play. U2 does not then have to worry about the runners lead off from 2B."
      },
      {
        "q": "On a play, what distance from the base does Appendix 5a give for a force play and for a tag play?",
        "options": [
          "About 3 m (10 ft) for a force play and 5 m (16 ft) for a tag play",
          "About 5 m (16 ft) for a force play and 3 m (10 ft) for a tag play",
          "About 5 m (16 ft) for both",
          "About 3 m (10 ft) for both"
        ],
        "ref": "Appendix 5a, Optimising Angle and Distance; page 10.",
        "why": "Appendix 5a gives approximately 5 meters for a force play and 3 meters for a tag play. These are working distances, not the separate before-pitch starting distances. Angle takes priority when angle and distance cannot both be ideal; retain room to adjust and reach the leading edge."
      },
      {
        "q": "U1 needs to come inside to cover multiple bases and remain able to adapt to a late going-out decision or backfill. Which technique follows Appendix 5a?",
        "options": [
          "Enter the diamond and button-hook by turning around the left shoulder, retaining the view and flexibility for the required coverage.",
          "Keep the right foot planted at first and twist only the upper body.",
          "Follow the ball into the outfield without checking the runner or crew.",
          "Stay in foul territory even when that prevents covering the required base."
        ],
        "ref": "Appendix 5a, Advanced Base Umpire Movements - U1 Using Button Hook; page 16.",
        "why": "Button-hooking turns around the left shoulder after entering the diamond. It supports multiple-base coverage and adaptation to a changed rotation, backfill or a partner's late decision. U2 also uses it in the four-umpire example when U1 goes out."
      },
      {
        "q": "Why does Appendix 5a say an umpire must never position directly over a base when making a call?",
        "options": [
          "It places the umpire too close to follow the throw into the glove, so the calling position should remain at force-play distance even when a tag develops.",
          "It prevents the umpire from maintaining a 90-degree angle to the throw, which must be held throughout both force and tag plays.",
          "It limits the umpire’s view of secondary plays, so the calling position should prioritise the next possible throw rather than the tag and base touch.",
          "It vertically aligns the umpire’s eyes with the base, causing the ball, tag and leading edge to overlap, reducing depth perception and making their timing harder to judge."
        ],
        "ref": "Appendix 5a, Starting Position, Observation Position and Calling Position; page 12.",
        "why": "Calling directly over the base can collapse the elements into a straight-lined view. This reduces visual separation and may distort whether the runner touched the base before the tag. A position just short of the leading edge, with appropriate angle, depth and adjustment, helps the umpire see the elements come together clearly."
      },
      {
        "q": "A ball is hit to the outfield and no umpire goes out. U2 can keep all Four Essential Elements in front from outside. Which statement correctly applies Appendix 5a?",
        "options": [
          "Every Base Umpire must remain outside whenever no umpire goes out.",
          "U2 must call time before choosing a position.",
          "U2 may stay outside in that circumstance; if an umpire goes out, the remaining Base Umpires must come inside for coverage and backfill.",
          "U2 may stay outside even when a partner goes out and inside coverage is needed."
        ],
        "ref": "Appendix 5a, Advanced Base Umpire Movements - Inside/Outside Theory; page 16.",
        "why": "Coming inside is the usual response to the ball in the outfield. Section 5a expressly allows U2 to remain outside if all four elements stay in front and nobody goes out. Any umpire going-out situation requires the remaining Base Umpires to come inside for coverage and in particular backfilling."
      },
      {
        "q": "In the four-umpire backfill example, U2 or U3 goes out and the Plate Umpire communicates that they are staying at home for a play. What should the remaining Base Umpires do?",
        "options": [
          "The remaining U2 or U3 umpire covers third; U1 works inside to cover first and second if possible, with an alternative position and crew adjustment if moving inside would interfere with play.",
          "Both remaining Base Umpires stay at second until the play at home ends.",
          "Order the Plate Umpire to leave home for third even though the play is at home.",
          "Require U1 to enter the diamond even if doing so interferes with a runner or throw."
        ],
        "ref": "Appendix 5a, Advanced Base Umpire Movements - Backfilling; pages 17, 18.",
        "why": "The Plate Umpire's home-coverage communication triggers this example. The remaining U2/U3 backfills third. If U1 cannot enter without interference, U1 moves toward the fence near the first-base dugout and the partner stays aware of possible second-base coverage."
      },
      {
        "q": "On a close force play where the runner reaches the base and then the fielder receives the throw, an umpire who watches the throw or rushes the call is most likely to make what error, per Appendix 5a?",
        "options": [
          "Call the runner safe",
          "Call the runner out, because they are still processing the throw being caught",
          "Call interference",
          "Fail to see the base"
        ],
        "ref": "Appendix 5a, Errors Due to Timing and Focus; page 21.",
        "why": "The runner is safe in the stated sequence, but a rushed umpire may react to the later catch and call out. A slight pause allows all inputs to be processed in order before deciding and communicating."
      },
      {
        "q": "U1 is required to rotate home while the lead runner advances. Which approach follows Appendix 5a's home-coverage priority?",
        "options": [
          "Wait in the former first-base holding area until the runner has reached first.",
          "Stop at the third-base-line extension for every potential swipe tag.",
          "Release first without observing the required tag-up or base touch and leave the crew to guess the rotation.",
          "Complete the required first-base observation even if looking over the shoulder, release promptly, communicate to push the Plate Umpire toward third, and move toward POP without an unnecessary holding-area delay."
        ],
        "ref": "Appendix 5a, Optimising Coverage at Home Plate; Starting Position, Observation Position and Calling Position; POP; pages 11, 12, 17.",
        "why": "Lead-runner and home coverage have priority. Observe required tag-ups and the batter-runner's touch of first, including over the right shoulder when appropriate, then rotate promptly. The old U1 first-base holding area is omitted and only a reference point because it delays home coverage. POP is a flexible observation reference, not a fixed final call."
      },
      {
        "q": "What does Appendix 5a mean by 'active feet'?",
        "options": [
          "The umpire jogs in place between pitches to stay warm",
          "The umpire takes quick small steps while the ball is in the air",
          "The umpire moves both feet when adjusting position so they stay balanced on the balls of their feet and ready to move",
          "The umpire keeps one foot planted until the call is made"
        ],
        "ref": "Appendix 5a, Dynamic Movement; Making the Call; pages 8, 13, 14.",
        "why": "Move both feet when possible to remain balanced on the balls of the feet and ready to adjust. This does not mean moving unnecessarily: remain stationary if the view is stable and clear; adjust when the view into the tag narrows or is blocked, keeping the head and eyes controlled."
      },
      {
        "q": "An umpire is considering the alternate starting position at second rather than the preferred side of 1B side of the 2BDA. They must account for the batter’s handedness and the pitcher’s exit path, which may block the view of the batter and plate area. Which description correctly identifies when and where this alternate may be used?",
        "options": [
          "With a runner on first or runners on first and third, about 3.5 meters back on the first-base side of 2BDA, providing a direct route inside for first-base coverage.",
          "With a runner on second or runners on second and third, about 3.5 meters back in the third-base-side alternate area, prioritising a view of the runner returning to second.",
          "With a runner on first or runners on first and third, about 3.5 meters back, just off 2BDA on the third-base side, provided the batter and home remain visible and access to the leading edge and required inside coverage is preserved.",
          "With a runner on first or runners on first and third, about 3.5 meters back toward the first-base-line extension, using the base as the alignment reference for the anticipated tag."
        ],
        "ref": "Appendix 5a, Second Base Diagonal Angle - Standard and Alternative Starting Positions; pages 18, 19, 20.",
        "why": "The alternate is conditional, not the preferred default. Use it within the stated runner configurations when it provides an unobstructed view of home and the batter. Check the sightline for both left- and right-handed batters, including the effect of the pitcher’s exit path. The umpire must remain able to adjust toward 2BDA, reach the leading edge, or move inside to cover first if U1 goes out. They must not move farther toward the first-base-line extension."
      },
      {
        "q": "From the third-base-side alternate at second, why must the umpire avoid moving farther right toward the extension of the line from first through second?",
        "options": [
          "It can put the base between the umpire and the play, increasing parallax and obscuring the runner’s contact with the base. Movement should preserve access toward 2BDA and 1B side at the leading edge.",
          "It takes the umpire away from a 90-degree angle to the catcher’s throw, which should remain the primary alignment throughout the tag attempt.",
          "It increases the distance from the tag point, so the umpire should move directly toward the base rather than adjust the viewing angle as the play develops.",
          "It moves the umpire outside the standard starting area, which must be maintained until the tag is completed before adjusting for a secondary play."
        ],
        "ref": "Appendix 5a, Second Base Diagonal Angle - Alternative Starting Position and Further Guidance; pages 20, 21.",
        "why": "The alternate already places the umpire on the third-base side of 2BDA. Moving farther toward 1BLE can place the base between the umpire and the tag, reducing visual separation and distorting whether the runner remains in contact with the base. Read the play and move toward 2BDA in the first instance, then adjust toward the first-base side or leading edge as required. The priority is an unobstructed view of the elements, rather than a fixed angle to the throw or remaining within a starting area."
      },
      {
        "q": "On a passed ball or wild pitch, the Plate Umpire is not required to rotate toward third and a runner advances home. Which movement follows Appendix 5a?",
        "options": [
          "Move left automatically without reading the catcher's retrieval movement, then remain fixed.",
          "Stay directly behind the catcher throughout the retrieval and tag attempt.",
          "Move immediately onto the third-base-line extension for every play.",
          "Read the catcher's shoulders, clear to allow retrieval, find the ball, avoid the throwing lane, and establish an observation and calling position that preserves all four elements; clearing may be left or right."
        ],
        "ref": "Appendix 5a, Plate Movement; Making the Call; pages 13, 14.",
        "why": "The usual initial left movement has exceptions. On a passed ball or wild pitch without a required third-base rotation or coverage, clear according to the catcher's turn, then read and adjust for the play at home. Avoid 3BLE when it places the plate between you and the runner."
      },
      {
        "q": "Which approach best describes the information an umpire should consider in Pre-Pitch Preparation (PPP) under Appendix 5a?",
        "options": [
          "Review the count, outs, runner positions and assigned coverage, then use standard rotation patterns without adjusting the preparation for individual players’ speed, range or throwing ability.",
          "Combine the count, outs and score with runners’ speed and advancement potential, outfielders’ depth and throwing arms, and fielders’ capabilities to anticipate likely plays while remaining ready to adapt.",
          "Identify the most likely play from the defensive alignment, then commit to its calling position before contact so the umpire arrives ahead of the runner and throw.",
          "Prioritise the lead runner’s speed and the nearest fielder’s position, leaving assessment of other runners, outfield depth and secondary-play possibilities until the ball is hit."
        ],
        "ref": "Appendix 5a, Pre-Pitch Preparation; pages 14, 15.",
        "why": "PPP combines the correct starting setup with knowledge of the game situation and players’ capabilities. Consider the count, outs, score, runners’ speed and intentions, outfield positioning and arms, and fielders’ range and ability to execute a play. Use that information to anticipate possibilities and adapt quickly. Anticipating a play does not mean committing to its outcome or moving early to a predetermined calling position."
      },
      {
        "q": "What should a base umpire do before deciding to go out on a fly ball, according to Appendix 5a?",
        "options": [
          "Use the outfielders’ starting positions to select coverage immediately on contact, then confirm the ball’s flight and communicate once moving into the outfield.",
          "Read the ball’s initial direction and commit if it enters their coverage area, leaving partners to adjust from observing the umpire’s movement.",
          "Read the flight and the outfielders’ reactions, but give the umpire at 2B the first opportunity because the central position provides the widest coverage.",
          "Read the ball’s flight and catch potential, check partners’ movements and coverage priorities, then communicate before committing to go out."
        ],
        "ref": "Appendix 5a, Pre-Pitch Preparation and Outfield Coverage; page 15.",
        "why": "Watch the actual flight before committing. Pre-pitch knowledge of outfielder depth and ability supports the decision but does not replace reading the ball. Check partners and communicate. The corner umpire has the first option over the umpire at second; with both corners occupied in the three-umpire example, U1 has first option. Go out when the play requires it within the assigned coverage, while avoiding unnecessary movement that weakens base or home-plate coverage."
      },
      {
        "q": "A routine hit has clearly landed and is bounding in the outfield, with no catch, fair/foul or home-run judgment requiring you to go out. Multiple runners are advancing. What should you do?",
        "options": [
          "Continue into the outfield to confirm how the ball is fielded, leaving the remaining umpires to expand their base coverage until the ball returns.",
          "Move toward the outfielder to establish a better angle on the return throw, then recover toward the bases once the defense selects its play.",
          "Keep the required base coverage, remain visually connected with the ball and runners, and avoid an unnecessary going-out movement.",
          "Follow the ball beyond the bases until the outfielder gains control, then decide which base requires coverage from the direction of the throw."
        ],
        "ref": "Appendix 5a, Pre-Pitch Preparation and Outfield Coverage; page 15.",
        "why": "Once the ball has clearly landed and no outfield judgment requires going out, maintain the assigned base coverage and prepare for advancing runners and secondary plays. Keep the ball and runners in view, read the developing throw, and adjust to obtain the required angle and distance. Unnecessary going out can weaken coverage, particularly at third and home."
      },
      {
        "q": "After completing the outfield judgment, the umpire who went out looks back and sees a nearby base uncovered because of a missed rotation, with a play about to occur. What may that umpire do under Appendix 5a?",
        "options": [
          "Return to cover that empty location if needed and clearly communicate the responsibility to the crew, or provide what was observed if the controlling umpire requests information.",
          "Return automatically and take over the base not covered by another umpire.",
          "Make an infield call without telling the crew that the coverage has changed.",
          "Ignore the uncovered play because the umpire has gone out, this ends all BU duties."
        ],
        "ref": "Appendix 5a, Advanced Base Umpire Movements - Umpire Goes Out, Infield Awareness; Backfilling; pages 16, 18.",
        "why": "This is a specific elite correction for missing coverage, not routine drift back into an occupied area. The umpire who goes out must look back and observe infield plays. Clear communication such as \"I'm here\" and the umpire's name tells partners the empty location has been covered."
      },
      {
        "q": "All plays have concluded and U1 is at home. What releases the crew to counter-rotate to the positions for the next pitch?",
        "options": [
          "The pitcher holding the ball securely in the circle and all runners returning to their bases, allowing each umpire to begin moving independently.",
          "U1 at home calling time, followed by coordinated counter-rotation so the incoming umpire takes control before the outgoing umpire releases the area.",
          "U2 or U3 beginning the return toward their starting position, prompting U1 and the Plate Umpire to follow once they recognise the movement.",
          "The Plate Umpire initiating the return toward home, with the base umpires adjusting as that movement creates space for the counter-rotation."
        ],
        "ref": "Appendix 5a, End of Play Counter Rotations; page 21.",
        "why": "When all plays have concluded and U1 is at home, U1 calls time to release the crew for counter-rotation. The return is coordinated: an umpire retains responsibility until released by the incoming umpire taking control. Possession in the pitcher’s circle alone does not initiate this sequence, and leaving early can create an uncovered base."
      }
    ],
    "draw": 10
  },
  "m07-mkc": {
    "module": "Module 07 — Appendix 5b: Three-Umpire System",
    "moduleShort": "Module 07",
    "kind": "Manual Knowledge Check",
    "title": "Appendix 5b: Three-Umpire System",
    "nextLabel": "Continue to Presentation - Appendix 5b: Three-Umpire System",
    "nextHref": "presentations.html#pres-5b",
    "questions": [
      {
        "q": "With no runners on, which U3 starting position follows Appendix 5b?",
        "options": [
          "About 3.5 meters behind third, up to 2 meters off the line in foul territory.",
          "About 5.5 meters behind third, just off the line in foul territory.",
          "About 4.5 meters behind third, just off the line in foul territory.",
          "About 3.5 meters back near 2BDA, on the first-base side of second."
        ],
        "correct": 1,
        "ref": "Appendix 5b, PDF page 23; presentation slides 3, 4, 5.",
        "why": "The no-runner reference is about 5.5 meters behind third, just off the line. The other distances and locations relate to different runner configurations. Depth is approximate and must permit timely movement and a clear view."
      },
      {
        "q": "U3 starts near 2BDA and reads a pickoff at second. Which description follows the pickoff guidance?",
        "options": [
          "Move backward about 3 meters from the starting position before reading the tag.",
          "Hold the starting position throughout because 2BDA is the final calling spot.",
          "Adjust to a position about 3 meters from the base, keeping the Four Essential Elements in view as the tag develops.",
          "Move onto the first-base-line extension before the throw arrives to prepare for every swipe tag."
        ],
        "correct": 2,
        "ref": "Appendix 5b, PDF page 24; presentation slides 6, 7, 21.",
        "why": "About 3 meters describes the working distance from the base, not a prescribed three-meter backward movement. Read the runner and fielder and adjust for an unobstructed view. The PDF heading identifies U3 although the sentence beneath it mistakenly says U2."
      },
      {
        "q": "In a three umpire system with runner 1B and 3B. Which allocation of lead-off responsibility follows Appendix 5b?",
        "options": [
          "U1 takes first, U3 takes second and the Plate Umpire takes third.",
          "The umpire nearest each runner takes that runner regardless of the assigned position.",
          "U1 takes first and second; U3 takes third.",
          "U1 takes first, and the Plate Umpire takes second and third while U3 reads the outfield."
        ],
        "correct": 2,
        "ref": "Appendix 5b, PDF page 25.",
        "why": "The leadoff allocation is U1 at first and second, U3 at third. Do not confuse leaving early on the pitch with tag-up responsibilities on a caught fly ball."
      },
      {
        "q": "In a three umpire system with a runner on first, U1 at first and U3 at second, why is U1 assigned the right-field area, including some balls directly behind U3?",
        "options": [
          "U1 has a useful right-field line/trap angle on balls that come to the line, while U3 can enter more easily to cover bases and the tag-up without U1 button-hooking across the runner's path.",
          "U3 must remain outside at second throughout the play, so U1 takes the ball mainly to avoid changing U3's initial viewing angle.",
          "U1 going out removes all first-base responsibilities from the crew until the ball is returned to the infield.",
          "U1's deeper route gives priority over U3 on every outfield ball."
        ],
        "correct": 0,
        "ref": "Appendix 5b, PDF page 32; presentation slides 13, 14.",
        "why": "The allocation combines useful line and trap-ball angles with efficient base coverage. U3 can enter the diamond, watch the tag-up and cover first/second more readily than U1 can time a button hook around the runner."
      },
      {
        "q": "A Base Umpire goes out and the fly ball is not caught. Who takes the batter-runner around to third in the elite three-umpire system?",
        "options": [
          "The Plate Umpire takes the batter-runner through third while the remaining Base Umpire takes 1B and 2B.",
          "The remaining Base Umpire takes the batter-runner through third, communicating so the Plate Umpire can cover home.",
          "The outfield umpire returns to third after ruling on the catch while the remaining Base Umpire stays at second.",
          "The remaining Base Umpire stops coverage at second and transfers every third-base play to the Plate Umpire."
        ],
        "correct": 1,
        "ref": "Appendix 5b, PDF pages 25, 31; presentation slides 15, 23.",
        "why": "The remaining Base Umpire covers first and second and takes the batter-runner to third. For a caught fly ball, taking the last runner to third depends on reaching an advantageous position and communicating with the Plate Umpire."
      }
    ]
  },
  "m08-mkc": {
    "module": "Module 08 — Appendix 5c & d: Four, Five and Six-Umpire Systems",
    "moduleShort": "Module 08",
    "kind": "Manual Knowledge Check",
    "title": "Appendix 5c & d: Four, Five and Six-Umpire Systems",
    "nextLabel": "Continue to Presentation - Appendix 5c & d: Four, Five and Six-Umpire Systems",
    "nextHref": "presentations.html#pres-5c",
    "questions": [
      {
        "q": "Which plate-meeting arrangement follows the Four-Umpire System?",
        "options": [
          "PU behind the boxes, with the Base Umpires arranged U1, U2, U3 from the first-base line toward third.",
          "PU behind the boxes, with the Base Umpires behind PU in the order they will rotate around the bases.",
          "PU behind the boxes at the point of the plate, with U2, U1 and U3 in front of the boxes from the first-base side toward third.",
          "PU in front of the boxes facing the catcher, with all Base Umpires on the third-base side."
        ],
        "correct": 2,
        "ref": "Appendix 5c, PDF page 40.",
        "why": "The stated U2, U1, U3 arrangement in front of the boxes allows the crew to peel off to their assigned starting positions. PU remains behind the boxes at the point of the plate."
      },
      {
        "q": "With a runner at first, which U1 start follows the four-umpire guidance?",
        "options": [
          "About 5.5 meters behind first, using the no-runner depth for every runner configuration.",
          "About 3.5 meters behind first in foul territory, maintaining a view of the pitcher, runner, batter and home.",
          "About 4.5 meters behind first in fair territory, aligned with the second baseman.",
          "About 3.5 meters back at 2BDA, allowing U2 to take the first-base playback."
        ],
        "correct": 1,
        "ref": "Appendix 5c, PDF page 40; presentation slides 3, 4.",
        "why": "The runner-at-first reference is approximately 3.5 meters behind the base in foul territory. Keep the home-plate view clear and remain ready to adjust for the runner's return or a developing tag."
      },
      {
        "q": "U2 goes out on a fly ball. Which crew allocation includes the correct third-base tag-up responsibility?",
        "options": [
          "U1 watches first and third while PU watches the catch only.",
          "U3 keeps third while U1 watches first and second.",
          "U2 watches third from the outfield while U3 moves inside.",
          "PU watches third, U3 watches second and U1 watches first."
        ],
        "correct": 3,
        "ref": "Appendix 5c, PDF page 41; presentation slide 9.",
        "why": "U3 rotates to second, including its tag-up. PU has the third-base tag-up while U1 retains first. The movement and tag-up responsibilities must be coordinated."
      },
      {
        "q": "A fly ball could be taken by U2 or the appropriate corner umpire. Which approach follows the four-umpire coverage priority?",
        "options": [
          "U2 commits first because the central starting position gives U2 priority over either corner.",
          "U2 reads the ball and allows U1 or U3 the first option within their coverage, then communicates and goes if the corner umpire does not take it.",
          "PU selects the going-out umpire after the ball reaches the outfielder.",
          "Both umpires go out initially and the one farther from the ball returns to the bases."
        ],
        "correct": 1,
        "ref": "Appendix 5c, PDF page 43; presentation slide 7.",
        "why": "Corner priority combines useful line and pole angles with efficient base coverage. Reading the ball and partners before committing helps avoid overlapping coverage and unnecessary rotation."
      },
      {
        "q": "With no runners or only a runner on first, which PU movement follows an infield hit in the four-umpire system?",
        "options": [
          "Rotate immediately to third as soon as the batter-runner leaves the box.",
          "Stay fixed at POP and transfer all first-base-area interference observations to U1.",
          "Trail about one-third toward first for the required observations and fair/foul decision, then return home when the batter-runner reaches first.",
          "Trail the batter-runner through first and second before releasing home coverage to U3."
        ],
        "correct": 2,
        "ref": "Appendix 5c, PDF page 42.",
        "why": "The infield-play instruction is to trail for possible interference, tag or assistance, while retaining fair/foul responsibility, then return home as the batter-runner reaches first. Other runner configurations use POP."
      }
    ]
  },
  "m07-pca": {
    "module": "Module 07 — Appendix 5b: Three-Umpire System",
    "moduleShort": "Module 07",
    "kind": "Presentation Competency Assessment",
    "title": "Appendix 5b: Three-Umpire System",
    "nextLabel": "Continue to Presentation - Appendix 5c & d: Four, Five and Six-Umpire Systems",
    "nextHref": "presentations.html#pres-5c",
    "watchFirst": "presentations.html#pres-5b",
    "questions": [
      {
        "q": "Which complete between-inning arrangement follows Appendix 5b, with all umpires standing off the fair/foul lines?",
        "options": [
          "PU one-third toward third; U1 halfway toward first; U3 two-thirds toward third.",
          "PU halfway toward third; U1 one-third toward first; U3 two-thirds toward third.",
          "PU one-third toward third; U1 two-thirds toward first; U3 halfway toward third.",
          "PU one-third toward first; U1 halfway toward first; U3 two-thirds toward third."
        ],
        "ref": "Appendix 5b, PDF page 23.",
        "why": "The specified arrangement is PU one-third up the third-base side, U1 halfway up the first-base side, and U3 two-thirds up the third-base side, all off the lines."
      },
      {
        "q": "With a runner on first only, which U1 starting position follows Appendix 5b?",
        "options": [
          "About 3.5 meters behind first and 2-3 meters off the line in foul territory, using the same lateral offset as U3 with a runner on third.",
          "About 5.5 meters behind first, just off the line in foul territory.",
          "About 3.5 meters behind first in foul territory, near the line with an unobstructed view of home and readiness for a playback.",
          "About 3.5 meters back on the third-base side of 2BDA, using the alternate second-base setup."
        ],
        "ref": "Appendix 5b, PDF page 23; presentation slides 4, 5, 18.",
        "why": "U1 starts about 3.5 meters behind first in foul territory. The line-side position supports a quick playback and fair/foul coverage. U1 may adjust slightly for a clear home-plate view; U3's wider third-base offset is not automatically copied at first."
      },
      {
        "q": "Why may U3 start about 3.5 meters behind third and up to 2 meters off the line in foul territory when a runner is on third?",
        "options": [
          "To align directly with the catcher's throw and keep that fixed alignment throughout any pickoff, even when the tag moves.",
          "To establish an earlier route to second and release third before the runner commits toward home.",
          "To obtain one close calling position that can be held for every possible tag without further adjustment.",
          "To retain a view of the pitcher, runner, batter and home even when the runner leads into foul territory and would screen a line-side position."
        ],
        "ref": "Appendix 5b, PDF page 23; presentation slides 5, 22.",
        "why": "The offset protects U3's view through the pitch and lead-off, especially when a runner leads widely in foul territory. U3 reads the runner's return and fielder's tag and adjusts rather than holding a fixed calling spot."
      },
      {
        "q": "Starting at first, U1 reads a pickoff throw back to the base. Which positioning approach follows Appendix 5b?",
        "options": [
          "Keep the approximately five-meter force-play distance and remain at 90 degrees to the throw even if the fielder attempts a swipe tag.",
          "Start just off the fair foul line and work to about 3 meters in foul territory without passing a 45-degree line through first, or step into fair territory when the leading-edge play requires that view.",
          "Move to the first-base-line extension before reading the runner's return, using the same position for every playback.",
          "Move directly beside the fielder's glove and use the ball's arrival to determine whether the runner is out."
        ],
        "ref": "Appendix 5b, PDF page 24; presentation slide 18.",
        "why": "Read the runner's path and fielder's action. The guide permits a foul-territory angle within the stated limit or a step inside for a leading-edge view. The objective is to see the tag and base contact together."
      },
      {
        "q": "One Base Umpire goes out on an outfield fly ball. Which statements correctly describe tag-up coverage?",
        "statements": [
          "The remaining Base Umpire is responsible for tag-ups at first and second.",
          "PU is responsible for the tag-up at third.",
          "The remaining Base Umpire should rotate inside promptly and glance over the shoulder when needed to observe first touch and the runner.",
          "If the required relationship was not seen, the crew should seek assistance and clearly identify the umpire with the relevant observation."
        ],
        "options": [
          "Statements 1 and 2 only.",
          "Statements 1, 3 and 4 only.",
          "Statements 2, 3 and 4 only.",
          "All four statements."
        ],
        "ref": "Appendix 5b, PDF page 25; presentation slide 16.",
        "why": "All four are correct. Remaining inside coverage is divided so the Base Umpire watches first/second tag-ups and PU watches third. If a rotation prevents seeing first touch and the runner together, use partner information and communicate who has the observation; do not infer it."
      },
      {
        "q": "A runner starts on second and U3 is stationed at third. Which umpire has the lead-off call as the pitch is delivered?",
        "options": [
          "U1, because the leadoff allocation assigns first and second to U1 and third to U3.",
          "U3, because the separate tag-up exception at second also transfers every leadoff there.",
          "PU, because the Plate Umpire sees the pitching release most directly.",
          "U1 and U3 jointly, with whichever signals first controlling the decision."
        ],
        "ref": "Appendix 5b, PDF page 25; presentation slide 16.",
        "why": "U1 has the second-base lead-off responsibility. A leadoff on the pitch and a tag-up on a caught fly ball are different observations with different allocation provisions; the tag-up exception does not change this leadoff assignment."
      },
      {
        "q": "With no runners, U1 at first and U3 at third, a fly ball takes the normally positioned center fielder toward right field. Which coverage is correct?",
        "options": [
          "U3 takes the catch because the center fielder began within U3's normal central sector, while U1 holds first.",
          "U1 takes the fly ball toward right; U3 moves inside and reads the movement and prepares the remaining base coverage.",
          "PU takes the catch whenever the center fielder moves, with both Base Umpires retaining their starting bases.",
          "U1 and U3 both go out until the fielder establishes which side of center will make the catch."
        ],
        "ref": "Appendix 5b, PDF page 31; presentation slides 9, 14.",
        "why": "From the corner starts, U1 covers the normally positioned center fielder moving toward right and the right-field foul sector. U3 covers center toward left. Read flight and partners and communicate before committing."
      },
      {
        "q": "With a runner on first, U1 at first and U3 at second, a fly ball takes the left fielder toward the left-field foul line. Who takes the fair/foul and catch/no-catch decisions?",
        "options": [
          "U3 takes both decisions because U3 is the umpire designated for the third-base side.",
          "U1 takes both decisions by crossing the central coverage area, leaving U3 to cover first.",
          "PU takes both decisions in the open left-field-line sector while the Base Umpires maintain the required rotation.",
          "U3 takes the catch from second while PU takes fair/foul separately, without a coverage handoff."
        ],
        "ref": "Appendix 5b, PDF pages 32, 36; presentation slides 12, 13.",
        "why": "With U3 starting at second, PU covers the left fielder toward the open left-field foul line. U3 covers the center sector and the left fielder moving toward center. Specifying the fielder's direction avoids the ambiguity of simply saying \"to F7.\""
      },
      {
        "q": "With no runners, U1 goes out toward right and a possible play develops on the batter-runner at first. Which initial coverage and handoff follow Appendix 5b?",
        "options": [
          "U3 takes the initial first-base play while PU remains at home throughout.",
          "PU moves inside, takes the possible initial play at first, then releases first to U3 as the batter-runner passes first; U3 covers the continued advance and PU prepares third/home coverage.",
          "U1 returns from the outfield for the first-base play, then goes out again if the ball remains outside.",
          "PU follows the batter-runner through first, second and third while U3 takes over home."
        ],
        "ref": "Appendix 5b, PDF page 33; presentation slide 15.",
        "why": "The no-runner/U1-out case is an exception to a blanket first/second-base allocation. PU handles the possible initial first-base play. U3 rotates inside and assumes first/second after the batter-runner passes first, then takes the batter-runner toward third while PU prepares home."
      },
      {
        "q": "With no runners and an infield ground ball, which approach correctly combines PU's trailing and coverage duties?",
        "options": [
          "Remain at POP and leave interference, a possible tag before first and fair/foul to U1.",
          "Rotate immediately to third and transfer all first-base-area observations to U3 before the throw.",
          "Trail the batter-runner to first and keep following toward second even when U3 has rotated there.",
          "Trail about one-third toward first, farther if needed, preserve the fair/foul decision and assistance responsibilities, then rotate toward third if the batter-runner advances toward second."
        ],
        "ref": "Appendix 5b, PDF page 26; presentation slides 2, 15.",
        "why": "PU trails for potential interference, a tag nearer home and assistance at first, while retaining fair/foul responsibility. Once the batter-runner reaches first and advances toward second, PU prepares third-base coverage rather than duplicating U3 at second."
      },
      {
        "q": "PU or U1 is covering home from the POP observation area. Which statements follow the Appendix 5b presentation?",
        "statements": [
          "If the catcher already has the ball and the play is at the leading edge, move forward and left as needed to retain the view.",
          "If ball and runner arrive together and a deeper/outside swipe tag develops, adjust forward and right as needed to look into the tag.",
          "Move toward the third-base-line extension before the tag develops, committing early to a swipe-tag position rather than preserving access to the leading edge.",
          "Use the runner's path, ball timing and possible obstruction/interference to read the play, keeping the elements in view as it changes."
        ],
        "options": [
          "Statements 1, 2 and 4 only.",
          "Statements 1 and 3 only.",
          "Statements 2 and 3 only.",
          "All four statements."
        ],
        "ref": "Appendix 5b, PDF pages 28, 29, 30; presentation slides 27, 28.",
        "why": "Statements 1, 2 and 4 are correct. The catcher's possession, the runner's approach and the ball's arrival help identify the likely contact area. Read and adjust from POP, preserving the view and ability to respond to a change. A rare swipe-tag position is not the routine destination."
      },
      {
        "q": "With a runner on first, U3 starts on the first-base side of 2BDA, closer to second. An infield throw creates a force play at second. Which adjustment follows the elite mechanics?",
        "options": [
          "Move right toward 2BDA as the routine response to every play at second, applying the steal-tag movement to the force play and keeping the diagonal as the final calling reference.",
          "Move closer along the starting alignment without changing the lateral angle, using proximity to judge possession and base contact even if the fielder screens the runner's arrival.",
          "Read the throw and move left toward the leading edge, seeking about 90 degrees to the throw and no more than 45 degrees off the leading edge, keeping all four elements visible.",
          "Move right toward the first-through-second line extension to center the base in the view, then hold that alignment for the force call before considering a different angle for a subsequent tag."
        ],
        "ref": "Appendix 5b, PDF page 28; presentation slides 6, 21.",
        "why": "Being closer to second does not correct a poor angle. From the standard first-base-side start, read the force play and work to your left toward the leading edge. Do not move right automatically on a force play. An adjustment toward 2BDA may suit a developing steal tag, but that is a different play. Keep possession, fielder/base contact and the runner visible, and adjust again if a tag develops."
      },
      {
        "q": "With a runner on first only, U3 selects a second-base starting position considering the batter's handedness, the pitcher's movement and possible first-base coverage if U1 goes out. Which approach is correct?",
        "options": [
          "Use the third base side alternate as the default because a potential steal always takes priority over the whole-pitch view and first-base access.",
          "Use the preferred first-base-side standard near 2BDA toward 3BLE, about 3.5 meters back, or the conditional third base side alternate with home unobstructed; when adjustment is needed from the alternate, move toward 2BDA first and retain inside/leading-edge access.",
          "Start toward the first-base-line extension to obtain a swipe-tag view before reading whether the runner attempts a steal or rounds the base.",
          "Start deeper beyond the fielders' range so the pitcher cannot screen the batter, accepting a longer route inside if U1 goes out."
        ],
        "ref": "Appendix 5b, PDF page 23; presentation slides 6, 7, 8, 21.",
        "why": "The presentation identifies the first-base-side start as preferred because it preserves the shorter inside route, including first-base coverage. The alternate is conditional, close to 2BDA, and must preserve the view throughout the pitch. From the alternate, initial movement is toward 2BDA, not farther toward 1BLE."
      },
      {
        "q": "Runners are on first and second, nobody is on third, and neither Base Umpire goes out. PU has a fly ball to the right-field open-line sector. Which tag-up allocation follows the stated exception?",
        "options": [
          "U3 watches the tag-up at second, while U1 watches first and PU judges the fly ball, with assistance communicated if a required observation is blocked.",
          "U1 must watch both tag-ups because U1 has the leadoff calls at first and second.",
          "PU must watch both tag-ups as well as the catch because neither Base Umpire went out.",
          "U3 watches first while U1 watches second, regardless of their actual sightlines during the rotation."
        ],
        "ref": "Appendix 5b, PDF page 25; presentation slide 16.",
        "why": "With first and second occupied and third empty, U3 has the second-base tag-up. The presentation explains that U3 can see that relationship while U1 rotates inside and has first to watch. Leadoff responsibility on the pitch is a separate allocation."
      },
      {
        "q": "With only a runner on third, U1 at first and U3 at third, an infield ground ball develops. What should U3 do?",
        "options": [
          "Rotate inside as soon as the ball is fielded, leaving PU to take any immediate return to third.",
          "Remain at third until every possible play at first and second has finished, even after the runner commits home.",
          "Retain 3B until the runner commits home, then rotate to second; if U3 remains or is delayed, U1 must cover first and second.",
          "Follow the runner to home and require PU to rotate through third toward second."
        ],
        "ref": "Appendix 5b, PDF page 27; presentation slides 15, 17.",
        "why": "Do not abandon a runner who can still be played on at third. Once the runner commits home, U3 can release and rotate. U1 reads U3's movement and covers both first and second if U3 cannot release."
      },
      {
        "q": "With no runners and both Base Umpires on the corners, a ground ball reaches the outfield. Which U1 sequence follows Appendix 5b?",
        "options": [
          "Rotate to POP immediately at contact and leave the initial first-base force possibility to PU.",
          "Button-hook to second and hold all home-plate coverage with PU until the batter-runner stops at third.",
          "Stay behind first throughout, requiring PU to cover the batter-runner at both third and home if the advance continues.",
          "Prepare for an outfield-to-first force play and observe first, then rotate to POP if the batter-runner progresses from second toward third, communicating to push PU toward third."
        ],
        "ref": "Appendix 5b, PDF page 29; presentation slides 17, 18.",
        "why": "With no original runners, U1 first protects the possible outfield-to-first play. The batter-runner's advance from second toward third triggers U1's home rotation in this case. Do not apply this timing to a runner-on-first case where the lead runner can threaten home earlier."
      },
      {
        "q": "With U1 at first and U3 at third, U3 initially starts out but reads that the ball will not be caught. U1 has begun the inside response. Which recovery follows the Appendix 5b presentation?",
        "options": [
          "U3 returns to third silently while U1 continues to cover second, third and home until the next pitch.",
          "U3 takes second without communicating, assuming U1 will notice and change the rotation before the runner arrives.",
          "U3 continues out solely to preserve the original going-out signal, even though the crew can safely restore better infield coverage.",
          "U3 clearly communicates visually and verbally that they have second and rotates inside; U1 adjusts the button hook and can proceed toward home, coordinating PU's third base coverage."
        ],
        "ref": "Appendix 5b, PDF pages 31, 39; presentation slide 10.",
        "why": "The correction restores the three-umpire infield rotation and improves coverage around the diamond. The communication is essential because U1 may already have responded to U3's initial movement. Read and coordinate rather than silently reversing the coverage."
      },
      {
        "q": "After U3 goes out, U1 is working inside for first and second. At second, which movement approach follows the presentation when the tag location changes?",
        "options": [
          "Mirror the outside 2BDA position from inside and preserve the same angle even if the runner moves away and the fielder screens the tag.",
          "Read the play and select an inside working lane: toward the third base line for a leading-edge play, or toward the first-base line to look back into a tag developing outside the base.",
          "Move closer to the base on a straight line for every tag, relying on distance to compensate for a blocked angle at the side of the base.",
          "Choose the lane from the expected throw before the runner arrives and hold it through the tag, reserving further adjustment for the next play."
        ],
        "ref": "Appendix 5b, PDF pages 34, 35; presentation slides 24, 25, 26.",
        "why": "Inside positioning has different restrictions from an outside start. Read the likely tag location and use the lane that keeps it in front, then adapt if it changes. These are inside working lanes, not permission to move farther toward 1BLE from the outside third base side alternate. Protect element separation and avoid simply mirroring outside mechanics."
      },
      {
        "q": "Which U3 approach follows the third base pickoff guidance?",
        "options": [
          "Remain at the initial depth for every playback and use the catcher's throwline as the fixed calling angle.",
          "Move immediately to fair territory to the leading edge for every playback, even when the runner returns through foul territory.",
          "Read the runner's return and fielder's tag, work about 3 meters from third in foul territory and adjust for the required tag or leading-edge view.",
          "Move behind the returning runner to align the runner, glove and base, using proximity to establish whether the tag came first."
        ],
        "ref": "Appendix 5b, PDF page 24; presentation slide 22.",
        "why": "The runner's return path and fielder's action guide the angle. The foul-territory reference is about 3 meters with the 45-degree limit. Adjust to look into the actual tag; do not assume every return uses the same contact point."
      },
      {
        "q": "U1 has gone out on a fly ball. Which U3 response follows the Three-Umpire Rotation Memory Map?",
        "options": [
          "Rotate inside past the line from the pitcher's plate to second, assume first/second coverage, and be ready to take the batter-runner toward third with clear communication.",
          "Remain outside near 2BDA and cover first and second from there so PU can take every third-base play.",
          "Move to the third base holding area and transfer first/second to PU until the outfield ball has been returned.",
          "Hold the third base leading edge for the next throw and leave first uncovered until U1 returns from the outfield."
        ],
        "ref": "Appendix 5b, PDF pages 31, 33, 39; presentation slides 15, 23.",
        "why": "The memory map puts U3 inside, past the pitcher to second line, for first and second when U1 goes out. Read the runner and communicate continued third base coverage. With no original runners, the detailed U1-out case gives PU the initial first-base play before U3 assumes it after the batter-runner passes first."
      }
    ],
    "draw": 10
  },
  "m08-pca": {
    "module": "Module 08 — Appendix 5c & d: Four, Five and Six-Umpire Systems",
    "moduleShort": "Module 08",
    "kind": "Presentation Competency Assessment",
    "title": "Appendix 5c & d: Four, Five and Six-Umpire Systems",
    "nextLabel": "You've completed all eight required modules - view your full assessment record",
    "nextHref": "#top",
    "watchFirst": "presentations.html#pres-5c",
    "questions": [
      {
        "q": "Which U2 between-inning position is specified for the four-umpire system?",
        "options": [
          "One-third of the way from home to first, off the line.",
          "Two-thirds of the way from home to third, off the line.",
          "One-third of the way from home to third, off the line.",
          "Two-thirds of the way from home to first, off the line."
        ],
        "ref": "Appendix 5c, PDF page 40.",
        "why": "U2 uses the first-base side about two-thirds of the way from home to first. U1 is one-third up the same side; PU and U3 use the corresponding thirds on the third-base side."
      },
      {
        "q": "With a runner on any base, which U2 starting approach follows the four-umpire guidance?",
        "options": [
          "Use approximately 3.5 meters behind second as the reference, adjusting within the approved area for the whole-pitch view and timely access to the required play.",
          "Keep the no-runner reference of approximately 4.5 meters for every pitch, using the extra depth to see over fielders even when it delays the required inside rotation.",
          "Use approximately 5.5 meters behind second to match both corner umpires' no-runner depth and preserve the same movement arc.",
          "Use the third-base-side alternate automatically whenever a runner is on any base, even if the pitcher screens home."
        ],
        "ref": "Appendix 5c, PDF page 40; presentation slides 3, 5, 6.",
        "why": "The guide reduces U2's reference depth from about 4.5 meters with no runners to about 3.5 meters with a runner. These are approximate starts, selected to preserve sightlines and the ability to move inside or adjust to a play. The alternate is conditional, not automatic."
      },
      {
        "q": "A fly ball goes directly into the normal central-field sector. Neither corner umpire has taken it, and it is not carrying toward a corner's line sector. Who takes the outfield call?",
        "options": [
          "U1, because corner priority gives U1 every fly ball regardless of its final coverage sector.",
          "PU, because a central-field call should be kept with the umpire behind home.",
          "U2, after reading the flight and partners and clearly communicating the decision to go out.",
          "U3, because U2 must remain at second whenever runners are on base."
        ],
        "ref": "Appendix 5c, PDF page 43; presentation slide 7.",
        "why": "U2 has the central sector. U1 and U3 have first option on appropriate overlapping balls, but that does not transfer every central ball to a corner. Read the actual flight and partners and then be decisive."
      },
      {
        "q": "U1 goes out on a fly ball with a runner at first. Which tag-up assignment and reasoning follow the four-umpire system?",
        "options": [
          "U2 takes the first-base tag-up because U2 will cover first and second after coming inside, combining both tag-up observations with the subsequent calls at those bases.",
          "PU takes the first-base tag-up, retaining the required view of the runner and first touch while U2 rotates inside for base coverage.",
          "U3 takes the first-base tag-up from third because the corner-to-corner angle replaces PU's observation.",
          "U1 takes the first-base tag-up while continuing into the outfield, leaving PU responsible only for home."
        ],
        "ref": "Appendix 5c, PDF page 41; presentation slide 8.",
        "why": "PU has the first-base tag-up when U1 goes out. U2 takes second and U3 takes third. A future base-call responsibility does not automatically assign an earlier tag-up when the rotation limits the umpire's view."
      },
      {
        "q": "With runners on base, U2 goes out. Which remaining-crew tag-up allocation follows Appendix 5c?",
        "options": [
          "U1 watches first and second while U3 retains third and PU stays solely at home.",
          "PU watches first and second while U1 moves home and U3 retains third.",
          "U1 watches first, U3 rotates to second and watches its tag-up, and PU watches third.",
          "U3 watches first, U1 watches second and PU watches third, regardless of the initial rotation."
        ],
        "ref": "Appendix 5c, PDF page 41; presentation slide 9.",
        "why": "When U2 goes out, U3 takes second including the tag-up there. U1 retains first and PU takes third. The umpire going out does not continue to judge the infield tag-ups from the outfield."
      },
      {
        "q": "Which statement accurately describes U1's normal route and the response to a backfill in the four-umpire system?",
        "options": [
          "Button-hook inside on every outfield ball before deciding whether to retain first or rotate home, keeping responsibility for first and second even when U2 has already moved inside to cover those bases.",
          "Normally use first-base foul territory or go out, communicate when rotating home and pushing PU toward third; if PU retains home for a quick play, adjust to support the required first/second coverage without interfering.",
          "Stay at first until all runners stop, because U2's presence removes the need for a home rotation.",
          "Rotate immediately home whenever U2 or U3 starts out, transferring any first-base touch to PU without communication."
        ],
        "ref": "Appendix 5c, PDF pages 46, 47; presentation slides 9, 10.",
        "why": "The memory map says U1 does not need a button hook for the normal four-umpire route. That is not an absolute ban on adjusting or working inside during an exceptional backfill. Read PU, communicate and protect the next required coverage without crowding the home play."
      },
      {
        "q": "With no runners and no umpire going out, a ground ball reaches left field. Which U2 approach follows the stated left-field case?",
        "options": [
          "Stay outside for the useful angle on the return throw from left, adjusting for a possible play at second while keeping all four of the elements in view.",
          "Button-hook immediately to the same inside position used for every right-field return, keeping the second-base-side angle unchanged even when the left-field throw produces a less open view.",
          "Rotate to third so U3 can take the return throw at second and PU can cover home and first.",
          "Move toward first to take its playback and require U1 to take every subsequent second-base call."
        ],
        "ref": "Appendix 5c, PDF pages 42, 47.",
        "why": "The detailed ground-ball section specifies staying outside for the left-field return angle. Stating no runners also matches the memory-map example. This does not override the inside rotation required when a Base Umpire goes out."
      },
      {
        "q": "U1 goes out toward right with runners on second and third. Which remaining-crew coverage best follows Appendix 5c?",
        "options": [
          "U2 keeps second only, U3 takes first and third by following the batter-runner around the bases, and PU moves toward first to assist while leaving the early home play to U3.",
          "U3 rotates to second, U2 follows the lead runner to home, and PU takes first and third.",
          "U2 rotates to third, U3 covers home, and PU takes first and second until the fly ball ends.",
          "U2 button-hooks inside for first and second, U3 moves to the 3BLE in foul territory and then maintains third-base coverage and adjusts for the play, and PU remains available for the home play from the POP area."
        ],
        "ref": "Appendix 5c, PDF page 44; presentation slides 7, 8.",
        "why": "When U1 goes out, U2 covers first and second and U3 retains third. With the scoring threat from second/third, PU prioritizes home and POP rather than initiating the U2/U3-going-out rotation. This is one reason U1 going out supports efficient coverage."
      },
      {
        "q": "U2 goes out. Which comparison correctly distinguishes U1's home-rotation timing with no original runners from the runners-on case?",
        "options": [
          "With no runners, protect the possible first-base play and start to rotate as the lead runner or batter-runner passes second toward third; with runners on, observe the touch at first and prioritize the earlier home rotation as the lead-runner threat develops.",
          "In both cases, wait until the batter-runner passes second before rotating home, retaining first-base responsibility for possible return throws while PU divides third and home; the lead runner does not change that release trigger.",
          "In both cases, rotate home at contact before checking a possible first-base play or the batter-runner's touch.",
          "In both cases, remain at first until the defense throws to third, then react toward home after PU makes the third-base call."
        ],
        "ref": "Appendix 5c, PDF pages 45, 46; presentation slide 9.",
        "why": "The detailed PDF distinguishes the no-runner trigger from runners-on timing. The presentation emphasizes not waiting unnecessarily at first when the lead runner can threaten home; use the shoulder check, communicate, and trust the inside umpire's subsequent first-base coverage."
      },
      {
        "q": "U2 has gone out. PU reads a quick play at home before U1 can arrive and communicates that PU is returning home. What coordinated response is required?",
        "options": [
          "U3 stays at second until PU completes the home call and can return to third, while U1 retains the home rotation because the original assignment remains in force until the play ends.",
          "U1 continues to POP and shares the home call with PU while U3 waits for the next throw.",
          "The outfield umpire immediately abandons the fly-ball judgment and takes third without informing the crew.",
          "U3 backfills third for a subsequent play, while U1 adjusts to support first/second coverage and avoids interfering with the home play; the crew communicates the changed responsibilities."
        ],
        "ref": "Appendix 5c, PDF pages 45, 46, 47; presentation slide 10.",
        "why": "The first home play remains the priority. PU's decision triggers the backfill: the remaining U3 fills third, with U1 adjusting as needed for first/second. Do not force a completed home rotation when PU has already taken the call."
      },
      {
        "q": "Compare U1 with a runner on first and U3 with a runner on third. Which starting-position approach preserves the view of home and access to the developing tag?",
        "options": [
          "Both start about 3.5 meters behind their base and 2-3 meters into foul territory, using the same lateral offset because both may face a return throw and tag.",
          "Both start about 3.5 meters behind their base; U1 stays just off the fair/foul line, while U3 may need more foul-territory offset because the runner leads off in front of U3 rather than away as at first.",
          "Both start about 3.5 meters behind their base; U1 takes the greater foul-territory offset to look across the returning runner, while U3 stays close to the line to preserve access to the leading edge.",
          "Both start about 3.5 meters behind their base and use the same lateral offset selected before the pitch, keeping that reference through a return throw so the original observation angle remains consistent."
        ],
        "ref": "Appendix 5c, PDF pages 40, 41; presentation slides 3, 4, 11, 15.",
        "why": "The corners are not mirror-image starts. At first, the runner leads away from U1, so U1 starts just off the line in foul territory with an unobstructed view of home. Starting 2-3 meters off the line unnecessarily lengthens the route inside if the tag requires it. At third, the runner can lead in front of U3, so U3 may need a greater foul-territory offset to retain the view of the pitcher, runner, batter and plate. Both read the actual tag and adjust; neither offset is a fixed calling position. The former runner-on-second U3 reference remains approximately 4.5 meters behind third, just off the line."
      },
      {
        "q": "U3 goes out on a fly ball with runners on base. Which tag-up allocation follows Appendix 5c?",
        "options": [
          "U1 watches first and second, U2 watches third, and PU takes no tag-up observation.",
          "PU watches first and second while U1 retains first-base calls and U2 moves toward home.",
          "U1 watches first, U2 watches second and PU watches third, with assistance sought if rotation blocks a required observation.",
          "U2 watches first, PU watches second and U1 watches third, exchanging observations before any appeal while retaining those assignments regardless of the initial inside rotation."
        ],
        "ref": "Appendix 5c, PDF page 41; presentation slides 9, 14.",
        "why": "The remaining crew covers the tag-ups at first, second and third through U1, U2 and PU respectively. Rotating inside does not permit guessing a first-touch or base-contact relationship that was not actually seen."
      },
      {
        "q": "R on 2B, U1 goes out on a hard, line drive caught in rightfield. U2 cannot get inside in time to see both first touch and the runner's tag-up at second. What should U2 do?",
        "options": [
          "Infer the tag-up from the runner's position after the catch and rule without seeking another view.",
          "Use the sound of the catch while watching the runner and treat that sound alone as proof of the exact first-touch timing.",
          "Seek U3's observation of the second-base tag-up and communicate the information and action needed before deciding any appeal.",
          "Keep sole control of the observation even if U3 has a complete view, because assigned coverage prevents crew assistance."
        ],
        "ref": "Appendix 5c, PDF page 41.",
        "why": "The guide expressly allows U2 to seek U3's help in this hard-flat-catch case. Rotate promptly and use a shoulder glance when possible, but if the timing relationship was missed, ask for the actual observation rather than reconstructing it from assumptions."
      },
      {
        "q": "In a four umpire system, which allocation applies to a runner leaving the base on the pitch in the four-umpire system?",
        "options": [
          "PU judges every leadoff because PU has the direct view of the pitcher's delivery.",
          "U1 judges first and second while U3 judges third, using the three-umpire allocation so U2 can focus entirely on the central-field sector.",
          "U2 judges first and second while U1 and U3 concentrate on their fly-ball sectors.",
          "Each Base Umpire judges the leadoff at their own base, distinct from any later fly-ball tag-up rotation."
        ],
        "ref": "Appendix 5c, PDF page 41.",
        "why": "Four-umpire leadoffs are assigned to the umpire at each base. Do not carry across the three-umpire first/second allocation or confuse a leadoff on the pitch with the separately assigned tag-up on a caught fly ball."
      },
      {
        "q": "U2 starts on the first-base side of 2BDA, closer to second. An infield throw creates a force play at second. Which movement applies the force-play guidance?",
        "options": [
          "Read the throw and move left toward the leading edge, seeking about 90 degrees to the throw and no more than 45 degrees off the leading edge, while keeping all four elements visible.",
          "Move right toward 2BDA as the routine response to every play at second, using the steal-tag adjustment for the force play as well and treating the diagonal as the final calling reference.",
          "Move closer to second along the starting alignment, using the shorter distance to judge possession and base contact while keeping the same lateral angle throughout the force play and any developing tag.",
          "Move right toward the extension of the line from first through second to bring the base into the center of the view, then judge the force from that alignment before adjusting for a later tag."
        ],
        "ref": "Appendix 5c, PDF page 42; presentation slides 12, 13.",
        "why": "Being closer does not correct a poor angle. From the standard first-base-side start, the presentation shows a move left toward the leading edge for a force play, aiming for about 90 degrees to the throw and no more than 45 degrees off the leading edge. Do not make a routine rightward movement merely because the start is closer to second. A rightward adjustment toward 2BDA may suit an actual steal tag; it is not the default force-play movement. Read the throw, fielder, runner and base contact, and adjust again if a tag develops or the view becomes obstructed."
      },
      {
        "q": "A runner starts on second and U1 goes out to rightfield. PU has home coverage and is observing from POP, but the throw and tag have not yet developed. Which approach preserves the required home view?",
        "options": [
          "Move early toward the third-base-line extension to prepare for a swipe tag, then use that position for the first home play before considering whether the leading edge would provide a clearer view.",
          "Use POP to track the ball, runner and fielder; read the timing of the throw and runner then the potential developing tag before adjusting, preserving access to the leading edge rather than committing early toward the third base line extension(3BLE).",
          "Choose the leading edge as the final calling position before the throw develops, then hold that spot through the play because reaching the leading edge removes the need for further lateral adjustment.",
          "Use POP until the throw starts, then follow the ball toward the third-base-line extension regardless of the runner and catcher, using the incoming throw as the sole reference for the final tag angle."
        ],
        "ref": "Appendix 5c, PDF page 44; presentation slides 8, 16, 17.",
        "why": "With U1 out, PU retains home while U2 covers first/second and U3 covers third. POP is an observation area, not a commitment to a predetermined tag angle. Track the runner for possible obstruction or interference and read the throw and fielder. Moving prematurely toward 3BLE can put the plate between the umpire and runner, obscure the tag or touch, and make a return to the leading edge difficult. Move left toward the leading edge or make another necessary adjustment as the actual play develops. A small rightward adjustment may reveal a swipe tag; it does not justify an early move all the way toward 3BLE."
      },
      {
        "q": "U3 goes out. Before U1 reaches home, PU returns from the holding zone for the first play at the plate and communicates the backfill. Who takes the subsequent third-base coverage?",
        "options": [
          "U1 must leave the first-base side and cross directly to third, while U2 retains only second.",
          "U2 backfills third, while U1 adjusts to support first/second coverage without crowding PU's home play.",
          "PU must finish the home call and then sprint to third, because U2 can never leave second.",
          "U3 must return from the outfield for every third-base play, regardless of whether the crew can communicate a safe handoff."
        ],
        "ref": "Appendix 5c, PDF pages 46, 47; presentation slides 10, 14.",
        "why": "When U3 is out, U2 is the remaining inside Base Umpire who can backfill third after PU takes home. U1 reads the changed coverage and avoids unnecessary movement into the play. Crew awareness and communication protect both the first and next play."
      },
      {
        "q": "Which statements correctly describe U2's starting choices and movement from the third-base-side alternate?",
        "statements": [
          "The preferred standard start is on the first-base side between 2BDA and the third base line extension, with depth adjusted to the runners.",
          "The third-base-side alternate is conditional, with a runner on first or runners on first and third; check batter handedness and the pitcher's landing/exit, keeping home unobstructed and the required first-base route available.",
          "When adjustment is needed from the alternate, move toward 1B and 2BDA first rather than farther toward the first base line extension (1BLE), which can put the base between the umpire and the runner/tag and obscure base contact.",
          "For a force play, continue toward the required leading-edge angle, crossing 2BDA if needed; if all elements are already clear, movement to the leading edge is not required merely for its own sake."
        ],
        "options": [
          "Statements 1 and 2 only.",
          "Statements 2 and 3 only.",
          "Statements 1, 3 and 4 only.",
          "All four statements."
        ],
        "ref": "Appendix 5c, PDF pages 40, 42; presentation slides 5, 6, 12, 13.",
        "why": "All four are correct. The standard first-base-side position remains preferred; the alternate is conditional. From the alternate, do not move farther toward 1BLE. That can put the base between the umpire and the runner/tag, increasing parallax and obscuring contact with the base. When an adjustment is required, move toward 2BDA first and continue toward the required leading-edge view as the play dictates. On a force play this may require crossing 2BDA to gain about 90 degrees to the throw and no more than 45 degrees off the leading edge. An existing clear view does not require movement for its own sake."
      },
      {
        "q": "A free runner advances from second toward third and the fielder prepares a tag. Which U3 approach follows the guide and presentation?",
        "options": [
          "Commit to the third-base-line (3BLE) extension before the runner arrives, treating that as the final position for every swipe tag.",
          "Move straight to the leading edge before reading the runner's slide or fielder's receiving position, then hold that angle through the tag because reaching the leading edge completes the required positioning.",
          "Read the runner's path and fielder, use a foul-territory observation position when it gives the view, and adjust toward the leading edge or other required tag angle as the play develops.",
          "Judge the tag from the original starting depth and use the timing of the ball entering the glove as the deciding event."
        ],
        "ref": "Appendix 5c, PDF pages 41, 42; presentation slides 15, 17.",
        "why": "The guide permits foul territory when it provides an unobstructed look into the tag. It is an observation choice, not a fixed destination. Retain access to the leading edge and adjust to the actual point of contact and base touch."
      },
      {
        "q": "U2 has gone out, runners were already on base, and U1 releases first to rotate home while PU prepares third. Which coverage must U3 now maintain?",
        "options": [
          "Inside coverage of second and the runner released at first, with readiness to backfill third if PU instead returns home for a quick play.",
          "Second only, because U1 retains first-base responsibility even while working home; U3 should delay any first-base adjustment until U1 completes the home call and signals a transfer.",
          "Third only, because first and second transfer to PU once U1 starts toward home.",
          "Home alongside U1, leaving the next first/second play until U2 returns from the outfield."
        ],
        "ref": "Appendix 5c, PDF pages 46, 47; presentation slides 9, 10, 14.",
        "why": "U3 rotates inside when U2 goes out and picks up the runner released by U1 at first as well as second-base coverage. Watch PU and U1: a quick home play taken by PU changes the required third-base coverage and triggers backfill."
      },
      {
        "q": "In a six-umpire crew, a deep fly ball is followed by a potential play at a base. Which complete allocation follows Appendix 5d?",
        "options": [
          "The appropriate Base Umpire goes out, ULF/URF remain on the lines and the remaining infield crew carries out the full four-umpire rotation.",
          "ULF/URF take the fly ball and PU plus two Base Umpires rotate using the three-umpire pattern, leaving the fourth infield umpire as a reserve.",
          "ULF/URF take the outfield judgments, no Base Umpire goes out and the infield crew retains its assigned bases without inter-base rotation, while still adjusting position for the view of each play.",
          "ULF/URF take the fly ball and all infield umpires hold their exact starting spots because no rotations also prohibits dynamic movement."
        ],
        "ref": "Appendix 5d, PDF pages 49, 50; presentation slides 19, 21, 22.",
        "why": "The six-umpire system has PU plus three Base Umpires and two outfield umpires. The outfield pair handles the stated outfield judgments, and there are no base rotations. Each infield umpire still reads and adjusts for angle, separation and the tag at their assigned responsibility.",
        "group": "5d"
      },
      {
        "q": "In the six-umpire system, which statements correctly describe the outfield/infield division and ULF/URF technique?",
        "statements": [
          "No Base Umpire goes out, and there are no inter-base rotations; infield umpires still adjust their angles and working positions.",
          "ULF/URF start in front of the outfielders, approximately midway between the Base Umpire and outfielder, up to about one meter inside fair territory near the line with home visible.",
          "If an outfielder runs toward the foul pole, the nearest Base Umpire replaces the outfield umpire and starts the normal four-umpire rotation.",
          "The outfield umpires establish their viewing angle and clearly claim the call; for fair/foul or a pole judgment, use the line and adequate depth, with PU taking fair/foul up to the corner Base Umpire's starting position."
        ],
        "options": [
          "Statements 1 and 3 only.",
          "Statements 1, 2 and 4 only.",
          "Statements 2, 3 and 4 only.",
          "All four statements."
        ],
        "ref": "Appendix 5d, PDF pages 49, 50; presentation slides 20, 21.",
        "why": "Statements 1, 2 and 4 are correct. Dedicated outfield umpires keep Base Umpires on their assigned infield duties. The outfield start protects the batter view and trap angle; claim the call clearly and use the line and suitable depth for line/pole judgments. A going-out trigger for the Base Umpires is not part of this six-umpire allocation.",
        "group": "5d"
      }
    ],
    "draw": 10,
    "drawGroups": {
      "5d": 1
    }
  }
};
