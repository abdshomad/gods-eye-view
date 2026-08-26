/**
 * Shared E2E Test Harness with Puppeteer and Step-by-Step Screenshot Capture.
 *
 * @module tests/harness
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function readDotenvPort() {
  try {
    const envContent = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    const m = envContent.match(/^PORT=(\d+)/m);
    if (m) return m[1];
  } catch {}
  return '4018';
}

export function resolveAppUrl() {
  const port = process.env.PORT || readDotenvPort();
  return process.env.APP_URL || `http://127.0.0.1:${port}`;
}

export async function isServerUp(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
    return res.ok || res.status === 200 || res.status === 304;
  } catch {
    return false;
  }
}

export async function ensureServerRunning(url = resolveAppUrl()) {
  if (await isServerUp(url)) return null;

  console.log(`[E2E Harness] Dev server not detected at ${url}, spawning 'npm run dev'...`);
  const proc = spawn('npm', ['run', 'dev'], {
    cwd: ROOT,
    stdio: 'ignore',
    detached: true,
  });
  proc.unref();

  const start = Date.now();
  while (Date.now() - start < 15000) {
    await new Promise((r) => setTimeout(r, 600));
    if (await isServerUp(url)) {
      console.log(`[E2E Harness] Dev server is ready at ${url}`);
      return proc;
    }
  }
  throw new Error(`[E2E Harness] Timed out waiting for dev server at ${url}`);
}

export async function launchBrowser({ headless = 'new' } = {}) {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH ||
    (() => { try { return puppeteer.executablePath(); } catch { return null; } })();

  return puppeteer.launch({
    headless,
    ...(executablePath && fs.existsSync(executablePath) ? { executablePath } : {}),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--window-size=1440,900',
    ],
    protocolTimeout: 180000,
  });
}

export async function captureStepScreenshot(page, testName, stepNum, slug) {
  const dir = path.resolve(ROOT, 'screenshots', testName);
  fs.mkdirSync(dir, { recursive: true });

  const numStr = String(stepNum).padStart(2, '0');
  const filename = `${numStr}-${slug}.png`;
  const filePath = path.join(dir, filename);

  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  📸 [Step ${numStr}] Captured: screenshots/${testName}/${filename}`);
  return filePath;
}
