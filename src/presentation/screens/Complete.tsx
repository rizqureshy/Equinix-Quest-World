import { useState } from 'react';
import { Link } from '../../app/router';
import { Cutscene } from '../Cutscene';
import { EvidenceCard } from '../parts';
import type { ScreenProps } from './types';

export function Complete({ state, episode, dispatch, announce }: ScreenProps) {
  const [outroDone, setOutroDone] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  if (!outroDone) {
    return <Cutscene title="Close" lines={episode.beats.GF10!.lines} onComplete={() => setOutroDone(true)} continueLabel="Finish" />;
  }

  const notes = episode.evidence.filter((e) => state.viewedEvidence.includes(e.id));
  return (
    <section className="stack narrow">
      <p className="status status-cyan" role="status">
        Ghost Feed complete. The crew is safe, routing is restored, and one marker is unexplained.
      </p>
      <EvidenceCard evidence={episode.evidence.find((e) => e.id === 'E06_MARKER')!} cited={false} tone="amber" />
      <div className="row">
        <button
          className="btn btn-primary"
          onClick={() => {
            dispatch({ type: 'replayCheckpoint' });
            announce(episode.copy.replay!);
          }}
        >
          Replay recovery
        </button>
        <button className="btn" aria-expanded={showNotes} onClick={() => setShowNotes((s) => !s)}>Review evidence</button>
        <Link className="btn" to="/episodes/ghost-feed/debrief">Open debrief</Link>
        <Link className="btn" to="/">Back to series</Link>
      </div>
      {showNotes && (
        <ul className="field-notes">
          {notes.map((e) => (
            <li key={e.id} className="card">
              <span className="eyebrow">{e.id}</span>
              <h4>{e.title}</h4>
              <p>{e.fieldNote}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="muted">Next: Episode 2, Heat Limit. Coming in a later build.</p>
    </section>
  );
}
