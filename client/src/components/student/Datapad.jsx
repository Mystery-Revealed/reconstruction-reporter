// Datapad.jsx — the student game. A small state machine over socket pushes:
// title → how to play → join → (approval) → briefing → match (6 assignments)
// → result. Everyone plays the SAME reporter — there is no "pick" and no
// rival, so the class is one accuracy group. The server owns all truth; this
// component only renders what it's told.

import { useEffect, useReducer, useRef, useState } from 'react';
import { getSocket, emitAck, errorText } from '../../services/socket.js';
import { Art } from '../../services/assets.jsx';
import MatchView from './MatchView.jsx';
import ResultScreen from './ResultScreen.jsx';

// The one class-wide side. It matches the server's single variant key.
const SIDE = 'reporter';

const initialState = {
  screen: 'title', // title | how | join | waiting_approval | briefing | match | result | ended
  joinCode: '',
  name: '',
  studentId: null,
  error: '',
  endedMessage: '',
  match: null,
  matchEnd: null,
};

function freshMatch(begin) {
  return {
    begin,
    map: begin.map,
    meters: begin.meters,
    eventCard: null,
    turn: null,
    feedback: null,
  };
}

// Merge live payloads (chapter:event, turn:begin, turn:resolution) into the match.
function mergeLive(match, payload) {
  const next = { ...match };
  if (payload.map) next.map = payload.map;
  if (payload.meters) next.meters = payload.meters;
  return next;
}

function reducer(state, action) {
  switch (action.type) {
    case 'ui':
      return { ...state, ...action.patch };
    case 'joined':
      return {
        ...state,
        studentId: action.studentId,
        error: '',
        matchEnd: null,
        match: null,
        screen: action.approved ? 'briefing' : 'waiting_approval',
      };
    case 'approved':
      return { ...state, screen: state.screen === 'waiting_approval' ? 'briefing' : state.screen };
    case 'match:begin':
      return { ...state, screen: 'match', matchEnd: null, match: freshMatch(action.payload) };
    case 'chapter:event': {
      if (!state.match) return state;
      const match = mergeLive(state.match, action.payload);
      return { ...state, match: { ...match, eventCard: action.payload } };
    }
    case 'turn:begin': {
      if (!state.match) return state;
      const match = mergeLive(state.match, action.payload);
      return { ...state, match: { ...match, turn: action.payload } };
    }
    case 'turn:resolution': {
      if (!state.match) return state;
      const match = mergeLive(state.match, action.payload);
      return { ...state, match: { ...match, feedback: action.payload } };
    }
    case 'match:end': {
      // Hold the result until pending feedback is dismissed (chronological order).
      const showNow = !state.match?.feedback;
      return { ...state, matchEnd: action.payload, screen: showNow ? 'result' : state.screen };
    }
    case 'dismiss-feedback': {
      if (!state.match) return state;
      if (state.matchEnd) return { ...state, screen: 'result', match: { ...state.match, feedback: null } };
      return { ...state, match: { ...state.match, feedback: null } };
    }
    case 'dismiss-event':
      return state.match ? { ...state, match: { ...state.match, eventCard: null } } : state;
    case 'sync': {
      const s = action.sync;
      if (s.screen === 'waiting_approval') return { ...state, screen: 'waiting_approval' };
      if (s.screen === 'lobby') return { ...state, screen: 'briefing' };
      if (s.screen === 'result') return { ...state, screen: 'result', matchEnd: s.matchEnd };
      if (s.screen === 'match') {
        const match = freshMatch(s.matchBegin);
        return {
          ...state,
          screen: 'match',
          matchEnd: null,
          match: { ...match, eventCard: s.chapterEvent, turn: s.turn },
        };
      }
      return state;
    }
    case 'removed':
      return { ...initialState, screen: 'join', joinCode: state.joinCode, name: '', error: 'Your teacher removed you from the session. You can join again.' };
    case 'ended':
      return { ...initialState, screen: 'ended', endedMessage: 'Your teacher ended this session. The story will still be here when you return.' };
    case 'replay':
      // Re-join for another run (a fresh match); the server issues a new record.
      return { ...state, matchEnd: null, match: null, error: '', screen: 'briefing' };
    default:
      return state;
  }
}

export default function Datapad() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const socket = getSocket();
    const on = (event, type) => {
      const fn = (payload) => dispatch({ type, payload });
      socket.on(event, fn);
      return [event, fn];
    };
    const subs = [
      on('match:begin', 'match:begin'),
      on('chapter:event', 'chapter:event'),
      on('turn:begin', 'turn:begin'),
      on('turn:resolution', 'turn:resolution'),
      on('match:end', 'match:end'),
    ];
    const approved = () => dispatch({ type: 'approved' });
    const removed = () => dispatch({ type: 'removed' });
    const ended = () => dispatch({ type: 'ended' });
    socket.on('join:approved', approved);
    socket.on('student:removed', removed);
    socket.on('session:ended', ended);

    // School wifi blip: the socket reconnects → re-attach and re-sync the screen.
    const onReconnect = async () => {
      const s = stateRef.current;
      if (!s.studentId || !s.joinCode) return;
      const res = await emitAck('student:rejoin', { joinCode: s.joinCode, studentId: s.studentId });
      if (res.ok) dispatch({ type: 'sync', sync: res.sync });
    };
    socket.io.on('reconnect', onReconnect);

    return () => {
      for (const [event, fn] of subs) socket.off(event, fn);
      socket.off('join:approved', approved);
      socket.off('student:removed', removed);
      socket.off('session:ended', ended);
      socket.io.off('reconnect', onReconnect);
    };
  }, []);

  // The one join call — mode solo, the single class-wide side. Join and replay.
  async function doJoin(joinCode, name) {
    const res = await emitAck('student:join', {
      joinCode: (joinCode || '').trim(), nickname: (name || '').trim(), mode: 'solo', nation: SIDE,
    });
    if (!res.ok) {
      dispatch({ type: 'ui', patch: { error: errorText(res.error), screen: 'join' } });
      return false;
    }
    dispatch({ type: 'joined', studentId: res.studentId, approved: res.approved });
    return true;
  }

  function playAgain() {
    const s = stateRef.current;
    dispatch({ type: 'replay' });
    doJoin(s.joinCode, s.name);
  }

  const { screen } = state;
  return (
    <div className="app student-app">
      {screen === 'title' && <TitleScreen onStart={() => dispatch({ type: 'ui', patch: { screen: 'join' } })} onHow={() => dispatch({ type: 'ui', patch: { screen: 'how' } })} />}
      {screen === 'how' && <HowToPlay onBack={() => dispatch({ type: 'ui', patch: { screen: 'title' } })} />}
      {screen === 'join' && <JoinForm state={state} dispatch={dispatch} onJoin={doJoin} />}
      {screen === 'waiting_approval' && (
        <WaitCard title="Hold tight!" text="Your teacher is checking names. Your notebook opens in a moment." />
      )}
      {screen === 'briefing' && (
        <WaitCard title="Your editor hands you a notebook." text="The biggest story in Texas is waiting: what freedom means, who is fighting it, and what this state becomes next. Your first assignment is being drawn up. Stand ready." />
      )}
      {screen === 'match' && state.match && <MatchView state={state} dispatch={dispatch} />}
      {screen === 'result' && state.matchEnd && <ResultScreen state={state} onPlayAgain={playAgain} />}
      {screen === 'ended' && (
        <WaitCard title="Session ended" text={state.endedMessage}>
          <button className="btn" onClick={() => dispatch({ type: 'ui', patch: { ...initialState, screen: 'title' } })}>
            Back to the title screen
          </button>
        </WaitCard>
      )}
      <footer className="app-footer">Made for 7th Grade Texas History · TEKS 7.5C, 7.20D/F, 7.16B</footer>
    </div>
  );
}

/* ---------------- small screens ---------------- */

function TitleScreen({ onStart, onHow }) {
  return (
    <div className="card title-screen">
      <Art name="title_hero.jpg" alt="A young reporter with a notebook on a busy 1870s Galveston street, cotton drays and sailing ships in the background" className="hero-art" />
      <h1 className="game-title">Reconstruction Reporter</h1>
      <p className="tagline">Play a Galveston reporter — and print the truth.</p>
      <p className="title-blurb">
        The year is 1865. Your editor hands you a notebook and the biggest story
        in Texas: what freedom means, who is fighting it, and what this state
        becomes next. Get the facts. Protect the people who trust you with them.
        Print the truth — <b>even when it costs</b>.
      </p>
      <div className="btn-col">
        <button className="btn big" onClick={onStart}>Join your class</button>
        <button className="btn secondary" onClick={onHow}>How to play</button>
      </div>
    </div>
  );
}

function HowToPlay({ onBack }) {
  return (
    <div className="card how-screen">
      <h2>How to play</h2>
      <ol className="how-list">
        <li><b>Join with your class code</b> and open your notebook.</li>
        <li><b>Live 6 assignments</b>, from 1865 to 1876. Each assignment you make <b>two calls</b>: a reporting decision, then a source or bias check. Pick 1 of 3 answers each time.</li>
      </ol>
      <div className="how-grid">
        <div className="how-card"><span className="how-icon">🏛️</span><b>Standing is the price of truth</b><p>It is your paper's reputation. In the late years it takes hard hits you cannot fully stop — that is history, not your failure.</p></div>
        <div className="how-card"><span className="how-icon">📰</span><b>Fill the corkboard</b><p>Good choices pin each assignment to your newsroom board — Jubilee, the school, the statute, the witness, the vote, the constitution.</p></div>
      </div>
      <h3>Your three meters</h3>
      <ul className="how-list">
        <li>📰 <b>Truth</b> — how accurate your printed record is.</li>
        <li>🤝 <b>Sources</b> — how much people trust you, especially freedpeople risking much to talk.</li>
        <li>🏛️ <b>Standing</b> — your paper's reputation and your job.</li>
      </ul>
      <div className="note">
        <b>Live the story, and learn the history.</b> Your <b>Story Score</b> is your
        three meters added up. But the score your teacher sees is your <b>accuracy</b>
        — how well your calls match good reporting. Spoiler from history: even a
        perfectly played reporter watches Standing fall, because the era punished
        truth-tellers. Printing the hard truth still counts <i>for</i> you — that
        is the whole point of the job.
      </div>
      <h3>Words to know</h3>
      <ul className="how-list">
        <li><b>Corroborate</b> — check a claim against other proof before you print it.</li>
        <li><b>Primary source</b> — a record made at the time, by the people involved (a law, a ledger, a letter) — stronger than someone's summary of it.</li>
        <li><b>Loaded words</b> — words picked to make you feel a judgment before you have seen a fact.</li>
        <li><b>Freedmen's Bureau</b> — the government office that helped freedpeople with schools, contracts, and hospitals after the Civil War.</li>
        <li><b>Black Codes</b> — 1866 Texas laws that forced freedpeople into labor contracts and limited their rights — slavery's shadow in statute form.</li>
      </ul>
      <button className="btn" onClick={onBack}>Back</button>
    </div>
  );
}

function JoinForm({ state, dispatch, onJoin }) {
  const [busy, setBusy] = useState(false);
  const set = (patch) => dispatch({ type: 'ui', patch });
  const ready = state.joinCode.length === 6 && state.name.trim().length >= 2;

  async function join() {
    if (!ready || busy) return;
    setBusy(true);
    const ok = await onJoin(state.joinCode, state.name);
    if (!ok) setBusy(false);
  }

  return (
    <div className="card join-screen">
      <h2>Join your class</h2>
      <label htmlFor="join-code">Class code</label>
      <input
        id="join-code" inputMode="numeric" autoComplete="off" maxLength={6}
        placeholder="6-digit code" value={state.joinCode}
        onChange={(e) => set({ joinCode: e.target.value.replace(/\D/g, '') })}
      />
      <label htmlFor="join-name">Your first name</label>
      <input
        id="join-name" maxLength={20} placeholder="e.g. Ana R." value={state.name}
        onChange={(e) => set({ name: e.target.value })}
      />
      <p className="muted">Everyone is the same reporter. Print the truth.</p>

      <p className="err" role="alert">{state.error}</p>
      <div className="btn-col">
        <button className="btn big" disabled={!ready || busy} onClick={join}>
          {busy ? 'Opening your notebook…' : 'Open your notebook →'}
        </button>
        <button className="btn ghost" onClick={() => set({ screen: 'title', error: '' })}>Back</button>
      </div>
    </div>
  );
}

function WaitCard({ title, text, children }) {
  return (
    <div className="card wait-card">
      <div className="pulse-dot" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{text}</p>
      {children}
    </div>
  );
}
