import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalTtsController } from './localTtsController.js';

test('createLocalTtsController: mute persistence and toggling', () => {
  const mockStorage = new Map();
  const storageAdapter = {
    getItem: (k) => mockStorage.get(k) ?? null,
    setItem: (k, v) => mockStorage.set(k, String(v)),
  };

  const tts = createLocalTtsController({
    storage: storageAdapter,
  });

  assert.equal(tts.isMuted(), false);
  assert.equal(tts.toggleMute(), true);
  assert.equal(tts.isMuted(), true);
  assert.equal(storageAdapter.getItem('godsEyeView.localTts.muted'), 'true');

  const tts2 = createLocalTtsController({
    storage: storageAdapter,
  });
  assert.equal(tts2.isMuted(), true);
});

test('createLocalTtsController: speak triggers synthesis when supported and unmuted', () => {
  let spokenUtterance = null;
  let cancelled = false;

  const mockSynthesis = {
    cancel: () => { cancelled = true; },
    speak: (u) => { spokenUtterance = u; },
    getVoices: () => [{ name: 'Samantha', lang: 'en-US' }],
  };

  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.rate = 1;
      this.pitch = 1;
      this.volume = 1;
      this.voice = null;
    }
  };

  const tts = createLocalTtsController({
    speechSynthesis: mockSynthesis,
  });

  assert.equal(tts.speak('Hello World'), true);
  assert.equal(cancelled, true);
  assert.equal(spokenUtterance.text, 'Hello World');

  tts.setMuted(true);
  assert.equal(tts.speak('Ignored text'), false);
});
