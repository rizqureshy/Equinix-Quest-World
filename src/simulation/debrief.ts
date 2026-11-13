import type { BehaviorId, EpisodeDefinition, EvidenceId } from '../content/schema';
import type { AttemptSummary, EpisodeState, Level } from './state';

export interface BehaviorFeedback {
  id: BehaviorId;
  label: string;
  level: Level;
  reason: string;
  selfAssessment: Level | null;
}

export interface Debrief {
  behaviors: BehaviorFeedback[];
  followUp: string | null;
  positionStatement: string | null;
  discoveryFeedback: string | null;
  citedEvidence: { id: EvidenceId; title: string }[];
  attempts: AttemptSummary[];
  exampleResponse: string;
  alternativeNote: string;
  nextDiscoveryQuestion: string;
  secondQuestion: string;
}

const has = (list: EvidenceId[], ...ids: EvidenceId[]) => ids.some((id) => list.includes(id));

/**
 * Deterministic local debrief. It compares what the player pinned, the position
 * they chose and the routes they tested with the authored example. It never reads
 * free text: the written reflection is for the learner only.
 */
export function buildDebrief(state: EpisodeState, episode: EpisodeDefinition): Debrief {
  const cited = state.citedEvidence;
  const position = state.briefing.position;
  const question = episode.discoveryQuestions.find((q) => q.id === state.briefing.discoveryQuestion) ?? null;
  const sawLateResult = state.attempts.some((a) => a.requestSent && a.sourcePass && !a.responseTimePass);
  const sawPolicyBlock = state.attempts.some((a) => !a.policyPass);

  const feedback: Record<BehaviorId, { level: Level; reason: string }> = {
    separatesModelFromData: (() => {
      const clue = has(cited, 'E01_CAMERA', 'E04_MODEL', 'E03_GAUGE');
      if (position === 'betterAI') {
        return {
          level: clue ? 'partial' : 'needsEvidence',
          reason:
            'The model never changed. Its input did. The repeated capture sequence 8041 is the clue that separates the two.',
        };
      }
      if (clue) {
        return {
          level: 'demonstrated',
          reason: 'You pinned evidence showing the model worked from a stale input, and did not credit the fix to the model.',
        };
      }
      return {
        level: 'partial',
        reason: 'You flagged the stale feed during the incident. Pin the capture record or the inference record to back it up.',
      };
    })(),

    explainsPlacement: (() => {
      const runbook = has(cited, 'E05_RUNBOOK');
      if (position === 'fabricTrust') {
        return {
          level: runbook ? 'partial' : 'needsEvidence',
          reason:
            'The connection carried the feed. It did not verify it. The gauge was trusted because the field report corroborated it.',
        };
      }
      if (position === 'betterAI' || position === null) {
        return {
          level: runbook ? 'partial' : 'needsEvidence',
          reason:
            'Say what runs where: the backup dispatcher at the IBX site, the feed arriving from the partner, the model still in the cloud.',
        };
      }
      return runbook
        ? {
            level: 'demonstrated',
            reason: 'You tied the answer to the runbook: backup at the IBX site, partner feed in, model call out to the existing cloud.',
          }
        : {
            level: 'partial',
            reason: 'Your position fits the design. Pin the continuity runbook to show which workload sits where.',
          };
    })(),

    linksRequirement: (() => {
      const requirementEvidence = has(cited, 'E03_GAUGE', 'E05_RUNBOOK', 'E01_CAMERA');
      const experienced = sawLateResult || sawPolicyBlock;
      if (position === 'betterAI') {
        return {
          level: 'needsEvidence',
          reason: 'Name the requirement that was unmet: a fresh input, an approved path, or the 250 ms response target.',
        };
      }
      if (requirementEvidence && (position === 'privateConnection' || position === 'keepCloud')) {
        return {
          level: 'demonstrated',
          reason: experienced
            ? 'You saw a path fail a requirement and pinned evidence for it. The decision follows from the requirement.'
            : 'You pinned evidence for a requirement the design had to meet.',
        };
      }
      return {
        level: requirementEvidence || experienced ? 'partial' : 'needsEvidence',
        reason: 'Link the choice to one requirement and the evidence for it: freshness, approved routing or response time.',
      };
    })(),

    acknowledgesAlternative: (() => {
      if (position === 'keepCloud' || question?.relevant) {
        return {
          level: 'demonstrated',
          reason:
            position === 'keepCloud'
              ? 'You allowed that the existing cloud design could be enough if it meets the same requirements.'
              : 'You asked the provider to prove something specific before changing the design.',
        };
      }
      if (question) {
        return { level: 'partial', reason: question.feedback };
      }
      return {
        level: 'needsEvidence',
        reason: 'A buyer trusts an answer that admits when the current design could work, or that asks what to measure first.',
      };
    })(),
  };

  return {
    behaviors: episode.behaviors.map((b) => ({
      id: b.id,
      label: b.label,
      ...feedback[b.id],
      selfAssessment: state.briefing.selfAssessment[b.id] ?? null,
    })),
    followUp: episode.positions.find((p) => p.id === position)?.followUp ?? null,
    positionStatement: episode.positions.find((p) => p.id === position)?.statement ?? null,
    discoveryFeedback: question?.feedback ?? null,
    citedEvidence: cited.map((id) => ({ id, title: episode.evidence.find((e) => e.id === id)?.title ?? id })),
    attempts: state.attempts,
    exampleResponse: episode.briefing.exampleResponse,
    alternativeNote: episode.briefing.alternativeNote,
    nextDiscoveryQuestion: episode.briefing.nextDiscoveryQuestion,
    secondQuestion: episode.briefing.secondQuestion,
  };
}
