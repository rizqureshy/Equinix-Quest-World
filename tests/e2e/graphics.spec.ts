import { expect, test } from '@playwright/test';
import { EPISODE, coldOpen, exitField, gate, investigate, press, reachRecovery, testRoute } from './helpers';

const GAUGE = /Verified partner gauge/;

test('with WebGL unavailable the whole episode completes in 2D', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type.startsWith('webgl')) return null;
      return (original as (...args: unknown[]) => unknown).call(this, type, ...rest);
    } as typeof original;
  });
  await coldOpen(page, /Hold at the turnout/);
  await expect(page.locator('.scene')).toHaveAttribute('data-mode', '2d');
  await expect(page.locator('svg.schematic')).toBeVisible();
  await expect(page.getByText('Showing the 2D view.', { exact: false })).toBeVisible();
  await investigate(page);
  await exitField(page);
  await press(page, 'Open the continuity runbook');
  await expect(page.locator('svg.schematic')).toBeVisible();
  await testRoute(page, 'R02', GAUGE);
  await expect(page.locator('svg.schematic')).toContainText('BLOCKED');
  await testRoute(page, 'R03', GAUGE);
  expect(await gate(page, 'Response time')).toBe('pass');
  await expect(page.locator('svg.schematic')).toContainText('ACTIVE');
  await press(page, 'Brief Elena');
  await press(page, 'Review my response');
  await press(page, 'Continue');
  await press(page, 'Skip scene');
  await expect(page.getByText('Ghost Feed complete.', { exact: false })).toBeVisible();
});

test('the 2D-only setting gives the same route results', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('signal-run/settings', JSON.stringify({ graphics: '2d' })));
  await reachRecovery(page);
  await expect(page.locator('.scene')).toHaveAttribute('data-mode', '2d');
  await testRoute(page, 'R01', GAUGE);
  expect(await gate(page, 'Response time')).toBe('fail');
});

test('WebGL: enter, inspect, scrub and exit the reconstruction with one render loop', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await coldOpen(page, /Hold at the turnout/);
  await expect(page.locator('.scene')).toHaveAttribute('data-mode', '3d');
  const canvas = page.locator('.scene canvas');
  await expect(canvas).toHaveAttribute('data-ready', 'true');
  expect(await page.evaluate(() => window.__signalRunLoops)).toBe(1);

  // The canvas is actually drawing: not a single flat color.
  const distinct = await canvas.evaluate((c: HTMLCanvasElement) => new Promise<number>((resolve) => {
    requestAnimationFrame(() => {
      const probe = document.createElement('canvas');
      probe.width = 64;
      probe.height = 40;
      const ctx = probe.getContext('2d')!;
      ctx.drawImage(c, 0, 0, 64, 40);
      const data = ctx.getImageData(0, 0, 64, 40).data;
      const seen = new Set<number>();
      for (let i = 0; i < data.length; i += 4) seen.add((data[i]! << 16) | (data[i + 1]! << 8) | data[i + 2]!);
      resolve(seen.size);
    });
  }));
  expect(distinct).toBeGreaterThan(20);

  await press(page, 'Open the underpass camera');
  await press(page, 'Play footage');
  await press(page, 'Whole district');
  await investigate(page, true);
  await exitField(page);
  await expect(canvas).toHaveAttribute('data-ready', 'true');
  expect(await page.evaluate(() => window.__signalRunLoops)).toBe(1);

  // Repeated replays must not stack render loops.
  await press(page, 'Open the continuity runbook');
  for (let i = 0; i < 4; i++) {
    await testRoute(page, 'R03', GAUGE);
    await press(page, 'Replay recovery');
    await expect(page.locator('.scene canvas')).toHaveAttribute('data-ready', 'true');
    expect(await page.evaluate(() => window.__signalRunLoops)).toBe(1);
  }
  await testRoute(page, 'R03', GAUGE);
  await press(page, 'Brief Elena');
  expect(await page.evaluate(() => window.__signalRunLoops)).toBe(0);
  expect(errors).toEqual([]);
  await page.goto(EPISODE);
});

test('clicking the camera in the 3D scene opens the feed', async ({ page }) => {
  await coldOpen(page, /Hold at the turnout/);
  const canvas = page.locator('.scene canvas');
  await expect(canvas).toHaveAttribute('data-ready', 'true');
  await press(page, 'Focus camera');
  await page.waitForTimeout(1500);
  const box = (await canvas.boundingBox())!;
  // After focusing, the camera plane sits at the centre of the view.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByRole('button', { name: 'Next frame' })).toBeVisible();
});
