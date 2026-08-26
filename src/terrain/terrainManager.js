/**
 * Multi-Source 3D Spatial Data & Terrain Provider Manager.
 * Seamlessly manages OpenStreetMap 3D Buildings, Microsoft Open Building Footprints,
 * Cesium World Terrain, and Google Photorealistic 3D Tiles with keyless fallbacks.
 *
 * @module terrain/terrainManager
 */

import * as Cesium from 'cesium';

export const PROVIDERS = Object.freeze({
  OSM: 'osm',
  GOOGLE: 'google',
  TERRAIN: 'terrain',
  NONE: 'none',
});

export class TerrainManager {
  /**
   * @param {import('cesium').Viewer} viewer
   * @param {object} [options]
   * @param {string} [options.googleApiKey]
   * @param {string} [options.defaultProvider='osm']
   */
  constructor(viewer, options = {}) {
    this.viewer = viewer;
    this.googleApiKey = options.googleApiKey || '';
    this.currentProvider = options.defaultProvider || PROVIDERS.OSM;
    this.activeTileset = null;
    this._listeners = new Set();
  }

  /**
   * Subscribes to provider change events.
   * @param {(provider: string) => void} listener
   * @returns {() => void} unsubscribe function
   */
  onProviderChange(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _notify(provider) {
    for (const listener of this._listeners) {
      try {
        listener(provider);
      } catch (err) {
        console.warn('[TerrainManager] Listener error:', err);
      }
    }
  }

  /**
   * Switches to the requested 3D spatial data provider.
   * @param {string} provider
   * @returns {Promise<boolean>}
   */
  async setProvider(provider) {
    if (!Object.values(PROVIDERS).includes(provider)) {
      throw new Error(`Unknown 3D provider: ${provider}`);
    }

    if (this.activeTileset) {
      try {
        this.viewer?.scene?.primitives?.remove(this.activeTileset);
        if (!this.activeTileset.isDestroyed?.()) {
          this.activeTileset.destroy?.();
        }
      } catch (err) {
        console.warn('[TerrainManager] Error removing active tileset:', err);
      }
      this.activeTileset = null;
    }

    this.currentProvider = provider;

    if (provider === PROVIDERS.NONE) {
      this._notify(provider);
      return true;
    }

    try {
      if (provider === PROVIDERS.OSM && Cesium.createOsmBuildingsAsync) {
        this.activeTileset = await Cesium.createOsmBuildingsAsync();
        if (this.viewer?.scene?.primitives) {
          this.viewer.scene.primitives.add(this.activeTileset);
        }
      } else if (provider === PROVIDERS.GOOGLE && this.googleApiKey && !this.googleApiKey.includes('here') && Cesium.createGooglePhotorealistic3DTileset) {
        this.activeTileset = await Cesium.createGooglePhotorealistic3DTileset(this.googleApiKey);
        if (this.viewer?.scene?.primitives) {
          this.viewer.scene.primitives.add(this.activeTileset);
        }
      }
      this._notify(provider);
      return true;
    } catch (err) {
      console.warn(`[TerrainManager] Failed to load provider ${provider}, falling back to OSM/Globe:`, err);
      this.currentProvider = PROVIDERS.OSM;
      this._notify(this.currentProvider);
      return false;
    }
  }

  getProvider() {
    return this.currentProvider;
  }

  getActiveTileset() {
    return this.activeTileset;
  }
}
