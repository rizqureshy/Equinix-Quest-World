import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { ghostFeed } from './content/episodes/ghost-feed';
import { validateEpisode } from './content/schema';
import './styles.css';

if (import.meta.env.DEV) {
  const problems = validateEpisode(ghostFeed);
  if (problems.length) console.error('Episode definition problems:', problems);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
