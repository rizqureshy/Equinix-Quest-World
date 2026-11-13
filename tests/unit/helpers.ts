import { ghostFeed } from '../../src/content/episodes/ghost-feed';
import { initialState, type Action, type EpisodeState } from '../../src/simulation/state';
import { transition } from '../../src/simulation/transition';

export const episode = ghostFeed;

/** Applies actions in order and fails loudly if any is rejected. */
export function play(state: EpisodeState, actions: Action[]): EpisodeState {
  return actions.reduce((s, action) => {
    const result = transition(s, action, episode);
    if (!result.accepted) throw new Error(`Rejected ${action.type}: ${result.reject}`);
    return result.state;
  }, state);
}

export const toInvestigation = (choice: 'hold' | 'continue' | 'ask' = 'hold'): Action[] => [
  { type: 'chooseFieldAction', choice },
  { type: 'enterReconstruction' },
];

export const investigate: Action[] = [
  { type: 'inspectFrame', index: 0 },
  { type: 'inspectFrame', index: 2 },
  { type: 'inspectEvidence', id: 'E01_CAMERA' },
  { type: 'flagStaleFeed' },
  { type: 'inspectEvidence', id: 'E02_FIELD' },
  { type: 'inspectEvidence', id: 'E03_GAUGE' },
  { type: 'verifySource' },
  { type: 'proceedToFieldExit' },
];

export const exitField: Action[] = [
  { type: 'confirmCrewCheck' },
  { type: 'authorizeSurfaceRoute' },
  { type: 'enterRecovery' },
  { type: 'inspectEvidence', id: 'E05_RUNBOOK' },
];

export const atRecovery = (choice: 'hold' | 'continue' | 'ask' = 'hold') =>
  play(initialState(), [...toInvestigation(choice), ...investigate, ...exitField]);

export const test = (route: 'R01' | 'R02' | 'R03', source: 'verifiedGauge' | 'quarantinedRelay'): Action[] => [
  { type: 'selectSource', source },
  { type: 'selectRoute', route },
  { type: 'simulateRecovery' },
];
