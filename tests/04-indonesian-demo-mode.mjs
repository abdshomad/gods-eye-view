/**
 * E2E Test Suite 04: Indonesian Voice & Automated Feature Demo Mode.
 *
 * @module tests/04-indonesian-demo-mode
 */

import { resolveAppUrl, ensureServerRunning, launchBrowser, captureStepScreenshot } from './harness.js';

const TEST_NAME = '04-indonesian-demo-mode';

export async function run() {
  const url = resolveAppUrl();
  await ensureServerRunning(url);

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // Step 1: Navigate to App & Capture Indonesian Default View
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => !document.getElementById('loading-screen') || document.getElementById('loading-screen').classList.contains('hidden'), { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));
    await captureStepScreenshot(page, TEST_NAME, 1, 'indonesia-initial-view');

    // Step 2: Trigger Automated Demo Mode
    await page.evaluate(() => {
      if (window.__gevDemoTour) {
        window.__gevDemoTour.start();
      } else {
        const btn = document.getElementById('demo-tour-btn');
        if (btn) btn.click();
      }
    });
    await page.waitForSelector('#demo-tour-hud', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1500));
    await captureStepScreenshot(page, TEST_NAME, 2, 'demo-tour-hud-active');

    // Step 3: Verify Aviation & Satellite Radar Simulation
    await page.evaluate(() => {
      window.__godsEyeView?.dataManager?.setEnabled?.('flights', true);
      window.__godsEyeView?.dataManager?.setEnabled?.('satellites', true);
    });
    await new Promise((r) => setTimeout(r, 2500));
    await captureStepScreenshot(page, TEST_NAME, 3, 'demo-radar-layers-simulated');

    // Step 4: Verify Thermal Sensor and Cockpit Mode Simulation
    await page.evaluate(() => {
      window.__godsEyeView?.styleManager?.setStyle('thermal');
      window.__godsEyeView?.styleManager?.setCockpitMode?.(true);
    });
    await new Promise((r) => setTimeout(r, 2500));
    await captureStepScreenshot(page, TEST_NAME, 4, 'demo-thermal-cockpit-simulated');

    // Clean up demo mode
    await page.evaluate(() => {
      window.__gevDemoTour?.stop();
    });

    console.log(`✅ [${TEST_NAME}] All steps completed successfully.`);
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('04-indonesian-demo-mode.mjs')) {
  run().catch((err) => {
    console.error(`❌ [${TEST_NAME}] Failed:`, err);
    process.exit(1);
  });
}
