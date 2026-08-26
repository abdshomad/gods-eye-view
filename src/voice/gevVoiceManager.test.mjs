import test from 'node:test';
import assert from 'node:assert/strict';
import { createUnifiedVoiceManager, readStoredVoiceMode, writeStoredVoiceMode } from './gevVoiceManager.js';

test('readStoredVoiceMode & writeStoredVoiceMode: handles storage', () => {
  const map = new Map();
  const mockStorage = {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, String(v)),
  };

  assert.equal(readStoredVoiceMode(mockStorage), 'local');
  writeStoredVoiceMode(mockStorage, 'cloud');
  assert.equal(readStoredVoiceMode(mockStorage), 'cloud');
});

test('createUnifiedVoiceManager: mode switching and fallback without cloud API key', () => {
  const map = new Map();
  const mockStorage = {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, String(v)),
  };

  let cloudStarted = false;
  let cloudStopped = false;
  const mockCloudController = {
    isActive: () => cloudStarted,
    start: () => { cloudStarted = true; },
    stop: () => { cloudStarted = false; cloudStopped = true; },
    syncCostUi: () => {},
  };

  const mockUi = {
    root: { dataset: {} },
    status: { textContent: '' },
    detail: { textContent: '' },
    costValue: { textContent: '' },
    tierButton: { style: {} },
  };

  const manager = createUnifiedVoiceManager({
    actionRunner: async () => {},
    cloudController: mockCloudController,
    ui: mockUi,
    storage: mockStorage,
    hasCloudApiKey: false,
  });

  assert.equal(manager.getMode(), 'local');
  assert.equal(mockUi.costValue.textContent, 'FREE');

  manager.setMode('cloud');
  assert.equal(manager.getMode(), 'cloud');

  manager.setMode('local');
  assert.equal(manager.getMode(), 'local');

  // Test start/toggle greeting
  let spoken = [];
  manager.tts.speak = (t) => spoken.push(t);
  manager.start();
  assert.ok(spoken.includes('Siap! Silahkan bertanya apa saja'));
});
