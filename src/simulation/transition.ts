import type { EpisodeDefinition, EvidenceId } from '../content/schema';
import { evaluateRecovery, summarizeAttempt } from './evaluate-recovery';
import { emptyBriefing, phaseAtLeast, type Action, type EpisodeState, type RejectCode } from './state';

export interface TransitionResult {
  state: EpisodeState;
  accepted: boolean;
  reject?: RejectCode;
  /** True when the action is a meaningful transition worth persisting. */
  save: boolean;
}

const addUnique = <T,>(list: T[], item: T): T[] => (list.includes(item) ? list : [...list, item]);

/** Whether a piece of evidence can be opened in the current state. */
export function canInspect(state: EpisodeState, id: EvidenceId): boolean {
  switch (id) {
    case 'E01_CAMERA':
      // The capture record opens once two captures have been looked at.
      return phaseAtLeast(state, 'investigation') && state.viewedFrames.length >= 2;
    case 'E02_FIELD':
    case 'E03_GAUGE':
    case 'E04_MODEL':
      return phaseAtLeast(state, 'investigation');
    case 'E05_RUNBOOK':
      return phaseAtLeast(state, 'recovery');
    case 'E06_MARKER':
      return state.phase === 'complete';
  }
}

/**
 * The only way episode state changes. Pure and deterministic: no clock, no
 * randomness, no I/O. An invalid action returns the same state object with a
 * reject code, so callers can never corrupt progress.
 */
export function transition(state: EpisodeState, action: Action, episode: EpisodeDefinition): TransitionResult {
  const reject = (code: RejectCode): TransitionResult => ({ state, accepted: false, reject: code, save: false });
  const ok = (next: Partial<EpisodeState>, save = false): TransitionResult => ({
    state: { ...state, ...next },
    accepted: true,
    save,
  });

  switch (action.type) {
    case 'chooseFieldAction': {
      if (state.phase !== 'coldOpen') return reject('WRONG_PHASE');
      if (state.openingChoice) return reject('ALREADY_DONE');
      // Every choice ends with the van held at the turnout. Continuing gets there
      // through a near miss, and asking adds the worker's call to the evidence.
      return ok(
        {
          openingChoice: action.choice,
          fieldStatus: 'held',
          viewedEvidence: action.choice === 'ask' ? addUnique(state.viewedEvidence, 'E02_FIELD') : state.viewedEvidence,
        },
        true,
      );
    }

    case 'enterReconstruction': {
      if (state.phase !== 'coldOpen') return reject('WRONG_PHASE');
      if (!state.openingChoice) return reject('MISSING_SELECTION');
      return ok({ phase: 'investigation', checkpoint: 'investigation' }, true);
    }

    case 'inspectFrame': {
      if (state.phase !== 'investigation') return reject('WRONG_PHASE');
      if (!episode.frames[action.index]) return reject('UNKNOWN_ID');
      if (state.viewedFrames.includes(action.index)) return ok({});
      return ok({ viewedFrames: [...state.viewedFrames, action.index] });
    }

    case 'inspectEvidence': {
      if (!episode.evidence.some((e) => e.id === action.id)) return reject('UNKNOWN_ID');
      if (!canInspect(state, action.id)) return reject('MISSING_EVIDENCE');
      return ok({ viewedEvidence: addUnique(state.viewedEvidence, action.id) });
    }

    case 'toggleCite': {
      if (!state.viewedEvidence.includes(action.id)) return reject('MISSING_EVIDENCE');
      if (state.briefing.reviewed) return reject('ALREADY_DONE');
      const cited = state.citedEvidence.includes(action.id)
        ? state.citedEvidence.filter((id) => id !== action.id)
        : [...state.citedEvidence, action.id];
      return ok({ citedEvidence: cited });
    }

    case 'requestHint': {
      if (state.phase !== 'investigation') return reject('WRONG_PHASE');
      if (state.hintsUsed >= episode.hints.length) return reject('ALREADY_DONE');
      return ok({ hintsUsed: state.hintsUsed + 1 });
    }

    case 'flagStaleFeed': {
      if (state.phase !== 'investigation') return reject('WRONG_PHASE');
      if (state.flaggedStaleFeed) return reject('ALREADY_DONE');
      if (!state.viewedEvidence.includes('E01_CAMERA')) return reject('MISSING_EVIDENCE');
      return ok({ flaggedStaleFeed: true }, true);
    }

    case 'verifySource': {
      if (state.phase !== 'investigation') return reject('WRONG_PHASE');
      if (state.verifiedSource) return reject('ALREADY_DONE');
      if (!state.viewedEvidence.includes('E02_FIELD') || !state.viewedEvidence.includes('E03_GAUGE')) {
        return reject('MISSING_EVIDENCE');
      }
      return ok({ verifiedSource: true }, true);
    }

    case 'proceedToFieldExit': {
      if (state.phase !== 'investigation') return reject('WRONG_PHASE');
      if (!state.flaggedStaleFeed || !state.verifiedSource) return reject('NOT_CORROBORATED');
      return ok({ phase: 'fieldExit', checkpoint: 'fieldExit' }, true);
    }

    case 'confirmCrewCheck': {
      if (state.phase !== 'fieldExit') return reject('WRONG_PHASE');
      if (state.crewConfirmed) return reject('ALREADY_DONE');
      return ok({ crewConfirmed: true }, true);
    }

    case 'authorizeSurfaceRoute': {
      if (state.phase !== 'fieldExit') return reject('WRONG_PHASE');
      if (state.fieldStatus === 'safe') return reject('ALREADY_DONE');
      // Human confirmation is required even with two agreeing sources.
      if (!state.verifiedSource || !state.crewConfirmed) return reject('NOT_CORROBORATED');
      return ok({ fieldStatus: 'safe' }, true);
    }

    case 'enterRecovery': {
      if (state.phase !== 'fieldExit') return reject('WRONG_PHASE');
      if (state.fieldStatus !== 'safe') return reject('NOT_CORROBORATED');
      return ok({ phase: 'recovery', checkpoint: 'recovery' }, true);
    }

    case 'selectSource': {
      if (state.phase !== 'recovery') return reject('WRONG_PHASE');
      if (state.recoveryStatus === 'restored') return reject('ALREADY_RESTORED');
      if (!episode.sources.some((s) => s.id === action.source)) return reject('UNKNOWN_ID');
      return ok({ selectedSource: action.source });
    }

    case 'selectRoute': {
      if (state.phase !== 'recovery') return reject('WRONG_PHASE');
      if (state.recoveryStatus === 'restored') return reject('ALREADY_RESTORED');
      if (!episode.routes.some((r) => r.id === action.route)) return reject('UNKNOWN_ID');
      return ok({ selectedRoute: action.route });
    }

    case 'simulateRecovery': {
      if (state.phase !== 'recovery') return reject('WRONG_PHASE');
      if (state.recoveryStatus === 'restored') return reject('ALREADY_RESTORED');
      if (!state.viewedEvidence.includes('E05_RUNBOOK')) return reject('MISSING_EVIDENCE');
      if (!state.selectedSource || !state.selectedRoute) return reject('MISSING_SELECTION');
      const evaluation = evaluateRecovery(episode, state.selectedRoute, state.selectedSource, state.verifiedSource);
      // A failed test leaves the last safe state intact: crew safe, dispatch manual.
      return ok(
        {
          attempts: [...state.attempts, summarizeAttempt(evaluation)],
          recoveryStatus: evaluation.outcome === 'restored' ? 'restored' : 'degraded',
        },
        true,
      );
    }

    case 'proceedToBriefing': {
      if (state.phase !== 'recovery') return reject('WRONG_PHASE');
      if (state.recoveryStatus !== 'restored') return reject('NOT_RESTORED');
      return ok({ phase: 'briefing' }, true);
    }

    case 'choosePosition': {
      if (state.phase !== 'briefing') return reject('WRONG_PHASE');
      if (state.briefing.reviewed) return reject('ALREADY_DONE');
      if (!episode.positions.some((p) => p.id === action.position)) return reject('UNKNOWN_ID');
      return ok({ briefing: { ...state.briefing, position: action.position } });
    }

    case 'chooseDiscoveryQuestion': {
      if (state.phase !== 'briefing') return reject('WRONG_PHASE');
      if (state.briefing.reviewed) return reject('ALREADY_DONE');
      if (!episode.discoveryQuestions.some((q) => q.id === action.id)) return reject('UNKNOWN_ID');
      return ok({ briefing: { ...state.briefing, discoveryQuestion: action.id } });
    }

    case 'setSelfAssessment': {
      if (state.phase !== 'briefing') return reject('WRONG_PHASE');
      if (!episode.behaviors.some((b) => b.id === action.behavior)) return reject('UNKNOWN_ID');
      return ok({
        briefing: {
          ...state.briefing,
          selfAssessment: { ...state.briefing.selfAssessment, [action.behavior]: action.level },
        },
      });
    }

    case 'chooseTransfer': {
      if (state.phase !== 'briefing') return reject('WRONG_PHASE');
      if (!state.briefing.reviewed) return reject('NOT_REVIEWED');
      if (!episode.transfer.options.some((o) => o.id === action.id)) return reject('UNKNOWN_ID');
      return ok({ briefing: { ...state.briefing, transferChoice: action.id } }, true);
    }

    case 'reviewResponse': {
      if (state.phase !== 'briefing') return reject('WRONG_PHASE');
      if (state.briefing.reviewed) return reject('ALREADY_DONE');
      // The first answer may be skipped. The debrief still shows the second question.
      return ok({ briefing: { ...state.briefing, reviewed: true } }, true);
    }

    case 'completeEpisode': {
      if (state.phase !== 'briefing') return reject('WRONG_PHASE');
      if (!state.briefing.reviewed) return reject('NOT_REVIEWED');
      return ok({ phase: 'complete', viewedEvidence: addUnique(state.viewedEvidence, 'E06_MARKER') }, true);
    }

    case 'replayCheckpoint': {
      // Replay restores the recovery checkpoint. Investigation findings and the
      // attempt log are kept; route, source, result and briefing are cleared so
      // no earlier choice leaks into the new run.
      if (!phaseAtLeast(state, 'recovery') || state.checkpoint !== 'recovery') return reject('WRONG_PHASE');
      return ok(
        {
          phase: 'recovery',
          selectedSource: null,
          selectedRoute: null,
          recoveryStatus: 'degraded',
          replays: state.replays + 1,
          citedEvidence: state.citedEvidence.filter((id) => id !== 'E06_MARKER'),
          viewedEvidence: state.viewedEvidence.filter((id) => id !== 'E06_MARKER'),
          briefing: emptyBriefing(),
        },
        true,
      );
    }
  }
}
