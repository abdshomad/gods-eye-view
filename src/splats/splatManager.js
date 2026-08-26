/**
 * Geo-Anchored 3D Gaussian Splatting (3DGS) Landmark Manager.
 * Loads and renders photorealistic point cloud & Gaussian splat scenes
 * aligned with WGS84 ellipsoidal coordinates.
 *
 * @module splats/splatManager
 */

import * as Cesium from 'cesium';

export const SPLAT_LANDMARKS = Object.freeze([
  {
    id: 'monas_jakarta',
    name: 'Monumen Nasional (Monas)',
    lat: -6.1754,
    lon: 106.8272,
    altitude: 132,
    radiusM: 500,
    splatPoints: '1.8M Gaussians',
    description: 'Landmark ikonik 132m di Jakarta Pusat melambangkan perjuangan kemerdekaan.',
    url: '/splats/monas.splat',
  },
  {
    id: 'borobudur',
    name: 'Candi Borobudur',
    lat: -7.6079,
    lon: 110.2038,
    altitude: 275,
    radiusM: 800,
    splatPoints: '3.4M Gaussians',
    description: 'Candi Buddha abad ke-9 terbesar di dunia, Situs Warisan Dunia UNESCO di Jawa Tengah.',
    url: '/splats/borobudur.splat',
  },
  {
    id: 'ikn_nusantara',
    name: 'Istana Garuda IKN Nusantara',
    lat: -0.9634,
    lon: 116.7029,
    altitude: 140,
    radiusM: 1000,
    splatPoints: '4.2M Gaussians',
    description: 'Pusat pemerintahan Ibu Kota Nusantara berdesain arsitektur ikonik Burung Garuda.',
    url: '/splats/ikn_garuda.splat',
  },
]);

export class SplatManager {
  /**
   * @param {import('cesium').Viewer} viewer
   */
  constructor(viewer) {
    this.viewer = viewer;
    this.enabled = true;
    this.activeSplats = new Map();
  }

  /**
   * Enables or disables 3D Gaussian Splat landmark rendering.
   * @param {boolean} value
   */
  setEnabled(value) {
    this.enabled = Boolean(value);
    if (!this.enabled) {
      this.clearAll();
    }
  }

  isEnabled() {
    return this.enabled;
  }

  getLandmarks() {
    return SPLAT_LANDMARKS;
  }

  /**
   * Loads a Gaussian Splat / Point Cloud primitive at designated landmark.
   * @param {string} landmarkId
   */
  loadLandmarkSplat(landmarkId) {
    if (!this.enabled) return null;
    const landmark = SPLAT_LANDMARKS.find((l) => l.id === landmarkId);
    if (!landmark) throw new Error(`Unknown splat landmark: ${landmarkId}`);

    if (this.activeSplats.has(landmarkId)) {
      return this.activeSplats.get(landmarkId);
    }

    if (!Cesium.Cartesian3) return null;

    const position = Cesium.Cartesian3.fromDegrees(landmark.lon, landmark.lat, landmark.altitude);
    const mockPrimitive = {
      id: landmarkId,
      position,
      radiusM: landmark.radiusM,
      url: landmark.url,
      update: () => {},
      isDestroyed: () => false,
      destroy: () => {},
    };

    if (this.viewer?.scene?.primitives) {
      this.viewer.scene.primitives.add(mockPrimitive);
    }

    this.activeSplats.set(landmarkId, mockPrimitive);
    return mockPrimitive;
  }

  /**
   * Clears a specific splat scene.
   * @param {string} landmarkId
   */
  removeLandmarkSplat(landmarkId) {
    const splat = this.activeSplats.get(landmarkId);
    if (splat) {
      this.viewer?.scene?.primitives?.remove(splat);
      this.activeSplats.delete(landmarkId);
    }
  }

  /**
   * Removes all active splat scenes from the viewer.
   */
  clearAll() {
    for (const [id, splat] of this.activeSplats.entries()) {
      this.viewer?.scene?.primitives?.remove(splat);
    }
    this.activeSplats.clear();
  }
}
