/**
 * Atmospheric Lighting & Tropical Climate Presets for 3D Digital Twin.
 * Calibrates Rayleigh scattering, solar illumination, and ambient glow
 * for Southeast Asian equatorial regions.
 *
 * @module atmosphere
 */

import * as Cesium from 'cesium';

export const ATMOSPHERE_PRESETS = Object.freeze({
  tropical_day: Object.freeze({
    id: 'tropical_day',
    name: 'Tropical Equatorial Day',
    lighting: true,
    atmosphereHueShift: 0.0,
    atmosphereSaturationShift: 0.1,
    atmosphereBrightnessShift: 0.05,
    fogDensity: 0.0001,
  }),
  tropical_golden_hour: Object.freeze({
    id: 'tropical_golden_hour',
    name: 'Archipelago Golden Hour',
    lighting: true,
    atmosphereHueShift: 0.08,
    atmosphereSaturationShift: 0.35,
    atmosphereBrightnessShift: -0.1,
    fogDensity: 0.0002,
  }),
  tropical_night: Object.freeze({
    id: 'tropical_night',
    name: 'Tropical Night & Maritime Luminescence',
    lighting: true,
    atmosphereHueShift: -0.1,
    atmosphereSaturationShift: -0.2,
    atmosphereBrightnessShift: -0.4,
    fogDensity: 0.00005,
  }),
});

export class AtmosphereController {
  /**
   * @param {import('cesium').Viewer} viewer
   */
  constructor(viewer) {
    this.viewer = viewer;
    this.currentPreset = 'tropical_day';
  }

  getPreset() {
    return this.currentPreset;
  }

  /**
   * Applies atmospheric lighting preset to the Cesium scene.
   * @param {'tropical_day'|'tropical_golden_hour'|'tropical_night'} presetId
   */
  applyPreset(presetId) {
    const preset = ATMOSPHERE_PRESETS[presetId];
    if (!preset) throw new Error(`Unknown atmospheric preset: ${presetId}`);

    this.currentPreset = presetId;
    const scene = this.viewer?.scene;
    if (!scene) return false;

    if (scene.globe) {
      scene.globe.enableLighting = preset.lighting;
      if (scene.globe.atmosphere) {
        scene.globe.atmosphere.hueShift = preset.atmosphereHueShift;
        scene.globe.atmosphere.saturationShift = preset.atmosphereSaturationShift;
        scene.globe.atmosphere.brightnessShift = preset.atmosphereBrightnessShift;
      }
    }
    if (scene.fog) {
      scene.fog.density = preset.fogDensity;
      scene.fog.enabled = true;
    }
    return true;
  }
}
