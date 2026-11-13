import type { EpisodeDefinition } from '../content/schema';
import { buildDebrief } from '../simulation/debrief';
import type { EpisodeState, Level } from '../simulation/state';

const LEVEL_TEXT: Record<Level, string> = {
  demonstrated: 'Demonstrated',
  partial: 'Partial',
  needsEvidence: 'Needs evidence',
};

export function DebriefView({ state, episode }: { state: EpisodeState; episode: EpisodeDefinition }) {
  const debrief = buildDebrief(state, episode);
  return (
    <section className="stack debrief" aria-labelledby="debrief-heading">
      <h3 id="debrief-heading">Debrief</h3>
      <p className="muted">
        This feedback compares the evidence you pinned, the position you chose and the paths you tested with an
        authored example. Your written answer is not scored.
      </p>

      {debrief.positionStatement && (
        <div className="card">
          <span className="eyebrow">Your position</span>
          <p>“{debrief.positionStatement}”</p>
          <p><strong>Elena:</strong> {debrief.followUp}</p>
        </div>
      )}

      <ul className="behaviors">
        {debrief.behaviors.map((b) => (
          <li key={b.id} className={`behavior level-${b.level}`} data-behavior={b.id} data-level={b.level}>
            <strong>{b.label}</strong>
            <span className="level">{LEVEL_TEXT[b.level]}</span>
            <p>{b.reason}</p>
            {b.selfAssessment && <p className="muted">Your own rating: {LEVEL_TEXT[b.selfAssessment]}</p>}
          </li>
        ))}
      </ul>

      <div className="grid2">
        <div className="card">
          <span className="eyebrow">Evidence you pinned</span>
          {debrief.citedEvidence.length ? (
            <ul>{debrief.citedEvidence.map((e) => <li key={e.id}>{e.id} · {e.title}</li>)}</ul>
          ) : (
            <p>None pinned.</p>
          )}
        </div>
        <div className="card">
          <span className="eyebrow">Paths you tested</span>
          <ol>
            {debrief.attempts.map((a, i) => (
              <li key={i}>{a.route} with {a.source === 'verifiedGauge' ? 'the verified gauge' : 'the quarantined relay'}: {a.outcome}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="card tone-cyan">
        <span className="eyebrow">An example answer</span>
        <p>“{debrief.exampleResponse}”</p>
      </div>
      <div className="card">
        <span className="eyebrow">When the current cloud design is enough</span>
        <p>{debrief.alternativeNote}</p>
      </div>
      <div className="card">
        <span className="eyebrow">Elena’s second question</span>
        <p>“{debrief.secondQuestion}”</p>
        {debrief.discoveryFeedback && <p>{debrief.discoveryFeedback}</p>}
        <p><strong>A discovery question to take to a customer:</strong> {debrief.nextDiscoveryQuestion}</p>
      </div>
    </section>
  );
}
