import type { RouteId } from '../content/schema';

// Plain data handed to a scene. Both the 3D renderer and the 2D schematic draw
// from the same view, and neither can change it.

export interface UnderpassView {
  kind: 'underpass';
  cameraOpen: boolean;
  frameIndex: number;
  playing: boolean;
  feedStale: boolean;
  gaugeViewed: boolean;
  gaugeVerified: boolean;
  fieldViewed: boolean;
}

export interface TopologyView {
  kind: 'topology';
  selectedRoute: RouteId | null;
  attempt: {
    route: RouteId;
    requestSent: boolean;
    policyPass: boolean;
    outcome: 'held' | 'restored';
  } | null;
  attemptCount: number;
  restored: boolean;
}

export type SceneViewData = UnderpassView | TopologyView;
export type PickId = 'camera' | 'gauge' | 'field' | 'backup' | 'partner' | 'cloud' | RouteId;
