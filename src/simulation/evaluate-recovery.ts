import type { EpisodeDefinition, RouteId, SourceId } from '../content/schema';
import type { AttemptSummary, GateStatus, ReasonCode } from './state';

export interface Gate {
  status: GateStatus;
  reason: ReasonCode;
  explanation: string;
}

export interface RecoveryEvaluation {
  route: RouteId;
  source: SourceId;
  gates: { source: Gate; policy: Gate; latency: Gate };
  /** False when policy stops activation before any request is simulated. */
  requestSent: boolean;
  outcome: 'held' | 'restored';
  message: string;
  imaniLine: string;
  nextAction: string;
}

/**
 * Evaluates one committed recovery test. Pure: the same route, source and episode
 * fixture always produce the same result. The three gates are judged independently
 * and a route activates only when all three pass.
 */
export function evaluateRecovery(
  episode: EpisodeDefinition,
  routeId: RouteId,
  source: SourceId,
  sourceVerified: boolean,
): RecoveryEvaluation {
  const route = episode.routes.find((r) => r.id === routeId);
  if (!route) throw new Error(`Unknown route ${routeId}`);
  const target = episode.scenario.responseTargetMs;

  const sourcePass = source === 'verifiedGauge' && sourceVerified;
  const sourceGate: Gate = sourcePass
    ? {
        status: 'pass',
        reason: 'SOURCE_VERIFIED',
        explanation: 'Gauge 14 is fresh and corroborated by the field report.',
      }
    : {
        status: 'fail',
        reason: 'SOURCE_QUARANTINED',
        explanation: 'The camera relay repeats capture sequence 8041. It is quarantined.',
      };

  const policyPass = route.policy === 'approved';
  const policyGate: Gate = policyPass
    ? { status: 'pass', reason: 'POLICY_APPROVED', explanation: route.policyNote }
    : { status: 'fail', reason: 'POLICY_DISALLOWED', explanation: route.policyNote };

  // Policy is checked before traffic. A disallowed path is never exercised.
  const requestSent = policyPass;
  const latencyPass = requestSent && route.simulatedP95Ms <= target;
  const latencyGate: Gate = !requestSent
    ? {
        status: 'notTested',
        reason: 'LATENCY_NOT_TESTED',
        explanation: 'No request was sent, so no response time was measured.',
      }
    : latencyPass
      ? {
          status: 'pass',
          reason: 'LATENCY_WITHIN_TARGET',
          explanation: `Simulated p95 ${route.simulatedP95Ms} ms is within the ${target} ms target.`,
        }
      : {
          status: 'fail',
          reason: 'LATENCY_MISSED_TARGET',
          explanation: `Simulated p95 ${route.simulatedP95Ms} ms misses the ${target} ms target under incident load.`,
        };

  const restored = sourcePass && policyPass && latencyPass;
  const copy = episode.copy;

  let message: string;
  let imaniLine: string;
  let nextAction: string;
  if (restored) {
    message = copy.R03 ?? '';
    imaniLine = copy.imaniR03 ?? '';
    nextAction = 'Compare the old and new model inputs, then brief Elena.';
  } else if (!policyPass) {
    message = copy.R02 ?? '';
    imaniLine = copy.imaniR02 ?? '';
    nextAction = 'Choose a path the runbook approves and test again.';
  } else if (!sourcePass) {
    message = copy.sourceFail ?? '';
    imaniLine = copy.imaniSourceFail ?? '';
    nextAction = 'Select the verified partner gauge as the input and test again.';
  } else {
    message = copy.R01 ?? '';
    imaniLine = copy.imaniR01 ?? '';
    nextAction = 'Choose a path that can meet the response target and test again.';
  }

  return {
    route: routeId,
    source,
    gates: { source: sourceGate, policy: policyGate, latency: latencyGate },
    requestSent,
    outcome: restored ? 'restored' : 'held',
    message,
    imaniLine,
    nextAction,
  };
}

export function summarizeAttempt(evaluation: RecoveryEvaluation): AttemptSummary {
  const { gates } = evaluation;
  return {
    route: evaluation.route,
    source: evaluation.source,
    sourcePass: gates.source.status === 'pass',
    policyPass: gates.policy.status === 'pass',
    responseTimePass: gates.latency.status === 'pass',
    requestSent: evaluation.requestSent,
    reasonCodes: [gates.source.reason, gates.policy.reason, gates.latency.reason],
    outcome: evaluation.outcome,
  };
}

export interface Recommendation {
  input: string;
  inputDetail: string;
  recommendation: string;
  underpassOpen: boolean;
}

/**
 * The teaching fixture for the routing model. The model is the same function for
 * both inputs: only the hazard input changes, and so the recommendation changes.
 */
export function inferRoute(episode: EpisodeDefinition, source: SourceId): Recommendation {
  if (source === 'quarantinedRelay') {
    return {
      input: 'Underpass camera relay',
      inputDetail: 'Capture sequence 8041, captured 02:12:51, road surface visible',
      recommendation: episode.copy.dispatchStale ?? '',
      underpassOpen: true,
    };
  }
  const { gaugeReadingM, closureThresholdM, gaugeReadingTime } = episode.scenario;
  const closed = gaugeReadingM > closureThresholdM;
  return {
    input: 'Gauge 14, sensor partner',
    inputDetail: `${gaugeReadingM.toFixed(2)} m at ${gaugeReadingTime}, threshold ${closureThresholdM.toFixed(2)} m`,
    recommendation: closed ? (episode.copy.dispatchRestored ?? '') : (episode.copy.dispatchStale ?? ''),
    underpassOpen: !closed,
  };
}
