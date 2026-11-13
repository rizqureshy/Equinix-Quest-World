import type { EpisodeDefinition } from '../../content/schema';
import type { Action, EpisodeState } from '../../simulation/state';
import type { TransitionResult } from '../../simulation/transition';

export interface ScreenProps {
  state: EpisodeState;
  episode: EpisodeDefinition;
  dispatch: (action: Action) => TransitionResult;
  announce: (message: string) => void;
}
