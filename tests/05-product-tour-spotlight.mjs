/**
 * E2E Test Suite 05: Spotlight Product Tour & Interactive Walkthrough.
 *
 * @module tests/05-product-tour-spotlight
 */

import { resolveAppUrl, ensureServerRunning, launchBrowser, captureStepScreenshot } from './harness.js';

const TEST_NAME = '05-product-tour-spotlight';

export async function run() {
  const url = resolveAppUrl();
  await ensureServerRunning(url);

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // Step 1: Navigate to App & Wait for loading to settle
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.evaluate(() => {
      const exploreBtn = document.querySelector('.first-run-explore-btn') ||
        document.getElementById('first-run-dismiss');
      if (exploreBtn) exploreBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));
    await captureStepScreenshot(page, TEST_NAME, 1, 'app-loaded-standby');

    // Step 2: Trigger Product Tour
    await page.evaluate(() => {
      if (window.__gevProductTour) {
        window.__gevProductTour.start();
      } else {
        const btn = document.getElementById('product-tour-help-btn');
        if (btn) btn.click();
      }
    });
    await page.waitForSelector('#product-tour-overlay', { timeout: 10000 });
    await page.waitForSelector('#product-tour-ring', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1500));
    await captureStepScreenshot(page, TEST_NAME, 2, 'spotlight-header-highlight');

    // Step 3: Advance to Step 3 (Voice Mic)
    await page.evaluate(() => {
      window.__gevProductTour?.next?.();
      window.__gevProductTour?.next?.();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await captureStepScreenshot(page, TEST_NAME, 3, 'spotlight-voice-mic-highlight');

    // Step 4: Advance to Step 4 (Data Toggles Panel)
    await page.evaluate(() => {
      window.__gevProductTour?.next?.();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await captureStepScreenshot(page, TEST_NAME, 4, 'spotlight-data-layers-highlight');

    // Clean up
    await page.evaluate(() => {
      window.__gevProductTour?.stop();
    });

    console.log(`✅ [${TEST_NAME}] All steps completed successfully.`);
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('05-product-tour-spotlight.mjs')) {
  run().catch((err) => {
    console.error(`❌ [${TEST_NAME}] Failed:`, err);
    process.exit(1);
  });
}
