import { useMemo, useState } from 'react';
import type { NodeId, RouteId } from '../../content/schema';
import type { PickId, TopologyView } from '../../scenes/views';
import { evaluateRecovery, inferRoute } from '../../simulation/evaluate-recovery';
import { DialogueLog } from '../Cutscene';
import { EvidenceCard, GateRow, MissionNote } from '../parts';
import { Plate } from '../Plate';
import { SceneView } from '../SceneView';
import type { ScreenProps } from './types';

export function Recovery({ state, episode, dispatch, announce }: ScreenProps) {
  const [inspected, setInspected] = useState<NodeId | null>(null);
  const [focus, setFocus] = useState<{ id: string | null; nonce: number }>({ id: null, nonce: 0 });
  const focusOn = (id: string | null) => setFocus((f) => ({ id, nonce: f.nonce + 1 }));

  const runbookOpen = state.viewedEvidence.includes('E05_RUNBOOK');
  const restored = state.recoveryStatus === 'restored';
  const last = state.attempts.at(-1) ?? null;
  // The outcome shown is recomputed from the logged attempt: same inputs, same result.
  const evaluation = last ? evaluateRecovery(episode, last.route, last.source, state.verifiedSource) : null;
  const target = episode.scenario.responseTargetMs;

  const inspectNode = (id: NodeId) => {
    setInspected(id);
    focusOn(id);
  };
  const selectRoute = (route: RouteId) => dispatch({ type: 'selectRoute', route });
  const onPick = (id: PickId) => {
    if (id === 'backup' || id === 'partner' || id === 'cloud') inspectNode(id);
    else if (id === 'R01' || id === 'R02' || id === 'R03') selectRoute(id);
  };

  const view = useMemo<TopologyView>(
    () => ({
      kind: 'topology',
      selectedRoute: state.selectedRoute,
      attempt: last && { route: last.route, requestSent: last.requestSent, policyPass: last.policyPass, outcome: last.outcome },
      attemptCount: state.attempts.length,
      restored,
    }),
    [state.selectedRoute, last, state.attempts.length, restored],
  );

  const test = () => {
    const result = dispatch({ type: 'simulateRecovery' });
    if (!result.accepted) return;
    const attempt = result.state.attempts.at(-1)!;
    announce(evaluateRecovery(episode, attempt.route, attempt.source, result.state.verifiedSource).message);
  };

  const ready = runbookOpen && state.selectedSource && state.selectedRoute && !restored;
  const stale = inferRoute(episode, 'quarantinedRelay');
  const fresh = inferRoute(episode, 'verifiedGauge');
  const node = episode.nodes.find((n) => n.id === inspected);

  return (
    <div className="split">
      <div className="split-scene">
        <SceneView view={view} onPick={onPick} focus={focus} />
        <div className="row scene-tools">
          {episode.nodes.map((n) => (
            <button key={n.id} className="btn" aria-pressed={inspected === n.id} onClick={() => inspectNode(n.id)}>
              Inspect {n.name.toLowerCase()}
            </button>
          ))}
          <button className="btn" onClick={() => focusOn(null)}>Whole topology</button>
        </div>
        {node && (
          <article className="card" aria-live="polite">
            <span className="eyebrow">{node.owner}</span>
            <h4>{node.name}</h4>
            <p>{node.description}</p>
          </article>
        )}
        <div className="plate-thumb"><Plate id="ibx" /></div>
      </div>

      <div className="split-panel">
        <DialogueLog lines={episode.beats.GF07!.lines} />
        <p className={`status ${restored ? 'status-cyan' : 'status-amber'}`} role="status" data-testid="dispatch-status">
          {restored ? 'Automatic routing restored.' : `Manual dispatch active. ${episode.copy.manualDispatch}`}
        </p>

        <section className="panel" aria-labelledby="runbook-heading">
          <h3 id="runbook-heading">1. Runbook</h3>
          {runbookOpen ? (
            <EvidenceCard
              evidence={episode.evidence.find((e) => e.id === 'E05_RUNBOOK')!}
              cited={state.citedEvidence.includes('E05_RUNBOOK')}
              onToggleCite={() => dispatch({ type: 'toggleCite', id: 'E05_RUNBOOK' })}
            />
          ) : (
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'inspectEvidence', id: 'E05_RUNBOOK' })}>
              Open the continuity runbook
            </button>
          )}
          {runbookOpen && (
            <ul className="conditions">
              <li>Source: the hazard input must be verified and fresh.</li>
              <li>Policy: the path must be approved for this feed.</li>
              <li>Response time: end-to-end p95 within {target} ms under incident load.</li>
            </ul>
          )}
        </section>

        {runbookOpen && (
          <>
            <fieldset className="panel" disabled={restored}>
              <legend>2. Hazard input for the test</legend>
              {episode.sources.map((s) => (
                <label key={s.id} className="option">
                  <input
                    type="radio"
                    name="source"
                    checked={state.selectedSource === s.id}
                    onChange={() => dispatch({ type: 'selectSource', source: s.id })}
                  />
                  <span>
                    <strong>{s.name}</strong>
                    <small>{s.description}</small>
                  </span>
                </label>
              ))}
            </fieldset>

            <fieldset className="panel" disabled={restored}>
              <legend>3. Path to the partner feed</legend>
              {episode.routes.map((r) => (
                <label key={r.id} className="option">
                  <input type="radio" name="route" checked={state.selectedRoute === r.id} onChange={() => selectRoute(r.id)} />
                  <span>
                    <strong>{r.id}: {r.name}</strong>
                    <small>{r.configuration}</small>
                    <small>Simulated p95 {r.simulatedP95Ms} ms · {r.policyNote}</small>
                  </span>
                </label>
              ))}
              <MissionNote {...episode.missionNotes.p95!} />
            </fieldset>

            {!restored && (
              <div className="row">
                <button className="btn btn-primary" onClick={test} disabled={!ready} aria-describedby="test-help">
                  Test route
                </button>
                <span id="test-help" className="muted">
                  {ready ? 'Runs an offline simulation. Manual dispatch stays on until all three checks pass.' : 'Choose an input and a path first.'}
                </span>
              </div>
            )}
          </>
        )}

        {evaluation && (
          <section className="panel outcome" aria-labelledby="outcome-heading" data-outcome={evaluation.outcome}>
            <h3 id="outcome-heading">
              Last test: {evaluation.route} with {episode.sources.find((s) => s.id === evaluation.source)!.name.toLowerCase()}
            </h3>
            <ul className="gates">
              <GateRow name="Source" gate={evaluation.gates.source} />
              <GateRow name="Policy" gate={evaluation.gates.policy} />
              <GateRow name="Response time" gate={evaluation.gates.latency} />
            </ul>
            <p className="result">{evaluation.message}</p>
            <DialogueLog lines={[{ speaker: 'Imani', text: evaluation.imaniLine }]} />
            <p className="muted">Next: {evaluation.nextAction}</p>
          </section>
        )}

        {restored && (
          <section className="panel" aria-labelledby="inputs-heading">
            <h3 id="inputs-heading">Same model, different input</h3>
            <div className="grid2">
              <article className="card tone-amber">
                <span className="eyebrow">Before · stale input</span>
                <h4>{stale.input}</h4>
                <p>{stale.inputDetail}</p>
                <p className="result">Dispatch: “{stale.recommendation}”</p>
              </article>
              <article className="card tone-cyan">
                <span className="eyebrow">Now · verified input</span>
                <h4>{fresh.input}</h4>
                <p>{fresh.inputDetail}</p>
                <p className="result">Dispatch: “{fresh.recommendation}”</p>
              </article>
            </div>
            <p>The model was not retrained or moved. It ran inference again on a current input.</p>
            <div className="row">
              <button className="btn btn-primary" onClick={() => dispatch({ type: 'proceedToBriefing' })}>Brief Elena</button>
              <button
                className="btn"
                onClick={() => {
                  dispatch({ type: 'replayCheckpoint' });
                  announce(episode.copy.replay!);
                }}
              >
                Replay recovery
              </button>
              <span className="muted">{episode.copy.replay}</span>
            </div>
          </section>
        )}

        {state.attempts.length > 0 && (
          <section className="panel" aria-labelledby="log-heading">
            <h3 id="log-heading">Test log</h3>
            <ol className="attempts">
              {state.attempts.map((a, i) => (
                <li key={i}>
                  {a.route} · {a.source === 'verifiedGauge' ? 'verified gauge' : 'quarantined relay'} ·{' '}
                  {a.outcome === 'restored' ? 'restored' : !a.policyPass ? 'blocked by policy' : !a.sourcePass ? 'source rejected' : 'missed response target'}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
