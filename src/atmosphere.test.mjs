import test from 'node:test';
import assert from 'node:assert/strict';
import { ATMOSPHERE_PRESETS, AtmosphereController } from './atmosphere.js';

test('ATMOSPHERE_PRESETS contains equatorial presets', () => {
  assert.ok(ATMOSPHERE_PRESETS.tropical_day);
  assert.ok(ATMOSPHERE_PRESETS.tropical_golden_hour);
  assert.ok(ATMOSPHERE_PRESETS.tropical_night);
});

test('AtmosphereController: applies presets to Cesium globe scene', () => {
  const mockScene = {
    globe: {
      enableLighting: false,
      atmosphere: {
        hueShift: 0,
        saturationShift: 0,
        brightnessShift: 0,
      },
    },
    fog: {
      density: 0,
      enabled: false,
    },
  };
  const mockViewer = { scene: mockScene };

  const controller = new AtmosphereController(mockViewer);
  assert.equal(controller.getPreset(), 'tropical_day');

  controller.applyPreset('tropical_golden_hour');
  assert.equal(controller.getPreset(), 'tropical_golden_hour');
  assert.equal(mockScene.globe.enableLighting, true);
  assert.equal(mockScene.globe.atmosphere.hueShift, 0.08);
  assert.equal(mockScene.fog.enabled, true);
});
