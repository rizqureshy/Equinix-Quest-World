import type { PlateId } from '../content/schema';

// Placeholder plates for the physical world: inky silhouettes, emergency light,
// rain. Original geometric art, drawn in code, to be replaced by painted or
// generated panels in the cinematic pass.

const INK = '#05080d';

const Rain = () => (
  <g className="plate-rain" stroke="#9fc4e6" strokeWidth="1.2" opacity="0.35">
    {Array.from({ length: 46 }, (_, i) => {
      const x = (i * 97) % 820;
      const y = (i * 53) % 450;
      return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 34} />;
    })}
  </g>
);

const Skyline = ({ y = 250 }: { y?: number }) => (
  <path
    fill="#0d1826"
    d={`M0 ${y} h40 v-50 h50 v30 h30 v-80 h60 v60 h40 v-30 h70 v-70 h40 v90 h60 v-40 h50 v-60 h70 v70 h40 v-30 h60 v-50 h50 v60 h70 v-20 h70 V450 H0 Z`}
  />
);

const Truck = ({ x, y, s = 1, ghost = false }: { x: number; y: number; s?: number; ghost?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-150 20 q-40 -50 -90 -30 q30 0 50 40 z" fill="#fff" opacity={ghost ? 0.25 : 0.55} />
    <g
      fill={ghost ? 'none' : '#2f6fd0'}
      stroke={ghost ? '#38d9e8' : '#0b1c38'}
      strokeWidth={ghost ? 2 : 3}
      strokeDasharray={ghost ? '7 5' : undefined}
    >
      <rect x="-150" y="-70" width="190" height="90" />
      <path d="M46 -50 h44 l22 30 v40 h-66 z" />
    </g>
    <g fill={INK}>
      <circle cx="-110" cy="26" r="17" />
      <circle cx="-50" cy="26" r="17" />
      <circle cx="78" cy="26" r="17" />
    </g>
  </g>
);

const Van = ({ x, y, brake = false }: { x: number; y: number; brake?: boolean }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M0 0 h150 l34 34 v46 h-184 z" fill={INK} stroke="#22364c" strokeWidth="2" />
    <rect x="16" y="12" width="52" height="24" fill="#e8b48a" opacity="0.5" />
    <rect x="78" y="12" width="52" height="24" fill="#e8b48a" opacity="0.35" />
    <circle cx="36" cy="82" r="16" fill={INK} stroke="#22364c" strokeWidth="2" />
    <circle cx="140" cy="82" r="16" fill={INK} stroke="#22364c" strokeWidth="2" />
    <rect x="-6" y="44" width="8" height="18" fill={brake ? '#ff4d3d' : '#7a1f18'} />
    {brake && <ellipse cx="-30" cy="60" rx="46" ry="16" fill="#ff4d3d" opacity="0.22" />}
    <rect x="52" y="-9" width="40" height="9" fill="#ffb347" />
  </g>
);

const Tunnel = ({ water = false }: { water?: boolean }) => (
  <g>
    <rect x="250" y="130" width="300" height="190" fill="#0d1826" stroke="#22364c" strokeWidth="3" />
    <path d="M300 320 v-110 q100 -80 200 0 v110 z" fill={INK} />
    {water && <path d="M300 320 v-36 q50 -10 100 0 t100 0 v36 z" fill="#2a9db5" opacity="0.75" />}
  </g>
);

const Road = () => <path d="M0 450 L330 300 H470 L800 450 Z" fill="#0a111b" />;

const scenes: Record<PlateId, { label: string; art: React.ReactNode }> = {
  street: {
    label: 'View through a wet windshield: a blue truck passes toward an underpass marked clear on the dispatch screen.',
    art: (
      <>
        <Skyline />
        <Road />
        <Tunnel />
        <Truck x={470} y={300} s={0.7} />
        <path d="M0 450 V380 q400 -50 800 0 V450 Z" fill={INK} />
        <rect x="560" y="360" width="170" height="70" rx="6" fill="#0f1a28" stroke="#3ddc84" strokeWidth="2" />
        <text x="574" y="386" fill="#3ddc84" fontSize="15" fontFamily="ui-monospace, monospace">UNDERPASS</text>
        <text x="574" y="412" fill="#3ddc84" fontSize="19" fontWeight="700" fontFamily="ui-monospace, monospace">CLEAR ▲</text>
        <g fill="#fff1c4"><circle cx="70" cy="392" r="7" /><circle cx="92" cy="392" r="4" /><circle cx="110" cy="392" r="7" /></g>
      </>
    ),
  },
  hold: {
    label: 'The response van stopped at a turnout, brake lights glowing in the rain.',
    art: (
      <>
        <Skyline />
        <path d="M0 450 V330 H800 V450 Z" fill="#0a111b" />
        <path d="M430 330 h300 v40 h-340 z" fill="#101c2b" />
        <Van x={480} y={250} brake />
      </>
    ),
  },
  nearMiss: {
    label: 'The tunnel mouth, flooded. A bollard floats across the lane in the headlights.',
    art: (
      <>
        <Skyline />
        <Road />
        <Tunnel water />
        <path d="M250 450 L360 300 H440 L550 450 Z" fill="#fff1c4" opacity="0.12" />
        <g transform="translate(410 300) rotate(64)">
          <rect x="-8" y="-34" width="16" height="68" rx="6" fill="#ffb347" stroke={INK} strokeWidth="2" />
          <rect x="-8" y="-8" width="16" height="12" fill="#fff" />
        </g>
      </>
    ),
  },
  crossover: {
    label: "The truck's silhouette dissolves into a cyan wireframe outline: the Reconstruction.",
    art: (
      <>
        <g stroke="#1b3348" strokeWidth="1">
          {Array.from({ length: 17 }, (_, i) => <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="450" />)}
          {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} />)}
        </g>
        <Truck x={430} y={250} s={1.5} ghost />
        <rect x="170" y="90" width="460" height="290" fill="none" stroke="#38d9e8" strokeWidth="2" />
        <text x="180" y="82" fill="#38d9e8" fontSize="15" fontFamily="ui-monospace, monospace">CAMERA PLANE · UNDERPASS RELAY</text>
      </>
    ),
  },
  turnout: {
    label: 'The van at the turnout. A pump house and a water gauge stand beside the flooded underpass.',
    art: (
      <>
        <Skyline />
        <path d="M0 450 V330 H800 V450 Z" fill="#0a111b" />
        <Van x={90} y={250} brake />
        <rect x="560" y="230" width="110" height="100" fill="#0d1826" stroke="#22364c" strokeWidth="3" />
        <rect x="596" y="280" width="30" height="50" fill="#e8b48a" opacity="0.5" />
        <rect x="490" y="200" width="8" height="130" fill="#9fb4c8" />
        <rect x="484" y="262" width="20" height="68" fill="#38d9e8" />
        <path d="M330 330 q60 -14 120 0 t120 0 v30 h-240 z" fill="#2a9db5" opacity="0.7" />
      </>
    ),
  },
  pursuit: {
    label: 'A freight gate drops behind the van. A lone rider with a three-lamp headlight waits at the junction.',
    art: (
      <>
        <Skyline />
        <path d="M0 450 V330 H800 V450 Z" fill="#0a111b" />
        <Van x={560} y={250} />
        <rect x="430" y="150" width="14" height="180" fill="#9fb4c8" />
        <g transform="rotate(-8 437 220)"><rect x="300" y="212" width="140" height="14" fill="#ffb347" /><g fill={INK}><rect x="320" y="212" width="18" height="14" /><rect x="360" y="212" width="18" height="14" /><rect x="400" y="212" width="18" height="14" /></g></g>
        <g transform="translate(120 290)">
          <path d="M0 0 q14 -44 36 -12 l20 12 l-10 34 h-44 z" fill={INK} stroke="#22364c" strokeWidth="2" />
          <circle cx="8" cy="40" r="14" fill={INK} stroke="#22364c" strokeWidth="2" />
          <g fill="#fff1c4"><circle cx="58" cy="8" r="6" /><circle cx="72" cy="8" r="3.5" /><circle cx="84" cy="8" r="6" /></g>
        </g>
      </>
    ),
  },
  ibx: {
    label: 'A fictional data center operations corridor lined with racks. Placeholder nameplate reads Equinix IBX.',
    art: (
      <>
        <path d="M0 0 H800 V450 H0 Z" fill="#0d1826" />
        <path d="M300 130 H500 V320 H300 Z" fill="#0a121c" stroke="#22364c" strokeWidth="2" />
        <path d="M0 450 L300 320 H500 L800 450 Z" fill="#101c2b" />
        {[0, 1, 2, 3].map((i) => {
          const w = 70 - i * 12;
          const lx = 30 + i * 72;
          const top = 60 + i * 22;
          const h = 360 - i * 62;
          return (
            <g key={i}>
              <rect x={lx} y={top} width={w} height={h} fill={INK} stroke="#2f6682" strokeWidth="2" />
              <rect x={800 - lx - w} y={top} width={w} height={h} fill={INK} stroke="#2f6682" strokeWidth="2" />
              {[0, 1, 2, 3, 4].map((j) => (
                <g key={j} fill="#38d9e8">
                  <rect x={lx + 8} y={top + 20 + j * (h / 6)} width={w - 16} height="3" />
                  <rect x={800 - lx - w + 8} y={top + 20 + j * (h / 6)} width={w - 16} height="3" />
                </g>
              ))}
            </g>
          );
        })}
        <rect x="318" y="150" width="164" height="38" fill="#0f1a28" stroke="#9fb4c8" strokeWidth="1.5" />
        <text x="400" y="175" textAnchor="middle" fill="#e6eef6" fontSize="16" fontFamily="ui-sans-serif, system-ui">EQUINIX IBX (placeholder)</text>
      </>
    ),
  },
  surface: {
    label: 'Response vehicles pass safely on the surface road. The underpass below is barred and closed.',
    art: (
      <>
        <Skyline />
        <path d="M0 300 H800 V345 H0 Z" fill="#101c2b" />
        <Van x={120} y={212} />
        <Van x={430} y={212} />
        <path d="M0 450 V390 H800 V450 Z" fill="#0a111b" />
        <rect x="330" y="372" width="140" height="14" fill="#ffb347" />
        <text x="400" y="420" textAnchor="middle" fill="#ffb347" fontSize="17" fontWeight="700" fontFamily="ui-monospace, monospace">UNDERPASS CLOSED</text>
      </>
    ),
  },
  marker: {
    label: 'A frozen frame with a small maintenance marker in the corner. The same marker glows on an unmarked terminal.',
    art: (
      <>
        <rect x="60" y="70" width="400" height="250" fill="#0d1826" stroke="#ffb347" strokeWidth="2" />
        <Truck x={280} y={230} s={0.8} ghost />
        <rect x="372" y="84" width="76" height="26" fill="none" stroke="#ffb347" strokeWidth="2" />
        <text x="410" y="102" textAnchor="middle" fill="#ffb347" fontSize="14" fontFamily="ui-monospace, monospace">MX-7</text>
        <rect x="540" y="200" width="180" height="120" fill={INK} stroke="#22364c" strokeWidth="2" />
        <text x="630" y="266" textAnchor="middle" fill="#ffb347" fontSize="22" fontFamily="ui-monospace, monospace">MX-7</text>
        <path d="M600 200 q30 -90 60 0 z" fill={INK} stroke="#22364c" strokeWidth="2" />
        <path d="M560 190 q20 -34 44 -6 l-8 16 h-30 z" fill={INK} stroke="#22364c" strokeWidth="2" />
      </>
    ),
  },
};

export function Plate({ id }: { id: PlateId }) {
  const scene = scenes[id];
  const outdoors = id !== 'crossover' && id !== 'ibx' && id !== 'marker';
  return (
    <svg className="plate" viewBox="0 0 800 450" role="img" aria-label={scene.label} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="plate-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a121c" />
          <stop offset="1" stopColor="#1a2f45" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill={id === 'crossover' || id === 'marker' ? '#0a121c' : 'url(#plate-sky)'} />
      {scene.art}
      {outdoors && <Rain />}
    </svg>
  );
}
