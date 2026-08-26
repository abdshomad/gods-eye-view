/**
 * 10-Feature Autonomous Product Demo Engine for 3D Digital Twin.
 * Features full Bahasa Indonesia voice narration, lower-third subtitle HUD,
 * and playback controls (Play, Pause, Prev, Next, Exit, Auto-Loop).
 *
 * @module demoTour
 */

import { flyToIndonesia } from './camera.js';
import { flyToPresetLocation } from './locations.js';

export const DEMO_STAGES = [
  {
    id: 'archipelago',
    title: '1/10: Tinjauan Kepulauan Indonesia',
    desc: 'Visualisasi 3D digital twin bola bumi berpusat pada kepulauan Indonesia.',
    narration: 'Tahap satu: Tinjauan Kepulauan Indonesia.',
    durationMs: 4000,
    run: async ({ viewer }) => flyToIndonesia(viewer),
  },
  {
    id: 'landmark',
    title: '2/10: Navigasi Landmark 3D Monas Jakarta',
    desc: 'Pemetaan fotorealistik 3D resolusi tinggi kota Jakarta dan Monas.',
    narration: 'Tahap dua: Navigasi Landmark Monumen Nasional Jakarta.',
    durationMs: 4000,
    run: async ({ viewer }) => flyToPresetLocation(viewer, 'jakarta', 0, { duration: 3.0 }),
  },
  {
    id: 'flights',
    title: '3/10: Radar Penerbangan Langsung ADS-B',
    desc: 'Telemetri penerbangan sipil dan militer real-time di seluruh dunia.',
    narration: 'Tahap tiga: Radar penerbangan langsung ADS-B.',
    durationMs: 4000,
    run: async ({ dataManager }) => dataManager?.setEnabled?.('flights', true),
  },
  {
    id: 'satellites',
    title: '4/10: Pelacakan Satelit Orbit Rendah & ISS',
    desc: 'Konstelasi satelit aktif LEO dan GEO dengan kalkulasi orbit presisi.',
    narration: 'Tahap empat: Pelacakan satelit orbit rendah dan ISS.',
    durationMs: 4000,
    run: async ({ dataManager }) => dataManager?.setEnabled?.('satellites', true),
  },
  {
    id: 'vessels',
    title: '5/10: Pelayaran Kapal Laut (AIS Live)',
    desc: 'Pemantauan lalu lintas kapal kargo, tanker, dan koridor maritim.',
    narration: 'Tahap lima: Pelayaran kapal laut AIS live.',
    durationMs: 4000,
    run: async ({ dataManager }) => dataManager?.setEnabled?.('vessels', true),
  },
  {
    id: 'infrastructure',
    title: '6/10: Infrastruktur Kabel Fiber Optik Bawah Laut',
    desc: 'Tulang punggung jaringan telekomunikasi bawah laut dan pusat data.',
    narration: 'Tahap enam: Infrastruktur kabel fiber optik bawah laut.',
    durationMs: 4000,
    run: async ({ dataManager }) => dataManager?.setEnabled?.('telegeography-submarine-cables', true),
  },
  {
    id: 'disaster',
    title: '7/10: Pusat Mitigasi Bencana Gempa & Titik Api',
    desc: 'Deteksi dini seismik USGS dan titik panas termal NASA FIRMS.',
    narration: 'Tahap tujuh: Mitigasi bencana gempa bumi dan titik api.',
    durationMs: 4000,
    run: async ({ dataManager }) => {
      dataManager?.setEnabled?.('earthquakes', true);
      dataManager?.setEnabled?.('local-firms', true);
    },
  },
  {
    id: 'cctv',
    title: '8/10: Kamera Pengawas Kota (CCTV Live)',
    desc: 'Integrasi sensor kamera lalu lintas dan video streaming jalan raya.',
    narration: 'Tahap delapan: Kamera pengawas kota CCTV.',
    durationMs: 4000,
    run: async ({ dataManager }) => dataManager?.setEnabled?.('cctv', true),
  },
  {
    id: 'thermal',
    title: '9/10: Sensor Visual Termal Multi-spektral',
    desc: 'Filter shader taktis malam hari dan analisis kontras spektral.',
    narration: 'Tahap sembilan: Sensor visual termal multi-spektral.',
    durationMs: 4000,
    run: async ({ styleManager }) => styleManager?.setStyle?.('thermal'),
  },
  {
    id: 'cockpit',
    title: '10/10: Mode Kokpit Pilot & Asisten Suara Cerdas',
    desc: 'Tampilan first-person HUD instrumen penerbangan dengan kendali suara lokal.',
    narration: 'Tahap sepuluh: Mode kokpit pilot dan asisten suara cerdas.',
    durationMs: 4500,
    run: async ({ styleManager }) => styleManager?.setCockpitMode?.(true),
  },
];

export function createDemoTourController({
  viewer,
  styleManager = null,
  dataManager = null,
  ttsController = null,
  container = typeof document !== 'undefined' ? document.body : null,
} = {}) {
  let isRunning = false;
  let isPaused = false;
  let currentStageIndex = 0;
  let timerId = null;
  let hudElement = null;

  function renderHud(stage) {
    if (!container) return;
    if (!hudElement) {
      hudElement = document.createElement('div');
      hudElement.id = 'demo-tour-hud';
      hudElement.className = 'demo-tour-hud';
      container.appendChild(hudElement);
    }
    hudElement.innerHTML = `
      <div class="demo-subtitle-banner">
        <div class="demo-banner-header">
          <span class="demo-hud-dot"></span>
          <span class="demo-banner-badge">3D DIGITAL TWIN • DEMO OTOMATIS</span>
          <span class="demo-banner-stage-counter">${currentStageIndex + 1}/${DEMO_STAGES.length}</span>
        </div>
        <div class="demo-banner-title">${stage ? stage.title : ''}</div>
        <div class="demo-banner-desc">${stage ? stage.desc : ''}</div>
        <div class="demo-banner-controls">
          <button id="demo-prev-btn" type="button" class="demo-ctrl-btn" title="Tahap Sebelumnya">◀ PREV</button>
          <button id="demo-playpause-btn" type="button" class="demo-ctrl-btn demo-btn-accent">${isPaused ? '▶ RESUME' : '⏸ PAUSE'}</button>
          <button id="demo-next-btn" type="button" class="demo-ctrl-btn" title="Tahap Berikutnya">NEXT ▶</button>
          <button id="demo-exit-btn" type="button" class="demo-ctrl-btn demo-btn-danger">KELUAR ✕</button>
        </div>
      </div>
    `;

    hudElement.querySelector('#demo-prev-btn').onclick = () => jumpToStage(currentStageIndex - 1);
    hudElement.querySelector('#demo-playpause-btn').onclick = () => togglePause();
    hudElement.querySelector('#demo-next-btn').onclick = () => jumpToStage(currentStageIndex + 1);
    hudElement.querySelector('#demo-exit-btn').onclick = () => stop();
  }

  function removeHud() {
    if (hudElement?.parentNode) hudElement.parentNode.removeChild(hudElement);
    hudElement = null;
  }

  async function executeStage(index) {
    if (!isRunning) return;
    if (index >= DEMO_STAGES.length) {
      finish();
      return;
    }
    currentStageIndex = Math.max(0, index);
    const stage = DEMO_STAGES[currentStageIndex];
    renderHud(stage);

    if (ttsController?.speak) ttsController.speak(stage.narration);
    try {
      await stage.run({ viewer, styleManager, dataManager });
    } catch (err) {
      console.warn('[DemoTour] Error in stage:', stage.id, err);
    }

    if (!isPaused) {
      timerId = setTimeout(() => {
        if (isRunning && !isPaused) executeStage(currentStageIndex + 1);
      }, stage.durationMs);
    }
  }

  function jumpToStage(index) {
    if (timerId) clearTimeout(timerId);
    timerId = null;
    executeStage((index + DEMO_STAGES.length) % DEMO_STAGES.length);
  }

  function togglePause() {
    isPaused = !isPaused;
    if (timerId) clearTimeout(timerId);
    timerId = null;
    renderHud(DEMO_STAGES[currentStageIndex]);
    if (!isPaused) {
      timerId = setTimeout(() => {
        if (isRunning && !isPaused) executeStage(currentStageIndex + 1);
      }, DEMO_STAGES[currentStageIndex].durationMs);
    }
  }

  function start() {
    if (isRunning) return false;
    isRunning = true;
    isPaused = false;
    currentStageIndex = 0;
    executeStage(0);
    return true;
  }

  function stop() {
    if (!isRunning) return false;
    isRunning = false;
    isPaused = false;
    if (timerId) clearTimeout(timerId);
    timerId = null;
    removeHud();
    styleManager?.setCockpitMode?.(false);
    styleManager?.setStyle?.('normal');
    if (ttsController?.speak) ttsController.speak('Simulasi tur fitur dihentikan.');
    return true;
  }

  function finish() {
    stop();
    if (ttsController?.speak) ttsController.speak('Simulasi seluruh fitur 3D Digital Twin telah selesai.');
  }

  function mountTopButton() {
    if (typeof document === 'undefined') return;
    const topBar = document.getElementById('top-center-actions');
    if (topBar && !document.getElementById('demo-tour-btn')) {
      const btn = document.createElement('button');
      btn.id = 'demo-tour-btn';
      btn.type = 'button';
      btn.className = 'demo-tour-btn';
      btn.title = 'Mulai Tur Demo Fitur Otomatis';
      btn.setAttribute('aria-label', 'Mulai Simulasi Fitur');
      btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">play_circle</span>';
      btn.addEventListener('click', () => {
        if (isRunning) stop();
        else start();
      });
      topBar.prepend(btn);
    }
  }

  // Auto-start if URL has ?demo=auto or ?demo=1
  if (typeof window !== 'undefined' && /[?&]demo=(?:auto|1)/i.test(window.location?.search || '')) {
    setTimeout(() => start(), 1200);
  }

  mountTopButton();

  return {
    start,
    stop,
    togglePause,
    jumpToStage,
    isActive: () => isRunning,
    getCurrentStage: () => (isRunning ? DEMO_STAGES[currentStageIndex] : null),
  };
}
