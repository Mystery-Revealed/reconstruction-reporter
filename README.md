# Reconstruction Reporter

A solo, class-wide Texas History game for **Unit 5 — Civil War and Reconstruction**.
Everyone in the class plays a **young reporter for a Galveston newspaper**, from **1865 to 1876**.

> Your editor hands you a notebook and the biggest story in Texas: what freedom means,
> who is fighting it, and what this state becomes next. Get the facts. Protect the people
> who trust you with them. Print the truth — even when it costs.

- **TEKS:** 7.5C (political/economic/social effects of the Civil War and Reconstruction), 7.20D/F (bias and source validity — built into every assignment), 7.16B (the free press)
- **Shape:** 6 assignments × 2 graded decisions = **12 graded actions**. Each assignment pairs a **reporting decision** (what to cover) with a **source/bias check** (how to verify it). Three meters — 📰 **Truth**, 🤝 **Sources**, 🏛️ **Standing** — all start at 50.
- **The honest design:** the *right* answers favor truth and source safety even when they cost Standing — teaching journalistic ethics inside history. **Standing takes unavoidable scripted hits** in the late assignments (advertisers pulling out after the night-riders story; the Redeemer chill of 1876) that good play softens but cannot stop. Even accurate play ends with Standing low — because the era punished truth-tellers, and the debrief says so. There is **no early-fail**; the meters just fall.
- **Sensitivity (the strictest in the catalog):** Klan violence is conveyed through *threat, testimony, and pattern* — never depicted. Freedpeople are protagonists with names, courage, and agency (interviewed at Juneteenth, learning at the Bureau school, testifying bravely, voting, and — as Senators **Matt Gaines** and **George T. Ruby** — legislating). The Black Codes and terror are named plainly at a headline level. The debrief bends toward the long record — **Juneteenth's endurance** — without pretending the era ended well.

Built on the shared Texas History game engine (Pattern A): server-authoritative Node + Express + Socket.IO, a React 18 + Vite thin client, one Render web service, and a live **Teacher Command Center** reporting one class-wide accuracy group. All session state lives in server memory — no database. See `D:\Texas History\Common_Build_Standards.md`.

## Run it locally

```bash
npm install          # cascades to server/ and client/ via postinstall (exFAT-safe, no workspaces)
npm run build        # builds the React client into client/dist
npm start            # node server/src/index.js — serves the built client + sockets on :4721
```

Then open:
- **Students:** <http://localhost:4721/>
- **Teacher Command Center:** <http://localhost:4721/#teacher> (create a session, share the 6-digit code)

For client hot-reload during development, run the server (`npm start`) and, in another terminal, `npm run dev:client` (Vite on :5176, proxying sockets to :4721).

```bash
npm test             # server test suite (content bank, balance, lifecycle, sensitivity, scoring)
```

## Deploy (Render) & embed (Wix)

- Render → New Blueprint Instance → connect this repo. `render.yaml` is included: `buildCommand: npm install && npm run build`, `startCommand: node server/src/index.js`. Render sets `PORT`.
- In Wix: **Add → Embed Code → Embed a Site**, paste the Render HTTPS URL (~1000×720). Put the `#teacher` route on a **password-protected** Wix page; the in-app 4-digit PIN is a second layer.

## Layout

```
server/src/games/reconstructionReporter.js   the game: 6 assignments, the answer key (verdicts/effects/feedback), the debrief
server/src/games/_stepGame.js                the shared step-game factory (createStepGame)
server/src/GameManager.js                    sessions, roster, class accuracy, PDF data — engine (unchanged)
client/src/components/student/               Datapad (title/how/join), MatchView, ResultScreen
client/src/components/shared/                NewsroomPanel (the newsroom-status SVG scene), MetersBar
client/src/components/teacher/               CommandCenter (code, approval, roster, PDF, end-session)
client/public/assets/images/                 8 Higgsfield illustrations (title + 6 assignments + ending)
```

*Made for 7th Grade Texas History · TEKS 7.5C, 7.20D/F, 7.16B.*
