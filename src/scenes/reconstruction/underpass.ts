import * as THREE from 'three';
import type { SceneViewData, UnderpassView } from '../views';
import {
  PALETTE,
  box,
  disposeScene,
  edges,
  glow,
  label,
  pose,
  seeded,
  standard,
  tagPick,
  type SceneModule,
} from './kit';

const LOOP_SECONDS = 4.5;
/** The single authored instant every capture shows: truck inside the camera plane. */
const CAPTURE_U = 0.6;
const TRUCK_START_X = -36;
const TRUCK_END_X = 8;

/**
 * The district around the underpass, as the Reconstruction draws it.
 * The truck has one authored motion track. Each "new" arrival replays that same
 * track, which is the clue: nothing new was ever captured.
 */
export function createUnderpass(options: { rain: boolean }): SceneModule {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.background);
  scene.fog = new THREE.FogExp2(PALETTE.background, 0.0075);

  scene.add(new THREE.HemisphereLight(0xa9ccff, 0x1a2c40, 2.2));
  const key = new THREE.DirectionalLight(0xd6e6ff, 2.6);
  key.position.set(-24, 34, 14);
  scene.add(key);

  // Ground and survey grid.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), standard(PALETTE.ground, { flatShading: false }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const grid = new THREE.GridHelper(220, 110, PALETTE.grid, PALETTE.grid);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.35;
  grid.position.y = 0.01;
  scene.add(grid);

  // Road along X, passing under a bridge that runs along Z.
  scene.add(box(200, 0.06, 8, standard(0x1a2634), 0, 0.03, 0));
  for (const z of [-4.1, 4.1]) scene.add(box(200, 0.1, 0.18, glow(PALETTE.edge, 0.9), 0, 0.06, z));
  const dashGeometry = new THREE.BoxGeometry(1.6, 0.02, 0.16);
  const dashes = new THREE.InstancedMesh(dashGeometry, glow(0x8fb0cc, 0.9), 34);
  const m = new THREE.Matrix4();
  for (let i = 0; i < 34; i++) {
    m.setPosition(-54 + i * 3.3, 0.08, 0);
    dashes.setMatrixAt(i, m);
  }
  scene.add(dashes);

  const deck = box(12, 1.3, 44, standard(PALETTE.structureLight), 0, 6.2, 0);
  edges(deck);
  scene.add(deck);
  for (const z of [-13, 13]) {
    const abutment = box(12, 5.6, 18, standard(PALETTE.structure), 0, 2.8, z);
    edges(abutment);
    scene.add(abutment);
  }

  // City blocks, placed deterministically. They form a backdrop behind the road
  // and to the far sides, so nothing stands between the viewer and the evidence.
  const random = seeded(8041);
  const blockCount = 54;
  const blocks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), standard(0xffffff), blockCount);
  const color = new THREE.Color();
  const q = new THREE.Quaternion();
  const outline: number[] = [];
  const unitEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)).getAttribute('position');
  const corner = new THREE.Vector3();
  let placed = 0;
  while (placed < blockCount) {
    const x = -90 + random() * 180;
    const z = -90 + random() * 150;
    const behind = z < -17;
    const farSide = Math.abs(x) > 58 && z < 30;
    if (!(behind || farSide) || (Math.abs(x) < 10 && z > -40)) continue;
    const w = 6 + random() * 9;
    const d = 6 + random() * 9;
    const h = 5 + random() * (behind ? 22 : 10);
    m.compose(new THREE.Vector3(x, h / 2, z), q, new THREE.Vector3(w, h, d));
    blocks.setMatrixAt(placed, m);
    color.setHex(PALETTE.structure).lerp(new THREE.Color(PALETTE.structureLight), random());
    blocks.setColorAt(placed, color);
    for (let i = 0; i < unitEdges.count; i++) {
      corner.fromBufferAttribute(unitEdges, i).applyMatrix4(m);
      outline.push(corner.x, corner.y, corner.z);
    }
    placed++;
  }
  scene.add(blocks);
  // One merged outline for every block: a single draw call.
  const outlineGeometry = new THREE.BufferGeometry();
  outlineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(outline, 3));
  scene.add(
    new THREE.LineSegments(outlineGeometry, new THREE.LineBasicMaterial({ color: PALETTE.edge, transparent: true, opacity: 0.55 })),
  );

  // Camera relay: pole, head, the camera plane and its sight lines.
  const cameraGroup = tagPick(new THREE.Group(), 'camera');
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 6.4, 6), standard(PALETTE.neutral));
  pole.position.set(-15, 3.2, 5.6);
  const head = box(1.2, 0.6, 0.6, standard(PALETTE.neutral), -14.6, 6.4, 5.3);
  cameraGroup.add(pole, head);

  const feedMaterial = new THREE.MeshBasicMaterial({
    color: PALETTE.cyan,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), feedMaterial);
  plane.rotation.y = Math.PI / 2;
  plane.position.set(-9, 2.6, 0);
  const feedLineMaterial = new THREE.LineBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0.9 });
  plane.add(new THREE.LineSegments(new THREE.EdgesGeometry(plane.geometry), feedLineMaterial));
  cameraGroup.add(plane);

  const headPoint = new THREE.Vector3(-14.2, 6.4, 5.2);
  const corners = [
    [-9, 0.1, -4],
    [-9, 0.1, 4],
    [-9, 5.1, -4],
    [-9, 5.1, 4],
  ] as const;
  const sight = new THREE.BufferGeometry().setFromPoints(
    corners.flatMap(([x, y, z]) => [headPoint, new THREE.Vector3(x, y, z)]),
  );
  cameraGroup.add(new THREE.LineSegments(sight, feedLineMaterial));

  // Three arrival pips. They advance with the scrubber while the truck does not.
  const pipOff = standard(0x2a3d50);
  const pipOn = glow(PALETTE.cyan, 2.2);
  const pips = [-1.4, 0, 1.4].map((z) => {
    const pip = box(0.5, 0.5, 0.5, pipOff, -9, 5.9, z);
    cameraGroup.add(pip);
    return pip;
  });
  const cameraLabel = label('CAMERA RELAY');
  cameraLabel.position.set(-15, 8, 5.6);
  cameraGroup.add(cameraLabel);
  scene.add(cameraGroup);

  // Street lamp. Its flicker is a function of loop time, so it repeats exactly.
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 5.6, 6), standard(PALETTE.neutral));
  lampPole.position.set(-11, 2.8, -5.4);
  const bulbMaterial = glow(0xffe2a8, 2);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), bulbMaterial);
  bulb.position.set(-11, 5.7, -4.9);
  const lampLight = new THREE.PointLight(0xffd9a0, 30, 22, 2);
  lampLight.position.copy(bulb.position);
  scene.add(lampPole, bulb, lampLight);

  // The truck.
  const truck = tagPick(new THREE.Group(), 'camera');
  const truckMaterial = standard(PALETTE.truck, { transparent: true });
  const trailer = box(6, 2.7, 2.5, truckMaterial, -1, 2.05, 0);
  const cab = box(2, 2.1, 2.4, truckMaterial, 3.2, 1.75, 0);
  edges(trailer, 0x9cc4ff, 0.7);
  edges(cab, 0x9cc4ff, 0.7);
  truck.add(trailer, cab);
  const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 10);
  const wheelMaterial = standard(0x05080d);
  for (const [x, z] of [[-3, 1.15], [-3, -1.15], [-0.6, 1.15], [-0.6, -1.15], [3.2, 1.15], [3.2, -1.15]] as const) {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.5, z);
    truck.add(wheel);
  }
  const headlights = box(0.1, 0.3, 1.8, glow(0xfff1c4, 3), 4.25, 1.2, 0);
  truck.add(headlights);
  const sprayMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const spray = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4.2, 9, 1, true), sprayMaterial);
  spray.rotation.z = -Math.PI / 2 - 0.25;
  spray.position.set(-5.6, 1.1, 0);
  truck.add(spray);
  truck.position.z = -1.6;
  scene.add(truck);

  // Pump house, the worker, and gauge 14 on its separate line.
  const fieldGroup = tagPick(new THREE.Group(), 'field');
  const pumpHouse = box(4.5, 3, 4.5, standard(PALETTE.structureLight), 15, 1.5, 12);
  edges(pumpHouse);
  const workerMaterial = standard(PALETTE.skin, { emissive: PALETTE.skin, emissiveIntensity: 0.25 });
  const worker = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 1, 3, 8), workerMaterial);
  worker.position.set(13, 0.85, 8.6);
  const fieldRing = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.9, 24), new THREE.MeshBasicMaterial({ color: PALETTE.skin, side: THREE.DoubleSide }));
  fieldRing.rotation.x = -Math.PI / 2;
  fieldRing.position.set(13, 0.05, 8.6);
  const fieldLabel = label('FIELD REPORT · PUMP HOUSE', '#f0c8a4');
  fieldLabel.position.set(15, 4.4, 12);
  fieldGroup.add(pumpHouse, worker, fieldRing, fieldLabel);
  scene.add(fieldGroup);

  const gaugeGroup = tagPick(new THREE.Group(), 'gauge');
  const gaugePost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 6), standard(PALETTE.neutral));
  gaugePost.position.set(9.5, 1.7, 6.2);
  const gaugeMaterial = glow(PALETTE.amber, 1.8);
  const gaugeScale = 3; // metres of water to scene units, exaggerated for legibility
  const level = box(0.9, 1, 0.9, gaugeMaterial, 9.5, 0, 6.2);
  const threshold = box(1.7, 0.08, 1.7, glow(0xffffff, 1.2), 9.5, 0.3 * gaugeScale, 6.2);
  const gaugeRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 24), new THREE.MeshBasicMaterial({ color: PALETTE.amber, side: THREE.DoubleSide }));
  gaugeRing.rotation.x = -Math.PI / 2;
  gaugeRing.position.set(9.5, 0.05, 6.2);
  const gaugeLabel = label('GAUGE 14 · PARTNER LINE', '#ffd08a');
  gaugeLabel.position.set(9.5, 4.6, 6.2);
  gaugeGroup.add(gaugePost, level, threshold, gaugeRing, gaugeLabel);
  scene.add(gaugeGroup);

  // Water under the bridge. Drawn only once a connected source has reported it.
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.amber,
    transparent: true,
    opacity: 0.4,
    roughness: 0.2,
    metalness: 0.3,
    depthWrite: false,
  });
  const water = box(26, 0.76 * 1.4, 7.9, waterMaterial, 2, 0.55, 0);
  water.visible = false;
  scene.add(water);

  // Rain.
  let rain: THREE.Points | null = null;
  const rainCount = 1400;
  if (options.rain) {
    const positions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = -50 + random() * 100;
      positions[i * 3 + 1] = random() * 34;
      positions[i * 3 + 2] = -40 + random() * 80;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    rain = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ color: 0x9fc4e6, size: 0.14, transparent: true, opacity: 0.55, depthWrite: false }),
    );
    scene.add(rain);
  }

  let view: UnderpassView = {
    kind: 'underpass',
    cameraOpen: false,
    frameIndex: 0,
    playing: false,
    feedStale: false,
    gaugeViewed: false,
    gaugeVerified: false,
    fieldViewed: false,
  };

  const applyView = () => {
    const feedColor = view.feedStale ? PALETTE.amber : PALETTE.cyan;
    feedMaterial.color.setHex(feedColor);
    feedMaterial.opacity = view.cameraOpen ? 0.16 : 0.08;
    feedLineMaterial.color.setHex(feedColor);
    pipOn.color.setHex(feedColor);
    pipOn.emissive.setHex(feedColor);
    pips.forEach((pip, i) => {
      pip.material = view.cameraOpen && i === view.frameIndex ? pipOn : pipOff;
    });
    // A stale capture is drawn as a ghost: amber and see-through.
    truckMaterial.color.setHex(view.feedStale ? PALETTE.amber : PALETTE.truck);
    truckMaterial.opacity = view.feedStale ? 0.45 : 1;

    const gaugeColor = view.gaugeVerified ? PALETTE.cyan : PALETTE.amber;
    gaugeMaterial.color.setHex(gaugeColor);
    gaugeMaterial.emissive.setHex(gaugeColor);
    (gaugeRing.material as THREE.MeshBasicMaterial).color.setHex(gaugeColor);
    const h = view.gaugeViewed ? 0.76 * gaugeScale : 0.12;
    level.scale.y = h;
    level.position.y = h / 2;
    threshold.visible = view.gaugeViewed;
    water.visible = view.gaugeViewed;
    waterMaterial.color.setHex(view.gaugeVerified ? 0x2a9db5 : PALETTE.amber);
    waterMaterial.opacity = view.gaugeVerified ? 0.6 : 0.35;
    workerMaterial.emissiveIntensity = view.fieldViewed ? 0.9 : 0.25;
  };
  applyView();

  const poseTruck = (u: number) => {
    truck.position.x = TRUCK_START_X + (TRUCK_END_X - TRUCK_START_X) * u;
    // Deterministic flicker and spray, keyed to loop position only.
    const flicker = Math.sin(u * 61) * Math.sin(u * 23) > 0.15 ? 1 : 0.25;
    bulbMaterial.emissiveIntensity = 2.4 * flicker;
    lampLight.intensity = 34 * flicker;
    const fan = 0.85 + 0.25 * Math.sin(u * 40);
    spray.scale.set(fan, 1, fan);
  };
  poseTruck(CAPTURE_U);

  return {
    scene,
    pickables: [cameraGroup, truck, fieldGroup, gaugeGroup],
    home: pose(-26, 22, 40, -2, 1.5, 0),
    focusTargets: {
      camera: pose(-26, 8, 17, -9, 2.4, 0),
      gauge: pose(27, 8, 1, 10, 1.6, 7.5),
      field: pose(30, 7, 22, 14, 1.4, 10),
    },
    setView(next: SceneViewData) {
      if (next.kind !== 'underpass') return;
      view = next;
      applyView();
    },
    update(time: number, motion: boolean) {
      const playing = view.playing && motion;
      poseTruck(playing ? (time % LOOP_SECONDS) / LOOP_SECONDS : CAPTURE_U);
      if (rain && motion) {
        const attribute = rain.geometry.getAttribute('position') as THREE.BufferAttribute;
        const array = attribute.array as Float32Array;
        for (let i = 1; i < array.length; i += 3) {
          // Position from absolute time, so pausing and resuming never drifts.
          const base = (i * 7.31) % 34;
          array[i] = 34 - ((base + time * 26) % 34);
        }
        attribute.needsUpdate = true;
      }
      if (water.visible && motion) water.position.y = 0.55 + Math.sin(time * 1.3) * 0.03;
    },
    dispose() {
      disposeScene(scene);
    },
  };
}
