// NewsroomPanel.jsx — the light newsroom-status panel that replaces a map
// (spec §1). Two halves, both display-only (the server owns all gameplay
// truth):
//
//   1. THE NEWSROOM — a small SVG scene: a desk with your open notebook and
//      inkwell (always there), a window on the Galveston harbor (always
//      there), and a corkboard that fills in with one pinned assignment card
//      per assignment filed — driven by chapterIndex, not by a meter. The
//      current assignment's card is highlighted; unfiled cards show as faint
//      dashed outlines.
//
//   2. ELEVEN YEARS, ONE NOTEBOOK — the six assignments, 1865–1876, as a
//      simple list with the current assignment highlighted.

const CARD_ICONS = ['✊', '📖', '⚖️', '🕯️', '🏛️', '📜'];

// Fixed assignment list (client display only; titles mirror the adapter).
const CHAPTERS = [
  { n: 1, title: 'The Day of Jubilee', date: 'June 1865' },
  { n: 2, title: 'The School', date: '1866' },
  { n: 3, title: 'The Black Codes', date: '1866' },
  { n: 4, title: 'Night Riders', date: '1868' },
  { n: 5, title: 'New Voters', date: '1869–73' },
  { n: 6, title: 'The 1876 Constitution', date: '1876' },
];

// Corkboard card grid: 3 columns x 2 rows.
const CARD_POS = [0, 1, 2, 3, 4, 5].map((i) => ({
  x: 94 + (i % 3) * 58,
  y: i < 3 ? 20 : 60,
}));

export default function NewsroomPanel({ chapterIndex = 0 }) {
  const cur = Math.max(0, Math.min(CHAPTERS.length - 1, chapterIndex));
  const filed = (i) => i <= cur;
  const filedTitles = CHAPTERS.filter((_, i) => filed(i)).map((c) => c.title).join(', ');

  return (
    <div className="mission-panel">
      <div className="mission-scene-wrap">
        <div className="panel-title">The newsroom</div>
        <svg
          className="mission-scene"
          viewBox="0 0 300 170"
          role="img"
          aria-label={`Your Galveston newsroom. Pinned to the corkboard so far: ${filedTitles}.`}
        >
          {/* wall + floor */}
          <rect x="0" y="0" width="300" height="118" className="nr-wall" rx="10" />
          <rect x="0" y="112" width="300" height="58" className="nr-floor" rx="10" />

          {/* the harbor window — always there */}
          <g aria-hidden="true">
            <rect x="14" y="18" width="60" height="58" rx="3" className="nr-window-frame" />
            <rect x="19" y="23" width="50" height="48" className="nr-window-glass" />
            <path d="M19 62 C 30 56, 40 60, 50 55 C 58 51, 64 56, 69 53 L69 71 L19 71 Z" className="nr-harbor-water" />
            <g className="nr-ship-hull">
              <path d="M28 55 L44 55 L41 61 L31 61 Z" />
            </g>
            <line x1="36" y1="55" x2="36" y2="42" className="nr-ship-mast" />
            <line x1="19" y1="46" x2="69" y2="46" stroke="#5a4530" strokeWidth="2" />
            <line x1="44" y1="23" x2="44" y2="71" stroke="#5a4530" strokeWidth="2" />
          </g>

          {/* the corkboard — six pinned assignment cards, filling in as you file them */}
          <g aria-hidden="true">
            <rect x="88" y="12" width="182" height="90" rx="4" className="nr-board" />
            {CARD_POS.map((p, i) => (
              <g key={i} className={`sc-piece nr-card-group ${filed(i) ? 'built' : 'planned'}`}>
                <rect x={p.x} y={p.y} width="48" height="30" rx="2" className={`nr-card ${i === cur ? 'current' : ''}`} />
                <circle cx={p.x + 24} cy={p.y - 2} r="3" className="nr-pin" />
                <text x={p.x + 24} y={p.y + 20} textAnchor="middle" className="nr-card-icon">{CARD_ICONS[i]}</text>
              </g>
            ))}
          </g>

          {/* the reporter's desk — always there: notebook, pencil, inkwell */}
          <g aria-hidden="true">
            <rect x="20" y="120" width="260" height="40" rx="3" className="nr-desk" />
            <rect x="20" y="156" width="10" height="12" className="nr-desk-leg" />
            <rect x="270" y="156" width="10" height="12" className="nr-desk-leg" />
            <rect x="110" y="126" width="60" height="26" rx="2" className="nr-notebook" transform="rotate(-3 140 139)" />
            <line x1="118" y1="134" x2="162" y2="132" className="nr-notebook-line" transform="rotate(-3 140 139)" />
            <line x1="118" y1="140" x2="162" y2="138" className="nr-notebook-line" transform="rotate(-3 140 139)" />
            <line x1="118" y1="146" x2="150" y2="144" className="nr-notebook-line" transform="rotate(-3 140 139)" />
            <rect x="190" y="132" width="10" height="14" rx="1" className="nr-inkwell" />
          </g>
        </svg>

        <p className="build-hint">Your corkboard fills in as you file each assignment.</p>
      </div>

      <div className="chapter-listing">
        <div className="panel-title">Eleven years, one notebook</div>
        <ol className="chapter-list">
          {CHAPTERS.map((c, i) => {
            const state = i < cur ? 'past' : i === cur ? 'current' : 'future';
            return (
              <li key={c.n} className={`chapter-item ${state}`} aria-current={state === 'current' ? 'step' : undefined}>
                <span className="chapter-dot" aria-hidden="true">{i < cur ? '✓' : c.n}</span>
                <span className="chapter-name">{c.title}</span>
                <span className="chapter-date">{c.date}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
