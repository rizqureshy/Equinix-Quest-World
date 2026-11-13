import * as THREE from 'three';
import type { SceneViewData } from '../views';

export const PALETTE = {
  background: 0x0a121c,
  ground: 0x101e2e,
  grid: 0x24445e,
  structure: 0x1f3a56,
  structureLight: 0x315778,
  edge: 0x4a9ab8,
  cyan: 0x38d9e8,
  amber: 0xffb347,
  blocked: 0xff6b5e,
  truck: 0x2f6fd0,
  skin: 0xe8b48a,
  neutral: 0x9fb4c8,
};

export interface CameraPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

export interface SceneModule {
  scene: THREE.Scene;
  pickables: THREE.Object3D[];
  home: CameraPose;
  focusTargets: Record<string, CameraPose>;
  setView(view: SceneViewData): void;
  /** `motion` is false under reduced motion: hold a fixed, readable pose. */
  update(time: number, motion: boolean): void;
  dispose(): void;
}

export const pose = (px: number, py: number, pz: number, tx: number, ty: number, tz: number): CameraPose => ({
  position: new THREE.Vector3(px, py, pz),
  target: new THREE.Vector3(tx, ty, tz),
});

export function standard(color: number, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05, flatShading: true, ...extra });
}

export function glow(color: number, intensity = 1.6, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.4,
    flatShading: true,
    ...extra,
  });
}

export function box(w: number, h: number, d: number, material: THREE.Material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
}

/** Outline that gives the reconstruction its faceted, drawn look. */
export function edges(mesh: THREE.Mesh, color = PALETTE.edge, opacity = 0.9) {
  const lines = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
  mesh.add(lines);
  return lines;
}

/** Text sprite for landmarks. DOM controls carry the same names for assistive tech. */
export function label(text: string, color = '#9fd8e4', scale = 1) {
  const canvas = document.createElement('canvas');
  const pad = 16;
  const font = '600 34px ui-sans-serif, system-ui, sans-serif';
  const probe = canvas.getContext('2d')!;
  probe.font = font;
  canvas.width = Math.ceil(probe.measureText(text).width) + pad * 2;
  canvas.height = 58;
  const ctx = canvas.getContext('2d')!;
  ctx.font = font;
  ctx.fillStyle = 'rgba(8,16,26,0.78)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, pad, canvas.height / 2 + 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, fog: false }),
  );
  const h = 0.9 * scale;
  sprite.scale.set((canvas.width / canvas.height) * h, h, 1);
  sprite.renderOrder = 10;
  return sprite;
}

export function tagPick<T extends THREE.Object3D>(object: T, pickId: string): T {
  object.userData.pickId = pickId;
  return object;
}

/** Deterministic pseudo-random numbers so the city is identical on every visit. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    const o = object as THREE.Mesh;
    o.geometry?.dispose?.();
    const materials = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of materials) {
      (m as THREE.SpriteMaterial).map?.dispose?.();
      m.dispose();
    }
  });
  scene.clear();
}
