import type { ReactNode } from 'react';
import type { Evidence } from '../content/schema';
import type { Gate } from '../simulation/evaluate-recovery';

export function EvidenceCard({
  evidence,
  cited,
  onToggleCite,
  tone = 'cyan',
  children,
}: {
  evidence: Evidence;
  cited: boolean;
  onToggleCite?: () => void;
  tone?: 'cyan' | 'amber';
  children?: ReactNode;
}) {
  return (
    <article className={`card evidence tone-${tone}`} data-evidence={evidence.id}>
      <header>
        <span className="eyebrow">
          {evidence.id} · {evidence.source}
        </span>
        <h4>{evidence.title}</h4>
      </header>
      <p>{evidence.summary}</p>
      <dl className="facts">
        {evidence.details.map((d) => (
          <div key={d.label}>
            <dt>{d.label}</dt>
            <dd>{d.value}</dd>
          </div>
        ))}
      </dl>
      <div className="row">
        {onToggleCite && (
          <button className="btn" aria-pressed={cited} onClick={onToggleCite}>
            {cited ? `Pinned: ${evidence.title}` : `Pin evidence: ${evidence.title}`}
          </button>
        )}
        {children}
      </div>
    </article>
  );
}

export function MissionNote({ term, note }: { term: string; note: string }) {
  return (
    <aside className="mission-note">
      <span className="eyebrow">Mission note</span>
      <p>
        <strong>{term}.</strong> {note}
      </p>
    </aside>
  );
}

const STATUS_TEXT = { pass: 'Pass', fail: 'Fail', notTested: 'Not tested' } as const;
const STATUS_MARK = { pass: '✓', fail: '✕', notTested: '–' } as const;

export function GateRow({ name, gate }: { name: string; gate: Gate }) {
  return (
    <li className={`gate gate-${gate.status}`} data-gate={name} data-status={gate.status}>
      <span className="gate-mark" aria-hidden="true">
        {STATUS_MARK[gate.status]}
      </span>
      <div>
        <strong>
          {name}: {STATUS_TEXT[gate.status]}
        </strong>
        <p>{gate.explanation}</p>
      </div>
    </li>
  );
}
