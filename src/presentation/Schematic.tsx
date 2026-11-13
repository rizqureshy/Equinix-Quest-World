import type { RouteId } from '../content/schema';
import type { SceneViewData, TopologyView, UnderpassView } from '../scenes/views';

// The 2D path. It draws the same view data as the 3D scene, and carries meaning
// with labels, line styles and marks as well as color.

const CYAN = '#38d9e8';
const AMBER = '#ffb347';
const mono = { fontFamily: 'ui-monospace, monospace' } as const;

function Underpass({ view }: { view: UnderpassView }) {
  const feed = view.feedStale ? AMBER : CYAN;
  const gauge = view.gaugeVerified ? CYAN : AMBER;
  return (
    <svg className="schematic" viewBox="0 0 640 400" role="img" aria-label="Plan view of the underpass district">
      <rect width="640" height="400" fill="#0a121c" />
      <g stroke="#1b3348" strokeWidth="1">
        {Array.from({ length: 16 }, (_, i) => <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="400" />)}
        {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 40} x2="640" y2={i * 40} />)}
      </g>
      <rect x="0" y="170" width="640" height="60" fill="#070d15" />
      <line x1="0" y1="200" x2="640" y2="200" stroke="#3c5a72" strokeDasharray="14 12" />
      {view.gaugeViewed && (
        <rect x="290" y="172" width="100" height="56" fill={view.gaugeVerified ? '#2a9db5' : AMBER} opacity="0.45" />
      )}
      <rect x="290" y="20" width="100" height="150" fill="#182a3d" stroke="#2f6682" />
      <rect x="290" y="230" width="100" height="150" fill="#182a3d" stroke="#2f6682" />
      <text x="340" y="100" textAnchor="middle" fill="#9fb4c8" fontSize="13" {...mono}>BRIDGE</text>

      {/* Camera relay and its plane */}
      <path d="M150 262 L196 172 L196 228 Z" fill={feed} opacity={view.cameraOpen ? 0.22 : 0.1} stroke={feed} />
      <line x1="196" y1="166" x2="196" y2="234" stroke={feed} strokeWidth="3" strokeDasharray={view.feedStale ? '6 4' : undefined} />
      <circle cx="150" cy="262" r="8" fill="#9fb4c8" />
      <text x="150" y="290" textAnchor="middle" fill={feed} fontSize="13" {...mono}>
        CAMERA RELAY{view.feedStale ? ' · STALE' : ''}
      </text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={176 + i * 22}
            y="140"
            width="16"
            height="16"
            fill={view.cameraOpen && i === view.frameIndex ? feed : '#2a3d50'}
            stroke={feed}
          />
          <text x={184 + i * 22} y="134" textAnchor="middle" fill="#9fb4c8" fontSize="11" {...mono}>{i + 1}</text>
        </g>
      ))}

      {/* The truck at the one captured instant */}
      <g>
        <path d="M118 196 l-34 -8 l0 20 z" fill="#fff" opacity="0.5" />
        <rect
          x="120"
          y="184"
          width="74"
          height="22"
          fill={view.feedStale ? 'none' : '#2f6fd0'}
          stroke={view.feedStale ? AMBER : '#9cc4ff'}
          strokeWidth="2"
          strokeDasharray={view.feedStale ? '6 4' : undefined}
        />
        <text x="157" y="222" textAnchor="middle" fill="#9fb4c8" fontSize="11" {...mono}>SEQ 8041</text>
      </g>

      {/* Lamp */}
      <circle cx="170" cy="160" r="5" fill="#ffe2a8" />

      {/* Pump house, worker, gauge */}
      <rect x="440" y="290" width="60" height="50" fill="#223a52" stroke="#2f6682" />
      <circle cx="428" cy="282" r="7" fill="#e8b48a" stroke={view.fieldViewed ? '#fff' : 'none'} strokeWidth="2" />
      <text x="470" y="358" textAnchor="middle" fill="#f0c8a4" fontSize="13" {...mono}>FIELD REPORT</text>
      <rect x="402" y="236" width="10" height="44" fill="none" stroke="#9fb4c8" />
      {view.gaugeViewed && <rect x="402" y="246" width="10" height="34" fill={gauge} />}
      <line x1="396" y1="266" x2="418" y2="266" stroke="#fff" />
      <text x="424" y="252" fill={gauge} fontSize="13" {...mono}>
        GAUGE 14{view.gaugeViewed ? ' · 0.76 m' : ''}
        {view.gaugeVerified ? ' ✓' : ''}
      </text>
    </svg>
  );
}

const NODES = {
  backup: { x: 120, y: 200 },
  partner: { x: 520, y: 300 },
  cloud: { x: 520, y: 80 },
  gateway: { x: 300, y: 350 },
  public: { x: 320, y: 250 },
};

const PATHS: Record<RouteId, string> = {
  R01: `M${NODES.partner.x} ${NODES.partner.y} Q420 380 ${NODES.gateway.x} ${NODES.gateway.y} Q160 350 ${NODES.backup.x} ${NODES.backup.y + 30}`,
  R02: `M${NODES.partner.x} ${NODES.partner.y} L${NODES.public.x} ${NODES.public.y} L${NODES.backup.x + 40} ${NODES.backup.y + 14}`,
  R03: `M${NODES.partner.x} ${NODES.partner.y} Q320 170 ${NODES.backup.x + 50} ${NODES.backup.y}`,
};
const DASH: Record<RouteId, string | undefined> = { R01: '10 6', R02: '3 6', R03: undefined };
const LABEL_AT: Record<RouteId, { x: number; y: number }> = {
  R01: { x: 380, y: 384 },
  R02: { x: 400, y: 262 },
  R03: { x: 330, y: 196 },
};

function Topology({ view }: { view: TopologyView }) {
  return (
    <svg className="schematic" viewBox="0 0 640 400" role="img" aria-label="Recovery topology: city backup, sensor partner and cloud model">
      <rect width="640" height="400" fill="#0a121c" />
      <rect x="30" y="130" width="190" height="140" fill="none" stroke={CYAN} strokeDasharray="4 4" />
      <text x="40" y="122" fill={CYAN} fontSize="12" {...mono}>IBX SITE</text>

      <path
        d={`M${NODES.backup.x + 40} ${NODES.backup.y - 20} Q330 60 ${NODES.cloud.x - 50} ${NODES.cloud.y}`}
        fill="none"
        stroke="#cfe2ff"
        strokeWidth={view.restored ? 4 : 2}
      />
      <text x="300" y="72" textAnchor="middle" fill="#cfe2ff" fontSize="11" {...mono}>
        EXISTING PRIVATE CONNECTION{view.restored ? ' · MODEL CALL →' : ''}
      </text>

      {(['R01', 'R02', 'R03'] as const).map((id) => {
        const tested = view.attempt?.route === id ? view.attempt : null;
        const selected = view.selectedRoute === id;
        const color = tested
          ? tested.outcome === 'restored'
            ? CYAN
            : tested.policyPass
              ? AMBER
              : '#ff6b5e'
          : selected
            ? '#ffffff'
            : '#5d7186';
        const status = tested
          ? tested.outcome === 'restored'
            ? ' · ACTIVE ←'
            : tested.policyPass
              ? ' · HELD'
              : ' · ✕ BLOCKED'
          : selected
            ? ' · SELECTED'
            : '';
        return (
          <g key={id}>
            <path d={PATHS[id]} fill="none" stroke={color} strokeWidth={selected || tested ? 5 : 2} strokeDasharray={DASH[id]} />
            <text x={LABEL_AT[id].x} y={LABEL_AT[id].y} fill={color} fontSize="13" fontWeight="700" {...mono}>
              {id}
              {status}
            </text>
          </g>
        );
      })}

      <rect x="60" y="160" width="120" height="80" fill="#121d2b" stroke="#2f6682" strokeWidth="2" />
      <text x="120" y="196" textAnchor="middle" fill="#e6eef6" fontSize="12" {...mono}>CITY BACKUP</text>
      <text x="120" y="214" textAnchor="middle" fill="#e6eef6" fontSize="12" {...mono}>DISPATCHER</text>
      <circle cx={NODES.partner.x} cy={NODES.partner.y} r="30" fill="#121d2b" stroke={AMBER} strokeWidth="2" />
      <text x={NODES.partner.x} y={NODES.partner.y + 50} textAnchor="middle" fill="#ffd08a" fontSize="12" {...mono}>SENSOR PARTNER</text>
      <ellipse cx={NODES.cloud.x} cy={NODES.cloud.y} rx="56" ry="28" fill="#121d2b" stroke="#cfe2ff" strokeWidth="2" />
      <text x={NODES.cloud.x} y={NODES.cloud.y + 4} textAnchor="middle" fill="#cfe2ff" fontSize="12" {...mono}>CLOUD MODEL</text>
      <rect x={NODES.gateway.x - 16} y={NODES.gateway.y - 14} width="32" height="28" fill="#223a52" stroke="#2f6682" />
      <text x={NODES.gateway.x} y={NODES.gateway.y - 22} textAnchor="middle" fill="#9fb4c8" fontSize="11" {...mono}>OLD GATEWAY</text>
      <path d={`M${NODES.public.x} ${NODES.public.y - 16} l16 16 l-16 16 l-16 -16 z`} fill="#223a52" stroke="#2f6682" />
      <text x={NODES.public.x} y={NODES.public.y - 24} textAnchor="middle" fill="#9fb4c8" fontSize="11" {...mono}>PUBLIC ENDPOINT</text>
    </svg>
  );
}

export function Schematic({ view }: { view: SceneViewData }) {
  return view.kind === 'underpass' ? <Underpass view={view} /> : <Topology view={view} />;
}
