import type { Quality } from '../platform/settings';

export interface QualityTier {
  maxPixelRatio: number;
  antialias: boolean;
  rain: boolean;
}

// Starting values from the blueprint. Revise after measuring on real hardware.
export const QUALITY_TIERS: Record<Quality, QualityTier> = {
  standard: { maxPixelRatio: 1.25, antialias: true, rain: true },
  low: { maxPixelRatio: 1, antialias: false, rain: false },
};

let cached: boolean | null = null;

/** A capability check is only a starting point: renderer creation can still fail. */
export function webgl2Available(): boolean {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement('canvas');
    cached = !!canvas.getContext('webgl2');
  } catch {
    cached = false;
  }
  return cached;
}
