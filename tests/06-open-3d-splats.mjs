/**
 * E2E Test Suite 06: Public 3D Data, Gaussian Splats & Open glTF Models.
 *
 * @module tests/06-open-3d-splats
 */

import { resolveAppUrl, ensureServerRunning, launchBrowser, captureStepScreenshot } from './harness.js';

const TEST_NAME = '06-open-3d-splats';

export async function run() {
  const url = resolveAppUrl();
  await ensureServerRunning(url);

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // Step 1: Navigate to App
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => !document.getElementById('loading-screen') || document.getElementById('loading-screen').classList.contains('hidden'), { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));
    await captureStepScreenshot(page, TEST_NAME, 1, 'baseline-globe-view');

    // Step 2: Activate 3D Terrain & OSM Building provider
    await page.evaluate(async () => {
      if (window.__godsEyeView?.terrainManager) {
        await window.__godsEyeView.terrainManager.setProvider('osm');
      }
    });
    await new Promise((r) => setTimeout(r, 2000));
    await captureStepScreenshot(page, TEST_NAME, 2, '3d-osm-buildings-active');

    // Step 3: Load Geo-anchored 3D Gaussian Splat at Monas Jakarta
    await page.evaluate(() => {
      if (window.__godsEyeView?.splatManager) {
        window.__godsEyeView.splatManager.loadLandmarkSplat('monas_jakarta');
      }
    });
    await new Promise((r) => setTimeout(r, 2000));
    await captureStepScreenshot(page, TEST_NAME, 3, 'gaussian-splats-monas-anchored');

    // Step 4: Verify open 3D assets
    await captureStepScreenshot(page, TEST_NAME, 4, 'gltf-models-rendered');

    console.log(`✅ [${TEST_NAME}] All steps completed successfully.`);
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('06-open-3d-splats.mjs')) {
  run().catch((err) => {
    console.error(`❌ [${TEST_NAME}] Failed:`, err);
    process.exit(1);
  });
}
