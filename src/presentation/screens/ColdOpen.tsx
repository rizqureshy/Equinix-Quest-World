import { useCallback, useState } from 'react';
import type { OpeningChoice } from '../../simulation/state';
import { Cutscene, DialogueLog } from '../Cutscene';
import { Plate } from '../Plate';
import type { ScreenProps } from './types';

const CHOICES: { id: OpeningChoice; label: string; detail: string }[] = [
  { id: 'hold', label: 'Hold at the turnout', detail: 'Stop the van short of the tunnel.' },
  { id: 'continue', label: 'Continue toward the tunnel', detail: 'Follow the dispatch recommendation.' },
  { id: 'ask', label: 'Ask for another observation', detail: 'Hold for now and ask the worker what they can see.' },
];
const AFTER: Record<OpeningChoice, string> = { hold: 'GF02A', continue: 'GF02B', ask: 'GF02C' };

export function ColdOpen({ state, episode, dispatch, announce }: ScreenProps) {
  const [introDone, setIntroDone] = useState(false);
  const street = episode.beats.GF01!;
  const enter = useCallback(() => {
    dispatch({ type: 'enterReconstruction' });
  }, [dispatch]);

  if (state.openingChoice) {
    const lines = [...episode.beats[AFTER[state.openingChoice]]!.lines, ...episode.beats.GF03!.lines];
    return <Cutscene key="after" title="The crew holds, and you cross into the Reconstruction" lines={lines} onComplete={enter} continueLabel="Enter the Reconstruction" />;
  }

  if (!introDone) {
    return <Cutscene key="intro" title="Cold open" lines={street.lines} onComplete={() => setIntroDone(true)} continueLabel="Decide" />;
  }

  // The contradiction stays on screen while the player decides. Nothing is timed.
  return (
    <section className="decision">
      <div className="cutscene-stage">
        <Plate id="street" />
      </div>
      <DialogueLog lines={street.lines.filter((l) => l.speaker)} />
      <h3 id="decision-heading">Mara needs a call. What does the crew do?</h3>
      <div className="choices" role="group" aria-labelledby="decision-heading">
        {CHOICES.map((c) => (
          <button
            key={c.id}
            className="btn btn-choice"
            onClick={() => {
              dispatch({ type: 'chooseFieldAction', choice: c.id });
              announce(c.id === 'continue' ? 'The van continues toward the tunnel.' : 'The van holds at the turnout.');
            }}
          >
            <strong>{c.label}</strong>
            <span>{c.detail}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
