/**
 * Browser-native Speech Recognition & Intent Parser for God's Eye View.
 * Offline, client-side, zero API key required.
 *
 * @module voice/localSpeechEngine
 */

const LAYER_MAP = {
  flight: 'flights', flights: 'flights', plane: 'flights', planes: 'flights', aircraft: 'flights', pesawat: 'flights', penerbangan: 'flights',
  military: 'military', militer: 'military', vessel: 'vessels', vessels: 'vessels', ship: 'vessels', ships: 'vessels', boat: 'vessels', kapal: 'vessels', pelayaran: 'vessels',
  satellite: 'satellites', satellites: 'satellites', satelit: 'satellites', iss: 'satellites',
  rocket: 'rocket-launches', rockets: 'rocket-launches', roket: 'rocket-launches', launch: 'rocket-launches', launches: 'rocket-launches', peluncuran: 'rocket-launches',
  earthquake: 'earthquakes', earthquakes: 'earthquakes', gempa: 'earthquakes', quake: 'earthquakes',
  cctv: 'cctv', camera: 'cctv', cameras: 'cctv', kamera: 'cctv', radio: 'radio',
  datacenter: 'local-datacenters', datacenters: 'local-datacenters', 'pusat data': 'local-datacenters',
  dam: 'local-dams', dams: 'local-dams', bendungan: 'local-dams',
  cable: 'telegeography-submarine-cables', cables: 'telegeography-submarine-cables', 'kabel laut': 'telegeography-submarine-cables', kabel: 'telegeography-submarine-cables',
  fire: 'local-firms', fires: 'local-firms', kebakaran: 'local-firms', api: 'local-firms',
  traffic: 'traffic', lalulintas: 'traffic', 'lalu lintas': 'traffic',
};

const STYLE_MAP = {
  normal: 'normal', retro: 'retro', surveillance: 'surveillance', pengawasan: 'surveillance',
  thermal: 'thermal', termal: 'thermal', anime: 'anime', noir: 'noir', snow: 'snow', salju: 'snow',
};

/**
 * Parses spoken speech text into a structured GEV tool call with spoken feedback.
 * @param {string} text - Raw speech transcript
 * @returns {{ tool: string, args: object, feedback: string } | null}
 */
export function parseVoiceIntent(text) {
  if (!text || typeof text !== 'string') return null;
  const raw = text.trim().toLowerCase();

  // 0. Demo Mode simulation & Product Tour triggers
  if (/^(?:mulai demo|start demo|simulasi fitur|jalankan demo|demo)$/.test(raw)) {
    return { tool: 'start_demo_tour', args: {}, feedback: 'Memulai simulasi tur fitur 3D Digital Twin.' };
  }
  if (/^(?:panduan sistem|panduan|cara penggunaan|bantuan|product tour|tour|guide|help)$/.test(raw)) {
    return { tool: 'start_product_tour', args: {}, feedback: 'Membuka panduan penggunaan sistem 3D Digital Twin.' };
  }

  // 0b. 3D Terrain Provider & Landmark Splat Inspection
  if (/^(?:lapisan 3d osm|bangunan 3d|mode 3d osm|osm 3d|3d osm)$/.test(raw)) {
    return { tool: 'set_terrain_provider', args: { provider: 'osm' }, feedback: 'Beralih ke lapisan bangunan 3D OpenStreetMap.' };
  }
  if (/^(?:foto 3d google|google 3d|google 3d tiles|bangunan photoreal)$/.test(raw)) {
    return { tool: 'set_terrain_provider', args: { provider: 'google' }, feedback: 'Beralih ke ubin 3D fotorealistik.' };
  }
  const splatMatch = raw.match(/^(?:inspeksi|lihat|splat)\s+(borobudur|monas|ikn|nusantara)$/);
  if (splatMatch) {
    const key = splatMatch[1] === 'monas' ? 'monas_jakarta' : splatMatch[1] === 'borobudur' ? 'borobudur' : 'ikn_nusantara';
    return { tool: 'inspect_landmark_splat', args: { landmarkId: key }, feedback: `Memuat rekonstruksi 3D ${splatMatch[1].toUpperCase()}.` };
  }

  // 1. Globe view
  if (/^(zoom to globe|reset view|show globe|whole earth|planet view|globe|kembali ke bumi|tampilan bumi|reset tampilan|lihat bumi)$/.test(raw)) {
    return { tool: 'zoom_to_globe', args: {}, feedback: 'Mengarahkan ke tampilan global bumi.' };
  }

  // 2. Cockpit / First-Person Mode
  if (/cockpit mode|enter cockpit|toggle cockpit|first person|mode kokpit|masuk kokpit|keluar kokpit|tampilan kokpit/.test(raw)) {
    return { tool: 'control_cockpit', args: { action: 'toggle' }, feedback: 'Mengubah mode kokpit.' };
  }

  // 3. Layer toggles (Indonesian & English)
  const enableMatch = raw.match(/^(?:show|enable|turn on|display|activate|tampilkan|aktifkan|nyalakan|buka)\s+(.+)$/);
  if (enableMatch) {
    const key = enableMatch[1].trim();
    if (LAYER_MAP[key]) {
      return {
        tool: 'set_layer_visibility',
        args: { layerId: LAYER_MAP[key], enabled: true },
        feedback: `Mengaktifkan lapisan ${key}.`,
      };
    }
  }

  const disableMatch = raw.match(/^(?:hide|disable|turn off|stop|deactivate|sembunyikan|matikan|nonaktifkan|tutup)\s+(.+)$/);
  if (disableMatch) {
    const key = disableMatch[1].trim();
    if (LAYER_MAP[key]) {
      return {
        tool: 'set_layer_visibility',
        args: { layerId: LAYER_MAP[key], enabled: false },
        feedback: `Menonaktifkan lapisan ${key}.`,
      };
    }
  }

  // 4. Visual Styles: "set style to [style]" or "[style] style/filter/mode", "mode [style]", "gaya [style]"
  for (const [key, style] of Object.entries(STYLE_MAP)) {
    if (raw.includes(`${key} style`) || raw.includes(`${key} mode`) || raw.includes(`mode ${key}`) || raw.includes(`gaya ${key}`) || raw === key) {
      return {
        tool: 'set_visual_style',
        args: { style },
        feedback: `Beralih ke gaya visual ${style}.`,
      };
    }
  }

  // 5. Navigation:
  // "terbang ke [lokasi]", "arahkan ke [lokasi]", "pergi ke [lokasi]", "can you direct me to [place]", "take me to [place]", etc.
  const navMatch = raw.match(/^(?:(?:can you|please|tolong)?\s*(?:direct me to|take me to|bring me to|fly to|go to|zoom to|search for|search|navigate to|show me|where is|terbang ke|pergi ke|arahkan ke|bawa saya ke|menuju ke|tampilkan|cari))\s+(.+)$/);
  if (navMatch) {
    const query = navMatch[1].replace(/^(?:the|a)\s+/i, '').trim();
    return {
      tool: 'zoom_to_location',
      args: { query },
      feedback: `Menavigasi ke ${query}.`,
    };
  }

  // 6. Camera Controls: "orbit", "putar", "stop camera", "berhenti"
  if (/^(?:orbit|putar)/.test(raw)) {
    return { tool: 'orbit_point', args: {}, feedback: 'Memutar sudut pandang kamera.' };
  }
  if (/^(?:stop|freeze|halt|berhenti)/.test(raw)) {
    return { tool: 'stop_camera_motion', args: {}, feedback: 'Menghentikan gerakan kamera.' };
  }

  // 7. Direct standalone location queries (e.g. "indonesia", "jakarta", "monas", "tokyo", "paris")
  if (!raw.includes(' ') && !LAYER_MAP[raw] && !STYLE_MAP[raw] && raw.length > 2) {
    return {
      tool: 'zoom_to_location',
      args: { query: raw },
      feedback: `Menavigasi ke ${raw}.`,
    };
  }

  return null;
}

/**
 * Creates and manages a browser-native local speech recognition controller.
 */
export function createLocalSpeechEngine({
  actionRunner,
  ttsController = null,
  onStateChange = () => {},
  onTranscript = () => {},
  SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null,
}) {
  let recognition = null;
  let isListening = false;
  let explicitlyStopped = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'id-ID';

    recognition.onresult = async (event) => {
      const lastIndex = event.results.length - 1;
      const transcript = event.results[lastIndex][0].transcript.trim();
      onTranscript(transcript);

      const intent = parseVoiceIntent(transcript);
      if (intent && actionRunner) {
        onStateChange('executing');
        try {
          await actionRunner(intent.tool, intent.args);
          if (ttsController?.speak) {
            ttsController.speak(intent.feedback);
          }
        } catch (err) {
          console.error('[LocalSpeech] Execution error:', err);
        } finally {
          if (isListening) onStateChange('listening');
        }
      }
    };

    recognition.onerror = (err) => {
      console.warn('[LocalSpeech] Recognition error:', err.error);
      if (err.error !== 'no-speech') {
        onStateChange('error');
      }
    };

    recognition.onend = () => {
      if (isListening && !explicitlyStopped) {
        try {
          recognition.start();
        } catch {
          isListening = false;
          onStateChange('idle');
        }
      } else {
        isListening = false;
        onStateChange('idle');
      }
    };
  }

  return {
    isSupported: Boolean(SpeechRecognition),
    start() {
      if (!recognition) return false;
      explicitlyStopped = false;
      isListening = true;
      try {
        recognition.start();
        onStateChange('listening');
        return true;
      } catch (err) {
        console.warn('[LocalSpeech] Failed to start:', err);
        return false;
      }
    },
    stop() {
      explicitlyStopped = true;
      isListening = false;
      if (recognition) {
        try {
          recognition.stop();
        } catch {}
      }
      onStateChange('idle');
    },
    toggle() {
      if (isListening) {
        this.stop();
        return false;
      }
      return this.start();
    },
    isActive() {
      return isListening;
    },
  };
}
