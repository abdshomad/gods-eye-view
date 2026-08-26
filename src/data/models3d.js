/**
 * Public 3D Model Registry and glTF Asset Provider for 3D Digital Twin.
 * Coordinates open 3D assets for aircraft, satellites, marine vessels, and towers.
 *
 * @module data/models3d
 */

export const OPEN_3D_MODELS = Object.freeze({
  airliner: Object.freeze({
    id: 'airliner',
    name: 'Commercial Airliner (Boeing / Airbus)',
    category: 'aviation',
    uri: '/models/airliner.glb',
    minimumPixelSize: 64,
    maximumScale: 200,
  }),
  fighter: Object.freeze({
    id: 'fighter',
    name: 'Tactical Fighter Jet',
    category: 'aviation',
    uri: '/models/fighter.glb',
    minimumPixelSize: 48,
    maximumScale: 150,
  }),
  iss: Object.freeze({
    id: 'iss',
    name: 'International Space Station (ISS)',
    category: 'space',
    uri: '/models/iss.glb',
    minimumPixelSize: 80,
    maximumScale: 500,
  }),
  cargo_ship: Object.freeze({
    id: 'cargo_ship',
    name: 'Container Cargo Vessel',
    category: 'maritime',
    uri: '/models/cargo_ship.glb',
    minimumPixelSize: 64,
    maximumScale: 300,
  }),
  telecom_tower: Object.freeze({
    id: 'telecom_tower',
    name: '5G Telecom / Fiber Tower',
    category: 'infrastructure',
    uri: '/models/telecom_tower.glb',
    minimumPixelSize: 32,
    maximumScale: 100,
  }),
});

export class Model3DRegistry {
  constructor() {
    this.models = new Map(Object.entries(OPEN_3D_MODELS));
  }

  getModel(id) {
    return this.models.get(id) || null;
  }

  getModelsByCategory(category) {
    return Array.from(this.models.values()).filter((m) => m.category === category);
  }

  listAll() {
    return Array.from(this.models.values());
  }
}

export const globalModelRegistry = new Model3DRegistry();
