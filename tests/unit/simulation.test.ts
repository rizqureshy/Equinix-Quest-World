import { describe, expect, it } from 'vitest';
import { validateEpisode } from '../../src/content/schema';
import { buildDebrief } from '../../src/simulation/debrief';
import { evaluateRecovery, inferRoute } from '../../src/simulation/evaluate-recovery';
import { initialState, type Action } from '../../src/simulation/state';
import { transition } from '../../src/simulation/transition';
import { atRecovery, episode, exitField, investigate, play, test, toInvestigation } from './helpers';

const step = (state: ReturnType<typeof initialState>, action: Action) => transition(state, action, episode);

describe('episode definition', () => {
  it('is internally consistent', () => {
    expect(validateEpisode(episode)).toEqual([]);
  });

  it('matches the blueprint fixture values', () => {
    const p95 = Object.fromEntries(episode.routes.map((r) => [r.id, r.simulatedP95Ms]));
    expect(p95).toEqual({ R01: 410, R02: 185, R03: 205 });
    expect(episode.scenario.responseTargetMs).toBe(250);
    expect(episode.frames.map((f) => f.arrivalTime)).toEqual(['02:13:08', '02:13:20', '02:13:32']);
    expect(new Set(episode.frames.map((f) => f.captureSequence))).toEqual(new Set([8041]));
    expect(new Set(episode.frames.map((f) => f.captureTime)).size).toBe(1);
  });
});

describe('route outcomes', () => {
  it('R01 is verified and approved but misses the response target', () => {
    const e = evaluateRecovery(episode, 'R01', 'verifiedGauge', true);
    expect(e.gates.source.status).toBe('pass');
    expect(e.gates.policy.status).toBe('pass');
    expect(e.gates.latency.status).toBe('fail');
    expect(e.requestSent).toBe(true);
    expect(e.outcome).toBe('held');
  });

  it('R02 is blocked by policy before any request is sent', () => {
    const e = evaluateRecovery(episode, 'R02', 'verifiedGauge', true);
    expect(e.gates.policy.status).toBe('fail');
    expect(e.gates.latency.status).toBe('notTested');
    expect(e.requestSent).toBe(false);
    expect(e.outcome).toBe('held');
  });

  it('R03 with the verified gauge passes all three gates', () => {
    const e = evaluateRecovery(episode, 'R03', 'verifiedGauge', true);
    expect(Object.values(e.gates).map((g) => g.status)).toEqual(['pass', 'pass', 'pass']);
    expect(e.outcome).toBe('restored');
  });

  it('R03 with the quarantined relay cannot activate', () => {
    const e = evaluateRecovery(episode, 'R03', 'quarantinedRelay', true);
    expect(e.gates.source.status).toBe('fail');
    expect(e.gates.policy.status).toBe('pass');
    expect(e.gates.latency.status).toBe('pass');
    expect(e.outcome).toBe('held');
  });

  it('no route activates with an unverified source', () => {
    for (const route of ['R01', 'R02', 'R03'] as const) {
      expect(evaluateRecovery(episode, route, 'verifiedGauge', false).outcome).toBe('held');
    }
  });

  it('is deterministic', () => {
    expect(evaluateRecovery(episode, 'R01', 'verifiedGauge', true)).toEqual(
      evaluateRecovery(episode, 'R01', 'verifiedGauge', true),
    );
  });

  it('the same model gives a different recommendation only because the input changed', () => {
    expect(inferRoute(episode, 'quarantinedRelay').underpassOpen).toBe(true);
    expect(inferRoute(episode, 'verifiedGauge').underpassOpen).toBe(false);
    expect(inferRoute(episode, 'verifiedGauge').recommendation).toBe('Underpass closed. Use the surface route.');
  });
});

describe('opening decision', () => {
  it.each(['hold', 'continue', 'ask'] as const)('%s ends with the van held and leads to the investigation', (choice) => {
    const s = play(initialState(), toInvestigation(choice));
    expect(s.fieldStatus).toBe('held');
    expect(s.openingChoice).toBe(choice);
    expect(s.phase).toBe('investigation');
  });

  it('asking adds the worker report to the evidence', () => {
    expect(play(initialState(), toInvestigation('ask')).viewedEvidence).toContain('E02_FIELD');
    expect(play(initialState(), toInvestigation('hold')).viewedEvidence).not.toContain('E02_FIELD');
  });

  it('the cutscene completion event applies exactly once', () => {
    const s = play(initialState(), toInvestigation());
    const again = step(s, { type: 'enterReconstruction' });
    expect(again.accepted).toBe(false);
    expect(again.state).toBe(s);
  });

  it('cannot enter the reconstruction before deciding', () => {
    expect(step(initialState(), { type: 'enterReconstruction' }).reject).toBe('MISSING_SELECTION');
  });
});

describe('investigation prerequisites', () => {
  const start = () => play(initialState(), toInvestigation());

  it('the capture record needs two frames', () => {
    const one = play(start(), [{ type: 'inspectFrame', index: 0 }]);
    expect(step(one, { type: 'inspectEvidence', id: 'E01_CAMERA' }).reject).toBe('MISSING_EVIDENCE');
    const two = play(one, [{ type: 'inspectFrame', index: 1 }]);
    expect(step(two, { type: 'inspectEvidence', id: 'E01_CAMERA' }).accepted).toBe(true);
  });

  it('looking at the same frame twice does not count as two', () => {
    const s = play(start(), [{ type: 'inspectFrame', index: 1 }, { type: 'inspectFrame', index: 1 }]);
    expect(s.viewedFrames).toEqual([1]);
  });

  it('flagging the feed needs the capture record', () => {
    expect(step(start(), { type: 'flagStaleFeed' }).reject).toBe('MISSING_EVIDENCE');
  });

  it('verifying the source needs both the field report and the gauge, in any order', () => {
    const gaugeOnly = play(start(), [{ type: 'inspectEvidence', id: 'E03_GAUGE' }]);
    expect(step(gaugeOnly, { type: 'verifySource' }).reject).toBe('MISSING_EVIDENCE');
    const both = play(gaugeOnly, [{ type: 'inspectEvidence', id: 'E02_FIELD' }]);
    expect(step(both, { type: 'verifySource' }).accepted).toBe(true);
  });

  it('cannot leave until the feed is flagged and a source is verified', () => {
    expect(step(start(), { type: 'proceedToFieldExit' }).reject).toBe('NOT_CORROBORATED');
  });

  it('hints are limited to the authored set', () => {
    const s = play(start(), [{ type: 'requestHint' }, { type: 'requestHint' }, { type: 'requestHint' }]);
    expect(s.hintsUsed).toBe(3);
    expect(step(s, { type: 'requestHint' }).accepted).toBe(false);
  });
});

describe('field exit', () => {
  it('the surface route needs crew confirmation', () => {
    const s = play(initialState(), [...toInvestigation(), ...investigate]);
    expect(step(s, { type: 'authorizeSurfaceRoute' }).reject).toBe('NOT_CORROBORATED');
    const safe = play(s, [{ type: 'confirmCrewCheck' }, { type: 'authorizeSurfaceRoute' }]);
    expect(safe.fieldStatus).toBe('safe');
    expect(safe.recoveryStatus).toBe('degraded');
  });
});

describe('recovery', () => {
  it('needs the runbook, a source and a route before a test', () => {
    const noRunbook = play(initialState(), [...toInvestigation(), ...investigate, ...exitField.slice(0, 3)]);
    const selected = play(noRunbook, [
      { type: 'selectSource', source: 'verifiedGauge' },
      { type: 'selectRoute', route: 'R03' },
    ]);
    expect(step(selected, { type: 'simulateRecovery' }).reject).toBe('MISSING_EVIDENCE');
    expect(step(atRecovery(), { type: 'simulateRecovery' }).reject).toBe('MISSING_SELECTION');
  });

  it('a failed test keeps the crew safe and dispatch manual', () => {
    const s = play(atRecovery(), test('R01', 'verifiedGauge'));
    expect(s.fieldStatus).toBe('safe');
    expect(s.recoveryStatus).toBe('degraded');
    expect(s.phase).toBe('recovery');
    expect(step(s, { type: 'proceedToBriefing' }).reject).toBe('NOT_RESTORED');
  });

  it('logs one attempt per committed test and none for selections', () => {
    let s = play(atRecovery(), [
      { type: 'selectRoute', route: 'R01' },
      { type: 'selectRoute', route: 'R02' },
      { type: 'selectSource', source: 'quarantinedRelay' },
    ]);
    expect(s.attempts).toHaveLength(0);
    s = play(s, [{ type: 'simulateRecovery' }]);
    expect(s.attempts).toHaveLength(1);
    expect(s.attempts[0]).toMatchObject({ route: 'R02', policyPass: false, requestSent: false, outcome: 'held' });
  });

  it('recovers from wrong choices: R02, R01, R03 with relay, then R03 with gauge', () => {
    const s = play(atRecovery('continue'), [
      ...test('R02', 'verifiedGauge'),
      ...test('R01', 'verifiedGauge'),
      ...test('R03', 'quarantinedRelay'),
      ...test('R03', 'verifiedGauge'),
    ]);
    expect(s.attempts.map((a) => a.outcome)).toEqual(['held', 'held', 'held', 'restored']);
    expect(s.recoveryStatus).toBe('restored');
    expect(step(s, { type: 'simulateRecovery' }).reject).toBe('ALREADY_RESTORED');
  });
});

describe('replay', () => {
  it('restores the recovery checkpoint without leaking earlier choices', () => {
    const done = play(atRecovery(), [
      ...test('R03', 'verifiedGauge'),
      { type: 'proceedToBriefing' },
      { type: 'choosePosition', position: 'betterAI' },
      { type: 'reviewResponse' },
      { type: 'completeEpisode' },
    ]);
    expect(done.phase).toBe('complete');
    const replayed = play(done, [{ type: 'replayCheckpoint' }]);
    expect(replayed).toMatchObject({
      phase: 'recovery',
      selectedRoute: null,
      selectedSource: null,
      recoveryStatus: 'degraded',
      replays: 1,
      fieldStatus: 'safe',
      flaggedStaleFeed: true,
      verifiedSource: true,
    });
    expect(replayed.briefing).toEqual({
      position: null,
      discoveryQuestion: null,
      selfAssessment: {},
      transferChoice: null,
      reviewed: false,
    });
    expect(replayed.viewedEvidence).not.toContain('E06_MARKER');

    // Second replay with a different route: each run stands on its own.
    const second = play(replayed, [...test('R01', 'verifiedGauge')]);
    expect(second.recoveryStatus).toBe('degraded');
    const third = play(second, [...test('R03', 'verifiedGauge'), { type: 'replayCheckpoint' }]);
    expect(third.replays).toBe(2);
    expect(third.selectedRoute).toBeNull();
    expect(third.attempts).toHaveLength(3);
  });

  it('is not available before the recovery checkpoint exists', () => {
    const s = play(initialState(), toInvestigation());
    expect(step(s, { type: 'replayCheckpoint' }).accepted).toBe(false);
  });
});

describe('briefing and debrief', () => {
  const atBriefing = () => play(atRecovery(), [...test('R03', 'verifiedGauge'), { type: 'proceedToBriefing' }]);
  const level = (state: ReturnType<typeof atBriefing>, id: string) =>
    buildDebrief(state, episode).behaviors.find((b) => b.id === id)!.level;

  it('the honest alternative is rewarded', () => {
    const s = play(atBriefing(), [{ type: 'choosePosition', position: 'keepCloud' }, { type: 'reviewResponse' }]);
    expect(level(s, 'acknowledgesAlternative')).toBe('demonstrated');
    expect(buildDebrief(s, episode).followUp).toBe(
      'That could work. What would you measure or verify before committing?',
    );
  });

  it('"better AI" does not get credit for separating model from data', () => {
    const s = play(atBriefing(), [{ type: 'choosePosition', position: 'betterAI' }, { type: 'reviewResponse' }]);
    expect(level(s, 'separatesModelFromData')).toBe('needsEvidence');
    expect(level(s, 'linksRequirement')).toBe('needsEvidence');
  });

  it('"Fabric made the feed trustworthy" does not get credit for explaining the connection', () => {
    const s = play(atBriefing(), [{ type: 'choosePosition', position: 'fabricTrust' }, { type: 'reviewResponse' }]);
    expect(level(s, 'explainsPlacement')).toBe('needsEvidence');
  });

  it('a well-evidenced answer demonstrates all four behaviors', () => {
    const s = play(atBriefing(), [
      { type: 'toggleCite', id: 'E01_CAMERA' },
      { type: 'toggleCite', id: 'E03_GAUGE' },
      { type: 'toggleCite', id: 'E05_RUNBOOK' },
      { type: 'choosePosition', position: 'privateConnection' },
      { type: 'chooseDiscoveryQuestion', id: 'DQ_LATENCY' },
      { type: 'reviewResponse' },
    ]);
    expect(buildDebrief(s, episode).behaviors.map((b) => b.level)).toEqual([
      'demonstrated',
      'demonstrated',
      'demonstrated',
      'demonstrated',
    ]);
  });

  it('the first answer can be skipped and the second question still appears', () => {
    const s = play(atBriefing(), [{ type: 'reviewResponse' }]);
    const debrief = buildDebrief(s, episode);
    expect(debrief.followUp).toBeNull();
    expect(debrief.secondQuestion).toBe('What would you ask our provider to prove before we change the design?');
  });

  it('an irrelevant discovery question earns partial credit only', () => {
    const s = play(atBriefing(), [{ type: 'chooseDiscoveryQuestion', id: 'DQ_GPU' }, { type: 'reviewResponse' }]);
    expect(level(s, 'acknowledgesAlternative')).toBe('partial');
  });

  it('cannot complete before the debrief is reviewed', () => {
    expect(step(atBriefing(), { type: 'completeEpisode' }).reject).toBe('NOT_REVIEWED');
  });

  it('completion reveals the marker, which has no effect on the result', () => {
    const s = play(atBriefing(), [{ type: 'reviewResponse' }, { type: 'completeEpisode' }]);
    expect(s.viewedEvidence).toContain('E06_MARKER');
    expect(s.recoveryStatus).toBe('restored');
  });
});

describe('phase guards', () => {
  it('rejects actions from the wrong phase without changing state', () => {
    const s = initialState();
    for (const action of [
      { type: 'flagStaleFeed' },
      { type: 'simulateRecovery' },
      { type: 'authorizeSurfaceRoute' },
      { type: 'reviewResponse' },
    ] as Action[]) {
      const result = step(s, action);
      expect(result.accepted).toBe(false);
      expect(result.state).toBe(s);
    }
  });
});
