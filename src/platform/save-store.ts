import { z } from 'zod';
import type { EpisodeState } from '../simulation/state';

// Local device progress. Nothing here leaves the browser.

const evidenceId = z.enum(['E01_CAMERA', 'E02_FIELD', 'E03_GAUGE', 'E04_MODEL', 'E05_RUNBOOK', 'E06_MARKER']);
const routeId = z.enum(['R01', 'R02', 'R03']);
const sourceId = z.enum(['verifiedGauge', 'quarantinedRelay']);
const level = z.enum(['demonstrated', 'partial', 'needsEvidence']);
const behaviorId = z.enum(['separatesModelFromData', 'explainsPlacement', 'linksRequirement', 'acknowledgesAlternative']);

const stateSchema = z.strictObject({
  version: z.literal(1),
  phase: z.enum(['coldOpen', 'investigation', 'fieldExit', 'recovery', 'briefing', 'complete']),
  fieldStatus: z.enum(['moving', 'held', 'safe']),
  openingChoice: z.enum(['hold', 'continue', 'ask']).nullable(),
  viewedFrames: z.array(z.number().int().min(0).max(2)),
  viewedEvidence: z.array(evidenceId),
  citedEvidence: z.array(evidenceId),
  flaggedStaleFeed: z.boolean(),
  verifiedSource: z.boolean(),
  crewConfirmed: z.boolean(),
  selectedSource: sourceId.nullable(),
  selectedRoute: routeId.nullable(),
  recoveryStatus: z.enum(['degraded', 'restored']),
  checkpoint: z.enum(['investigation', 'fieldExit', 'recovery']).nullable(),
  attempts: z.array(
    z.strictObject({
      route: routeId,
      source: sourceId,
      sourcePass: z.boolean(),
      policyPass: z.boolean(),
      responseTimePass: z.boolean(),
      requestSent: z.boolean(),
      reasonCodes: z.array(z.string()),
      outcome: z.enum(['held', 'restored']),
    }),
  ),
  replays: z.number().int().min(0),
  hintsUsed: z.number().int().min(0),
  briefing: z.strictObject({
    position: z.enum(['betterAI', 'fabricTrust', 'privateConnection', 'keepCloud']).nullable(),
    discoveryQuestion: z.string().nullable(),
    selfAssessment: z.partialRecord(behaviorId, level),
    transferChoice: z.string().nullable(),
    reviewed: z.boolean(),
  }),
});

const envelopeSchema = z.object({
  episodeId: z.string(),
  contentVersion: z.string(),
  state: stateSchema,
});

export type LoadResult =
  | { status: 'none' }
  | { status: 'ok'; state: EpisodeState }
  | { status: 'corrupt' }
  | { status: 'unavailable' };

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const saveKey = (episodeId: string) => `signal-run/${episodeId}/save`;

export function loadSave(store: KeyValueStore | null, episodeId: string): LoadResult {
  if (!store) return { status: 'unavailable' };
  let raw: string | null;
  try {
    raw = store.getItem(saveKey(episodeId));
  } catch {
    return { status: 'unavailable' };
  }
  if (raw === null) return { status: 'none' };
  try {
    const parsed = envelopeSchema.safeParse(JSON.parse(raw));
    if (!parsed.success || parsed.data.episodeId !== episodeId) return { status: 'corrupt' };
    return { status: 'ok', state: parsed.data.state as EpisodeState };
  } catch {
    return { status: 'corrupt' };
  }
}

/** Returns false when storage is unavailable or full. Play continues in memory. */
export function writeSave(
  store: KeyValueStore | null,
  episodeId: string,
  contentVersion: string,
  state: EpisodeState,
): boolean {
  if (!store) return false;
  try {
    store.setItem(saveKey(episodeId), JSON.stringify({ episodeId, contentVersion, state }));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(store: KeyValueStore | null, episodeId: string): void {
  try {
    store?.removeItem(saveKey(episodeId));
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

export function browserStore(): KeyValueStore | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}
