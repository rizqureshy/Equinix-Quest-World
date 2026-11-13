import { useCallback, useRef, useState } from 'react';
import type { EpisodeDefinition } from '../content/schema';
import { browserStore, clearSave, loadSave, writeSave, type LoadResult } from '../platform/save-store';
import { initialState, type Action, type EpisodeState } from '../simulation/state';
import { transition, type TransitionResult } from '../simulation/transition';

/**
 * Connects the pure simulation to React and to local storage. All state changes
 * go through `transition`. Saving happens only when the simulation marks an
 * action as a meaningful transition.
 */
export function useEpisode(episode: EpisodeDefinition) {
  const [loaded] = useState<LoadResult>(() => loadSave(browserStore(), episode.id));
  const [state, setState] = useState<EpisodeState>(() => (loaded.status === 'ok' ? loaded.state : initialState()));
  const [saveProblem, setSaveProblem] = useState<'corrupt' | 'unavailable' | null>(
    loaded.status === 'corrupt' || loaded.status === 'unavailable' ? loaded.status : null,
  );
  // The ref is the source of truth so two dispatches in one tick cannot both
  // act on the same stale state.
  const current = useRef(state);

  const dispatch = useCallback(
    (action: Action): TransitionResult => {
      const result = transition(current.current, action, episode);
      if (!result.accepted) return result;
      current.current = result.state;
      setState(result.state);
      if (result.save && !writeSave(browserStore(), episode.id, episode.contentVersion, result.state)) {
        setSaveProblem((p) => p ?? 'unavailable');
      }
      return result;
    },
    [episode],
  );

  const restart = useCallback(() => {
    clearSave(browserStore(), episode.id);
    const fresh = initialState();
    current.current = fresh;
    setState(fresh);
    setSaveProblem((p) => (p === 'corrupt' ? null : p));
  }, [episode]);

  return { state, dispatch, restart, saveProblem };
}
