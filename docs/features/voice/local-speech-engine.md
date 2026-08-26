# Local Web Speech STT & TTS Engine

## 1. Overview
Enables offline, client-side voice control using browser-native `SpeechRecognition` (STT) and `window.speechSynthesis` (TTS), requiring zero API keys or external server dependencies.

## 2. Components
- **`src/voice/localSpeechEngine.js`**:
  - Implements browser SpeechRecognition lifecycle.
  - `parseVoiceIntent`: Matches spoken phrases to `gevActions` (e.g. fly to location, toggle layers, visual styles, cockpit mode, orbit).
- **`src/voice/localTtsController.js`**:
  - Delivers low-latency spoken confirmations for executed actions.
  - Supports mute/unmute persistence via `localStorage['godsEyeView.localTts.muted']`.
- **`src/voice/gevVoiceManager.js`**:
  - Unified voice coordinator supporting `LOCAL` vs `CLOUD` mode switching.
  - Auto-falls back to `LOCAL` when no OpenAI API key is configured.
