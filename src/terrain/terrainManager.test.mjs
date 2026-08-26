import test from 'node:test';
import assert from 'node:assert/strict';
import { TerrainManager, PROVIDERS } from './terrainManager.js';

test('TerrainManager: initializes with default OSM provider', () => {
  const mockPrimitives = {
    add: () => {},
    remove: () => {},
  };
  const mockViewer = {
    scene: { primitives: mockPrimitives },
  };

  const manager = new TerrainManager(mockViewer);
  assert.equal(manager.getProvider(), PROVIDERS.OSM);
});

test('TerrainManager: switches provider and notifies listeners', async () => {
  const mockPrimitives = {
    add: () => {},
    remove: () => {},
  };
  const mockViewer = {
    scene: { primitives: mockPrimitives },
  };

  const manager = new TerrainManager(mockViewer);
  const events = [];
  manager.onProviderChange((p) => events.push(p));

  await manager.setProvider(PROVIDERS.NONE);
  assert.equal(manager.getProvider(), PROVIDERS.NONE);
  assert.deepEqual(events, [PROVIDERS.NONE]);
});
