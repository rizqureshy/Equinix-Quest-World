import { useState } from 'react';
import { ghostFeed } from '../content/episodes/ghost-feed';
import { Plate } from '../presentation/Plate';
import { browserStore, clearSave, loadSave } from '../platform/save-store';
import { Link, navigate } from './router';
import { SettingsPanel } from './SettingsPanel';

const LATER = [
  { n: 2, title: 'Heat Limit', topic: 'Training, inference, power and cooling' },
  { n: 3, title: 'Across the Line', topic: 'Data movement, inference placement and sovereignty' },
  { n: 4, title: 'The Last Route', topic: 'Distributed AI and the customer conversation' },
];

export function Landing() {
  const [save, setSave] = useState(() => loadSave(browserStore(), ghostFeed.id));
  const hasProgress = save.status === 'ok' && (save.state.phase !== 'coldOpen' || save.state.openingChoice !== null);

  return (
    <div className="landing">
      <div className="landing-art"><Plate id="street" /></div>
      <main className="landing-body">
        <p className="eyebrow">A playable series on AI infrastructure</p>
        <h1>SIGNAL RUN</h1>
        <h2>Episode 1 · {ghostFeed.title}</h2>
        <p className="lede">{ghostFeed.tagline}</p>
        <p className="muted">About 12 to 15 minutes. One player. Nothing is timed.</p>
        <div className="row">
          <Link className="btn btn-primary btn-large" to="/episodes/ghost-feed">
            {hasProgress ? 'Resume Ghost Feed' : 'Play Ghost Feed'}
          </Link>
          {(hasProgress || save.status === 'corrupt') && (
            <button
              className="btn"
              onClick={() => {
                clearSave(browserStore(), ghostFeed.id);
                setSave({ status: 'none' });
                navigate('/episodes/ghost-feed');
              }}
            >
              Start over
            </button>
          )}
        </div>
        {save.status === 'corrupt' && (
          <p className="status status-amber" role="alert">Saved progress on this device could not be read. Start over to play.</p>
        )}
        <details className="settings-details">
          <summary>Settings: captions, motion and graphics</summary>
          <SettingsPanel />
        </details>
        <h3>Coming later</h3>
        <ul className="later">
          {LATER.map((e) => (
            <li key={e.n}><strong>Episode {e.n} · {e.title}</strong><span>{e.topic}</span></li>
          ))}
        </ul>
        <p className="fineprint">
          Fictional scenario with synthetic data. All figures are invented teaching values. Placeholder art.
        </p>
      </main>
    </div>
  );
}
