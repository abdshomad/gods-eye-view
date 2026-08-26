import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVoiceIntent, createLocalSpeechEngine } from './localSpeechEngine.js';

test('parseVoiceIntent: parses globe navigation commands', () => {
  assert.deepEqual(parseVoiceIntent('zoom to globe'), {
    tool: 'zoom_to_globe',
    args: {},
    feedback: 'Mengarahkan ke tampilan global bumi.',
  });
  assert.deepEqual(parseVoiceIntent('kembali ke bumi'), {
    tool: 'zoom_to_globe',
    args: {},
    feedback: 'Mengarahkan ke tampilan global bumi.',
  });
});

test('parseVoiceIntent: parses location queries in Indonesian and English', () => {
  assert.deepEqual(parseVoiceIntent('fly to Tokyo'), {
    tool: 'zoom_to_location',
    args: { query: 'tokyo' },
    feedback: 'Menavigasi ke tokyo.',
  });
  assert.deepEqual(parseVoiceIntent('terbang ke Jakarta'), {
    tool: 'zoom_to_location',
    args: { query: 'jakarta' },
    feedback: 'Menavigasi ke jakarta.',
  });
  assert.deepEqual(parseVoiceIntent('arahkan ke Monas'), {
    tool: 'zoom_to_location',
    args: { query: 'monas' },
    feedback: 'Menavigasi ke monas.',
  });
  assert.deepEqual(parseVoiceIntent('indonesia'), {
    tool: 'zoom_to_location',
    args: { query: 'indonesia' },
    feedback: 'Menavigasi ke indonesia.',
  });
});

test('parseVoiceIntent: parses layer commands in Indonesian and English', () => {
  assert.deepEqual(parseVoiceIntent('tampilkan pesawat'), {
    tool: 'set_layer_visibility',
    args: { layerId: 'flights', enabled: true },
    feedback: 'Mengaktifkan lapisan pesawat.',
  });
  assert.deepEqual(parseVoiceIntent('matikan satelit'), {
    tool: 'set_layer_visibility',
    args: { layerId: 'satellites', enabled: false },
    feedback: 'Menonaktifkan lapisan satelit.',
  });
  assert.deepEqual(parseVoiceIntent('aktifkan gempa'), {
    tool: 'set_layer_visibility',
    args: { layerId: 'earthquakes', enabled: true },
    feedback: 'Mengaktifkan lapisan gempa.',
  });
});

test('parseVoiceIntent: parses visual styles and demo tour', () => {
  assert.deepEqual(parseVoiceIntent('mode termal'), {
    tool: 'set_visual_style',
    args: { style: 'thermal' },
    feedback: 'Beralih ke gaya visual thermal.',
  });
  assert.deepEqual(parseVoiceIntent('mulai demo'), {
    tool: 'start_demo_tour',
    args: {},
    feedback: 'Memulai simulasi tur fitur 3D Digital Twin.',
  });
  assert.deepEqual(parseVoiceIntent('lapisan 3d osm'), {
    tool: 'set_terrain_provider',
    args: { provider: 'osm' },
    feedback: 'Beralih ke lapisan bangunan 3D OpenStreetMap.',
  });
  assert.deepEqual(parseVoiceIntent('inspeksi borobudur'), {
    tool: 'inspect_landmark_splat',
    args: { landmarkId: 'borobudur' },
    feedback: 'Memuat rekonstruksi 3D BOROBUDUR.',
  });
});

test('parseVoiceIntent: parses cockpit toggles', () => {
  assert.deepEqual(parseVoiceIntent('mode kokpit'), {
    tool: 'control_cockpit',
    args: { action: 'toggle' },
    feedback: 'Mengubah mode kokpit.',
  });
});

test('createLocalSpeechEngine: handles lifecycle and mock recognition', async () => {
  let executedTool = null;
  let executedArgs = null;
  const executedActions = [];

  class MockSpeechRecognition {
    constructor() {
      this.continuous = false;
      this.interimResults = false;
      this.lang = 'en-US';
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
    }
    start() {}
    stop() {
      if (this.onend) this.onend();
    }
  }

  const states = [];
  const transcripts = [];
  const spokenFeedbacks = [];

  const engine = createLocalSpeechEngine({
    actionRunner: async (tool, args) => {
      executedTool = tool;
      executedArgs = args;
      executedActions.push({ tool, args });
    },
    ttsController: {
      speak: (text) => spokenFeedbacks.push(text),
    },
    onStateChange: (state) => states.push(state),
    onTranscript: (t) => transcripts.push(t),
    SpeechRecognition: MockSpeechRecognition,
  });

  assert.equal(engine.isSupported, true);
  assert.equal(engine.isActive(), false);

  assert.equal(engine.start(), true);
  assert.equal(engine.isActive(), true);
  assert.ok(states.includes('listening'));

  engine.stop();
  assert.equal(engine.isActive(), false);
  assert.equal(states[states.length - 1], 'idle');
});
