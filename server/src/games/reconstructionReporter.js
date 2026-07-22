// reconstructionReporter.js — Unit 5 game adapter: "Reconstruction Reporter"
// (SOLO, one class-wide group). Everyone plays a young reporter for a Galveston
// newspaper, 1865–1876. Six assignments × 2 graded decisions = 12 graded
// actions. There is no "pick" and no rival — the whole class walks the same
// eleven years, so the Teacher Command Center reports ONE accuracy group.
//
// THE TEACHING IDEA (spec §1): Reconstruction is where the EFFECTS of the Civil
// War (TEKS 7.5C) and the SKILLS of a historian (7.20D/F — bias, source
// validity) meet naturally. A reporter must witness Juneteenth, the Freedmen's
// Bureau, the Black Codes, Klan terror, Black Texans voting and holding office,
// and the 1876 Constitution — AND learn to weigh loaded words, self-interested
// witnesses, and rumor against evidence. Every assignment grades BOTH what you
// cover and HOW you verify it. This also teaches 7.16B (the free press).
//
// THE DESIGN THAT MAKES THIS GAME HONEST (spec §3): the RIGHT answers favor
// truth and source safety even when they cost Standing — teaching journalistic
// ethics inside history. Standing (your paper's credibility and your job) takes
// UNAVOIDABLE scripted hits in the late assignments: the era punished
// truth-tellers, and telling the truth about the Black Codes and the night
// riders cost real Galveston editors real advertisers and real friends. So even
// accurate play ends with Standing low. That is the point, and the debrief says
// so. There is NO early-fail; the meters just fall.
//
// SENSITIVITY (spec §6, Standing Rules 1–4 — the STRICTEST in the catalog):
//   • Klan violence is conveyed through THREAT, TESTIMONY, and PATTERN — never
//     depicted (burned fence posts, a warning nailed to a church door, "the
//     riders will come for him"). No attack is described.
//   • Freedpeople are PROTAGONISTS with names, courage, and agency — interviewed
//     at Jubilee, learning at the school, testifying bravely, voting, and (as
//     Senators Matt Gaines and George T. Ruby) legislating. Never only victims.
//   • The Black Codes and terror are named PLAINLY (honesty rule) at a
//     headline level — "slavery's shadow, in statute form."
//   • The debrief bends toward the long record (Juneteenth's endurance) without
//     pretending the era ended well.
//
// THE ANSWER KEY LIVES HERE, ON THE SERVER (verdicts/effects/feedback). The
// factory ships labels only; the client submits { kind, choiceIndex }.
// Student-facing text is written at a 5th grade reading level.
//
// Every step is a 'decision' — a judgment call. This is a management game with a
// newsroom-status panel, not a map. ✅ right (+1) · ⚠️ partial (+0.5) · ❌ wrong (0).

import { createStepGame } from './_stepGame.js';

// ---------------------------------------------------------------------------
// Shared board metadata (shipped to clients at match:begin — display info only)
// ---------------------------------------------------------------------------

export const METERS = {
  truth:    { name: 'Truth',    icon: 'truth',    blurb: 'How accurate the printed record is. Truth grows when you go to the source and check every claim before you print it.' },
  sources:  { name: 'Sources',  icon: 'sources',  blurb: 'How much people trust you — especially freedpeople who risk everything to talk. Protect them and Sources grows; burn them and it collapses.' },
  standing: { name: 'Standing', icon: 'standing', blurb: 'Your paper\'s reputation and your job. In this era, printing hard truths costs Standing no matter how well you do it — and that is the price of the work.' },
};

// This game has no map, so there are no placed markers. Kept for engine symmetry.
export const MARKERS = {
  newsroom: { name: 'The newsroom' },
};

// All three meters begin at 50: a new reporter, a notebook, and the biggest
// story in Texas still unwritten.
const START_METERS = { truth: 50, sources: 50, standing: 50 };

// Story Score = truth + sources + standing (max 300).
export function reporterScore(meters) {
  return (meters.truth || 0) + (meters.sources || 0) + (meters.standing || 0);
}

// Ending tier from the final Story Score (spec §3). Tuned by simulation so that
// accurate play still reaches "The Record Stands" even though Standing falls in
// the late game — because printing the truth and protecting your sources IS the
// win, lost advertisers and all.
export const ENDINGS = {
  top: { key: 'top', title: 'The Record Stands',
         text: 'You protected your sources, checked every claim, and printed the truth with the evidence attached. Your paper lost some friends and kept its soul. You went where the story was — into the crowd at Jubilee, into the freedpeople\'s school, into the lantern light where a frightened man trusted you with his name. You named the Black Codes for what they were, printed the night riders\' pattern without ever printing the witness, and answered loaded words with facts. A century and a half later, historians will lean on records like yours to tell this era straight. The record stands — because you did.' },
  mid: { key: 'mid', title: 'Ink and Nerve',
         text: 'You got much of the story, and you paid for some of it. A few claims slipped into print unchecked; a few hard truths came out softer than they should have. But your notebook holds real history, honestly gathered — a school full of eager readers, two Black senators at work, a constitution read closely instead of cheered blindly. Reporters like you kept the record alive when it would have been far easier to let it go dark. It took ink and nerve, and you had both, most days.' },
  low: { key: 'low', title: 'The Story Got Away',
         text: 'The rumors got printed. The spin got through. The hardest stories died quietly in your notebook. The planter\'s claim, the politician\'s "explainer," the sheriff\'s denial — you let the powerful write the record, and the people at the center of the story never saw their truth in your pages. The history still happened. But your readers never learned it from you, and the false version got a head start it would keep for decades. This decade deserved a braver witness. There is another run in you — and the story is still waiting.' },
};

export function endingFor(score) {
  if (score >= 195) return ENDINGS.top;
  if (score >= 115) return ENDINGS.mid;
  return ENDINGS.low;
}

// The universal debrief: the true record, the honest naming of harm, and the
// long arc — Juneteenth endures, the 1876 constitution still governs, and the
// era's unfinished business feeds the civil-rights movement of Unit 7.
export const DEBRIEF =
  'Here is the true record your eleven years just walked through. On June 19, 1865, General Gordon Granger landed at Galveston and read the order that freed about 250,000 enslaved Texans — the last enslaved people in the Confederacy to learn of their freedom, more than two years after the Emancipation Proclamation. That day became Juneteenth. Freedom on paper was only the start. The Freedmen\'s Bureau opened schools where Black Texans of every age learned to read — something that had once been against the law for them — even as angry neighbors tried to stop it. But in 1866 Texas passed the Black Codes: laws that forced freedpeople into labor contracts, limited where they could travel and work, and blocked their testimony in court against white Texans. These were slavery\'s shadow in statute form, and history names them plainly. When freedpeople voted and organized anyway, hooded night riders answered with terror — threats, burned property, and violence meant to frighten Black Texans away from the ballot and the schoolhouse. Witnesses risked everything to report it. Under military Reconstruction, Black men in Texas voted and won office: Matt Gaines and George T. Ruby became two of the first Black state senators in Texas history, fighting for public schools and for the safety of Black voters. Then the "Redeemers" — Texans who fought to roll back Reconstruction — took power and wrote the Constitution of 1876: a document built on distrust of government, with a weaker governor, shorter terms, and deep cuts to schools. Here is the long arc. Reconstruction\'s gains were rolled back, and much of the record was buried or twisted for almost a century. But the truth endured where reporters and record-keepers kept it. Juneteenth became a Texas holiday in 1980 and a national holiday in 2021. The 1876 Constitution still governs Texas today — amended over 500 times, because you cannot run a modern state on an 1876 document without patching it. And the rights won and rolled back in Reconstruction — voting, schools, equal standing in court — became the heart of the civil-rights movement you will meet in Unit 7. The skills you used are real too: weighing loaded words, checking claims against documents, protecting sources, and corroborating before you print. That is how real journalists and real historians still separate the record from the noise. The story got told because someone chose to witness it. This time, that someone was you.';

// ===========================================================================
// THE SIX ASSIGNMENTS, 1865–1876. Standing is the thread — and in the late game
// it falls no matter what, because the era punished truth-tellers. Player-facing
// text at a 5th grade reading level.
// ===========================================================================

const PHASES = [
  // ---- Assignment 1 — The Day of Jubilee (June 19, 1865) ----
  {
    title: 'The Day of Jubilee', date: 'June 19, 1865 · freedom proclaimed', image: 'event_juneteenth.jpg',
    event: 'General Gordon Granger has landed in Galveston. Today he read an order out loud: every enslaved person in Texas is free. That is about 250,000 people — and many are only hearing of their freedom now, more than two years late. The streets are filling with song and tears of joy. Your editor hands you a notebook and wants the story by dark. Where do you point your pencil?',
    steps: [
      {
        kind: 'decision',
        prompt: 'The biggest day in Texas history is happening in the streets. What do you cover?',
        choices: [
          { label: 'Interview the general\'s staff and copy down the order word for word.',
            verdict: 'partial', effects: { truth: 5 },
            feedback: 'Accurate — and hollow. An order on paper is not a day of jubilee. You got the facts of the law but missed the truth of the day: what freedom felt like to the people who had waited for it.' },
          { label: 'Go where the story is — interview freedpeople themselves about what this day means to them.',
            verdict: 'right', effects: { truth: 10, sources: 10, standing: 5 },
            feedback: 'The people at the center of the story ARE the story. Their words made the record that matters — and asking them first is how you earn their trust for every story after this one.' },
          { label: 'Write it from the office. Everyone already knows what happened.',
            verdict: 'wrong', effects: { truth: -10 },
            feedback: 'Nobody knew what happened until someone asked. A story written from an empty office is a guess dressed up as news. That is not the job.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'A planter stops you. He says the freedpeople "won\'t work without masters" and wants it in the paper. Do you print it?',
        choices: [
          { label: 'Print his quote with no check. He said it, so it is fair to run it.',
            verdict: 'partial', effects: { standing: 5, truth: -10 },
            feedback: 'His words are real, but printing a claim without checking it makes it look true. A quote in your paper wears your paper\'s trust. Your readers deserve the check, not just the quote.' },
          { label: 'Print it as fact, in your own voice.',
            verdict: 'wrong', effects: { truth: -15 },
            feedback: 'Now HIS opinion wears YOUR paper\'s name. That is exactly how a false idea becomes "common knowledge" — one unchecked claim printed as fact.' },
          { label: 'Note it as HIS claim, then find what freedpeople and Freedmen\'s Bureau agents actually report — and print the evidence.',
            verdict: 'right', effects: { truth: 10 },
            feedback: 'He has a stake in the story — he lost the labor he never paid for. A source with something to gain needs backing up. That is corroboration: checking a claim against other proof. (Skills: 7.20D/F)' },
        ],
      },
    ],
  },

  // ---- Assignment 2 — The School (1866) ----
  {
    title: 'The School', date: '1866 · a Freedmen\'s Bureau school opens', image: 'event_school.jpg',
    event: 'The Freedmen\'s Bureau — the government office set up to help freedpeople — has opened a school near the wharf. The room is packed: children, parents, even grandparents at the slates. Many walked past angry stares to get here. Learning to read was once against the law for them. Not anymore. Your editor wants two things from this assignment: the story of the school, and a rumor checked.',
    steps: [
      {
        kind: 'decision',
        prompt: 'A schoolroom full of new readers of every age. How do you cover it?',
        choices: [
          { label: 'Sit in the classroom. Talk to the teacher and the students. Show the hunger to learn.',
            verdict: 'right', effects: { truth: 10, sources: 10, standing: 5 },
            feedback: 'One room, every age, all learning at once — that picture tells Texas what freedom is FOR. You went and saw it, and the people in it trusted you to tell it true.' },
          { label: 'Report that a school opened, using the Bureau\'s official notice.',
            verdict: 'partial', effects: { truth: 5 },
            feedback: 'True, but thin. A notice cannot show you a grandmother learning her letters beside her grandson. The facts were right; the story was still in the room you did not enter.' },
          { label: 'Skip it. "A school opening isn\'t news."',
            verdict: 'wrong', effects: { truth: -10, sources: -5 },
            feedback: 'For people once forbidden to read, a school is the biggest news there is. You missed the story of the year — and the freedpeople noticed which stories your paper thinks matter.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'A rumor is moving through town: "The Bureau steals the workers\' wages." A man repeats it as fact. Do you print it?',
        choices: [
          { label: 'Ask the Bureau to open its contract ledgers. Compare the rumor to the records. Print what the documents show.',
            verdict: 'right', effects: { truth: 10, sources: 5 },
            feedback: 'Documents beat rumor. The ledgers are a primary source — a record made at the time, by the people involved. When you can check a claim against the paperwork, you check it. (Skills: 7.20D/F)' },
          { label: 'Print "some say the Bureau takes wages" without checking.',
            verdict: 'partial', effects: { standing: 5, truth: -10 },
            feedback: '"Some say" is how a rumor sneaks into print wearing a suit. You did not lie, exactly — but you gave a rumor a ride under your paper\'s name. That still spreads it.' },
          { label: 'Print the rumor as fact — everyone\'s already saying it.',
            verdict: 'wrong', effects: { truth: -15 },
            feedback: 'A rumor printed becomes a "fact" quoted. Papers that do not check become megaphones for whoever shouts first — and the shout here was aimed at the freedpeople\'s only help.' },
        ],
      },
    ],
  },

  // ---- Assignment 3 — The Black Codes (1866) [sensitivity-reviewed] ----
  {
    title: 'The Black Codes', date: '1866 · slavery\'s shadow, in statute form', image: 'event_statute.jpg',
    event: 'The Texas legislature has passed new laws about freedpeople. People are calling them the Black Codes. A politician tells you they are "fair labor laws that help everyone." Your editor drops the statute book on your desk — the statute is the actual written law. Tonight you read it by lamplight and decide what your paper will say the law really does.',
    steps: [
      {
        kind: 'decision',
        prompt: 'You have read the Black Codes yourself. What does your paper report they do?',
        choices: [
          { label: 'Summarize the politician\'s version, but add a line of your own doubts.',
            verdict: 'partial', effects: { truth: 5 },
            feedback: 'A doubt whispered next to a claim shouted — readers hear the shout. Half the truth is a hard way to be half right. The law\'s real words deserved the headline, not a footnote.' },
          { label: 'Print the politician\'s "explainer" as your story.',
            verdict: 'wrong', effects: { truth: -15, standing: 5 },
            feedback: 'He wrote the law; now he wrote your story too. Your paper gained a friend in office and lost its reason to exist. The record now says these laws were "fair" — and they were not.' },
          { label: 'Say it plainly: they force freedpeople into labor contracts, limit where they can travel and work, and block their testimony in court against white Texans.',
            verdict: 'right', effects: { truth: 15, standing: -5 },
            feedback: 'You named it. These laws were written to keep freedpeople as close to slavery as the law would allow — slavery\'s shadow, in statute form. Saying so plainly cost your paper some powerful friends. It bought the record the truth.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'The politician hands you his written "explainer," which says the laws simply "encourage honest work." How do you use it?',
        choices: [
          { label: 'Ask him sharp follow-up questions, but never open the statute yourself.',
            verdict: 'partial', effects: { truth: 5 },
            feedback: 'Good questions, wrong source. He can dodge a question. He cannot dodge his own law\'s words — but only if you read them. You checked the man and skipped the document.' },
          { label: 'Put his words next to the law\'s actual text, side by side, and let readers see both.',
            verdict: 'right', effects: { truth: 10 },
            feedback: 'The statute is the primary source; his explainer is spin. When a summary and the real text disagree, the real text wins — and showing both lets readers see the gap themselves. (Skills: 7.20D/F)' },
          { label: 'Take his word for it. He wrote the law — he would know.',
            verdict: 'wrong', effects: { truth: -10 },
            feedback: 'He would know best AND has the most reason to shade it. The more a source stands to gain, the harder you check. You did the opposite: trusted the person with the most to hide.' },
        ],
      },
    ],
  },

  // ---- Assignment 4 — Night Riders (1868) [sensitivity-reviewed: strictest] ----
  {
    title: 'Night Riders', date: '1868 · terror, and the courage to report it', image: 'event_witness.jpg',
    event: 'Hooded men have been riding at night in the county — leaving threats at the doors of freedpeople who vote, teach, or farm their own land. Fence posts burned. A warning nailed to a church door. A freedman respected in his church agrees to tell you what he has seen, on one condition: his name stays out of the paper. If it is printed, the riders will come for him. Your notebook is open. His trust is in your hands.',
    steps: [
      {
        kind: 'decision',
        prompt: 'A brave witness will talk — if you protect his name. How do you report the night riders?',
        choices: [
          { label: 'Print the story with his name. "Readers trust a named source."',
            verdict: 'partial', effects: { truth: 5, sources: -15 },
            feedback: 'The story ran — and the man who trusted you is now in danger, and no one else will ever talk to you again. Some prices are not yours to spend. A source\'s safety is not a detail; it is the whole trust.' },
          { label: 'Protect his name. Then gather more — other witnesses, the burned posts, the Bureau\'s reports — and print the PATTERN with the evidence.',
            verdict: 'right', effects: { truth: 10, sources: 15, standing: -5 },
            feedback: 'He risked everything to talk. You protected him AND printed the truth — not one man\'s story, but a pattern proven many ways. Courage and care can work together. That is how the terror got dragged into the light safely.' },
          { label: 'Drop the story. It is too dangerous.',
            verdict: 'wrong', effects: { truth: -10, sources: -5 },
            feedback: 'Silence is exactly what the riders are counting on. Terror works best in the dark. There were careful, safe ways to bring it into the light — protect the name, print the pattern — and you had them.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'The sheriff waves you off: "Exaggeration. A few pranks." Now you weigh a threatened witness against an official denial. What runs?',
        choices: [
          { label: 'Weigh what each source has at stake. Corroborate carefully — witnesses, Bureau records, the burned posts — print the evidence, and note the sheriff\'s denial as HIS claim.',
            verdict: 'right', effects: { truth: 10, standing: -5 },
            feedback: 'A badge does not make a claim true, and fear does not make a witness false. You weighed evidence, not titles. That is the skill: judge a source by what it can prove and what it stands to gain. (Skills: 7.20D/F)' },
          { label: 'Print both statements side by side and let readers decide — without weighing the evidence.',
            verdict: 'partial', effects: { standing: 5, truth: -5 },
            feedback: '"Both sides" sounds fair. But one side had proof and one had a shrug — and your story hid the difference. Fairness to sources is not the same as fairness to the facts.' },
          { label: 'Take the sheriff\'s word and kill the story.',
            verdict: 'wrong', effects: { truth: -15, sources: -10 },
            feedback: 'The official denial was the easy exit, and you took it. The record now says "nothing happened." The people it happened to know better — and they know your paper now, too.' },
        ],
      },
    ],
  },

  // ---- Assignment 5 — New Voters (1869–1873) [SCRIPTED STANDING HIT] ----
  {
    title: 'New Voters', date: '1869–1873 · history in session', image: 'event_capitol.jpg',
    eventEffects: { standing: -12 },
    event: 'Your night-riders reporting had a price: angry letters, and two advertisers who pulled out. That is the cost of truth in 1868 Texas, and you are paying it — just as the real editors who did this work paid it. But the story rolls on. Under the new state constitution, Black men in Texas vote for the first time and win office. In the capitol, Senators Matt Gaines and George T. Ruby — two of the first Black state senators in Texas history — are at work on schools, railroads, and laws to protect voters.',
    steps: [
      {
        kind: 'decision',
        prompt: 'Black Texans are voting and holding office for the first time. How do you cover it?',
        choices: [
          { label: 'Report the election results, but skip covering the men at work.',
            verdict: 'partial', effects: { truth: 5 },
            feedback: 'You recorded THAT it happened, not WHAT it meant. Numbers without faces are easy to forget — and easy to dismiss. The senators\' work was the proof of change, and you left it out.' },
          { label: 'Skip it for a cotton-prices story.',
            verdict: 'wrong', effects: { truth: -10 },
            feedback: 'Cotton prices repeat every year. The first Black senators in Texas history happen once. You covered the wrong first — and told your readers which one your paper thought mattered.' },
          { label: 'Go to the capitol. Report what Gaines and Ruby actually say and do — the bills, the speeches, the votes.',
            verdict: 'right', effects: { truth: 10, sources: 5, standing: 5 },
            feedback: 'History was in session and you were in the room. Gaines fought for public schools; Ruby built political power on the Galveston docks. The record has their words because someone wrote them down — you.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'A rival paper calls the new legislature "ignorant men playing at government." Your editor asks what you make of it.',
        choices: [
          { label: 'Reprint the column with a note that "views differ."',
            verdict: 'partial', effects: { standing: 5, truth: -5 },
            feedback: '"Views differ" is not a check. You handed their megaphone a second stage and called it balance. The loaded words still landed — now in your pages too.' },
          { label: 'Spot the loaded words. Check the claim against the record — bills passed, schools funded, speeches given — and answer it with evidence.',
            verdict: 'right', effects: { truth: 10 },
            feedback: '"Ignorant" and "playing" are loaded words — words picked to make you feel a judgment before you have seen a fact. Loaded words tell you about the writer, not the subject. (Skill: 7.20D — detecting bias)' },
          { label: 'Echo the same words in your own column.',
            verdict: 'wrong', effects: { truth: -15 },
            feedback: 'Their bias just became your bias, in your voice, under your paper\'s name. This is how loaded words travel — one lazy echo at a time — until a slur starts to sound like a fact.' },
        ],
      },
    ],
  },

  // ---- Assignment 6 — The 1876 Constitution (1876) [SCRIPTED STANDING HIT] ----
  {
    title: 'The 1876 Constitution', date: '1876 · Reconstruction rolled back', image: 'event_constitution.jpg',
    eventEffects: { standing: -10 },
    event: 'The soldiers are gone, and the mood has turned. Papers that told hard truths feel the chill. The men who call themselves "Redeemers" — Texans who fought to roll back Reconstruction — have written a new state constitution. It cuts the governor\'s power, shortens terms, and slashes money for schools. Voters approve it. Texas still lives under this constitution today. Your editor wants two things: the news, and — because you have earned it — a farewell column on the whole decade.',
    steps: [
      {
        kind: 'decision',
        prompt: 'A new state constitution has passed. What does your news story say?',
        choices: [
          { label: 'Report what the document actually changes — weaker government, shorter terms, school cuts — and who gains and loses by it.',
            verdict: 'right', effects: { truth: 10 },
            feedback: 'You read it and reported it: a constitution built on distrust of government. Texans still amend it today, hundreds of times over — because you cannot run a modern state on an 1876 document without patching it. (Effects: 7.5C)' },
          { label: 'Report that a new constitution passed, with quotes from its backers.',
            verdict: 'partial', effects: { truth: 5, standing: 5 },
            feedback: 'You printed the event and their spin, but never opened the document yourself. The backers thank you. The record does not — it still cannot tell readers what actually changed.' },
          { label: 'Print the celebration story your publisher wants.',
            verdict: 'wrong', effects: { truth: -10, standing: 10 },
            feedback: 'The publisher is pleased and the story is a press release. Somewhere in the last decade, that stopped being your kind of journalism — did it not? A cheer is not a report.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'Your farewell column. Eleven years — jubilee, schools, statutes, night riders, senators, rollback. What does your column say the decade was?',
        choices: [
          { label: 'Write only the hopeful parts.',
            verdict: 'partial', effects: { truth: 5, standing: 5 },
            feedback: 'Every word true, and the story still false. Leaving out the losses does not protect the gains — it just leaves readers unarmed for what comes next. An honest record needs its hard half.' },
          { label: 'Write that Reconstruction was "a mistake best forgotten" — the Redeemers\' version.',
            verdict: 'wrong', effects: { truth: -15, standing: 5 },
            feedback: 'For almost a century, that version WAS the record in many books. It was wrong then. Your notebook knew better — you watched the schools fill and the senators work. You just chose not to say so.' },
          { label: 'Tell it honestly — gains and losses both. Freedom proclaimed, schools built against the odds, votes cast and offices won, laws and terror that fought all of it, and a constitution that rolled much of it back.',
            verdict: 'right', effects: { truth: 15, sources: 5, standing: -5 },
            feedback: 'Both things are true, and you printed both. The gains were real. The rollback was real. A record that keeps both is the only record worth keeping — and yours will still be telling the truth in a hundred years.' },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Assemble the single class-wide role into a one-variant game. One side, no
// rival — so the Command Center reports ONE class accuracy group (spec §1).
// ---------------------------------------------------------------------------

export const VARIANTS = {
  reporter: {
    name: 'The Galveston Reporter',
    sub: 'A young reporter\'s notebook · Galveston, 1865–1876',
    phases: PHASES,
    waypoints: [], // no map: the newsroom-status panel tells the story instead
  },
};

export { PHASES };

export default createStepGame({
  id: 'reconstruction-reporter',
  title: 'Reconstruction Reporter',
  meters: METERS,
  markers: MARKERS,
  startMeters: () => ({ ...START_METERS }),
  scoreMeters: reporterScore,
  endingFor,
  debrief: DEBRIEF,
  variants: VARIANTS,
  // No failCheck / failEnding: even accurate play ends with Standing low,
  // because the era punished truth-tellers. The meters just fall; there is no
  // early game-over. That is the whole point (spec §3).
});
