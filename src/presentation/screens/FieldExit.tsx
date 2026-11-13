import { useCallback } from 'react';
import { Cutscene, DialogueLog } from '../Cutscene';
import { EvidenceCard } from '../parts';
import { Plate } from '../Plate';
import type { ScreenProps } from './types';

export function FieldExit({ state, episode, dispatch, announce }: ScreenProps) {
  const enterRecovery = useCallback(() => {
    dispatch({ type: 'enterRecovery' });
  }, [dispatch]);

  if (state.fieldStatus === 'safe') {
    return (
      <>
        <p className="status status-cyan" role="status">{episode.copy.manualDispatch}</p>
        <Cutscene title="Pursuit" lines={episode.beats.GF06!.lines} onComplete={enterRecovery} continueLabel="Go to the continuity site" />
      </>
    );
  }

  const record =
    state.openingChoice === 'continue'
      ? episode.copy.nearMissRecord
      : state.openingChoice === 'ask'
        ? episode.copy.askRecord
        : episode.copy.holdRecord;
  const field = episode.evidence.find((e) => e.id === 'E02_FIELD')!;
  const gauge = episode.evidence.find((e) => e.id === 'E03_GAUGE')!;

  return (
    <section className="stack">
      <div className="cutscene-stage">
        <Plate id="turnout" />
      </div>
      <DialogueLog lines={episode.beats.GF05!.lines} />
      <p className={`status ${state.openingChoice === 'continue' ? 'status-amber' : 'status-cyan'}`}>{record}</p>
      <div className="grid2">
        <EvidenceCard evidence={field} cited={state.citedEvidence.includes('E02_FIELD')} />
        <EvidenceCard evidence={gauge} cited={state.citedEvidence.includes('E03_GAUGE')} />
      </div>
      <p>
        Two sources agree the underpass is flooded. Routing is still offline, so the crew moves only on a road a
        person has checked.
      </p>
      {state.crewConfirmed && <DialogueLog lines={[{ speaker: 'Mara', text: episode.copy.crewConfirm! }]} />}
      <div className="row">
        <button
          className="btn btn-primary"
          disabled={state.crewConfirmed}
          onClick={() => {
            dispatch({ type: 'confirmCrewCheck' });
            announce('The crew has checked the surface road.');
          }}
        >
          Ask the crew to check the surface road
        </button>
        <button
          className="btn btn-primary"
          disabled={!state.crewConfirmed}
          aria-describedby="authorize-help"
          onClick={() => {
            dispatch({ type: 'authorizeSurfaceRoute' });
            announce(episode.copy.manualDispatch!);
          }}
        >
          Authorize the surface route
        </button>
        <span id="authorize-help" className="muted">
          {state.crewConfirmed ? 'Confirmed by the crew.' : 'Needs the crew to confirm it first.'}
        </span>
      </div>
    </section>
  );
}
