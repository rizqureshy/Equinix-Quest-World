import type { BehaviorId, EvidenceId, PositionId, RouteId, SourceId } from '../content/schema';

export type Phase = 'coldOpen' | 'investigation' | 'fieldExit' | 'recovery' | 'briefing' | 'complete';
export const PHASE_ORDER: Phase[] = ['coldOpen', 'investigation', 'fieldExit', 'recovery', 'briefing', 'complete'];

export type OpeningChoice = 'hold' | 'continue' | 'ask';
export type Level = 'demonstrated' | 'partial' | 'needsEvidence';
export type GateStatus = 'pass' | 'fail' | 'notTested';

export type ReasonCode =
  | 'SOURCE_VERIFIED'
  | 'SOURCE_QUARANTINED'
  | 'POLICY_APPROVED'
  | 'POLICY_DISALLOWED'
  | 'LATENCY_WITHIN_TARGET'
  | 'LATENCY_MISSED_TARGET'
  | 'LATENCY_NOT_TESTED';

export interface AttemptSummary {
  route: RouteId;
  source: SourceId;
  sourcePass: boolean;
  policyPass: boolean;
  /** False when the target was missed and also when no request was sent (see `requestSent`). */
  responseTimePass: boolean;
  requestSent: boolean;
  reasonCodes: ReasonCode[];
  outcome: 'held' | 'restored';
}

export interface BriefingState {
  position: PositionId | null;
  discoveryQuestion: string | null;
  selfAssessment: Partial<Record<BehaviorId, Level>>;
  transferChoice: string | null;
  reviewed: boolean;
}

export interface EpisodeState {
  version: 1;
  phase: Phase;
  fieldStatus: 'moving' | 'held' | 'safe';
  openingChoice: OpeningChoice | null;
  /** Indexes of camera captures the player has looked at. */
  viewedFrames: number[];
  viewedEvidence: EvidenceId[];
  citedEvidence: EvidenceId[];
  flaggedStaleFeed: boolean;
  verifiedSource: boolean;
  crewConfirmed: boolean;
  selectedSource: SourceId | null;
  selectedRoute: RouteId | null;
  recoveryStatus: 'degraded' | 'restored';
  checkpoint: 'investigation' | 'fieldExit' | 'recovery' | null;
  attempts: AttemptSummary[];
  replays: number;
  hintsUsed: number;
  briefing: BriefingState;
}

export const emptyBriefing = (): BriefingState => ({
  position: null,
  discoveryQuestion: null,
  selfAssessment: {},
  transferChoice: null,
  reviewed: false,
});

export const initialState = (): EpisodeState => ({
  version: 1,
  phase: 'coldOpen',
  fieldStatus: 'moving',
  openingChoice: null,
  viewedFrames: [],
  viewedEvidence: [],
  citedEvidence: [],
  flaggedStaleFeed: false,
  verifiedSource: false,
  crewConfirmed: false,
  selectedSource: null,
  selectedRoute: null,
  recoveryStatus: 'degraded',
  checkpoint: null,
  attempts: [],
  replays: 0,
  hintsUsed: 0,
  briefing: emptyBriefing(),
});

export type Action =
  | { type: 'chooseFieldAction'; choice: OpeningChoice }
  | { type: 'enterReconstruction' }
  | { type: 'inspectFrame'; index: number }
  | { type: 'inspectEvidence'; id: EvidenceId }
  | { type: 'toggleCite'; id: EvidenceId }
  | { type: 'requestHint' }
  | { type: 'flagStaleFeed' }
  | { type: 'verifySource' }
  | { type: 'proceedToFieldExit' }
  | { type: 'confirmCrewCheck' }
  | { type: 'authorizeSurfaceRoute' }
  | { type: 'enterRecovery' }
  | { type: 'selectSource'; source: SourceId }
  | { type: 'selectRoute'; route: RouteId }
  | { type: 'simulateRecovery' }
  | { type: 'proceedToBriefing' }
  | { type: 'choosePosition'; position: PositionId }
  | { type: 'chooseDiscoveryQuestion'; id: string }
  | { type: 'setSelfAssessment'; behavior: BehaviorId; level: Level }
  | { type: 'chooseTransfer'; id: string }
  | { type: 'reviewResponse' }
  | { type: 'completeEpisode' }
  | { type: 'replayCheckpoint' };

export type RejectCode =
  | 'WRONG_PHASE'
  | 'ALREADY_DONE'
  | 'MISSING_EVIDENCE'
  | 'MISSING_SELECTION'
  | 'NOT_CORROBORATED'
  | 'NOT_RESTORED'
  | 'ALREADY_RESTORED'
  | 'NOT_REVIEWED'
  | 'UNKNOWN_ID';

export const phaseAtLeast = (state: EpisodeState, phase: Phase) =>
  PHASE_ORDER.indexOf(state.phase) >= PHASE_ORDER.indexOf(phase);
