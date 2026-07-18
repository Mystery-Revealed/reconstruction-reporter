// ResultScreen.jsx — the end of the eleven years. Two stories, in order: (1)
// how the record fared (Story Score + ending tier), (2) the score that matters
// to your teacher — accuracy — then the debrief: the honest timeline, the Black
// Codes and night riders named plainly, and how Juneteenth's endurance closes
// the arc.

import { Art } from '../../services/assets.jsx';

const TIER_CLASS = { top: 'win', mid: 'mid', low: 'low' };

export default function ResultScreen({ state, onPlayAgain }) {
  const end = state.matchEnd;
  const meta = end.meta || state.match?.begin?.meta;
  const you = end.you;
  const ending = you.ending;
  const score = you.score ?? 0;

  return (
    <div className="card result-screen">
      <div className="event-kicker">Galveston, Texas · 1865–1876</div>
      <h1 className={`result-headline ${TIER_CLASS[ending.key] || 'mid'}`}>{ending.title}</h1>

      <Art name="ending.jpg" alt="A reporter's closed notebook and printing press in a quiet 1870s newspaper office at dusk" className="result-art" />

      <p className="fall-note">
        This game measured how well you protected your <b>sources</b> and printed the
        <b> truth</b> — even when it cost your paper's Standing. Standing falling was
        the true history: the era punished truth-tellers, and no reporter could avoid
        that cost forever. But printing the truth was never wasted — it is the record
        historians still lean on today.
      </p>

      <div className="ending-block mission">
        <p>{ending.text}</p>
      </div>

      <div className="score-block" aria-label="Story Score">
        <div className="score-head">
          <span className="score-title">📰 Story Score</span>
          <span className="score-num">{score}<span className="muted"> / 300</span></span>
        </div>
        <span className="score-bar-track">
          <span className={`score-bar ${TIER_CLASS[ending.key] || 'mid'}`} style={{ width: `${Math.min(100, (score / 300) * 100)}%` }} />
        </span>
        <div className="meter-final-row">
          {Object.entries(you.meters || {}).map(([k, v]) => (
            <span key={k} className="meter-final">{meta?.meters?.[k]?.name || k}: <b>{v}</b></span>
          ))}
        </div>
      </div>

      <div className="accuracy-block">
        <div className="accuracy-number">{you.accuracy}%</div>
        <div>
          <b>Your accuracy — the score your teacher sees.</b>
          <p>
            How well your calls matched good reporting — going to the source,
            corroborating claims, protecting sources, and spotting loaded words.
          </p>
        </div>
      </div>

      <div className="debrief">
        <h3>What the record shows today</h3>
        <p>{you.debrief}</p>
      </div>

      <div className="btn-col">
        <button className="btn big" onClick={onPlayAgain}>Report the eleven years again</button>
        <p className="replay-nudge muted">Try new choices — can you protect the truth even better?</p>
      </div>
    </div>
  );
}
