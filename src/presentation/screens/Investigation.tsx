import { useMemo, useState } from 'react';
import type { EvidenceId } from '../../content/schema';
import type { PickId, UnderpassView } from '../../scenes/views';
import { canInspect } from '../../simulation/transition';
import { DialogueLog } from '../Cutscene';
import { EvidenceCard, MissionNote } from '../parts';
import { SceneView } from '../SceneView';
import type { ScreenProps } from './types';

export function Investigation({ state, episode, dispatch, announce }: ScreenProps) {
  const [cameraOpen, setCameraOpen] = useState(state.viewedFrames.length > 0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [focus, setFocus] = useState<{ id: string | null; nonce: number }>({ id: null, nonce: 0 });

  const viewed = (id: EvidenceId) => state.viewedEvidence.includes(id);
  const evidence = (id: EvidenceId) => episode.evidence.find((e) => e.id === id)!;
  const focusOn = (id: string | null) => setFocus((f) => ({ id, nonce: f.nonce + 1 }));

  const openCamera = () => {
    setCameraOpen(true);
    dispatch({ type: 'inspectFrame', index: frameIndex });
    focusOn('camera');
  };
  const showFrame = (index: number) => {
    const clamped = Math.max(0, Math.min(episode.frames.length - 1, index));
    setFrameIndex(clamped);
    dispatch({ type: 'inspectFrame', index: clamped });
  };
  const open = (id: EvidenceId, target?: string) => {
    if (dispatch({ type: 'inspectEvidence', id }).accepted && target) focusOn(target);
  };
  const onPick = (id: PickId) => {
    if (id === 'camera') cameraOpen ? focusOn('camera') : openCamera();
    if (id === 'gauge') open('E03_GAUGE', 'gauge');
    if (id === 'field') open('E02_FIELD', 'field');
  };

  const view = useMemo<UnderpassView>(
    () => ({
      kind: 'underpass',
      cameraOpen,
      frameIndex,
      playing,
      feedStale: state.flaggedStaleFeed,
      gaugeViewed: state.viewedEvidence.includes('E03_GAUGE'),
      gaugeVerified: state.verifiedSource,
      fieldViewed: state.viewedEvidence.includes('E02_FIELD'),
    }),
    [cameraOpen, frameIndex, playing, state.flaggedStaleFeed, state.viewedEvidence, state.verifiedSource],
  );

  const frame = episode.frames[frameIndex]!;
  const viewedFrames = [...state.viewedFrames].sort();
  const recordReady = canInspect(state, 'E01_CAMERA');
  const bothSources = viewed('E02_FIELD') && viewed('E03_GAUGE');
  const done = state.flaggedStaleFeed && state.verifiedSource;
  const cite = (id: EvidenceId) => ({
    cited: state.citedEvidence.includes(id),
    onToggleCite: () => dispatch({ type: 'toggleCite', id }),
  });

  return (
    <div className="split">
      <div className="split-scene">
        <SceneView view={view} onPick={onPick} focus={focus} />
        <div className="row scene-tools">
          <button className="btn" onClick={() => focusOn('camera')}>Focus camera</button>
          <button className="btn" onClick={() => focusOn('gauge')}>Focus gauge 14</button>
          <button className="btn" onClick={() => focusOn(null)}>Whole district</button>
        </div>
      </div>

      <div className="split-panel">
        <DialogueLog lines={[{ speaker: 'Imani', text: 'This is the feed dispatch received. Look at it in order.' }]} />

        <section className="panel" aria-labelledby="feed-heading">
          <h3 id="feed-heading">1. Underpass camera feed</h3>
          {!cameraOpen ? (
            <button className="btn btn-primary" onClick={openCamera}>Open the underpass camera</button>
          ) : (
            <>
              <label className="scrub">
                <span>Arrival {frameIndex + 1} of {episode.frames.length}</span>
                <input
                  type="range"
                  min={0}
                  max={episode.frames.length - 1}
                  step={1}
                  value={frameIndex}
                  onChange={(e) => showFrame(Number(e.target.value))}
                  aria-valuetext={`Arrival ${frameIndex + 1}, received ${frame.arrivalTime}`}
                />
              </label>
              <div className="row">
                <button className="btn" onClick={() => showFrame(frameIndex - 1)} disabled={frameIndex === 0}>Previous frame</button>
                <button className="btn" onClick={() => showFrame(frameIndex + 1)} disabled={frameIndex === episode.frames.length - 1}>Next frame</button>
                <button className="btn" aria-pressed={playing} onClick={() => setPlaying((p) => !p)}>
                  {playing ? 'Pause footage' : 'Play footage'}
                </button>
              </div>
              <article className="card frame" data-frame={frame.id}>
                <span className="eyebrow">{frame.source}</span>
                <p>{frame.description}</p>
                <dl className="facts">
                  <div><dt>Arrival time</dt><dd>{frame.arrivalTime}</dd></div>
                  <div><dt>Capture time</dt><dd>{frame.captureTime}</dd></div>
                </dl>
              </article>

              {viewedFrames.length > 1 && (
                <table className="compare">
                  <caption>Frames you have compared</caption>
                  <thead><tr><th scope="col">Frame</th><th scope="col">Arrival time</th><th scope="col">Capture time</th><th scope="col">What it shows</th></tr></thead>
                  <tbody>
                    {viewedFrames.map((i) => (
                      <tr key={i}><th scope="row">{i + 1}</th><td>{episode.frames[i]!.arrivalTime}</td><td>{episode.frames[i]!.captureTime}</td><td>Same truck, same spray, same lamp flicker</td></tr>
                    ))}
                  </tbody>
                </table>
              )}

              {!viewed('E01_CAMERA') && (
                <div className="row">
                  <button className="btn btn-primary" onClick={() => open('E01_CAMERA')} disabled={!recordReady} aria-describedby="record-help">
                    Open capture record
                  </button>
                  <span id="record-help" className="muted">
                    {recordReady ? 'Compare what the camera captured with when it arrived.' : 'Look at two frames first.'}
                  </span>
                </div>
              )}
              {viewed('E01_CAMERA') && (
                <EvidenceCard evidence={evidence('E01_CAMERA')} tone="amber" {...cite('E01_CAMERA')}>
                  {!state.flaggedStaleFeed && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        dispatch({ type: 'flagStaleFeed' });
                        announce(episode.copy.afterCamera!);
                      }}
                    >
                      Flag the camera feed as stale
                    </button>
                  )}
                </EvidenceCard>
              )}
              {state.flaggedStaleFeed && (
                <>
                  <p className="status status-amber">{episode.copy.afterCamera}</p>
                  <MissionNote {...episode.missionNotes.freshness!} />
                </>
              )}
            </>
          )}
        </section>

        <section className="panel" aria-labelledby="sources-heading">
          <h3 id="sources-heading">2. Other sources</h3>
          <div className="row">
            {(['E02_FIELD', 'E03_GAUGE', 'E04_MODEL'] as const).map((id) =>
              viewed(id) ? null : (
                <button key={id} className="btn" onClick={() => open(id, id === 'E03_GAUGE' ? 'gauge' : id === 'E02_FIELD' ? 'field' : undefined)}>
                  Open {evidence(id).title.toLowerCase()}
                </button>
              ),
            )}
          </div>
          {viewed('E02_FIELD') && <EvidenceCard evidence={evidence('E02_FIELD')} {...cite('E02_FIELD')} />}
          {viewed('E03_GAUGE') && <EvidenceCard evidence={evidence('E03_GAUGE')} {...cite('E03_GAUGE')} />}
          {bothSources && !state.verifiedSource && (
            <div className="card">
              <p>
                Two sources, two owners, two lines. The worker saw water at 02:13:15. Gauge 14 measured 0.76 m at
                02:13:34.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  dispatch({ type: 'verifySource' });
                  announce(episode.copy.afterVerify!);
                }}
              >
                They agree: mark gauge 14 as verified
              </button>
            </div>
          )}
          {state.verifiedSource && <p className="status status-cyan">{episode.copy.afterVerify}</p>}
          {viewed('E04_MODEL') && (
            <>
              <EvidenceCard evidence={evidence('E04_MODEL')} tone="amber" {...cite('E04_MODEL')} />
              <MissionNote {...episode.missionNotes.inference!} />
            </>
          )}
        </section>

        <section className="panel" aria-labelledby="hint-heading">
          <h3 id="hint-heading">Stuck?</h3>
          {state.hintsUsed > 0 && (
            <DialogueLog lines={episode.hints.slice(0, state.hintsUsed).map((text) => ({ speaker: 'Imani', text }))} />
          )}
          <button className="btn" onClick={() => dispatch({ type: 'requestHint' })} disabled={state.hintsUsed >= episode.hints.length}>
            {state.hintsUsed >= episode.hints.length ? 'No more hints' : 'Ask Imani for a hint'}
          </button>
        </section>

        {done && (
          <button className="btn btn-primary btn-wide" onClick={() => dispatch({ type: 'proceedToFieldExit' })}>
            Brief Mara at the turnout
          </button>
        )}
      </div>
    </div>
  );
}
