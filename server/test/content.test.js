// content.test.js — sanity + historical-balance checks on the Reconstruction
// Reporter content bank (spec §1–§6). One class-wide role (a young Galveston
// reporter), six assignments, choice-based, with NO early-fail: even accurate
// play ends with Standing low, because the era punished truth-tellers and
// Standing takes unavoidable scripted hits in the late assignments.
import test from 'node:test';
import assert from 'node:assert/strict';
import game, { PHASES, reporterScore, endingFor, ENDINGS } from '../src/games/reconstructionReporter.js';

const SIDE = 'reporter';

const allText = () =>
  PHASES.flatMap((p) => [p.event, ...p.steps.flatMap((s) => [s.prompt, ...s.choices.map((c) => `${c.label} ${c.feedback}`)])]).join(' ');

test('one class-wide role is the single side, with no rival', () => {
  assert.deepEqual(game.sides, [SIDE]);
  assert.equal(game.hasOpponent, false, 'everyone plays the reporter — a single class-wide accuracy group');
  assert.equal(game.totalActions, 12);
  assert.equal(game.chapterCount, 6);
  assert.ok(game.meta.variants[SIDE], 'The Galveston Reporter ships as the one variant');
  assert.deepEqual(game.meta.variants[SIDE].waypoints, [], 'no map: the newsroom-status panel replaces it');
});

test('six assignments, each with an event and two graded decisions (right/partial/wrong)', () => {
  assert.equal(PHASES.length, 6, 'assignment count');
  for (const [i, ph] of PHASES.entries()) {
    assert.ok(ph.title && ph.date && ph.event && ph.image, `assignment ${i} metadata`);
    assert.equal(ph.steps.length, 2, `assignment ${i} has 2 steps`);
    for (const [j, step] of ph.steps.entries()) {
      assert.equal(step.kind, 'decision', `assignment ${i} step ${j} is a decision (no map)`);
      assert.ok(step.prompt?.length > 5, `assignment ${i} step ${j} prompt`);
      const verdicts = step.choices.map((c) => c.verdict).sort();
      assert.deepEqual(verdicts, ['partial', 'right', 'wrong'], `assignment ${i} step ${j} verdicts`);
      for (const c of step.choices) {
        assert.ok(c.label?.length > 5 && c.feedback?.length > 10, `assignment ${i} step ${j} choice text`);
      }
    }
  }
  const steps = PHASES.flatMap((p) => p.steps);
  assert.equal(steps.length, 12, '12 graded actions');
});

test('meters start at 50/50/50 — truth, sources, standing', () => {
  const state = game.initMatch({ soloSide: SIDE });
  assert.deepEqual(state.sides[SIDE].meters, { truth: 50, sources: 50, standing: 50 });
});

test('every assignment pairs a reporting decision with a source/bias check (spec §1)', () => {
  // The design contract: 6 assignments × 2 decisions, and the source-check skill
  // (7.20D/F) is named across the source-check beats — corroboration, primary
  // sources, and loaded words all appear in the feedback.
  const text = allText();
  assert.match(text, /corroborat/i, 'the corroboration skill is named');
  assert.match(text, /primary source/i, 'primary sources are named as a skill');
  assert.match(text, /loaded words?/i, 'loaded/bias vocabulary is named (7.20D)');
  assert.match(text, /7\.20D/i, 'the source-validity TEKS is cited in feedback');
});

test('the content teaches the spec’s content bank (TEKS 7.5C, 7.20D/F, 7.16B)', () => {
  const text = allText();
  assert.match(text, /Granger/i, 'General Granger reads the order at Galveston');
  assert.match(text, /Galveston/i, 'Galveston is the setting');
  assert.match(text, /250,000/i, 'about 250,000 enslaved Texans freed');
  assert.match(text, /Freedmen'?s Bureau/i, "the Freedmen's Bureau");
  assert.match(text, /school/i, 'the freedpeople’s school and Black literacy');
  assert.match(text, /Black Codes/i, 'the Black Codes named plainly');
  assert.match(text, /night riders|hooded|Klan|terror/i, 'organized night-rider terror (headline level)');
  assert.match(text, /Matt Gaines/i, 'Senator Matt Gaines named');
  assert.match(text, /George T\. Ruby|Ruby/i, 'Senator George T. Ruby named');
  assert.match(text, /vote|voting|voters/i, 'Black Texans voting and holding office');
  assert.match(text, /1876|constitution/i, 'the 1876 Constitution');
  assert.match(text, /Redeemers/i, 'the Redeemers who rolled Reconstruction back');
  const debrief = game.report(game.initMatch({ soloSide: SIDE })).perSide[SIDE].debrief;
  assert.match(debrief, /Juneteenth/i, 'debrief names Juneteenth');
  assert.match(debrief, /national holiday/i, 'debrief carries Juneteenth to the 2021 national holiday');
  assert.match(debrief, /Unit 7|civil-rights|civil rights/i, 'debrief bridges to the civil-rights movement');
});

test('sensitivity: freedpeople are protagonists, harm is named plainly, terror is never depicted (spec §6, strictest)', () => {
  const text = allText();
  assert.match(text, /enslaved|freedpeople|freedman/i, 'freedpeople are named, not hidden');
  // The Black Codes (assignment 3, decision 1): the right choice names the harm plainly.
  const codesStep = PHASES[2].steps[0];
  const codesRight = codesStep.choices.find((c) => c.verdict === 'right');
  assert.match(codesRight.label + ' ' + codesRight.feedback, /forced|labor contracts|testimony|slavery'?s shadow/i,
    'the Black Codes are named for what they do, plainly');
  // The night riders (assignment 4): the right choice protects the source AND prints the pattern.
  const witnessStep = PHASES[3].steps[0];
  const witnessRight = witnessStep.choices.find((c) => c.verdict === 'right');
  assert.match(witnessRight.label, /protect/i, 'the right call protects the source’s name');
  assert.match(witnessRight.label + ' ' + witnessRight.feedback, /pattern/i, 'and prints the pattern with evidence');
  // Violence is conveyed by threat/testimony/pattern only — no graphic depiction.
  assert.doesNotMatch(text, /\b(lynch\w*|hang\w*|blood\w*|beaten|murder\w*|corpse\w*|gore)\b/i, 'no graphic violence anywhere');
  // No slurs.
  assert.doesNotMatch(text, /savage|primitive|heathen/i, 'no slurs');
});

test('the ethics contract: protecting a source is right; burning one is not', () => {
  const witnessStep = PHASES[3].steps[0];
  const protect = witnessStep.choices.find((c) => /protect his name/i.test(c.label));
  assert.ok(protect, 'an option to protect the source exists');
  assert.equal(protect.verdict, 'right', 'protecting the frightened witness is the right call');
  const nameHim = witnessStep.choices.find((c) => /with his name/i.test(c.label));
  assert.equal(nameHim.verdict, 'partial', 'printing his name is a costly half-measure, not the worst — but it burns Sources');
  assert.ok((nameHim.effects?.sources ?? 0) < 0, 'naming the source costs Sources heavily');
});

test('the design is honest: NO early-fail, and Standing takes scripted hits late (spec §3)', () => {
  const state = game.initMatch({ soloSide: SIDE });
  const rep = game.report(state);
  assert.equal(rep.perSide[SIDE].failed, false, 'there is no early game-over');
  // The late assignments carry scripted Standing tolls that good play cannot stop.
  const scripted = PHASES.map((p) => p.eventEffects?.standing ?? 0);
  const totalScriptedStanding = scripted.reduce((a, b) => a + b, 0);
  assert.ok(totalScriptedStanding <= -20, `scripted Standing hits total ${totalScriptedStanding} (the era punishing truth-tellers)`);
  assert.ok((PHASES[4].eventEffects?.standing ?? 0) < 0, 'the night-riders backlash (assignment 5) drops Standing');
  assert.ok((PHASES[5].eventEffects?.standing ?? 0) < 0, 'the Redeemer chill (assignment 6) drops Standing');
});

// --- Playthrough helpers (drive the adapter directly, no GameManager) --------

function playRun(pick) {
  const state = game.initMatch({ soloSide: SIDE });
  for (let step = 0; step < game.totalActions; step++) {
    game.chapterEvent(state, SIDE);            // idempotent per chapter; safe each step
    const res = game.resolve(state, SIDE, pick(state));
    assert.ok(!res.error, `step ${step} failed: ${res.error}`);
  }
  return game.report(state);
}

const rightMove = (state) => game.aiMove(state, SIDE);

const moveWithVerdict = (verdict) => (state) => {
  const ss = state.sides[SIDE];
  const steps = PHASES.flatMap((p) => p.steps);
  const step = steps[ss.cursor];
  const realIdx = step.choices.findIndex((c) => c.verdict === verdict);
  return { kind: step.kind, choiceIndex: ss.shuffles[ss.cursor].indexOf(realIdx) };
};

const wrongMove = moveWithVerdict('wrong');
const partialMove = moveWithVerdict('partial');

test('all-right run: 100% accuracy and "The Record Stands"', () => {
  const you = playRun(rightMove).perSide[SIDE];
  assert.equal(you.accuracy, 100);
  assert.equal(you.failed, false);
  assert.equal(you.ending.key, 'top');
  assert.equal(you.ending.title, ENDINGS.top.title);
  // Even a perfect run watches Standing fall — telling the truth cost real editors real friends.
  assert.ok(you.meters.standing < 50, `Standing eroded to ${you.meters.standing}, below its start — the price of the work`);
});

test('all-wrong run: 0% accuracy, the story got away, but the run still finishes (no early-fail)', () => {
  const you = playRun(wrongMove).perSide[SIDE];
  assert.equal(you.accuracy, 0, 'every wrong answer scores 0 across the full 12-action denominator');
  assert.equal(you.failed, false, 'the game never ends early — the meters just fall');
  assert.equal(you.ending.key, 'low');
  assert.equal(you.ending.title, ENDINGS.low.title);
});

test('all-partial run: 50% accuracy and Ink and Nerve', () => {
  const you = playRun(partialMove).perSide[SIDE];
  assert.equal(you.accuracy, 50, '12 halves = 50%');
  assert.equal(you.ending.key, 'mid');
  assert.equal(you.ending.title, ENDINGS.mid.title);
});

test('currentPrompt never leaks the answer key', () => {
  const state = game.initMatch({ soloSide: SIDE });
  game.chapterEvent(state, SIDE);
  const prompt = game.currentPrompt(state, SIDE);
  assert.equal(prompt.choices.length, 3);
  for (const c of prompt.choices) {
    if (typeof c === 'object') {
      assert.ok(!('verdict' in c) && !('feedback' in c) && !('effects' in c), 'no answer key on a choice');
    }
  }
});

test('story-score tiers: The Record Stands ≥ 195, Ink and Nerve 115–194, The Story Got Away < 115', () => {
  assert.equal(endingFor(300).key, 'top');
  assert.equal(endingFor(195).key, 'top');
  assert.equal(endingFor(194).key, 'mid');
  assert.equal(endingFor(115).key, 'mid');
  assert.equal(endingFor(114).key, 'low');
  assert.equal(reporterScore({ truth: 50, sources: 50, standing: 50 }), 150);
});
