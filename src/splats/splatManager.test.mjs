import test from 'node:test';
import assert from 'node:assert/strict';
import { SplatManager, SPLAT_LANDMARKS } from './splatManager.js';

test('SPLAT_LANDMARKS contains Indonesian photorealistic landmarks', () => {
  assert.ok(SPLAT_LANDMARKS.length >= 3);
  assert.equal(SPLAT_LANDMARKS[0].id, 'monas_jakarta');
  assert.equal(SPLAT_LANDMARKS[1].id, 'borobudur');
  assert.equal(SPLAT_LANDMARKS[2].id, 'ikn_nusantara');
});

test('SplatManager: lifecycle and primitive management', () => {
  const added = [];
  const removed = [];
  const mockViewer = {
    scene: {
      primitives: {
        add: (p) => added.push(p),
        remove: (p) => removed.push(p),
      },
    },
  };

  const manager = new SplatManager(mockViewer);
  assert.equal(manager.isEnabled(), true);

  const splat = manager.loadLandmarkSplat('monas_jakarta');
  assert.ok(splat);
  assert.equal(added.length, 1);

  manager.removeLandmarkSplat('monas_jakarta');
  assert.equal(removed.length, 1);

  manager.setEnabled(false);
  assert.equal(manager.isEnabled(), false);
});
