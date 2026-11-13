import { expect, test } from '@playwright/test';
import { EPISODE, choose, coldOpen, exitField, gate, investigate, press, reachRecovery, testRoute } from './helpers';

const GAUGE = /Verified partner gauge/;
const RELAY = /Quarantined relay/;

test('complete Ghost Feed with the keyboard only', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'SIGNAL RUN' })).toBeVisible();
  const play = page.getByRole('link', { name: 'Play Ghost Feed' });
  await play.focus();
  await page.keyboard.press('Enter');

  // Cold open: step through every line by hand, then decide.
  for (let i = 0; i < 4; i++) await press(page, 'Next');
  await press(page, 'Decide');
  await expect(page.getByText('Tunnel clear. Proceed.')).toBeVisible();
  await expect(page.getByText("I've got water over the curb and rising.", { exact: false })).toBeVisible();
  await press(page, /Hold at the turnout/);
  await press(page, 'Skip scene');

  await investigate(page);
  await exitField(page);

  await press(page, 'Open the continuity runbook');
  await testRoute(page, 'R03', GAUGE);
  expect(await gate(page, 'Source')).toBe('pass');
  expect(await gate(page, 'Policy')).toBe('pass');
  expect(await gate(page, 'Response time')).toBe('pass');
  await expect(page.getByRole('main').getByText('The underpass is closed in dispatch.', { exact: false })).toBeVisible();
  await expect(page.getByText('Dispatch: “Underpass closed. Use the surface route.”')).toBeVisible();
  await expect(page.getByTestId('dispatch-status')).toContainText('Automatic routing restored');

  await press(page, 'Brief Elena');
  await expect(page.getByText('What are we paying for at the data center?', { exact: false })).toBeVisible();
  await choose(page, 'checkbox', /Camera capture record/);
  await choose(page, 'checkbox', /Continuity runbook/);
  await choose(page, 'radio', /keep everything in our cloud/);
  await expect(page.getByText('That could work. What would you measure or verify before committing?')).toBeVisible();
  await choose(page, 'radio', /end-to-end p95 dispatch response/);
  await press(page, 'Review my response');

  // The honest alternative is reachable and rewarded.
  await expect(page.locator('[data-behavior="acknowledgesAlternative"]')).toHaveAttribute('data-level', 'demonstrated');
  await expect(page.locator('[data-behavior="separatesModelFromData"]')).toHaveAttribute('data-level', 'demonstrated');
  await choose(page, 'radio', /response trace/);
  await expect(page.getByText('Response traces can distinguish retrieval, network and model time.', { exact: false })).toBeVisible();
  await press(page, 'Continue');

  await press(page, 'Skip scene');
  await expect(page.getByText('Ghost Feed complete.', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Maintenance marker' })).toBeVisible();

  // Stable debrief link.
  await page.goto(`${EPISODE}/debrief`);
  await expect(page.getByRole('heading', { name: 'Debrief' })).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Resume Ghost Feed' })).toBeVisible();
});

test('continuing toward the tunnel shows a near miss, then every wrong route recovers', async ({ page }) => {
  await page.goto(EPISODE);
  await press(page, 'Skip scene');
  await press(page, /Continue toward the tunnel/);
  await expect(page.getByText('A bollard floats across the lane.', { exact: false })).toBeVisible();
  await press(page, 'Skip scene');
  await investigate(page);
  await expect(page.getByText('Mara overrode the dispatch recommendation', { exact: false })).toBeVisible();
  await exitField(page);
  await press(page, 'Open the continuity runbook');

  // R02: blocked before any request.
  await testRoute(page, 'R02', GAUGE);
  expect(await gate(page, 'Policy')).toBe('fail');
  expect(await gate(page, 'Response time')).toBe('notTested');
  await expect(page.getByRole('main').getByText('Activation blocked. This endpoint is outside', { exact: false })).toBeVisible();
  await expect(page.getByTestId('dispatch-status')).toContainText('Manual dispatch active');

  // R01: verified and approved, but late.
  await testRoute(page, 'R01', GAUGE);
  expect(await gate(page, 'Source')).toBe('pass');
  expect(await gate(page, 'Policy')).toBe('pass');
  expect(await gate(page, 'Response time')).toBe('fail');
  await expect(page.getByRole('main').getByText("The response missed the city's target.", { exact: false })).toBeVisible();

  // R03 with the quarantined relay cannot activate.
  await testRoute(page, 'R03', RELAY);
  expect(await gate(page, 'Source')).toBe('fail');
  await expect(page.getByTestId('dispatch-status')).toContainText('Manual dispatch active');
  await expect(page.getByRole('button', { name: 'Brief Elena' })).toHaveCount(0);

  // R03 with the verified gauge restores service.
  await testRoute(page, 'R03', GAUGE);
  await expect(page.getByTestId('dispatch-status')).toContainText('Automatic routing restored');
  await expect(page.locator('.attempts li')).toHaveCount(4);
});

test('asking for another observation adds the worker report', async ({ page }) => {
  await coldOpen(page, /Ask for another observation/);
  await expect(page.locator('[data-evidence="E02_FIELD"]')).toBeVisible();
});

test('replay twice with different routes without leaking choices', async ({ page }) => {
  await reachRecovery(page);
  await testRoute(page, 'R03', GAUGE);
  await press(page, 'Replay recovery');

  await expect(page.getByTestId('dispatch-status')).toContainText('Manual dispatch active');
  await expect(page.getByRole('radio', { name: /^R03:/ })).not.toBeChecked();
  await expect(page.getByRole('radio', { name: GAUGE })).not.toBeChecked();
  await expect(page.getByRole('button', { name: 'Test route' })).toBeDisabled();

  await testRoute(page, 'R01', GAUGE);
  await expect(page.getByTestId('dispatch-status')).toContainText('Manual dispatch active');
  await testRoute(page, 'R03', GAUGE);
  await press(page, 'Brief Elena');
  await choose(page, 'radio', /better AI/);
  await press(page, 'Review my response');
  await press(page, 'Replay recovery');

  await expect(page.getByRole('heading', { name: 'Continuity site' })).toBeVisible();
  await expect(page.getByRole('radio', { name: /^R03:/ })).not.toBeChecked();
  await testRoute(page, 'R03', GAUGE);
  await press(page, 'Brief Elena');
  await expect(page.getByRole('radio', { name: /better AI/ })).not.toBeChecked();
});

test('reload restores progress from investigation, recovery and briefing', async ({ page }) => {
  await coldOpen(page, /Hold at the turnout/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'The Reconstruction' })).toBeVisible();

  await investigate(page);
  await exitField(page);
  await press(page, 'Open the continuity runbook');
  await testRoute(page, 'R01', GAUGE);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Continuity site' })).toBeVisible();
  await expect(page.locator('.attempts li')).toHaveCount(1);
  await expect(page.getByTestId('dispatch-status')).toContainText('Manual dispatch active');

  await testRoute(page, 'R03', GAUGE);
  await press(page, 'Brief Elena');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Incident call' })).toBeVisible();
});

test('a corrupt save offers a clean restart instead of a blank page', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('signal-run/ghost-feed/save', '{"state":{"version":0}'));
  await page.goto(EPISODE);
  await expect(page.getByRole('alert')).toContainText('could not be read');
  await expect(page.getByRole('heading', { name: 'Street' })).toBeVisible();
  await press(page, 'Clear the old save');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await press(page, 'Skip scene');
  await expect(page.getByRole('button', { name: /Hold at the turnout/ })).toBeVisible();
});

test('the cold open reaches the first decision without input when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(EPISODE);
  await expect(page.getByRole('button', { name: /Hold at the turnout/ })).toBeVisible({ timeout: 45_000 });
});

test('usable at 360 px wide with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await reachRecovery(page);
  await testRoute(page, 'R03', GAUGE);
  await expect(page.getByTestId('dispatch-status')).toContainText('Automatic routing restored');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
