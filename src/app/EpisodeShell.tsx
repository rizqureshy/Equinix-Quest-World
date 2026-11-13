import { useCallback, useEffect, useRef, useState } from 'react';
import { ghostFeed } from '../content/episodes/ghost-feed';
import { Briefing } from '../presentation/screens/Briefing';
import { ColdOpen } from '../presentation/screens/ColdOpen';
import { Complete } from '../presentation/screens/Complete';
import { FieldExit } from '../presentation/screens/FieldExit';
import { Investigation } from '../presentation/screens/Investigation';
import { Recovery } from '../presentation/screens/Recovery';
import type { ScreenProps } from '../presentation/screens/types';
import type { Phase } from '../simulation/state';
import { Link } from './router';
import { SettingsPanel } from './SettingsPanel';
import { useEpisode } from './useEpisode';

const episode = ghostFeed;

const HEADINGS: Record<Phase, string> = {
  coldOpen: 'Street',
  investigation: 'The Reconstruction',
  fieldExit: 'The turnout',
  recovery: 'Continuity site',
  briefing: 'Incident call',
  complete: 'Close',
};
const OBJECTIVES: Record<Phase, string> = {
  coldOpen: 'objectiveInitial',
  investigation: 'objectiveInvestigate',
  fieldExit: 'objectiveFieldExit',
  recovery: 'objectiveRecovery',
  briefing: 'objectiveBriefing',
  complete: 'objectiveComplete',
};
const SCREENS: Record<Phase, (props: ScreenProps) => React.ReactNode> = {
  coldOpen: ColdOpen,
  investigation: Investigation,
  fieldExit: FieldExit,
  recovery: Recovery,
  briefing: Briefing,
  complete: Complete,
};

export function EpisodeShell() {
  const { state, dispatch, restart, saveProblem } = useEpisode(episode);
  const [message, setMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const announce = useCallback((text: string) => setMessage(text), []);

  // On a scene change, move focus to its heading so keyboard and screen reader
  // users land at the top of the new scene.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
    window.scrollTo({ top: 0 });
  }, [state.phase]);

  const Screen = SCREENS[state.phase];

  return (
    <div className="shell" data-phase={state.phase}>
      <header className="topbar">
        <Link to="/" className="brand">SIGNAL RUN</Link>
        <span className="episode-name">Episode 1 · {episode.title}</span>
        <span className="spacer" />
        <button className="btn" aria-expanded={showSettings} onClick={() => setShowSettings((s) => !s)}>Settings</button>
        <button
          className="btn"
          onClick={() => {
            if (window.confirm('Start Ghost Feed over? Saved progress on this device will be cleared.')) {
              restart();
              setMessage('Episode restarted.');
            }
          }}
        >
          Start over
        </button>
      </header>
      {showSettings && <SettingsPanel />}

      {saveProblem === 'corrupt' && (
        <div className="status status-amber" role="alert">
          Saved progress on this device could not be read, so the episode has started fresh.{' '}
          <button className="link" onClick={restart}>Clear the old save</button>
        </div>
      )}
      {saveProblem === 'unavailable' && (
        <div className="status status-amber" role="status">
          Progress cannot be saved in this browser. You can still play the whole episode in one sitting.
        </div>
      )}

      <main>
        <div className="scene-heading">
          <h2 ref={heading} tabIndex={-1}>{HEADINGS[state.phase]}</h2>
          <p className="objective"><span className="eyebrow">Objective</span> {episode.copy[OBJECTIVES[state.phase]]}</p>
        </div>
        <Screen key={`${state.phase}-${state.replays}`} state={state} episode={episode} dispatch={dispatch} announce={announce} />
      </main>

      <div className="live" role="status" aria-live="polite">{message}</div>
    </div>
  );
}
