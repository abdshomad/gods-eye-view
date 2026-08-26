/**
 * E2E Suite 01: Globe Exploration & First-Run Experience
 */

import { ensureServerRunning, launchBrowser, resolveAppUrl, captureStepScreenshot } from './harness.js';

const TEST_NAME = '01-globe-exploration';

async function run() {
  console.log(`\n🚀 Running E2E Test: ${TEST_NAME}`);
  const url = resolveAppUrl();
  await ensureServerRunning(url);

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // Step 1: Navigate to App & Capture Initial Loading
    await page.goto(`${url}/?welcome=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await captureStepScreenshot(page, TEST_NAME, 1, 'initial-loading');

    // Step 2: Wait for First-Run Launcher Modal
    await page.waitForSelector('#first-run-launcher, #loader', { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1500));
    await captureStepScreenshot(page, TEST_NAME, 2, 'first-run-launcher-modal');

    // Step 3: Dismiss Launcher or Explore Manually & Settle Globe
    await page.evaluate(() => {
      const exploreBtn = document.querySelector('.first-run-explore-btn') ||
        document.getElementById('first-run-dismiss');
      if (exploreBtn) exploreBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));
    await captureStepScreenshot(page, TEST_NAME, 3, 'globe-view-settled');

    // Step 4: Navigate to City Preset (e.g. Austin or Tokyo)
    await page.evaluate(() => {
      if (window.__godsEyeView?.voiceCommands?.runner) {
        window.__godsEyeView.voiceCommands.runner('zoom_to_location', { query: 'Tokyo' });
      }
    });
    await new Promise((r) => setTimeout(r, 3000));
    await captureStepScreenshot(page, TEST_NAME, 4, 'navigated-city-target');

    console.log(`✅ [${TEST_NAME}] All steps completed successfully.`);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(`❌ [${TEST_NAME}] Failed:`, err);
  process.exit(1);
});
