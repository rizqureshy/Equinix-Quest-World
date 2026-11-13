# Implementation status

Last updated: 2026-11-13. Covers M0, M1 and the first WebGL2 slice of M2 for
Episode 1, Ghost Feed.

## What is playable

The whole episode, end to end, in 3D or 2D:

1. Cold open with three choices (hold, continue with a near miss, ask for another observation).
2. Investigation: three repeated captures, capture record, stale-feed flag, field report, gauge 14, inference record, three escalating hints.
3. Field exit: crew check, then surface route authorization.
4. Recovery: runbook, two input sources, three paths, three independent gates (source, policy, response time), test log, replay.
5. Briefing: evidence pins, written reflection, position, discovery question, self-assessment, deterministic debrief, transfer case.
6. Close: marker clue, field notes review, replay, stable debrief link.

## Verification results

Run on 2026-11-13 in a Linux container, Node 22, headless Chromium with software GL.

| Check | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run test` | 43 of 43 unit tests pass |
| `npm run build` | Pass. Shell 119 kB gzip, 3D chunk 153 kB gzip, loaded only when a 3D scene opens |
| `npm run test:e2e` | 12 of 12 browser journeys pass |

Browser journeys cover:

- Full completion using keyboard activation only.
- The near-miss opening, then R02 blocked, R01 late, R03 with the quarantined relay refused, R03 with the gauge restored.
- Two replays with different routes and no leaked choices.
- Reload from investigation, recovery and briefing.
- Corrupt save offers a clean restart.
- Cold open reaches the first decision in about 30 seconds with no input.
- 360 px width with reduced motion and no horizontal overflow.
- WebGL unavailable: full completion in 2D.
- 2D-only setting gives the same route results.
- WebGL on: canvas renders, scrub and inspect work, exactly one render loop through five replays, zero loops after leaving the scene.
- Clicking the camera in the 3D scene opens the feed.

## Decisions that differ from the blueprint

Agreed with the product owner on 2026-11-13:

- No claims list or claims check. Product statements have not been through product or brand review.
- No Blender or GLB pipeline. All geometry is procedural Three.js.
- Generated cinematic media (Higgsfield and similar) waits until Episode 1 passes review.

Made during the build:

- **Briefing.** Elena's follow-up needs to know what the player said, and keyword matching is ruled out. The player picks the authored statement closest to their answer. Free text is kept for reflection and is never scored, saved or sent anywhere.
- **Routing.** A 60-line History API router instead of a routing library.
- **State model.** Section 7's `EpisodeState` gained `openingChoice`, `viewedFrames`, `crewConfirmed`, `replays`, `hintsUsed`, `briefing`, and per-attempt `requestSent` and `reasonCodes`.
- **Replay.** Restores the recovery checkpoint. Investigation findings and the attempt log are kept. Route, source, result and briefing are cleared.
- **Timer.** The render loop uses `THREE.Timer` for elapsed time.
- **No worker folder, Cloudflare config, post-processing, WebGPU, audio or runtime AI.** All deferred as the blueprint allows.

## Placeholders

| Item | Current state |
|---|---|
| Physical-world scenes (street, turnout, near miss, pursuit, IBX corridor, surface road, marker) | Geometric SVG plates drawn in code |
| World transition | Direct cut with a wireframe plate. No shader dissolve |
| Underpass district, truck, camera, gauge | Procedural boxes and lines |
| IBX racks, partner, cloud model | Procedural shapes |
| Equinix identity | Plain text "Equinix IBX (placeholder)" |
| Voices, score, sound | None. Captions only |
| Character art | None |

## Gaps and remaining work

Not verified:

- Frame rate on a real integrated-GPU laptop. Only software rendering was tested, which checks correctness.
- Memory over long sessions. Loop count is tested; heap and GPU memory were not measured.
- Safari, managed Edge and real phones. Only Chromium was run.
- Screen reader output. Structure, labels, focus moves and a live region are in place but were not tested with a screen reader.
- The 3-second cold-load target on a throttled 10 Mbps link.
- Learning outcomes. No learner has played it yet.

Not built:

- Audio of any kind, so there is no mute control and captions cannot be turned off.
- High-contrast theme.
- Renderer context-loss resume. Loss falls back to 2D with a "Try 3D again" link.
- Automatic quality downgrade on slow frames. Quality is a manual setting.
- IBX corridor fly-through and physical-map route animation. The topology view carries the recovery.
- Old and new model inputs shown inside the 3D scene. They are shown in the panel.
- Touch gestures were not tuned beyond the Three.js defaults.
- Analytics. None, by design.

Cinematic pass (M3), once the episode passes review:

- Painted or generated plates for the nine scenes, with parallax.
- Cast voices, WebVTT captions, score and the three-beat radio tone.
- Windshield-to-camera-plane transition.
- Chase sequence and IBX corridor move.
- Approved Equinix nameplate and a product and brand review of every product statement.
