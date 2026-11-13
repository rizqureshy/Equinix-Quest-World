import { useState } from 'react';
import type { Level } from '../../simulation/state';
import { DialogueLog } from '../Cutscene';
import { DebriefView } from '../DebriefView';
import type { ScreenProps } from './types';

const LEVELS: { id: Level; label: string }[] = [
  { id: 'demonstrated', label: 'I did this' },
  { id: 'partial', label: 'Partly' },
  { id: 'needsEvidence', label: 'Not yet' },
];

export function Briefing({ state, episode, dispatch, announce }: ScreenProps) {
  // Reflection text stays in this component. It is never scored, saved or sent anywhere.
  const [reflection, setReflection] = useState('');
  const { briefing } = state;
  const position = episode.positions.find((p) => p.id === briefing.position);
  const transfer = episode.transfer.options.find((o) => o.id === briefing.transferChoice);
  const pinnable = episode.evidence.filter((e) => state.viewedEvidence.includes(e.id));

  return (
    <section className="stack narrow">
      <DialogueLog lines={[{ speaker: 'Elena', text: episode.briefing.question }]} />

      {!briefing.reviewed && (
        <>
          <fieldset className="panel">
            <legend>Evidence to bring to the call</legend>
            {pinnable.map((e) => (
              <label key={e.id} className="option">
                <input
                  type="checkbox"
                  checked={state.citedEvidence.includes(e.id)}
                  onChange={() => dispatch({ type: 'toggleCite', id: e.id })}
                />
                <span>
                  <strong>{e.title}</strong>
                  <small>{e.summary}</small>
                </span>
              </label>
            ))}
          </fieldset>

          <label className="panel field">
            <span>Your answer to Elena, in your own words (30 to 60 seconds). For your reflection only: it is not scored or saved.</span>
            <textarea rows={5} value={reflection} onChange={(e) => setReflection(e.target.value)} />
          </label>

          <fieldset className="panel">
            <legend>Which statement is closest to what you said? (optional)</legend>
            {episode.positions.map((p) => (
              <label key={p.id} className="option">
                <input
                  type="radio"
                  name="position"
                  checked={briefing.position === p.id}
                  onChange={() => dispatch({ type: 'choosePosition', position: p.id })}
                />
                <span><strong>“{p.statement}”</strong></span>
              </label>
            ))}
          </fieldset>
          {position && <DialogueLog lines={[{ speaker: 'Elena', text: position.followUp }]} />}

          <DialogueLog lines={[{ speaker: 'Elena', text: episode.briefing.secondQuestion }]} />
          <fieldset className="panel">
            <legend>What would you ask the provider to prove? (optional)</legend>
            {episode.discoveryQuestions.map((q) => (
              <label key={q.id} className="option">
                <input
                  type="radio"
                  name="discovery"
                  checked={briefing.discoveryQuestion === q.id}
                  onChange={() => dispatch({ type: 'chooseDiscoveryQuestion', id: q.id })}
                />
                <span><strong>{q.text}</strong></span>
              </label>
            ))}
          </fieldset>

          <fieldset className="panel">
            <legend>Rate your own answer</legend>
            {episode.behaviors.map((b) => (
              <div key={b.id} className="self-row" role="radiogroup" aria-label={b.label}>
                <span>{b.label}</span>
                <span className="row">
                  {LEVELS.map((l) => (
                    <label key={l.id} className="chip">
                      <input
                        type="radio"
                        name={`self-${b.id}`}
                        checked={briefing.selfAssessment[b.id] === l.id}
                        onChange={() => dispatch({ type: 'setSelfAssessment', behavior: b.id, level: l.id })}
                      />
                      {l.label}
                    </label>
                  ))}
                </span>
              </div>
            ))}
          </fieldset>

          <button
            className="btn btn-primary btn-wide"
            onClick={() => {
              dispatch({ type: 'reviewResponse' });
              announce('Debrief ready.');
            }}
          >
            Review my response
          </button>
        </>
      )}

      {briefing.reviewed && (
        <>
          {reflection && (
            <div className="card">
              <span className="eyebrow">What you wrote</span>
              <p>{reflection}</p>
            </div>
          )}
          <DebriefView state={state} episode={episode} />

          <fieldset className="panel">
            <legend>A different customer</legend>
            <p>{episode.transfer.situation}</p>
            <p><strong>{episode.transfer.prompt}</strong></p>
            {episode.transfer.options.map((o) => (
              <label key={o.id} className="option">
                <input
                  type="radio"
                  name="transfer"
                  checked={briefing.transferChoice === o.id}
                  onChange={() => dispatch({ type: 'chooseTransfer', id: o.id })}
                />
                <span><strong>{o.text}</strong></span>
              </label>
            ))}
            {transfer && (
              <div className={`status ${transfer.best ? 'status-cyan' : 'status-amber'}`} role="status">
                <p>{transfer.feedback}</p>
                <p>{episode.transfer.reveal}</p>
              </div>
            )}
          </fieldset>

          <div className="row">
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'completeEpisode' })}>Continue</button>
            <button className="btn" onClick={() => dispatch({ type: 'replayCheckpoint' })}>Replay recovery</button>
          </div>
        </>
      )}
    </section>
  );
}
