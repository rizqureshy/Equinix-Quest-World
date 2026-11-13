import { expect, type Page } from '@playwright/test';

export const EPISODE = '/episodes/ghost-feed';

/** Activates a button the way a keyboard user would: focus it, then press Enter. */
export async function press(page: Page, name: string | RegExp) {
  const button = page.getByRole('button', { name }).first();
  await button.focus();
  await expect(button).toBeFocused();
  await page.keyboard.press('Enter');
}

/** Selects a radio or checkbox from the keyboard. */
export async function choose(page: Page, role: 'radio' | 'checkbox', name: string | RegExp) {
  const input = page.getByRole(role, { name }).first();
  await input.focus();
  await page.keyboard.press('Space');
  await expect(input).toBeChecked();
}

export async function coldOpen(page: Page, choice: RegExp) {
  await page.goto(EPISODE);
  await press(page, 'Skip scene');
  await press(page, choice);
  await press(page, 'Skip scene');
  await expect(page.getByRole('heading', { name: 'The Reconstruction' })).toBeVisible();
}

export async function investigate(page: Page, cameraOpen = false) {
  if (!cameraOpen) await press(page, 'Open the underpass camera');
  await press(page, 'Next frame');
  await press(page, 'Next frame');
  await press(page, 'Open capture record');
  await press(page, 'Flag the camera feed as stale');
  await expect(page.getByText('Capture sequence 8041 repeats. Check an independent source.').first()).toBeVisible();
  await press(page, 'Open field report');
  await press(page, 'Open gauge 14 reading');
  await press(page, /mark gauge 14 as verified/);
  await press(page, 'Brief Mara at the turnout');
  await expect(page.getByRole('heading', { name: 'The turnout' })).toBeVisible();
}

export async function exitField(page: Page) {
  await press(page, 'Ask the crew to check the surface road');
  await press(page, 'Authorize the surface route');
  await expect(page.getByText('The crew is safe. Automatic routing is still offline.').first()).toBeVisible();
  await press(page, 'Skip scene');
  await expect(page.getByRole('heading', { name: 'Continuity site' })).toBeVisible();
}

export async function testRoute(page: Page, route: 'R01' | 'R02' | 'R03', source: RegExp) {
  await choose(page, 'radio', source);
  await choose(page, 'radio', new RegExp(`^${route}:`));
  await press(page, 'Test route');
}

export async function gate(page: Page, name: string) {
  return page.locator(`[data-gate="${name}"]`).getAttribute('data-status');
}

export async function reachRecovery(page: Page, choice: RegExp = /Hold at the turnout/) {
  await coldOpen(page, choice);
  await investigate(page);
  await exitField(page);
  await press(page, 'Open the continuity runbook');
}
