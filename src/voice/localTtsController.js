/**
 * Browser-native Text-to-Speech (TTS) Controller for God's Eye View.
 * Provides spoken voice acknowledgments via window.speechSynthesis with mute control.
 *
 * @module voice/localTtsController
 */

const STORAGE_KEY = 'godsEyeView.localTts.muted';

function readStoredMute(storage) {
  try {
    if (storage) return storage.getItem(STORAGE_KEY) === 'true';
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    }
  } catch {}
  return false;
}

function writeStoredMute(storage, muted) {
  try {
    if (storage) storage.setItem(STORAGE_KEY, String(muted));
    else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(muted));
    }
  } catch {}
}

/**
 * Creates a local TTS controller using native speech synthesis.
 */
export function createLocalTtsController({
  speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null,
  storage = null,
  rate = 1.05,
  pitch = 1.0,
  volume = 1.0,
} = {}) {
  let muted = readStoredMute(storage);
  let activeVoice = null;

  function resolveVoice() {
    if (!speechSynthesis?.getVoices) return null;
    const voices = speechSynthesis.getVoices();
    // Prefer Indonesian (id-ID) voice if available (e.g. Google Bahasa Indonesia, Gadis, Damayanti, etc.)
    const idVoice = voices.find((v) => v.lang.startsWith('id') || v.lang.includes('ID') || /indonesia/i.test(v.name));
    if (idVoice) return idVoice;
    return (
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google'))) ||
      voices[0] ||
      null
    );
  }

  if (speechSynthesis?.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      activeVoice = resolveVoice();
    };
  }

  return {
    isSupported: Boolean(speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined'),
    isMuted() {
      return muted;
    },
    setMuted(value) {
      muted = Boolean(value);
      writeStoredMute(storage, muted);
      if (muted && speechSynthesis?.cancel) {
        speechSynthesis.cancel();
      }
      return muted;
    },
    toggleMute() {
      return this.setMuted(!muted);
    },
    speak(text) {
      if (!text || muted || !speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
        return false;
      }
      try {
        speechSynthesis.cancel(); // Cancel any in-flight utterance for low-latency feedback
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;
        if (!activeVoice) activeVoice = resolveVoice();
        if (activeVoice) utterance.voice = activeVoice;
        speechSynthesis.speak(utterance);
        return true;
      } catch (err) {
        console.warn('[LocalTts] Synthesis error:', err);
        return false;
      }
    },
    stop() {
      if (speechSynthesis?.cancel) {
        speechSynthesis.cancel();
      }
    },
  };
}
