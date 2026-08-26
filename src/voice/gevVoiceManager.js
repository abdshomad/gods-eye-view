/**
 * Unified Voice Manager for God's Eye View.
 * Coordinates Local (Browser-native Web Speech STT/TTS) and Cloud (OpenAI Realtime) modes.
 *
 * @module voice/gevVoiceManager
 */

import { createLocalSpeechEngine } from './localSpeechEngine.js';
import { createLocalTtsController } from './localTtsController.js';

const MODE_STORAGE_KEY = 'godsEyeView.voiceMode';

export function readStoredVoiceMode(storage) {
  try {
    if (storage) return storage.getItem(MODE_STORAGE_KEY) || 'local';
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(MODE_STORAGE_KEY) || 'local';
    }
  } catch {}
  return 'local';
}

export function writeStoredVoiceMode(storage, mode) {
  try {
    if (storage) storage.setItem(MODE_STORAGE_KEY, mode);
    else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    }
  } catch {}
}

/**
 * Creates the unified voice manager coordinating local STT/TTS and cloud Realtime.
 */
export function createUnifiedVoiceManager({
  actionRunner,
  cloudController,
  ui,
  storage = null,
  hasCloudApiKey = false,
}) {
  let mode = readStoredVoiceMode(storage);
  // Default to local if no API key is available
  if (!hasCloudApiKey && mode === 'cloud') {
    mode = 'local';
  }

  const ttsController = createLocalTtsController({ storage });
  let localEngine = null;

  function updateUiStatus(statusText, detailText = '') {
    if (ui?.status) ui.status.textContent = statusText;
    if (ui?.detail && detailText) ui.detail.textContent = detailText;
    if (ui?.root?.dataset) ui.root.dataset.status = statusText.toLowerCase();
  }

  const wrappedActionRunner = async (tool, args) => {
    if (tool === 'start_demo_tour') {
      window.__gevDemoTour?.start();
      return { success: true };
    }
    if (tool === 'start_product_tour') {
      window.__gevProductTour?.start();
      return { success: true };
    }
    if (actionRunner) return actionRunner(tool, args);
  };

  localEngine = createLocalSpeechEngine({
    actionRunner: wrappedActionRunner,
    ttsController,
    onStateChange: (state) => {
      if (mode !== 'local') return;
      if (state === 'listening') {
        updateUiStatus('LISTENING', 'LOCAL SPEECH ACTIVE');
      } else if (state === 'executing') {
        updateUiStatus('EXECUTING', 'PROCESSING COMMAND');
      } else if (state === 'error') {
        updateUiStatus('ERROR', 'LOCAL SPEECH ERROR');
      } else {
        updateUiStatus('OFF', 'VOICE STANDBY (LOCAL)');
      }
    },
    onTranscript: (text) => {
      if (ui?.detail) ui.detail.textContent = `"${text}"`;
    },
  });

  function setMode(newMode) {
    if (newMode === mode) return;
    if (mode === 'local' && localEngine.isActive()) {
      localEngine.stop();
    } else if (mode === 'cloud' && cloudController?.isActive?.()) {
      cloudController.stop();
    }
    mode = newMode;
    writeStoredVoiceMode(storage, mode);
    updateModeUi();
  }

  function updateModeUi() {
    if (ui?.modeButton) {
      ui.modeButton.textContent = mode.toUpperCase();
      ui.modeButton.title = `Voice engine: ${mode === 'local' ? 'Local (Browser Web Speech)' : 'Cloud (OpenAI Realtime)'} — click to switch`;
      ui.modeButton.setAttribute('aria-pressed', String(mode === 'local'));
    }
    if (mode === 'local') {
      if (ui?.tierButton?.style) ui.tierButton.style.display = 'none';
      if (ui?.costValue) ui.costValue.textContent = 'FREE';
      updateUiStatus(localEngine.isActive() ? 'LISTENING' : 'OFF', 'VOICE STANDBY (LOCAL)');
    } else {
      if (ui?.tierButton?.style) ui.tierButton.style.display = '';
      cloudController?.syncCostUi?.();
      updateUiStatus(cloudController?.isActive?.() ? 'LISTENING' : 'OFF', 'VOICE STANDBY');
    }
  }

  // Mount Mode Button to UI if not already present
  if (typeof ui?.root?.querySelector === 'function' && !ui?.modeButton) {
    const heading = ui.root.querySelector('.gev-voice-heading');
    if (heading) {
      const modeBtn = document.createElement('button');
      modeBtn.id = 'gev-voice-mode-btn';
      modeBtn.className = 'gev-voice-tier-btn';
      modeBtn.type = 'button';
      modeBtn.style.marginRight = '4px';
      modeBtn.addEventListener('click', () => {
        setMode(mode === 'local' ? 'cloud' : 'local');
      });
      heading.querySelector('.gev-voice-cost')?.prepend(modeBtn);
      ui.modeButton = modeBtn;
    }
  }

  updateModeUi();

  return {
    getMode: () => mode,
    setMode,
    toggleMode: () => setMode(mode === 'local' ? 'cloud' : 'local'),
    tts: ttsController,
    localEngine,
    cloudController,
    isActive: () => (mode === 'local' ? localEngine.isActive() : cloudController?.isActive?.()),
    start: () => (mode === 'local' ? localEngine.start() : cloudController?.start?.()),
    stop: () => (mode === 'local' ? localEngine.stop() : cloudController?.stop?.()),
    toggle: function () {
      if (mode === 'local') {
        return localEngine.toggle();
      }
      return cloudController?.isActive?.() ? cloudController.stop() : cloudController?.start?.();
    },
  };
}
