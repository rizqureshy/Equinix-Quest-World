// Episode definition types and build-time validation.
// An episode is versioned data: the simulation and the presentation both read it.

export type RouteId = 'R01' | 'R02' | 'R03';
export type SourceId = 'verifiedGauge' | 'quarantinedRelay';
export type EvidenceId =
  | 'E01_CAMERA'
  | 'E02_FIELD'
  | 'E03_GAUGE'
  | 'E04_MODEL'
  | 'E05_RUNBOOK'
  | 'E06_MARKER';
export type PositionId = 'betterAI' | 'fabricTrust' | 'privateConnection' | 'keepCloud';
export type BehaviorId = 'separatesModelFromData' | 'explainsPlacement' | 'linksRequirement' | 'acknowledgesAlternative';
export type NodeId = 'backup' | 'partner' | 'cloud';

export type PlateId =
  | 'street'
  | 'hold'
  | 'nearMiss'
  | 'crossover'
  | 'turnout'
  | 'pursuit'
  | 'ibx'
  | 'surface'
  | 'marker';

/** One caption line. `speaker: null` is a stage direction (shown in the transcript and as scene text). */
export interface Line {
  speaker: string | null;
  text: string;
  plate?: PlateId;
}

export interface Beat {
  id: string;
  title: string;
  lines: Line[];
}

export interface Frame {
  id: string;
  source: string;
  captureTime: string;
  captureSequence: number;
  arrivalTime: string;
  description: string;
}

export interface Evidence {
  id: EvidenceId;
  title: string;
  source: string;
  /** What the player reads. */
  summary: string;
  details: { label: string; value: string }[];
  /** Field note shown in the end-of-episode review. */
  fieldNote: string;
}

export interface RouteDef {
  id: RouteId;
  name: string;
  configuration: string;
  simulatedP95Ms: number;
  policy: 'approved' | 'disallowed';
  policyNote: string;
  /** Scene nodes the path travels through, partner first. */
  via: string[];
}

export interface SourceDef {
  id: SourceId;
  name: string;
  description: string;
}

export interface NodeDef {
  id: NodeId;
  name: string;
  owner: string;
  description: string;
}

export interface Position {
  id: PositionId;
  statement: string;
  followUp: string;
}

export interface DiscoveryQuestion {
  id: string;
  text: string;
  relevant: boolean;
  feedback: string;
}

export interface TransferOption {
  id: string;
  text: string;
  best: boolean;
  feedback: string;
}

export interface EpisodeDefinition {
  id: string;
  contentVersion: string;
  title: string;
  tagline: string;
  scenario: {
    responseTargetMs: number;
    closureThresholdM: number;
    gaugeReadingM: number;
    gaugeReadingTime: string;
  };
  frames: Frame[];
  evidence: Evidence[];
  routes: RouteDef[];
  sources: SourceDef[];
  nodes: NodeDef[];
  beats: Record<string, Beat>;
  hints: string[];
  positions: Position[];
  discoveryQuestions: DiscoveryQuestion[];
  behaviors: { id: BehaviorId; label: string }[];
  briefing: {
    question: string;
    secondQuestion: string;
    exampleResponse: string;
    alternativeNote: string;
    nextDiscoveryQuestion: string;
  };
  transfer: {
    situation: string;
    prompt: string;
    options: TransferOption[];
    reveal: string;
  };
  missionNotes: Record<string, { term: string; note: string }>;
  copy: Record<string, string>;
}

/** Returns a list of problems. Empty means the definition is internally consistent. */
export function validateEpisode(def: EpisodeDefinition): string[] {
  const errors: string[] = [];
  const unique = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`${label}: duplicate id ${id}`);
      seen.add(id);
    }
  };
  unique('frames', def.frames.map((f) => f.id));
  unique('evidence', def.evidence.map((e) => e.id));
  unique('routes', def.routes.map((r) => r.id));
  unique('sources', def.sources.map((s) => s.id));
  unique('nodes', def.nodes.map((n) => n.id));
  unique('positions', def.positions.map((p) => p.id));
  unique('discoveryQuestions', def.discoveryQuestions.map((q) => q.id));
  unique('transfer', def.transfer.options.map((o) => o.id));
  unique('beats', Object.values(def.beats).map((b) => b.id));

  for (const [key, beat] of Object.entries(def.beats)) {
    if (beat.id !== key) errors.push(`beats: key ${key} does not match id ${beat.id}`);
    if (beat.lines.length === 0) errors.push(`beats: ${key} has no lines`);
  }
  for (const id of ['R01', 'R02', 'R03'] as const) {
    if (!def.routes.some((r) => r.id === id)) errors.push(`routes: missing ${id}`);
  }
  for (const id of ['E01_CAMERA', 'E02_FIELD', 'E03_GAUGE', 'E04_MODEL', 'E05_RUNBOOK', 'E06_MARKER'] as const) {
    if (!def.evidence.some((e) => e.id === id)) errors.push(`evidence: missing ${id}`);
  }
  if (def.frames.length !== 3) errors.push('frames: the camera fixture needs exactly three captures');
  if (new Set(def.frames.map((f) => f.captureSequence)).size !== 1) {
    errors.push('frames: all captures must reuse one capture sequence');
  }
  if (new Set(def.frames.map((f) => f.arrivalTime)).size !== def.frames.length) {
    errors.push('frames: arrival times must differ');
  }
  if (def.transfer.options.filter((o) => o.best).length !== 1) {
    errors.push('transfer: exactly one best option is required');
  }
  if (def.hints.length === 0) errors.push('hints: at least one hint is required');
  return errors;
}
