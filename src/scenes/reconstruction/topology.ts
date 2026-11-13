import * as THREE from 'three';
import type { RouteId } from '../../content/schema';
import type { SceneViewData, TopologyView } from '../views';
import { PALETTE, box, disposeScene, edges, glow, label, pose, standard, tagPick, type SceneModule } from './kit';

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const BACKUP = v(-9, 2.2, 0);
const PARTNER = v(13, 1.6, 8);
const CLOUD = v(13, 6.5, -9);
const GATEWAY = v(1, 1.2, 15);
const PUBLIC = v(4, 1.2, -3.5);

interface RouteVisual {
  id: RouteId;
  curve: THREE.CatmullRomCurve3;
  material: THREE.MeshStandardMaterial;
  pulses: THREE.Mesh[];
  speed: number;
}

/**
 * The recovery view: the city backup at the IBX site, the sensor partner, the
 * cloud model, and the three candidate paths between them. Feed traffic flows
 * from the partner to the backup. The model call goes from the backup to the cloud.
 */
export function createTopology(): SceneModule {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.background);
  scene.fog = new THREE.FogExp2(PALETTE.background, 0.012);
  scene.add(new THREE.HemisphereLight(0xa9ccff, 0x1a2c40, 2));
  const key = new THREE.DirectionalLight(0xd6e6ff, 2.2);
  key.position.set(-10, 26, 18);
  scene.add(key);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), standard(PALETTE.ground, { flatShading: false }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const grid = new THREE.GridHelper(160, 80, PALETTE.grid, PALETTE.grid);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.35;
  grid.position.y = 0.01;
  scene.add(grid);

  const pickables: THREE.Object3D[] = [];

  // City backup dispatcher: a rack row on the IBX site platform.
  const backup = tagPick(new THREE.Group(), 'backup');
  const platform = box(17, 0.25, 9, standard(PALETTE.structure), -10, 0.12, 0);
  edges(platform, PALETTE.cyan, 0.7);
  backup.add(platform);
  const rackMaterial = standard(0x121d2b, { roughness: 0.45, metalness: 0.5 });
  const ledMaterial = glow(PALETTE.cyan, 2);
  for (let i = 0; i < 6; i++) {
    const rack = box(1.5, 3.6, 2.4, rackMaterial, -15.5 + i * 2.2, 2.05, -1);
    edges(rack, PALETTE.edge, 0.8);
    backup.add(rack);
    for (let j = 0; j < 5; j++) {
      backup.add(box(1.0, 0.07, 0.05, ledMaterial, -15.5 + i * 2.2, 0.9 + j * 0.6, 0.23));
    }
  }
  const backupLabel = label('CITY BACKUP DISPATCHER · IBX SITE');
  backupLabel.position.set(-10, 5.2, -1);
  backup.add(backupLabel);
  scene.add(backup);
  pickables.push(backup);

  // Sensor partner.
  const partner = tagPick(new THREE.Group(), 'partner');
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 3.4, 6), standard(PALETTE.neutral));
  mast.position.set(13, 1.7, 8);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.09, 6, 20), glow(PALETTE.cyan, 1.6));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(13, 3.2, 8);
  const partnerBase = box(3.4, 0.25, 3.4, standard(PALETTE.structure), 13, 0.12, 8);
  edges(partnerBase);
  const partnerLabel = label('SENSOR PARTNER · GAUGE 14', '#ffd08a');
  partnerLabel.position.set(13, 4.9, 8);
  partner.add(mast, ring, partnerBase, partnerLabel);
  scene.add(partner);
  pickables.push(partner);

  // Cloud model endpoint.
  const cloud = tagPick(new THREE.Group(), 'cloud');
  const cloudMaterial = standard(0x8fa8c4, { roughness: 0.5 });
  for (const [x, y, z, r] of [[13, 6.5, -9, 1.7], [11.2, 6, -8.4, 1.2], [14.8, 6.1, -9.4, 1.3]] as const) {
    const lobe = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), cloudMaterial);
    lobe.position.set(x, y, z);
    edges(lobe, 0xcfe2ff, 0.5);
    cloud.add(lobe);
  }
  const cloudLabel = label('ROUTING MODEL · EXISTING CLOUD', '#cfe2ff');
  cloudLabel.position.set(13, 9.3, -9);
  cloud.add(cloudLabel);
  scene.add(cloud);
  pickables.push(cloud);

  // Intermediate hops.
  const gateway = box(2.2, 1.8, 2.2, standard(PALETTE.structureLight), GATEWAY.x, 0.9, GATEWAY.z);
  edges(gateway);
  const gatewayLabel = label('OLD GATEWAY', '#9fb4c8', 0.8);
  gatewayLabel.position.set(GATEWAY.x, 2.9, GATEWAY.z);
  const publicNode = new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), standard(PALETTE.structureLight));
  publicNode.position.set(PUBLIC.x, 1.3, PUBLIC.z);
  edges(publicNode);
  const publicLabel = label('PUBLIC ENDPOINT', '#9fb4c8', 0.8);
  publicLabel.position.set(PUBLIC.x, 3.2, PUBLIC.z);
  scene.add(gateway, gatewayLabel, publicNode, publicLabel);

  // Existing private connection from the backup to the cloud model. Always present.
  const cloudCurve = new THREE.CatmullRomCurve3([BACKUP, v(2, 6.5, -6), CLOUD]);
  const cloudLinkMaterial = glow(0xcfe2ff, 0.5, { transparent: true, opacity: 0.7 });
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(cloudCurve, 40, 0.07, 6), cloudLinkMaterial));
  const pulseGeometry = new THREE.SphereGeometry(0.24, 8, 6);
  const cloudPulses = [0, 1, 2].map(() => {
    const p = new THREE.Mesh(pulseGeometry, glow(0xffffff, 2.5));
    p.visible = false;
    scene.add(p);
    return p;
  });

  const routeCurves: Record<RouteId, THREE.Vector3[]> = {
    R01: [PARTNER, v(10, 1.4, 15), GATEWAY, v(-6, 1.6, 11), BACKUP],
    R02: [PARTNER, v(10, 1.2, 1.5), PUBLIC, v(-3, 1.6, -2.5), BACKUP],
    R03: [PARTNER, v(2, 3.6, 6.5), BACKUP],
  };
  const routes: RouteVisual[] = (['R01', 'R02', 'R03'] as const).map((id) => {
    const curve = new THREE.CatmullRomCurve3(routeCurves[id]);
    const material = glow(PALETTE.neutral, 0.4, { transparent: true, opacity: 0.4 });
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 0.1, 6), material));
    // A wide, invisible tube makes the thin path easy to click.
    const hit = tagPick(
      new THREE.Mesh(
        new THREE.TubeGeometry(curve, 30, 0.8, 5),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      ),
      id,
    );
    scene.add(hit);
    pickables.push(hit);
    const tag = label(id, '#e6eef6', 0.8);
    tag.position.copy(curve.getPoint(id === 'R03' ? 0.5 : 0.3)).add(v(0, 1.1, 0));
    scene.add(tag);
    const pulses = [0, 1, 2, 3].map(() => {
      const p = new THREE.Mesh(pulseGeometry, material);
      p.visible = false;
      scene.add(p);
      return p;
    });
    return { id, curve, material, pulses, speed: id === 'R01' ? 0.09 : 0.3 };
  });

  // Policy barrier for a disallowed path: a ring with a bar through it.
  const barrier = new THREE.Group();
  const barrierMaterial = glow(PALETTE.blocked, 2);
  barrier.add(new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.1, 6, 20), barrierMaterial));
  const bar = box(1.8, 0.16, 0.16, barrierMaterial);
  bar.rotation.z = Math.PI / 4;
  barrier.add(bar);
  barrier.position.copy(routes[1]!.curve.getPoint(0.12));
  barrier.rotation.y = Math.PI / 2.4;
  barrier.visible = false;
  scene.add(barrier);

  let view: TopologyView = { kind: 'topology', selectedRoute: null, attempt: null, attemptCount: 0, restored: false };
  let attemptStart = 0;
  let lastTime = 0;

  const applyView = () => {
    for (const route of routes) {
      const selected = view.selectedRoute === route.id;
      const tested = view.attempt?.route === route.id ? view.attempt : null;
      let color = PALETTE.neutral;
      if (tested) color = tested.outcome === 'restored' ? PALETTE.cyan : tested.policyPass ? PALETTE.amber : PALETTE.blocked;
      else if (selected) color = 0xffffff;
      route.material.color.setHex(color);
      route.material.emissive.setHex(color);
      route.material.emissiveIntensity = selected || tested ? 1.8 : 0.4;
      route.material.opacity = selected || tested ? 1 : 0.4;
      const flowing = !!tested && tested.requestSent;
      route.pulses.forEach((p) => (p.visible = flowing));
    }
    barrier.visible = !!view.attempt && !view.attempt.policyPass;
    cloudPulses.forEach((p) => (p.visible = view.restored));
    cloudLinkMaterial.emissiveIntensity = view.restored ? 1.6 : 0.5;
  };
  applyView();

  return {
    scene,
    pickables,
    home: pose(1, 19, 36, 2, 2.5, 2),
    focusTargets: {
      backup: pose(-16, 8, 14, -10, 2, 0),
      partner: pose(22, 7, 19, 12, 2, 7),
      cloud: pose(22, 11, 4, 13, 6, -8),
    },
    setView(next: SceneViewData) {
      if (next.kind !== 'topology') return;
      if (next.attemptCount !== view.attemptCount) attemptStart = lastTime;
      view = next;
      applyView();
    },
    update(time: number, motion: boolean) {
      lastTime = time;
      const elapsed = motion ? time - attemptStart : 0;
      for (const route of routes) {
        route.pulses.forEach((p, i) => {
          if (!p.visible) return;
          // Under reduced motion the pulses sit still, evenly spaced along the path.
          const u = (i / route.pulses.length + elapsed * route.speed) % 1;
          p.position.copy(route.curve.getPoint(u));
        });
      }
      cloudPulses.forEach((p, i) => {
        if (!p.visible) return;
        p.position.copy(cloudCurve.getPoint((i / cloudPulses.length + elapsed * 0.35) % 1));
      });
      if (motion) ring.rotation.z = time * 0.6;
    },
    dispose() {
      pulseGeometry.dispose();
      disposeScene(scene);
    },
  };
}
