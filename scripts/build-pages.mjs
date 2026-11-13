// Builds the site for GitHub Pages "Deploy from a branch" (main, root folder)
// and copies the result into the repository root so it can be committed.
import { execSync } from 'node:child_process';
import { cpSync, copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

// Project sites are served under /<repository name>/.
const base = process.env.BASE_PATH ?? '/Equinix-Quest-World/';

execSync('npx tsc --noEmit && npx vite build', { stdio: 'inherit', env: { ...process.env, BASE_PATH: base } });

if (!readFileSync('dist/index.html', 'utf8').includes(`${base}assets/`)) {
  throw new Error('Built index.html does not reference the expected base path.');
}

// Replace the previously committed build. Hashed files change name every build.
for (const stale of ['assets', 'episodes']) if (existsSync(stale)) rmSync(stale, { recursive: true });
cpSync('dist', '.', { recursive: true });
// Pages has no rewrite rules. Serving the app as the 404 page lets deep links
// such as /episodes/ghost-feed load the app, which then routes itself.
copyFileSync('dist/index.html', '404.html');
// Skip Jekyll so files are published exactly as committed.
writeFileSync('.nojekyll', '');
console.log(`Pages build written to the repository root with base ${base}`);
