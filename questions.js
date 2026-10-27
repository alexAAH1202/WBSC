// The question bank for assessment-widget.html. Add or edit questions here; the page itself does not need to change.
// Each assessment is one entry: { module, moduleShort, kind, title, nextLabel, nextHref, questions: [...] }.
// A question is { q, options: [..], correct: <index into options>, ref: 'manual section to revisit' }.
// Any number of questions works: the pass mark is 85% of however many there are (the server decides).
// kind 'Presentation Competency Assessment' is the marked, recorded one; 'Manual Knowledge Check' is unmarked practice.
// Run `node tests/bank.test.js` after editing.

var QUIZ_BANK = {
    'm01-mkc': {
      module: "Module 01 \u2014 Foundations Learning Guide",
      moduleShort: "Module 01",
      kind: "Manual Knowledge Check",
      title: "Foundations Learning Guide",
      nextLabel: "Continue to Presentations \u2014 Foundations to Appendix 4",
      nextHref: "presentations.html#pres-01-05",
      questions: [
    {
      q: "In the Foundations Learning Guide's umpire acronym (“So, you want to be an umpire…”), what does the letter M stand for?",
      options: [
        'Motivated — stay enthusiastic through every game',
        'Mobile — maintain hustle and be in position',
        'Managed — accept coaching feedback without question',
        'Methodical — follow the same routine every game'
      ],
      correct: 1,
      ref: 'Foundations Learning Guide, Module 1 — Being an Umpire, §1.1.'
    },
    {
      q: 'Module 1 describes several roles a competent umpire takes on. Which of the following is one of them?',
      options: [
        'Statistician — tracking pitch counts for both teams',
        'Coach — advising players on how to play their position',
        'Communicator — talking and listening effectively to partners, players and coaches',
        'Sponsor liaison — managing sponsorship arrangements'
      ],
      correct: 2,
      ref: 'Foundations Learning Guide, Module 1 — Being an Umpire, §1.2.'
    },
    {
      q: 'Per the WBSC Umpire Code of Ethics, how far in advance of the scheduled game time must an umpire honour their assignment and report to the venue?',
      options: ['30 minutes', '45 minutes', '60 minutes', '90 minutes'],
      correct: 2,
      ref: 'Foundations Learning Guide, Module 2 — What It Means to Be a WBSC Umpire, §2.2.'
    },
    {
      q: 'The Code of Ethics says umpires must be fair and unbiased in their decisions. What does it specifically say this means?',
      options: [
        'Giving the benefit of the doubt to the home team',
        'Deciding without regard to the score',
        'Consulting both head coaches before close calls',
        "Favouring the team with fewer challenges remaining"
      ],
      correct: 1,
      ref: 'Foundations Learning Guide, Module 2 — What It Means to Be a WBSC Umpire, §2.2.'
    },
    {
      q: 'The Four Essential Elements Theory (FEET) in Module 3 lists four things every umpire must keep in view. Which of the following is one of them?',
      options: ['The scoreboard', 'The dugout', 'The on-deck circle', 'The base or area of play'],
      correct: 3,
      ref: 'Foundations Learning Guide, Module 3 — Definitions, §3.1.1.'
    }
  ]
    },
    'm01-pca': {
      module: "Module 01 \u2014 Foundations Learning Guide",
      moduleShort: "Module 01",
      kind: "Presentation Competency Assessment",
      title: "Foundations Learning Guide",
      nextLabel: "Continue to Module 02 \u2014 One-Umpire Field Mechanics",
      nextHref: "manuals.html#module-02",
      questions: [
  { q: "During Team A's half-inning, the head coach visits the mound for a fourth defensive conference in a single 7-inning game to discuss pitching strategy. According to the guide, what is the correct outcome?", options: ["The pitcher is declared illegal because the team has exceeded the permitted three defensive conferences per game.", "Nothing happens — defensive conferences are unlimited as long as they are not injury checks.", "The head coach is ejected automatically for exceeding the conference limit.", "The conference is simply not charged since it is the fourth of the game."], correct: 0, ref: "Foundations Learning Guide, Module 3 — Definitions, §3.7.1 Conference." },
  { q: "After the game, a base umpire who missed a call on a close play at second wants to review it with the crew. Per the guide's approach to crew debriefs, what is the correct way to handle this?", options: ["Avoid raising the play at all so as not to embarrass the umpire who missed it.", "Discuss the play honestly and respectfully as part of the debrief, focus on learning rather than blaming, and ask permission before questioning another umpire's call.", "Confront the umpire about the mistake immediately on the field before leaving.", "Report the missed call directly to the UIC without first discussing it with the crew."], correct: 1, ref: "Foundations Learning Guide, Module 6 — Game Management, §6.9.2 Crew debriefs." },
  { q: "During a game, thunder is heard but no lightning has actually been seen. Per the guide's lightning safety protocol, what should the umpire do?", options: ["Continue play, since only a lightning sighting — not thunder alone — requires suspension.", "Wait and monitor for another few minutes before deciding.", "Immediately call 'Time', suspend play, and direct all players off the field.", "Continue play but move all metal equipment away from the field."], correct: 2, ref: "Foundations Learning Guide, Module 6 — Game Management, §6.8.2 Lightning safety protocol." },
  { q: "A batter is standing well inside the batter's box, crowding the plate, and is struck by a pitch that was actually within the strike zone. Per the guide, what is the correct ruling?", options: ["The batter is awarded first base, since any batter hit by a pitch goes to first base.", "The batter is not awarded first base, because a batter cannot be awarded a base when hit by a pitch that was in the strike zone.", "The umpire must ask the batter whether they attempted to avoid the pitch before making any ruling.", "The pitch is ruled a balk and all runners advance one base."], correct: 1, ref: "Foundations Learning Guide, Module 3 — Definitions, §3.5.19 Batter Hit by the Pitch." },
  { q: "On a force play at second base, the base umpire ends up standing directly above the bag as the throw and runner arrive. Per the guide's positioning principles, what is the problem with this, and where should the umpire have worked from instead?", options: ["There is no problem — directly over the base gives the clearest view of a force play.", "From directly above the base the ball, fielder, runner, and leading edge can appear to line up, making timing hard to judge; the umpire should work just short of the leading edge at a slight angle.", "The umpire should have gone out toward the outfield instead of staying on the infield.", "The umpire should have used the Inside-Outside Theory instead, since that only applies to fly balls."], correct: 1, ref: "Foundations Learning Guide, Module 3 — Definitions, §3.2.1 Leading Edge." },
  { q: "A ball is hit sharply into the outfield gap. Per the Inside-Outside Theory, where should the base umpire move to keep the Four Essential Elements in front of them?", options: ["Stay outside the diamond, beyond the baselines.", "Move inside the diamond, between the baselines.", "Move directly toward home plate regardless of the ball's location.", "Stay in the holding zone until the ball is fielded."], correct: 1, ref: "Foundations Learning Guide, Module 3 — Definitions, §3.3.1 Inside-Outside Theory." },
  { q: "A base umpire has gone out into the outfield to rule on a fly ball. As the throw comes back in and a play develops at second base — already covered by another umpire — what should the umpire who went out do?", options: ["Drift back toward the infield to help cover the play at second base.", "Stay out and let all plays complete, since drifting back could result in two umpires calling the same play.", "Immediately return to their original starting position regardless of other plays.", "Signal for time to reset the umpires' positions."], correct: 1, ref: "Foundations Learning Guide, Module 3 — Definitions, §3.3.4 Going Out (sometimes referred to as Chasing)." },
  { q: "A head coach has already received a warning for arguing a checked-swing call, but continues to argue balls and strikes and directs a personal insult at the umpire. According to the guide, what is the appropriate response?", options: ["Give a second warning before taking any further action.", "Ignore the comments and continue the game to avoid escalation.", "Eject the coach, following the ejection procedure — wait until play stops, be decisive, and use the ejection signal.", "Call the game a forfeit immediately."], correct: 2, ref: "Foundations Learning Guide, Module 6 — Game Management, §6.7 Ejections." },
  { q: "A coach wants to protest that the umpires misapplied a substitution rule in the previous half-inning, but does not raise it until a pitch has already been thrown in the following half-inning. Per the guide, is this protest valid?", options: ["Yes — misapplication of a rule is always a valid protest regardless of timing.", "No — even though misapplying a rule is a valid protest subject, notice was not given before the next pitch as required.", "Yes, but only if the coach files it in writing within 48 hours.", "No — substitution rule disputes can never be protested under any circumstances."], correct: 1, ref: "Foundations Learning Guide, Module 6 — Game Management, §6.6 Protests." },
  { q: "With a runner on first base and one out, the batter swings and misses at a third strike that the catcher does not catch cleanly. Per the guide, what must the plate umpire do?", options: ["Say nothing, since the batter is expected to know the pitch was uncaught.", "Signal safe immediately since the ball was not caught.", "Clearly verbalise 'Strike three ... Out!' because the batter is automatically out by rule in this situation, and reinforce the call if the batter starts toward first.", "Wait for the defensive team to appeal before making any ruling."], correct: 2, ref: "Foundations Learning Guide, Module 9 — Mechanics, §9.6.2 At the Plate." }
]
    },
    'm02-mkc': {
      module: "Module 02 \u2014 Foundations: One-Umpire Field Mechanics",
      moduleShort: "Module 02",
      kind: "Manual Knowledge Check",
      title: "Foundations \u2014 One-Umpire Field Mechanics",
      nextLabel: "Continue to Presentations \u2014 Foundations to Appendix 4",
      nextHref: "presentations.html#pres-01-05",
      questions: [
  {
    q: "According to the One-Umpire System overview, what are the \"Four Essential Elements\" the umpire should always try to keep in view?",
    options: [
      "The ball, the defensive players, the offensive players, and the base or the area of play",
      "The ball, the runners, the coaches, and the scoreboard",
      "The pitcher, the catcher, the batter, and the infield",
      "The ball, the fielders, the foul lines, and the dugouts"
    ],
    correct: 0,
    ref: "Foundations — One-Umpire Field Mechanics, \"One Umpire System\" section."
  },
  {
    q: "In the One-Umpire System, what must the umpire do on every hit ball, before making any call?",
    options: [
      "Remain behind the plate until the ball is fielded",
      "Quickly move out from behind the plate and into the infield for the best view of the play",
      "Call \"Time\" immediately to reset the defense",
      "Move directly to first base regardless of where the ball is hit"
    ],
    correct: 1,
    ref: "Foundations — One-Umpire Field Mechanics, \"One Umpire System\" section."
  },
  {
    q: "Per the Conventions section, how is the plate umpire referred to throughout this manual?",
    options: [
      "\"Umpire-in-Chief\" or \"UIC\"",
      "\"Plate\" or \"PU\"",
      "\"Base Umpire\" or \"BU\"",
      "\"Home\" or \"HU\""
    ],
    correct: 1,
    ref: "Foundations — One-Umpire Field Mechanics, \"Conventions\" section."
  },
  {
    q: "According to the Plate Umpire Starting Position guidance, how many warm-up pitches are allowed for each pitcher in the first inning and with each new pitcher?",
    options: [
      "Three",
      "Five",
      "Seven",
      "Ten"
    ],
    correct: 1,
    ref: "Foundations — One-Umpire Field Mechanics, \"Starting Position — Plate umpire\" section."
  },
  {
    q: "On every hit ball, which side does the manual instruct the plate umpire to exit from behind the catcher?",
    options: [
      "The right side, unless the batter is left-handed",
      "Whichever side is closer to where the ball was hit",
      "The left side, even on a left-handed batter",
      "Directly up the middle, between catcher and batter"
    ],
    correct: 2,
    ref: "Foundations — One-Umpire Field Mechanics, \"Plate Umpire Starting Position\" (general mechanics) section."
  }
]
    },
    'm02-pca': {
      module: "Module 02 \u2014 Foundations: One-Umpire Field Mechanics",
      moduleShort: "Module 02",
      kind: "Presentation Competency Assessment",
      title: "Foundations \u2014 One-Umpire Field Mechanics",
      nextLabel: "Continue to Module 03 \u2014 Two-Umpire Field Mechanics",
      nextHref: "manuals.html#module-03",
      questions: [
  {
    q: "There are no runners on base, and the batter hits a routine ground ball to the shortstop. Per the mechanics for \"No Runners on Base,\" where should the plate umpire move to get the best view of the play?",
    options: [
      "Into foul ball territory toward third base",
      "With purpose, out in front of home plate towards the pitcher's area",
      "Straight up the first base line, following the batter-runner",
      "Stay behind the catcher and make the call from the plate"
    ],
    correct: 1,
    ref: "Foundations — One-Umpire Field Mechanics, \"No Runners on Base,\" Ball hit to the infield."
  },
  {
    q: "A runner is on third base only, and the batter hits a ground ball to the third baseman. Per the mechanics for \"Runner at Third Base,\" what movement should the plate umpire make?",
    options: [
      "Move out in front of home plate towards the pitcher's area, as with no runners on base",
      "Move into foul ball territory toward third base",
      "Remain stationary behind the catcher",
      "Sprint directly to first base"
    ],
    correct: 1,
    ref: "Foundations — One-Umpire Field Mechanics, \"Runner at Third Base,\" Ball hit in the infield."
  },
  {
    q: "With the bases loaded, the batter hits a fly ball to shallow right field. Consistent with the \"Bases Loaded\" mechanics (which follow the same pattern as Runner at Third Base), where should the umpire move?",
    options: [
      "Out in front of home plate toward the pitcher's area",
      "Into foul ball territory toward third base",
      "Directly behind second base",
      "Toward the right field foul line"
    ],
    correct: 1,
    ref: "Foundations — One-Umpire Field Mechanics, \"Bases Loaded,\" Ball hit to the outfield."
  },
  {
    q: "The plate umpire has moved into position for a potential play at first base on a ground ball. What sequence does the manual prescribe for making the call?",
    options: [
      "Call immediately upon seeing the throw, then confirm with a signal",
      "Stop… Wait… Call and Signal",
      "Signal first, then verbally call",
      "Move continuously while calling to keep angle on the play"
    ],
    correct: 1,
    ref: "Foundations — One-Umpire Field Mechanics, \"No Runners on Base,\" Ball hit to the infield."
  },
  {
    q: "A fly ball is hit to the outfield with no runners on base. Before moving toward the base where the play will be made, what must the umpire judge?",
    options: [
      "Whether the ball is fair or foul only",
      "Catch or no catch",
      "Whether the fielder is left- or right-handed",
      "The runner's lead-off distance"
    ],
    correct: 1,
    ref: "Foundations — One-Umpire Field Mechanics, \"No Runners on Base,\" Ball hit to the outfield."
  },
  {
    q: "The ball has returned to the infield after a play in the outfield, and all play has ceased. What should the plate umpire do, per the manual?",
    options: [
      "Continue actively pursuing the play in case a runner attempts another advance",
      "May call and signal \"Time\"",
      "Immediately return to the dugout area",
      "Call an automatic conference with the coaches"
    ],
    correct: 1,
    ref: "Foundations — One-Umpire Field Mechanics, \"No Runners on Base,\" Ball hit to the outfield."
  },
  {
    q: "With runners on first and second base, a fly ball is hit to left field that may or may not be caught. Consistent with the One-Umpire System's instruction to give priority in positioning, which runner should most influence the umpire's positioning?",
    options: [
      "The batter-runner heading to first base",
      "The runner on second base (the lead runner)",
      "The runner on first base",
      "Whichever runner is physically closest to the umpire's current position"
    ],
    correct: 1,
    ref: "Foundations — One-Umpire Field Mechanics, \"One Umpire System\" section (\"give the lead runner priority in your positioning\")."
  },
  {
    q: "A ground ball is hit with a runner on first base. The throw to first base for the batter-runner appears to be a routine, uncontested play, but the runner from first may try to advance on the throw. What does the manual instruct the umpire to do?",
    options: [
      "Stay fixed on the play at first base until it is fully completed",
      "Shift towards where the next play may occur, especially since it is a possible tag play",
      "Call \"Time\" immediately once the throw to first is released",
      "Move to the outfield to prepare for the next batter"
    ],
    correct: 1,
    ref: "Foundations — One-Umpire Field Mechanics, \"One Umpire System\" section."
  },
  {
    q: "A ground ball is hit sharply down the third base line with a runner on third base. Besides moving into foul ball territory toward third base, what additional responsibility does the manual assign the umpire in this situation?",
    options: [
      "Immediately signal \"Out\" before the play concludes",
      "Stay close to the line to call fair/foul",
      "Call the runner out for running outside the baseline",
      "Request assistance from the third base coach"
    ],
    correct: 1,
    ref: "Foundations — One-Umpire Field Mechanics, \"Runner at Third Base,\" Ball hit in the infield."
  },
  {
    q: "While moving with purpose to get into position for a developing play, what positioning principle must the umpire observe, according to the One-Umpire System overview?",
    options: [
      "Always stand exactly halfway between the two bases involved in the play",
      "Ensure the chosen position does not put the umpire in the way of a player or a thrown ball",
      "Always face the pitcher regardless of where the play is developing",
      "Remain a fixed distance from the base at all times"
    ],
    correct: 1,
    ref: "Foundations — One-Umpire Field Mechanics, \"One Umpire System\" section."
  }
]
    },
    'm03-mkc': {
      module: "Module 03 \u2014 Foundations: Two-Umpire Field Mechanics",
      moduleShort: "Module 03",
      kind: "Manual Knowledge Check",
      title: "Foundations \u2014 Two-Umpire Field Mechanics",
      nextLabel: "Continue to Presentations \u2014 Foundations to Appendix 4",
      nextHref: "presentations.html#pres-01-05",
      questions: [
  {
    q: "According to the Two-Umpire System manual, which of the following is NOT one of the 'Four Essential Elements' an umpire must keep in unobstructed view?",
    options: [
      "The ball",
      "The defensive players",
      "The offensive players",
      "The scoreboard"
    ],
    correct: 3,
    ref: "Foundations — Two-Umpire Field Mechanics, Two Umpire System (introduction), Four Essential Elements."
  },
  {
    q: "Under the Division Principle in the Two-Umpire System, which umpire is responsible for calls at home plate and third base under normal circumstances?",
    options: [
      "Plate Umpire",
      "Base Umpire",
      "Whichever umpire arrives first",
      "Both umpires jointly"
    ],
    correct: 0,
    ref: "Foundations — Two-Umpire Field Mechanics, Three Basic Principles — The Division Principle."
  },
  {
    q: "Per the Infield/Outfield Principle, where does the Base Umpire move when the ball is hit to the outfield?",
    options: [
      "Further into the outfield, toward the ball",
      "Into the infield",
      "To a position on the foul line",
      "Behind home plate"
    ],
    correct: 1,
    ref: "Foundations — Two-Umpire Field Mechanics, Three Basic Principles — The Infield/Outfield Principle."
  },
  {
    q: "What is the rationale behind the Leading Runner Principle in the Two-Umpire System?",
    options: [
      "The lead runner is always the fastest runner on base and needs closer supervision",
      "The Base Umpire must always start closest to second base regardless of runners",
      "The Base Umpire positions with the lead runner because the catcher is expected to attempt a pick-off play on that runner",
      "The Plate Umpire delegates lead-runner coverage to avoid fatigue"
    ],
    correct: 2,
    ref: "Foundations — Two-Umpire Field Mechanics, Three Basic Principles — The Leading Runner Principle."
  },
  {
    q: "With no runners on base, what is the Base Umpire's starting position per the manual?",
    options: [
      "4-5 meters (15 feet) behind the base line, in fair territory",
      "5.5 meters (18 feet) behind first base in foul territory, 150 mm (6 inches) off the line",
      "3.5 meters (10-12 feet) behind first base, on the foul line",
      "Directly behind the pitcher's plate, facing home plate"
    ],
    correct: 1,
    ref: "Foundations — Two-Umpire Field Mechanics, Base Umpire Position for Calls."
  }
]
    },
    'm03-pca': {
      module: "Module 03 \u2014 Foundations: Two-Umpire Field Mechanics",
      moduleShort: "Module 03",
      kind: "Presentation Competency Assessment",
      title: "Foundations \u2014 Two-Umpire Field Mechanics",
      nextLabel: "Continue to Module 04 \u2014 Three-Umpire Field Mechanics",
      nextHref: "manuals.html#module-04",
      questions: [
  {
    q: "With no runners on base, the batter hits a routine ground ball to the shortstop, who throws to first base. Which umpire has responsibility for the call at first base?",
    options: [
      "Plate Umpire, because it is a force play",
      "Base Umpire, who makes all calls on the first throw on base plays",
      "Whichever umpire is physically closer to the bag",
      "Plate Umpire, because the hit occurred in fair territory"
    ],
    correct: 1,
    ref: "Foundations — Two-Umpire Field Mechanics, No Runners on Base — Ball hit in the infield."
  },
  {
    q: "With a runner on first base, the batter hits a ground ball that develops into a potential double play. Per the manual, what should the Base Umpire do?",
    options: [
      "Immediately move to third base to cover R1's advance",
      "Remain in the ready position at first base until the throw is complete",
      "Anticipate the double play, move quickly toward the base where the first play will be made, and call all plays made on the first throw",
      "Hand off first-base coverage to the Plate Umpire"
    ],
    correct: 2,
    ref: "Foundations — Two-Umpire Field Mechanics, Runner at First Base — Ball hit in the infield."
  },
  {
    q: "With a runner on first base, the batter hits a fly ball to the outfield that is caught. Which umpire is responsible for the tag-up call at first base?",
    options: [
      "Plate Umpire",
      "Base Umpire",
      "Both umpires jointly",
      "Neither — tag-ups are not judged on caught fly balls"
    ],
    correct: 1,
    ref: "Foundations — Two-Umpire Field Mechanics, Runner at First Base — Ball hit to the outfield."
  },
  {
    q: "With runners on first and second base, R2 attempts to steal third base on the pitch. Under the exceptions to the Division Principle, which umpire has the call at third base?",
    options: [
      "Plate Umpire, per the general Division Principle rule for third base",
      "Base Umpire",
      "Whichever umpire has the clearer angle in the moment",
      "The umpire positioned nearest home plate"
    ],
    correct: 1,
    ref: "Foundations — Two-Umpire Field Mechanics, Three Basic Principles — The Division Principle, Exceptions."
  },
  {
    q: "With runners on second and third base, the batter hits a deep fly ball to the outfield. According to the manual, which runner does the Base Umpire take into third base on this play?",
    options: [
      "R3, the runner originally on third base",
      "The Batter Runner",
      "R2, the runner originally on second base",
      "Neither — the Plate Umpire takes all runners into third base on outfield hits"
    ],
    correct: 2,
    ref: "Foundations — Two-Umpire Field Mechanics, Runners at Second & Third Base — Ball hit to the outfield."
  },
  {
    q: "With the bases loaded, the batter hits a ground ball to an infielder. According to the manual's note for this situation, how should a play at any base be treated?",
    options: [
      "As a tag play requiring the umpire to move to 3.5 meters",
      "As a fair/foul judgment only",
      "As requiring a defensive appeal",
      "As a force play"
    ],
    correct: 3,
    ref: "Foundations — Two-Umpire Field Mechanics, Bases Loaded — Ball hit to the infield."
  },
  {
    q: "The batter hits a ball to the outfield and, as the Batter Runner, advances all the way to third base. Under the exceptions to the Division Principle, who takes the call on the Batter Runner at third base?",
    options: [
      "Plate Umpire, since third-base calls always belong to the Plate Umpire under the Division Principle",
      "Base Umpire",
      "Whichever umpire started the play closer to third base",
      "Plate Umpire, because the Base Umpire only covers first and second base calls"
    ],
    correct: 1,
    ref: "Foundations — Two-Umpire Field Mechanics, Three Basic Principles — The Division Principle, Exceptions."
  },
  {
    q: "With a runner on second base only, and before the pitch, where should the Base Umpire be positioned?",
    options: [
      "5.5 meters (18 feet) behind first base in foul territory",
      "Behind and off the second base fielder, shading toward first base",
      "In the outfield grass behind second base",
      "Behind and off the shortstop, shading toward the runner on second base, with a view of the pitcher, runner and home plate area"
    ],
    correct: 3,
    ref: "Foundations — Two-Umpire Field Mechanics, Runner at Second Base — Starting Position."
  },
  {
    q: "The Base Umpire is set up for a potential play at first base and it becomes clear the throw will require a tag rather than a force. Per the manual, what adjustment should the Base Umpire make?",
    options: [
      "Remain at 5.5 meters (18 feet), since that distance applies to all calls",
      "Move to approximately 3.5 meters (10-12 feet) to see and make the call",
      "Move to 4-5 meters (15 feet) behind the baseline",
      "Retreat further into foul territory for a wider angle"
    ],
    correct: 1,
    ref: "Foundations — Two-Umpire Field Mechanics, Base Umpire Position for Calls."
  },
  {
    q: "With runners on first and third base, a ground ball is hit to the infield. The defense makes the first play (a force at second base), then throws home attempting to get the runner from third. Which umpire is responsible for calling this second, subsequent play at home plate?",
    options: [
      "Base Umpire, since the Base Umpire calls all plays including follow-up throws",
      "Plate Umpire, who is responsible for succeeding plays at third base or home plate after the first infield play",
      "Whichever umpire is positioned in fair territory",
      "Both umpires must call it simultaneously"
    ],
    correct: 1,
    ref: "Foundations — Two-Umpire Field Mechanics, Runners at First & Third Base — Ball hit in the infield."
  }
]
    },
    'm04-mkc': {
      module: "Module 04 \u2014 Foundations: Three-Umpire Field Mechanics",
      moduleShort: "Module 04",
      kind: "Manual Knowledge Check",
      title: "Foundations \u2014 Three-Umpire Field Mechanics",
      nextLabel: "Continue to Presentations \u2014 Foundations to Appendix 4",
      nextHref: "presentations.html#pres-01-05",
      questions: [
  { q: "According to the Three-Umpire System manual's 'Four Essential Elements', which four things must an umpire maintain an unobstructed view of to keep the play in front of them?", options: ["The ball, the defensive players, the offensive players, and the base or area of play", "The ball, the pitcher, the catcher, and the base", "The ball, the runner, the coach, and the scoreboard", "The ball, the fielder, the dugout, and the foul line"], correct: 0, ref: "Foundations — Three-Umpire Field Mechanics, Four Essential Elements." },
  { q: "Per the Division Principle in the Three-Umpire System's 'Two Basic Coverage Principles', when a Base Umpire goes out on a fly ball, which umpire takes all calls at home plate and third base?", options: ["The remaining Base Umpire", "The Plate Umpire", "Whichever umpire is closest to third base", "Both umpires jointly"], correct: 1, ref: "Foundations — Three-Umpire Field Mechanics, Two Basic Coverage Principles — The Division Principle." },
  { q: "What does 'clearing the catcher' mean for the Plate Umpire, as described in the Three-Umpire System manual?", options: ["Sprinting to the backstop to check for interference", "Taking a small step to the Plate Umpire's left to move out from behind the catcher", "Signalling the catcher to stand up before every pitch", "Moving directly behind the catcher for the best angle"], correct: 1, ref: "Foundations — Three-Umpire Field Mechanics, Plate Umpire Responsibilities and Positions — Clearing the Catcher." },
  { q: "In the Base Umpire Ready Position described in this manual, when should the umpire adopt the 'ready' position by unlocking the knees slightly and resting weight on the balls of the feet?", options: ["As soon as the pitcher assumes the set position", "As the pitcher starts the pitch", "Only after the ball is put in play", "During the pre-game meeting"], correct: 1, ref: "Foundations — Three-Umpire Field Mechanics, Base Umpire Starting, Ready Positions and Mechanics — Base Umpire Ready Position." },
  { q: "Per the Infield/Outfield Principle in the Three-Umpire System, what should a base umpire who is NOT going out on a fly ball do once the ball is in the outfield?", options: ["Rotate inside the diamond", "Remain in the ready position at their original base", "Move out beyond the base line to back up the play", "Follow the ball toward the outfield fence"], correct: 0, ref: "Foundations — Three-Umpire Field Mechanics, Two Basic Coverage Principles — The Infield/Outfield Principle." }
]
    },
    'm04-pca': {
      module: "Module 04 \u2014 Foundations: Three-Umpire Field Mechanics",
      moduleShort: "Module 04",
      kind: "Presentation Competency Assessment",
      title: "Foundations \u2014 Three-Umpire Field Mechanics",
      nextLabel: "Continue to Module 05 \u2014 Appendix 4: Elite Positioning Philosophies",
      nextHref: "manuals.html#module-05",
      questions: [
  { q: "With no runners on base, a ground ball is hit to the infield resulting in a possible force play at first base. If the batter-runner is called safe at first and continues toward second base, which umpire has rotated into position to make that call, per the Three-Umpire System manual?", options: ["U3, rotating to second base in line with the plate umpire", "U1, staying at first base to also cover second", "The Plate Umpire, trailing the runner to second base", "U3 remains at third base and does not rotate"], correct: 0, ref: "Foundations — Three-Umpire Field Mechanics, No Runners on Base - Ball Hit to Infield." },
  { q: "With no runners on base, U1 goes out on a fly ball to the outfield. If the ball is not caught, which umpire is responsible for taking the batter-runner into second base and around to third base?", options: ["The Plate Umpire", "U3", "U1 returns from the outfield to take the runner", "Coverage is shared equally between the Plate Umpire and U3"], correct: 1, ref: "Foundations — Three-Umpire Field Mechanics, No Runners on Base-Umpire 1 Goes Out." },
  { q: "With a runner on first base, a ground ball is hit to the infield presenting a potential double play. What does U3 do in anticipation of the throw to second base?", options: ["Steps forward towards second base to get an angle on the throw", "Moves to third base to cover a possible advance", "Remains in the original ready position off the third base line", "Goes out toward the outfield to back up the throw"], correct: 0, ref: "Foundations — Three-Umpire Field Mechanics, Runner on First Base - Ball Hit to Infield - Potential Double Play." },
  { q: "With a runner on second base only, a ground ball is hit to the infield. Which umpire is responsible for calls at both first and second base in this situation?", options: ["U3", "The Plate Umpire", "U1", "Both U1 and U3 share the calls"], correct: 2, ref: "Foundations — Three-Umpire Field Mechanics, Runner on Second Base - Ball Hit to Infield." },
  { q: "With a runner on third base only, a ground ball is hit to the infield. If U3 is unable to release R1 at third base (R1 does not proceed home), which umpire may be required to take the batter-runner to second base and make the call?", options: ["U3, after releasing third base", "U1", "The Plate Umpire, moving up the first base line", "No umpire — the play is a dead ball"], correct: 1, ref: "Foundations — Three-Umpire Field Mechanics, Runner on Third Base - Ball Hit to Infield." },
  { q: "With a runner on third base, U1 goes out on a fly ball. Which umpire moves to the holding zone between home and third base to watch the tag-up of R1, while also preparing for a possible call at home plate?", options: ["U3", "The Plate Umpire", "U1, before leaving for the outfield", "No umpire watches the tag-up in this situation"], correct: 1, ref: "Foundations — Three-Umpire Field Mechanics, Runner on Third Base-Umpire 1 Goes Out." },
  { q: "With runners on first and second base, a ground ball is hit to the infield presenting a potential double play. What does U3 do in anticipation of the lead runner (R1) progressing from second base?", options: ["Moves into fair territory about one step in anticipation of a play on R1", "Rotates all the way to third base immediately", "Stays in foul territory behind third base", "Goes out to the outfield to back up a potential overthrow"], correct: 0, ref: "Foundations — Three-Umpire Field Mechanics, Runner on First and Second Base - Ball Hit to the infield (potential double play)." },
  { q: "With runners on second and third base, a ground ball is hit to the infield. If R1 (the runner on third) advances toward home, what does U3 do, per the manual?", options: ["Remains at third base regardless of R1's advance", "Moves into fair territory about one step in anticipation of a play on R2 progressing from second base", "Immediately rotates to first base", "Follows R1 toward home plate"], correct: 1, ref: "Foundations — Three-Umpire Field Mechanics, Runners on Second and third Base - Ball Hit to the Infield." },
  { q: "With a runner on first base, the ball is hit through the infield to the outfield and no umpire goes out. As R1 progresses toward second base, where does the Plate Umpire rotate to in preparation for a possible call?", options: ["Third base", "First base", "The Plate Umpire remains at home plate", "Second base, alongside U3"], correct: 0, ref: "Foundations — Three-Umpire Field Mechanics, Runner on First Base - Ball Hit Through the Infield." },
  { q: "With a runner on second base, the ball is hit through the infield toward right field. Per the manual's note, if there is a possibility of a play at third base on the throw-back, what should U3 do?", options: ["Rotate inside the diamond", "Move back out beyond the base line in fair territory", "Remain on the foul line even with the base", "Release to cover home plate"], correct: 0, ref: "Foundations — Three-Umpire Field Mechanics, Runner on Second Base - Ball Hit Through the Infield (Note)." }
]
    },
    'm05-mkc': {
      module: "Module 05 \u2014 Appendix 4: Elite Umpire Mechanics, Positioning Philosophies",
      moduleShort: "Module 05",
      kind: "Manual Knowledge Check",
      title: "Appendix 4: Elite Positioning Philosophies",
      nextLabel: "Continue to Presentations \u2014 Foundations to Appendix 4",
      nextHref: "presentations.html#pres-01-05",
      questions: [
  { q: "According to Appendix 4's Key Concepts and Glossary, what are the 'Four Essential Elements' an umpire must observe together to make an accurate decision?", options: ["The umpire's position, the runner's speed, the crowd noise, and the scoreboard", "The ball, the defensive player, the offensive player(s), and the base or area of play", "The pitcher, the catcher, the batter, and the plate", "The starting position, the calling position, the focal point, and the leading edge"], correct: 1, ref: "Appendix 4, Section 1 — Key Concepts and Glossary, \"Four Essential Elements.\"" },
  { q: "In Appendix 4's Key Concepts and Glossary, how is 'Parallax Error' defined?", options: ["A rule violation that occurs when a pitcher's stepping foot lands outside the pitching lane", "A visual distortion that occurs when the umpire views a play from a poor angle that prevents clear separation and timing of the elements of the play", "The delay between an umpire seeing a play and signalling a decision", "A mechanical error caused by starting too far from the base"], correct: 1, ref: "Appendix 4, Section 1 — Key Concepts and Glossary, \"Parallax Error\"; see also Section 8, Parallax Error in Softball Umpiring." },
  { q: "Where is the Point of Plate (POP) Position generally located?", options: ["Directly on the foul line, level with first base", "Inside the diamond, halfway between home plate and the pitcher's plate", "Approximately 3-4 metres (10-12 feet) directly behind home plate, aligned with the centre axis of the plate", "At the Second Base Diagonal Angle, 3-4 metres behind second base"], correct: 2, ref: "Appendix 4, Section 1 — Key Concepts and Glossary, \"Point of Plate (POP) Position.\"" },
  { q: "What disciplined sequence does Appendix 4 identify as the technique umpires use to avoid anticipation and cognitive bias before making and communicating a decision?", options: ["See - Move - React - Call", "Stop - See - Decide - Signal", "Watch - Wait - Confirm - Announce", "Position - Track - Judge - Signal"], correct: 1, ref: "Appendix 4, Section 1 — Key Concepts and Glossary, \"Timing (Stop–See–Decide–Signal)\"; see also Section 9, Visual Discipline and Cognitive Bias in Umpire Judgment." },
  { q: "How does Appendix 4 describe its relationship to Appendix 5?", options: ["Appendix 4 replaces Appendix 5 for umpires below elite level", "Appendix 4 provides the why; Appendix 5 will provide the how", "Appendix 4 and Appendix 5 cover identical content in different formats", "Appendix 4 is only for trainers, while Appendix 5 is only for umpires"], correct: 1, ref: "Appendix 4, Section 11 — Preparing for Appendix 5: Applying Elite Mechanics." }
]
    },
    'm05-pca': {
      module: "Module 05 \u2014 Appendix 4: Elite Umpire Mechanics, Positioning Philosophies",
      moduleShort: "Module 05",
      kind: "Presentation Competency Assessment",
      title: "Appendix 4: Elite Positioning Philosophies",
      nextLabel: "Continue to Module 06 \u2014 Appendix 5: Elite Field Mechanics",
      nextHref: "manuals.html#module-06",
      questions: [
  { q: "During a bang-bang tag play at third base, the umpire clearly sees the fielder's glove make contact with the runner's leg but does not clearly track whether the runner's hand had already reached the base. The umpire calls the runner out based on the glove contact alone. Which principle from Appendix 4 best explains the risk in this decision-making process?", options: ["Anticipatory signalling, because the umpire prepared the signal before the play began", "Affirmation bias, because fixating on the tag action can cause the brain to prematurely confirm an out and override the actual relationship between the ball, runner, and base", "Parallax error, because the umpire was positioned too far from the play", "A breach of primary responsibilities, because the umpire failed to rotate to the correct base"], correct: 1, ref: "Appendix 4, Section 9 — Visual Discipline and Cognitive Bias in Umpire Judgment, \"Affirmation Bias: Focusing Only on the Tag.\"" },
  { q: "A sharp line drive travels near the third-base bag. The Plate Umpire, positioned behind the catcher, is the only umpire with a view of the play. Based on Appendix 4's explanation of parallax error, why is this positioning a concern, and what does correct mechanics require?", options: ["It is not a concern, because the Plate Umpire's slot position is aligned with every part of the field", "Parallax may make the ball appear fair or foul incorrectly from behind the plate; mechanics require an umpire to be on the foul line to accurately judge the call", "It is only a concern for home run judgments, not for line drives near a base", "The Plate Umpire should call the play from memory of the pitch location rather than the batted ball"], correct: 1, ref: "Appendix 4, Section 8 — Parallax Error in Softball Umpiring, \"Fair/Foul on Line Drives.\"" },
  { q: "A runner attempting to avoid a swipe tag at second base slides to the back corner of the bag, away from the umpire's position on the Second Base Diagonal Angle. What does Appendix 4 direct the umpire to do in this situation?", options: ["Remain fixed on the Second Base Diagonal Angle regardless of how the play develops, since it is the designated starting reference", "Adjust position along the diagonal or move off it as needed, since the priority is always maintaining an unobstructed view of the key elements", "Immediately move to the Point of Plate position to gain a better angle", "Call time and reposition only after the play has concluded"], correct: 1, ref: "Appendix 4, Section 1 — Key Concepts and Glossary, \"Second Base Diagonal Angle.\"" },
  { q: "On a potential tag play, a runner runs directly at the umpire, forcing the umpire to move suddenly to avoid a collision. What does Appendix 4 say this situation indicates?", options: ["The runner committed interference and should be called out automatically", "The umpire was in the wrong position or did not wait for the play to develop properly", "The umpire correctly anticipated the play and should hold their ground next time", "This is a normal and unavoidable part of elite mechanics requiring no adjustment"], correct: 1, ref: "Appendix 4, Section 4 — Observation and calling positions." },
  { q: "During a game, the umpire positioned near second base has a clear, obvious view that the pitcher's stepping foot landed completely outside the pitching lane, while the Plate Umpire's angle does not allow a clear view of the violation. According to Appendix 4, what should the umpire near second base do?", options: ["Say nothing, because only the Plate Umpire has authority to call an illegal pitch", "Wait until the next inning to raise the issue with the Plate Umpire privately", "If certain, call the illegal pitch, since WBSC mechanics permit the umpire near second base to manage the stepping foot when it is completely outside the pitching lane", "Signal the Plate Umpire discreetly but never call the violation directly"], correct: 2, ref: "Appendix 4, Section 6 — Managing Pitching Philosophy, Responsibility and the Pitching Lane." },
  { q: "An umpire begins forming their 'out' signal mentally while the fielder is still completing the tag attempt, before the play has fully concluded. According to Appendix 4, what is the likely consequence of this habit?", options: ["It has no effect on accuracy, since experienced umpires can multitask effectively", "It disrupts timing and encourages early calling, because the brain shifts focus away from processing the final elements of the action", "It improves reaction time and is a recommended technique for bang-bang plays", "It only affects balls and strikes calls, not tag plays"], correct: 1, ref: "Appendix 4, Section 9 — Visual Discipline and Cognitive Bias in Umpire Judgment, \"Anticipatory Signalling.\"" },
  { q: "In a Four-Umpire system, a fly ball is hit into the gap where both U1 and U2's coverage areas overlap, with U1 also converging on the ball. Which umpire should go out first, per Appendix 4?", options: ["U2 should go out first because U2 has the more central starting position", "Both umpires should go out simultaneously to double-cover the play", "U1 should have the first opportunity to go out, since U2 should allow U1 or U3 the first opportunity and only go out if neither does", "Neither umpire should go out; the Plate Umpire must cover all converging fly balls"], correct: 2, ref: "Appendix 4, Section 7 — Outfield coverage, \"In a Four-Umpire system.\"" },
  { q: "An umpire's initial angle on a developing tag play is poor, but the umpire moves purposefully to a better angle as the throw arrives. Which technique described in Appendix 4 does this reflect, and what is its purpose?", options: ["Active feet, used solely to maintain balance while standing still", "The mental snapshot technique, in which the umpire takes a mental photograph from the initial angle, then a second from the improved angle, combining them into a clearer 3D picture of the play", "Parallax correction, which eliminates the need to change position", "The leading edge principle, which requires the umpire to remain at 90 degrees to the runner's path at all times"], correct: 1, ref: "Appendix 4, Section 8 — Parallax Error in Softball Umpiring, \"Mental Snapshots: A Technique to Improve Judgment.\"" },
  { q: "A Base Umpire in a 3- or 4-umpire system must decide whether to go out on a fly ball. One available position is closer to the play but offers a compromised sightline; another is farther away but offers a clean, unobstructed angle. Which choice reflects Appendix 4's stated principle for outfield coverage decisions?", options: ["The closer position, because proximity always produces the most accurate judgment", "The farther position with the clean angle, because in all cases angles take priority over distance", "Neither position; the umpire should request a video review", "The closer position, because distance takes priority over angle in outfield coverage"], correct: 1, ref: "Appendix 4, Section 7 — Outfield coverage." },
  { q: "A developing umpire treats their textbook starting position at second base as the position from which every call must be made, even as a throw and tag pull the play toward the leading edge. Which key principle from Appendix 4 does this approach fail to reflect?", options: ["Primary Responsibilities, because the umpire must always rotate to another base first", "Dynamic Positioning and Adjustments, because there is no 'X marks the spot' position — starting and observation positions must never be assumed to be the final calling position", "Pre-Pitch Preparation and Outfield Coverage, because the umpire failed to anticipate outfielder depth", "Parallax Error, because the umpire was aligned with the wrong plane"], correct: 1, ref: "Appendix 4, Section 2.1 — Dynamic Positioning and Adjustments." }
]
    },
    'm06-mkc': {
      module: "Module 06 \u2014 Appendix 5: Elite Three, Four, Five and Six-Umpire Field Mechanics",
      moduleShort: "Module 06",
      kind: "Manual Knowledge Check",
      title: "Appendix 5: Elite Field Mechanics",
      nextLabel: "Continue to Presentations \u2014 Appendix 5, Part A: Key Concepts",
      nextHref: "presentations.html#pres-5a",
      questions: [
  {
    q: "In Appendix 5a's Four Essential Element Theory (FEET), what are the four elements umpires must observe together to make a correct call?",
    options: [
      "The ball, the defensive player, the offensive players, and the base or the area of the play",
      "The pitcher, the catcher, the batter, and the base umpire",
      "The strike zone, the runner's lead, the tag, and the fielder's glove",
      "The starting position, the observation position, the calling position, and the base"
    ],
    correct: 0,
    ref: "Appendix 5a, Key Concepts Introduction — Four Essential Element Theory (FEET)."
  },
  {
    q: "Per Appendix 5a, the Point of Plate (POP) position is located approximately how far behind home plate?",
    options: [
      "1-2 meters (3-6 feet)",
      "2-4 meters (6-12 feet)",
      "3-5 meters (9-15 feet)",
      "6-12 meters (20-40 feet)"
    ],
    correct: 1,
    ref: "Appendix 5a, Point of Plate (POP) Position."
  },
  {
    q: "According to Appendix 5a, what does 'Backfilling' refer to?",
    options: [
      "An umpire counter-rotating to cover a position not filled by another umpire who is required to cover a play elsewhere",
      "An umpire moving to the leading edge of a base to judge a tag play",
      "An umpire clearing the catcher to obtain an unobstructed view of the field",
      "An umpire returning to their between-innings position after a play concludes"
    ],
    correct: 0,
    ref: "Appendix 5a, Backfilling."
  },
  {
    q: "What does Appendix 5a give as the purpose of the Five and Six-Umpire Systems?",
    options: [
      "To replace the Plate Umpire with two additional outfield umpires",
      "To allow two dedicated outfield umpires to cover fly-ball responsibilities so the remaining umpires can stay in the infield and cover bases at all times",
      "To eliminate the need for any rotations between bases",
      "To allow all umpires to officiate exclusively from foul territory"
    ],
    correct: 1,
    ref: "Appendix 5a, Purpose of the Five and Six-Umpire Systems."
  },
  {
    q: "Appendix 5 is divided into four sub-sections (5a-5d). Which sub-section covers the Three-Umpire System mechanics?",
    options: [
      "Appendix 5a",
      "Appendix 5b",
      "Appendix 5c",
      "Appendix 5d"
    ],
    correct: 1,
    ref: "Appendix 5, Table of Contents — Appendix 5b, Three-Umpire System."
  }
]
    },
    'm06-pca': {
      module: "Module 06 \u2014 Appendix 5: Elite Three, Four, Five and Six-Umpire Field Mechanics",
      moduleShort: "Module 06",
      kind: "Presentation Competency Assessment",
      title: "Appendix 5: Elite Field Mechanics",
      nextLabel: "You've completed all six required modules \u2014 view your full assessment record",
      nextHref: "#top",
      questions: [
  {
    q: "Three-Umpire System: U1 is at 1B and U3 is at 3B, no runners on base. A ground ball gets through the infield to the outfield. Per Appendix 5b, what is U3's responsibility?",
    options: [
      "Rotate inside for any call at 2B",
      "Move down the foul line and be prepared for an outfield-to-1B force-out play",
      "Rotate directly to the POP area for a possible call at home plate",
      "Stay in the Second Base Diagonal Angle position anticipating a pickoff throw back"
    ],
    correct: 0,
    ref: "Appendix 5b, Ground Ball to Outfield — U1 at 1B; U3 at 3B (No runners on base or runner on 3B only)."
  },
  {
    q: "Three-Umpire System, runner on 1B only (U1 at 1B, U3 at 2B). A ground ball is hit into the outfield. According to Appendix 5b, what does U1 do?",
    options: [
      "Use foul territory to move toward home plate, and once the Batter-Runner touches 1B, rotate to the HP POP area and push PU to 3B",
      "Remain at 1B to cover a potential pickoff throw back",
      "Move inside the diamond to take control of any call at 2B",
      "Button hook inside to cover 1B and 2B"
    ],
    correct: 0,
    ref: "Appendix 5b, Ground Ball to Outfield — U1 at 1B; U3 at 2B (Runner on 1B)."
  },
  {
    q: "Three-Umpire System, U1 at 1B and U3 at 3B, no runners on base. U1 goes out on a fly ball to right field. Per Appendix 5b, who takes responsibility for calls at 1B and 2B once the Batter-Runner passes 1B?",
    options: [
      "PU",
      "U3",
      "U1, immediately after returning from the outfield",
      "No umpire — the base is left uncovered until the next rotation"
    ],
    correct: 1,
    ref: "Appendix 5b, Outfield Fly-Ball Coverage Movements — U1 at 1B; U3 at 3B; U1 Goes Out (no runners on)."
  },
  {
    q: "Three-Umpire System, runner on 3B, U1 goes out on a fly ball to right field. Per Appendix 5b, what does PU do while U3 covers the infield?",
    options: [
      "Rotate to the holding position, observe the play as it develops, and move to 3B or HP as needed",
      "Trail the Batter-Runner one third of the way to 1B",
      "Remain fixed at POP for the entire play without moving",
      "Immediately rotate to 3B regardless of how the play develops"
    ],
    correct: 0,
    ref: "Appendix 5b, Outfield Fly-Ball Coverage Movements — U1 at 1B; U3 at 3B; U1 Goes Out; Runner on 3B."
  },
  {
    q: "Four-Umpire System, no runners on base. U2 goes out on a fly ball to centre field. Per Appendix 5c, what does U3 do?",
    options: [
      "Rotate inside for any call at 2B",
      "Move down the foul line to prepare for a call at 3B",
      "Stay in foul territory at 3B in case of a tag play",
      "Button hook inside to cover 1B and 2B"
    ],
    correct: 0,
    ref: "Appendix 5c, Outfield Fly-Ball Coverage Movements — Fly-ball Centre field — U2 goes out."
  },
  {
    q: "Four-Umpire System. U1 goes out on a fly ball to right field. Per Appendix 5c, which umpire is responsible for any call at 1B and 2B?",
    options: [
      "U2, by button hooking inside",
      "U3, by rotating inside from 3B",
      "PU, by trailing the Batter-Runner",
      "U1 continues to cover 1B by verbal call from the outfield"
    ],
    correct: 0,
    ref: "Appendix 5c, Outfield Fly-Ball Coverage Movements — Fly-ball down 1B line (right field) — U1 goes out."
  },
  {
    q: "Four-Umpire System. A ground ball is hit to left field and no base umpire goes out. Per Appendix 5c, what should U2 do?",
    options: [
      "Stay out for an acute angle on the throw from left field for any call at 2B",
      "Button hook inside immediately for any call at 2B",
      "Move to the POP area to assist the Plate Umpire",
      "Rotate to 3B to cover a potential tag play"
    ],
    correct: 0,
    ref: "Appendix 5c, Ground Ball to Outfield — U2, Hit to LF."
  },
  {
    q: "In the Four-Umpire System's outfield fly-ball coverage areas, which umpire goes out for a fly ball to centre field?",
    options: [
      "U1",
      "U2",
      "U3",
      "PU"
    ],
    correct: 1,
    ref: "Appendix 5c, Outfield Fly-Ball Coverage Area."
  },
  {
    q: "In a Five-Umpire System, a fly ball is hit to the outfield. Per Appendix 5d, which umpires go out to judge the play, and what do the three infield umpires do?",
    options: [
      "ULF and URF run into fair territory to judge the play; the three infield umpires remain on the infield and rotate as per the Three-Umpire System",
      "The nearer base umpire always goes out, exactly as in the Three-Umpire System",
      "All five umpires converge toward the ball to triangulate the call",
      "PU goes out while the four base umpires cover the bases"
    ],
    correct: 0,
    ref: "Appendix 5d, Five Umpire System — Infield Rotations / Fly-ball Coverage."
  },
  {
    q: "In both the Five and Six-Umpire Systems, per Appendix 5d, how is fair/foul responsibility divided?",
    options: [
      "The Plate Umpire takes all fair/foul balls up to the starting position of U1 or U3; ULF and URF take all other fair/foul calls",
      "ULF and URF have sole responsibility for every fair/foul call on the field",
      "Fair/foul responsibility goes entirely to whichever infield umpire is nearest the batter",
      "The Plate Umpire has no fair/foul responsibility in these systems"
    ],
    correct: 0,
    ref: "Appendix 5d, Fair/Foul Responsibility."
  }
]
    }
  };
