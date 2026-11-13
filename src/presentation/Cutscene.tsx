import { useCallback, useEffect, useRef, useState } from 'react';
import type { Line } from '../content/schema';
import { useSettings } from '../platform/settings';
import { Plate } from './Plate';

interface Props {
  title: string;
  lines: Line[];
  onComplete: () => void;
  /** Label for the final manual step. */
  continueLabel?: string;
}

const readTime = (line: Line) => 2200 + line.text.length * 55;

/**
 * A motion-panel sequence. It may advance on its own, but the player can pause,
 * step or skip at any point. Finishing naturally and skipping both call
 * `onComplete`, and a guard makes sure that happens exactly once.
 */
export function Cutscene({ title, lines, onComplete, continueLabel = 'Continue' }: Props) {
  const { reducedMotion } = useSettings();
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(!reducedMotion);
  const [showTranscript, setShowTranscript] = useState(false);
  const completed = useRef(false);
  const last = index >= lines.length - 1;
  const line = lines[index]!;

  const complete = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    onComplete();
  }, [onComplete]);

  const next = useCallback(() => {
    if (last) complete();
    else setIndex((i) => i + 1);
  }, [last, complete]);

  useEffect(() => {
    if (!auto || showTranscript) return;
    const id = window.setTimeout(next, readTime(line));
    return () => window.clearTimeout(id);
  }, [auto, showTranscript, next, line]);

  return (
    <section className="cutscene" aria-label={title}>
      <div className="cutscene-stage">
        <Plate id={line.plate ?? 'street'} />
        <div className="caption" aria-live="polite">
          {line.speaker ? <span className="speaker">{line.speaker}</span> : <span className="speaker direction">Scene</span>}
          <p>{line.text}</p>
        </div>
      </div>
      <div className="cutscene-controls">
        <span className="muted">
          {index + 1} / {lines.length}
        </span>
        <button className="btn" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          Back
        </button>
        <button className="btn btn-primary" onClick={next}>
          {last ? continueLabel : 'Next'}
        </button>
        <button className="btn" onClick={() => setAuto((a) => !a)} aria-pressed={!auto}>
          {auto ? 'Pause' : 'Auto-play'}
        </button>
        <button className="btn" onClick={() => setShowTranscript((s) => !s)} aria-expanded={showTranscript}>
          Transcript
        </button>
        {!last && (
          <button className="btn" onClick={complete}>
            Skip scene
          </button>
        )}
      </div>
      {showTranscript && <Transcript lines={lines} />}
    </section>
  );
}

export function Transcript({ lines }: { lines: Line[] }) {
  return (
    <ol className="transcript">
      {lines.map((l, i) => (
        <li key={i}>{l.speaker ? <><strong>{l.speaker}:</strong> {l.text}</> : <em>[{l.text}]</em>}</li>
      ))}
    </ol>
  );
}

/** Dialogue shown alongside interactive screens. Never blocks play. */
export function DialogueLog({ lines }: { lines: Line[] }) {
  return (
    <ul className="dialogue">
      {lines.map((l, i) => (
        <li key={i} className={l.speaker ? undefined : 'direction'}>
          {l.speaker && <span className="speaker">{l.speaker}</span>}
          <span>{l.text}</span>
        </li>
      ))}
    </ul>
  );
}
