import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Quality } from '../platform/settings';
import { QUALITY_TIERS } from './quality';
import type { CameraPose, SceneModule } from './reconstruction/kit';
import { createTopology } from './reconstruction/topology';
import { createUnderpass } from './reconstruction/underpass';
import type { PickId, SceneViewData } from './views';

export interface SceneControllerOptions {
  kind: SceneViewData['kind'];
  quality: Quality;
  reducedMotion: boolean;
  onPick: (id: PickId) => void;
  onContextLost: () => void;
}

declare global {
  interface Window {
    /** Count of running render loops. Tests use it to catch duplicate loops. */
    __signalRunLoops?: number;
  }
}

/**
 * Owns the canvas: one renderer, one scene, one animation loop. It draws the
 * view it is given and reports clicks. It holds no story state.
 */
export class SceneController {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly module: SceneModule;
  private readonly raycaster = new THREE.Raycaster();
  private readonly resizeObserver: ResizeObserver;
  private readonly timer = new THREE.Timer();
  private reducedMotion: boolean;
  private maxPixelRatio: number;
  private frame = 0;
  private running = false;
  private disposed = false;
  private pointerDown: { x: number; y: number } | null = null;
  private tween: { from: CameraPose; to: CameraPose; start: number } | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly options: SceneControllerOptions,
  ) {
    const tier = QUALITY_TIERS[options.quality];
    this.reducedMotion = options.reducedMotion;
    this.maxPixelRatio = tier.maxPixelRatio;

    // Throws when WebGL2 is unavailable. The caller falls back to the 2D view.
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: tier.antialias, powerPreference: 'high-performance' });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.module =
      options.kind === 'underpass'
        ? createUnderpass({ rain: tier.rain && !options.reducedMotion })
        : createTopology();

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.5, 400);
    this.camera.position.copy(this.module.home.position);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.copy(this.module.home.target);
    this.controls.enableDamping = !options.reducedMotion;
    this.controls.minDistance = 12;
    this.controls.maxDistance = 70;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.08;
    this.controls.keyPanSpeed = 18;
    this.controls.listenToKeyEvents(canvas);
    this.controls.update();

    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('webglcontextlost', this.onContextLost);
    document.addEventListener('visibilitychange', this.onVisibility);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement ?? canvas);
    this.resize();
    this.start();
  }

  setView(view: SceneViewData) {
    if (!this.disposed) this.module.setView(view);
  }

  setReducedMotion(reduced: boolean) {
    this.reducedMotion = reduced;
    this.controls.enableDamping = !reduced;
  }

  setQuality(quality: Quality) {
    this.maxPixelRatio = QUALITY_TIERS[quality].maxPixelRatio;
    this.resize();
  }

  /** Moves the camera to a named point of interest, or home when no id is given. */
  focus(id: string | null) {
    const to = (id && this.module.focusTargets[id]) || this.module.home;
    if (this.reducedMotion) {
      this.camera.position.copy(to.position);
      this.controls.target.copy(to.target);
      this.controls.update();
      return;
    }
    this.tween = {
      from: { position: this.camera.position.clone(), target: this.controls.target.clone() },
      to,
      start: this.timer.getElapsed(),
    };
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.controls.dispose();
    this.module.dispose();
    this.renderer.dispose();
    this.timer.dispose();
  }

  private start() {
    if (this.running || this.disposed || document.hidden) return;
    this.running = true;
    window.__signalRunLoops = (window.__signalRunLoops ?? 0) + 1;
    this.frame = requestAnimationFrame(this.tick);
  }

  private stop() {
    if (!this.running) return;
    this.running = false;
    window.__signalRunLoops = Math.max(0, (window.__signalRunLoops ?? 1) - 1);
    cancelAnimationFrame(this.frame);
  }

  private readonly tick = (timestamp: number) => {
    if (!this.running) return;
    this.timer.update(timestamp);
    const time = this.timer.getElapsed();

    if (this.tween) {
      const t = Math.min(1, (time - this.tween.start) / 0.9);
      const eased = t * t * (3 - 2 * t);
      this.camera.position.lerpVectors(this.tween.from.position, this.tween.to.position, eased);
      this.controls.target.lerpVectors(this.tween.from.target, this.tween.to.target, eased);
      if (t >= 1) this.tween = null;
    }
    this.controls.update();
    this.module.update(time, !this.reducedMotion);
    this.renderer.render(this.module.scene, this.camera);
    this.frame = requestAnimationFrame(this.tick);
  };

  private resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const width = Math.max(1, parent.clientWidth);
    const height = Math.max(1, parent.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.maxPixelRatio));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private pick(event: PointerEvent): PickId | null {
    const rect = this.canvas.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.module.pickables, true)[0];
    let object: THREE.Object3D | null = hit?.object ?? null;
    while (object) {
      if (object.userData.pickId) return object.userData.pickId as PickId;
      object = object.parent;
    }
    return null;
  }

  private readonly onPointerDown = (event: PointerEvent) => {
    this.pointerDown = { x: event.clientX, y: event.clientY };
    this.tween = null;
  };

  private readonly onPointerUp = (event: PointerEvent) => {
    const down = this.pointerDown;
    this.pointerDown = null;
    // A drag orbits the camera. Only a still click selects.
    if (!down || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) return;
    const id = this.pick(event);
    if (id) this.options.onPick(id);
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    if (this.pointerDown) return;
    this.canvas.style.cursor = this.pick(event) ? 'pointer' : 'grab';
  };

  private readonly onContextLost = (event: Event) => {
    event.preventDefault();
    this.stop();
    this.options.onContextLost();
  };

  private readonly onVisibility = () => {
    if (document.hidden) this.stop();
    else this.start();
  };
}
