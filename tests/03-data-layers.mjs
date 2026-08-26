/**
 * E2E Suite 03: Multi-Domain Data Layers & Cockpit HUD
 */

import { ensureServerRunning, launchBrowser, resolveAppUrl, captureStepScreenshot } from './harness.js';

const TEST_NAME = '03-data-layers';

async function run() {
  console.log(`\n🚀 Running E2E Test: ${TEST_NAME}`);
  const url = resolveAppUrl();
  await ensureServerRunning(url);

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // Step 1: Open app & reveal Data Layer / Display panel
    await page.goto(`${url}/?welcome=0`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#cesiumContainer', { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));
    await captureStepScreenshot(page, TEST_NAME, 1, 'initial-globe-overview');

    // Step 2: Enable Satellites & Earthquakes layers
    await page.evaluate(async () => {
      const dm = window.__godsEyeView?.dataManager;
      if (dm) {
        await dm.setEnabled('satellites', true, { origin: 'user' });
        await dm.setEnabled('earthquakes', true, { origin: 'user' });
      }
    });
    await new Promise((r) => setTimeout(r, 2500));
    await captureStepScreenshot(page, TEST_NAME, 2, 'satellites-earthquakes-active');

    // Step 3: Enable CCTV camera feeds & Submarine Cables
    await page.evaluate(async () => {
      const dm = window.__godsEyeView?.dataManager;
      if (dm) {
        await dm.setEnabled('cctv', true, { origin: 'user' });
        await dm.setEnabled('telegeography-submarine-cables', true, { origin: 'user' });
      }
    });
    await new Promise((r) => setTimeout(r, 2500));
    await captureStepScreenshot(page, TEST_NAME, 3, 'cctv-submarine-cables-active');

    // Step 4: Toggle Cockpit / First-Person View Mode
    await page.evaluate(async () => {
      const runner = window.__godsEyeView?.voiceCommands?.runner;
      if (runner) {
        await runner('control_cockpit', { action: 'toggle' });
      }
    });
    await new Promise((r) => setTimeout(r, 2500));
    await captureStepScreenshot(page, TEST_NAME, 4, 'cockpit-first-person-hud');

    console.log(`✅ [${TEST_NAME}] All steps completed successfully.`);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(`❌ [${TEST_NAME}] Failed:`, err);
  process.exit(1);
});
