import { SettingsProvider } from '../platform/settings';
import { DebriefRoute } from './DebriefRoute';
import { EpisodeShell } from './EpisodeShell';
import { Landing } from './Landing';
import { Link, usePath } from './router';

function Routes() {
  const path = usePath();
  if (path === '/') return <Landing />;
  if (path === '/episodes/ghost-feed') return <EpisodeShell />;
  if (path === '/episodes/ghost-feed/debrief') return <DebriefRoute />;
  return (
    <main className="stack narrow">
      <h1>Page not found</h1>
      <Link className="btn btn-primary" to="/">Back to Signal Run</Link>
    </main>
  );
}

export function App() {
  return (
    <SettingsProvider>
      <Routes />
    </SettingsProvider>
  );
}
