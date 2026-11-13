# Signal Run

Read `docs/Signal_Run_Series_Blueprint_for_Claude_Code.md` before changing anything.
Current build state and known gaps are in `docs/implementation-status.md`.

- The simulation (`src/simulation`) is pure and deterministic. Presentation and
  the render loop display state and emit actions; they never decide story,
  outcomes or persistence.
- Episode facts (evidence IDs, route values, dialogue) live in
  `src/content/episodes/`. Do not hard-code them in components.
- All scenario numbers are invented teaching values. Never label them benchmarks.
- Synthetic data only. No customer data, real site layouts or real people.
- Keep the 2D path complete: every required clue has a DOM control, and the
  episode must finish with WebGL unavailable.
- No countdowns or speed scoring. Cutscenes may auto-advance but are pausable
  and skippable, and skipping fires the same completion action once.
- Three.js is loaded lazily and owned by one `SceneController`. Dispose
  everything on exit.
- Product decisions on record: no claims ledger, no Blender pipeline (procedural
  geometry), generated cinematic media comes after Episode 1 passes review.

Commands: `npm run typecheck`, `npm run test`, `npm run build`,
`npm run test:e2e` (needs a build first), `npm run preview`.
