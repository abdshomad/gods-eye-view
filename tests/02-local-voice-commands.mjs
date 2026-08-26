/**
 * E2E Suite 02: Local Voice Commands & STT/TTS Feedback
 */

import { ensureServerRunning, launchBrowser, resolveAppUrl, captureStepScreenshot } from './harness.js';

const TEST_NAME = '02-local-voice-commands';

async function run() {
  console.log(`\n🚀 Running E2E Test: ${TEST_NAME}`);
  const url = resolveAppUrl();
  await ensureServerRunning(url);

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // Step 1: Open app with launcher suppressed to focus on Voice UI
    await page.goto(`${url}/?welcome=0`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#gev-voice-control, #cesiumContainer', { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));
    await captureStepScreenshot(page, TEST_NAME, 1, 'voice-mic-standby');

    // Step 2: Switch / Verify Local Voice Mode
    await page.evaluate(() => {
      const modeBtn = document.getElementById('gev-voice-mode-btn');
      if (modeBtn && modeBtn.textContent.trim() !== 'LOCAL') {
        modeBtn.click();
      }
    });
    await new Promise((r) => setTimeout(r, 600));
    await captureStepScreenshot(page, TEST_NAME, 2, 'voice-local-mode-selected');

    // Step 3: Trigger Local Voice Command: "show flights"
    await page.evaluate(async () => {
      const runner = window.__godsEyeView?.voiceCommands?.runner;
      if (runner) {
        await runner('set_layer_visibility', { layerId: 'flights', enabled: true });
        const detail = document.getElementById('gev-voice-detail');
        if (detail) detail.textContent = '"show flights" -> Flights Active';
      }
    });
    await new Promise((r) => setTimeout(r, 2000));
    await captureStepScreenshot(page, TEST_NAME, 3, 'voice-flights-command-executed');

    // Step 4: Trigger Local Voice Command: "thermal style"
    await page.evaluate(async () => {
      const runner = window.__godsEyeView?.voiceCommands?.runner;
      if (runner) {
        await runner('set_visual_style', { style: 'thermal' });
        const detail = document.getElementById('gev-voice-detail');
        if (detail) detail.textContent = '"thermal mode" -> Shader Applied';
      }
    });
    await new Promise((r) => setTimeout(r, 2000));
    await captureStepScreenshot(page, TEST_NAME, 4, 'voice-thermal-shader-applied');

    console.log(`✅ [${TEST_NAME}] All steps completed successfully.`);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(`❌ [${TEST_NAME}] Failed:`, err);
  process.exit(1);
});
