// games/index.js — registry of playable games. GameManager looks games up here,
// keeping the engine reusable across Texas History units.

import reconstructionReporter from './reconstructionReporter.js';

export const GAMES = {
  [reconstructionReporter.id]: reconstructionReporter,
};

export function getGame(id) {
  return GAMES[id] || null;
}
