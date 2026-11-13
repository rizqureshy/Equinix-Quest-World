# Signal Run

A playable series that teaches AI infrastructure through an incident story.
This repository contains Episode 1, **Ghost Feed**: a 12 to 15 minute
single-player episode with a deterministic incident simulation, a complete 2D
path and a 3D reconstruction in Three.js on WebGL2.

The specification is `docs/Signal_Run_Series_Blueprint_for_Claude_Code.md`.
Build state, verification results and known gaps are in
`docs/implementation-status.md`.

## Run it

Requires Node 22.

```bash
npm ci
```

```bash
npm run build
```

```bash
npm run preview
```

Then open http://localhost:4173. For development with hot reload use `npm run dev`.

## Check it

```bash
npm run typecheck
```

```bash
npm run test
```

```bash
npm run test:e2e
```

`test:e2e` runs against the production build, so run `npm run build` first.

## Layout

| Path | Contents |
|---|---|
| `src/content` | Episode definition: evidence, routes, dialogue, copy. Typed data, validated in tests. |
| `src/simulation` | Pure state, transitions, recovery evaluation and debrief. No DOM, no clock. |
| `src/scenes` | Three.js scene controller and the two procedural scenes. Loaded lazily. |
| `src/presentation` | Screens, cutscene player, 2D schematic, placeholder plates. |
| `src/platform` | Local save store and settings. |
| `src/app` | Routes, episode shell, landing page. |
| `tests/unit`, `tests/e2e` | Vitest and Playwright suites. |

Routes: `/`, `/episodes/ghost-feed`, `/episodes/ghost-feed/debrief`. Set
`BASE_PATH` at build time to host under a sub-path. The host must serve
`index.html` for unknown paths.

Everything is fictional. Scenario numbers are invented teaching values, not
benchmarks. No data leaves the browser.
