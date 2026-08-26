import test from 'node:test';
import assert from 'node:assert/strict';
import { OPEN_3D_MODELS, Model3DRegistry, globalModelRegistry } from './models3d.js';

test('OPEN_3D_MODELS contains all core category assets', () => {
  assert.ok(OPEN_3D_MODELS.airliner);
  assert.ok(OPEN_3D_MODELS.fighter);
  assert.ok(OPEN_3D_MODELS.iss);
  assert.ok(OPEN_3D_MODELS.cargo_ship);
  assert.ok(OPEN_3D_MODELS.telecom_tower);
});

test('Model3DRegistry: queries models by category and id', () => {
  const registry = new Model3DRegistry();
  const aviation = registry.getModelsByCategory('aviation');
  assert.equal(aviation.length, 2);

  const iss = registry.getModel('iss');
  assert.equal(iss.name, 'International Space Station (ISS)');
});
