import { useState } from 'react';
import { ghostFeed } from '../content/episodes/ghost-feed';
import { DebriefView } from '../presentation/DebriefView';
import { browserStore, loadSave } from '../platform/save-store';
import { Link } from './router';

/** Stable link to the debrief for the progress saved on this device. */
export function DebriefRoute() {
  const [save] = useState(() => loadSave(browserStore(), ghostFeed.id));
  const ready = save.status === 'ok' && (save.state.phase === 'complete' || save.state.briefing.reviewed);
  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">SIGNAL RUN</Link>
        <span className="episode-name">Episode 1 · {ghostFeed.title} · Debrief</span>
      </header>
      <main className="stack narrow">
        {ready && save.status === 'ok' ? (
          <DebriefView state={save.state} episode={ghostFeed} />
        ) : (
          <p className="status status-amber">The debrief unlocks after you brief Elena in Ghost Feed.</p>
        )}
        <div className="row">
          <Link className="btn btn-primary" to="/episodes/ghost-feed">{ready ? 'Back to the episode' : 'Play Ghost Feed'}</Link>
          <Link className="btn" to="/">Back to series</Link>
        </div>
      </main>
    </div>
  );
}
