/**
 * Master E2E Test Suite Runner.
 * Executes all tests in sequence and verifies generated screenshots.
 *
 * @module tests/run-all-e2e
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fork } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SUITES = [
  'tests/01-globe-exploration.mjs',
  'tests/02-local-voice-commands.mjs',
  'tests/03-data-layers.mjs',
  'tests/04-indonesian-demo-mode.mjs',
  'tests/05-product-tour-spotlight.mjs',
  'tests/06-open-3d-splats.mjs',
];

async function runSuite(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = fork(path.resolve(ROOT, scriptPath), [], {
      stdio: 'inherit',
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Suite ${scriptPath} exited with code ${code}`));
    });
  });
}

async function main() {
  console.log('====================================================');
  console.log('       GOD\'S EYE VIEW — E2E TEST RUNNER             ');
  console.log('====================================================');

  const results = [];
  for (const suite of SUITES) {
    const start = Date.now();
    try {
      await runSuite(suite);
      results.push({ suite, status: 'PASS', durationMs: Date.now() - start });
    } catch (err) {
      results.push({ suite, status: 'FAIL', durationMs: Date.now() - start, error: err.message });
    }
  }

  console.log('\n====================================================');
  console.log('                  E2E SUMMARY                       ');
  console.log('====================================================');
  let allPass = true;
  for (const res of results) {
    const icon = res.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${res.suite.padEnd(35)} [${res.status}] (${(res.durationMs / 1000).toFixed(2)}s)`);
    if (res.status !== 'PASS') allPass = false;
  }

  // Verify and count screenshots
  const screenshotsDir = path.resolve(ROOT, 'screenshots');
  if (fs.existsSync(screenshotsDir)) {
    console.log('\n📸 Generated Screenshots:');
    const dirs = fs.readdirSync(screenshotsDir);
    for (const d of dirs) {
      const sub = path.join(screenshotsDir, d);
      if (fs.statSync(sub).isDirectory()) {
        const files = fs.readdirSync(sub).filter((f) => f.endsWith('.png'));
        console.log(`  📁 screenshots/${d}/ (${files.length} step images)`);
        for (const f of files) {
          console.log(`     • ${f}`);
        }
      }
    }
  }

  if (!allPass) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal E2E error:', err);
  process.exit(1);
});
