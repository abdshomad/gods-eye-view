/**
 * 10-Feature Autonomous Product Demo Engine for 3D Digital Twin.
 * Synchronizes dynamic camera flights, entity orbital tracking, and voice narration.
 * @module demoTour
 */

import * as Cesium from 'cesium';

export function flyCameraTo(viewer, { lon, lat, height = 1500, heading = 0, pitch = -30, duration = 2.0 }) {
  if (!viewer?.camera) return;
  try {
    const destination = Cesium.Cartesian3?.fromDegrees ? Cesium.Cartesian3.fromDegrees(lon, lat, height) : { lon, lat, height };
    const hRad = Cesium.Math?.toRadians ? Cesium.Math.toRadians(heading) : heading;
    const pRad = Cesium.Math?.toRadians ? Cesium.Math.toRadians(pitch) : pitch;
    viewer.camera.flyTo({ destination, orientation: { heading: hRad, pitch: pRad, roll: 0.0 }, duration });
  } catch (err) {
    console.warn('[DemoTour] flyCameraTo fallback:', err);
  }
}

export const DEMO_STAGES = [
  { id: 'archipelago', title: '1/10: Tinjauan Kepulauan Indonesia', desc: 'Visualisasi 3D digital twin bola bumi berpusat pada kepulauan Nusantara.', narration: 'Tahap satu: Tinjauan Kepulauan Indonesia.', durationMs: 8000, run: async ({ viewer }) => flyCameraTo(viewer, { lon: 118.0, lat: -2.0, height: 3500000, heading: 0, pitch: -60, duration: 3.5 }) },
  { id: 'landmark', title: '2/10: Navigasi Landmark 3D Monas Jakarta', desc: 'Pemetaan fotorealistik 3D resolusi tinggi kota Jakarta dan Monas.', narration: 'Tahap dua: Navigasi Landmark Monumen Nasional Jakarta.', durationMs: 8000, run: async ({ viewer }) => flyCameraTo(viewer, { lon: 106.8272, lat: -6.1754, height: 900, heading: 45, pitch: -30, duration: 3.5 }) },
  { id: 'flights', title: '3/10: Radar Penerbangan Langsung ADS-B', desc: 'Telemetri penerbangan sipil dan militer real-time di seluruh dunia.', narration: 'Tahap tiga: Radar penerbangan langsung ADS-B.', durationMs: 8000, run: async ({ viewer, dataManager }) => { dataManager?.setEnabled?.('flights', true); flyCameraTo(viewer, { lon: 107.5, lat: -6.8, height: 35000, heading: 120, pitch: -25, duration: 3.5 }); } },
  { id: 'satellites', title: '4/10: Pelacakan Satelit Orbit Rendah & ISS', desc: 'Konstelasi satelit aktif LEO dan GEO dengan kalkulasi orbit presisi.', narration: 'Tahap empat: Pelacakan satelit orbit rendah dan ISS.', durationMs: 8000, run: async ({ viewer, dataManager }) => { dataManager?.setEnabled?.('satellites', true); flyCameraTo(viewer, { lon: 110.0, lat: 5.0, height: 1200000, heading: 210, pitch: -40, duration: 3.5 }); } },
  { id: 'vessels', title: '5/10: Pelayaran Kapal Laut (AIS Live)', desc: 'Pemantauan lalu lintas kapal kargo di koridor maritim Selat Sunda.', narration: 'Tahap lima: Pelayaran kapal laut AIS live.', durationMs: 8000, run: async ({ viewer, dataManager }) => { dataManager?.setEnabled?.('vessels', true); flyCameraTo(viewer, { lon: 105.9, lat: -5.9, height: 15000, heading: 60, pitch: -25, duration: 3.5 }); } },
  { id: 'infrastructure', title: '6/10: Infrastruktur Kabel Fiber Optik Bawah Laut', desc: 'Tulang punggung jaringan telekomunikasi bawah laut dan data center.', narration: 'Tahap enam: Infrastruktur kabel fiber optik bawah laut.', durationMs: 8000, run: async ({ viewer, dataManager }) => { dataManager?.setEnabled?.('telegeography-submarine-cables', true); flyCameraTo(viewer, { lon: 106.8, lat: -5.8, height: 120000, heading: 0, pitch: -45, duration: 3.5 }); } },
  { id: 'disaster', title: '7/10: Pusat Mitigasi Bencana Gempa & Titik Api', desc: 'Deteksi dini seismik USGS dan titik panas termal NASA FIRMS.', narration: 'Tahap tujuh: Mitigasi bencana gempa bumi dan titik api.', durationMs: 8000, run: async ({ viewer, dataManager }) => { dataManager?.setEnabled?.('earthquakes', true); dataManager?.setEnabled?.('local-firms', true); flyCameraTo(viewer, { lon: 103.0, lat: -3.5, height: 350000, heading: 330, pitch: -35, duration: 3.5 }); } },
  { id: 'cctv', title: '8/10: Kamera Pengawas Kota (CCTV Live)', desc: 'Integrasi sensor kamera lalu lintas dan video streaming jalan raya.', narration: 'Tahap delapan: Kamera pengawas kota CCTV.', durationMs: 8000, run: async ({ viewer, dataManager }) => { dataManager?.setEnabled?.('cctv', true); flyCameraTo(viewer, { lon: 106.8227, lat: -6.1931, height: 800, heading: 180, pitch: -35, duration: 3.5 }); } },
  { id: 'thermal', title: '9/10: Sensor Visual Termal Multi-spektral', desc: 'Filter shader taktis malam hari dan analisis kontras spektral.', narration: 'Tahap sembilan: Sensor visual termal multi-spektral.', durationMs: 8000, run: async ({ viewer, styleManager }) => { styleManager?.setStyle?.('thermal'); flyCameraTo(viewer, { lon: 106.8272, lat: -6.1754, height: 1500, heading: 90, pitch: -30, duration: 3.5 }); } },
  { id: 'cockpit', title: '10/10: Mode Kokpit Pilot & Asisten Suara Cerdas', desc: 'Tampilan first-person HUD instrumen penerbangan dengan kendali suara lokal.', narration: 'Tahap sepuluh: Mode kokpit pilot dan asisten suara cerdas.', durationMs: 9000, run: async ({ viewer, styleManager }) => { styleManager?.setCockpitMode?.(true); flyCameraTo(viewer, { lon: 106.8272, lat: -6.1754, height: 3000, heading: 90, pitch: -5, duration: 3.5 }); } },
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
  let speedMultiplier = 1;
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
          <button id="demo-speed-btn" type="button" class="demo-ctrl-btn" title="Ubah Kecepatan">${speedMultiplier}x</button>
          <button id="demo-exit-btn" type="button" class="demo-ctrl-btn demo-btn-danger">KELUAR ✕</button>
        </div>
      </div>
    `;

    hudElement.querySelector('#demo-prev-btn').onclick = () => jumpToStage(currentStageIndex - 1);
    hudElement.querySelector('#demo-playpause-btn').onclick = () => togglePause();
    hudElement.querySelector('#demo-next-btn').onclick = () => jumpToStage(currentStageIndex + 1);
    hudElement.querySelector('#demo-speed-btn').onclick = () => cycleSpeed();
    hudElement.querySelector('#demo-exit-btn').onclick = () => stop();
  }

  function cycleSpeed() {
    const speeds = [1, 2, 4, 0.5];
    speedMultiplier = speeds[(speeds.indexOf(speedMultiplier) + 1) % speeds.length];
    renderHud(DEMO_STAGES[currentStageIndex]);
  }

  function removeHud() {
    if (hudElement?.parentNode) hudElement.parentNode.removeChild(hudElement);
    hudElement = null;
  }

  async function executeStage(index) {
    if (!isRunning) return;
    if (index >= DEMO_STAGES.length) { finish(); return; }
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
      const waitTime = Math.max(500, stage.durationMs / speedMultiplier);
      timerId = setTimeout(() => {
        if (isRunning && !isPaused) executeStage(currentStageIndex + 1);
      }, waitTime);
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
      const waitTime = Math.max(500, DEMO_STAGES[currentStageIndex].durationMs / speedMultiplier);
      timerId = setTimeout(() => {
        if (isRunning && !isPaused) executeStage(currentStageIndex + 1);
      }, waitTime);
    }
  }

  function start(startIdx = 0) {
    if (isRunning) return false;
    isRunning = true;
    isPaused = false;
    currentStageIndex = startIdx;
    executeStage(startIdx);
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

  if (typeof window !== 'undefined') {
    const search = window.location?.search || '';
    if (/[?&]demo=(?:auto|1)/i.test(search)) {
      setTimeout(() => start(0), 1200);
    } else {
      const stageMatch = search.match(/[?&]stage=(\d+)/i);
      if (stageMatch) {
        setTimeout(() => start(Math.max(0, parseInt(stageMatch[1], 10) - 1)), 1200);
      }
    }
  }

  mountTopButton();

  return {
    start,
    stop,
    togglePause,
    jumpToStage,
    getSpeedMultiplier: () => speedMultiplier,
    setSpeedMultiplier: (s) => { speedMultiplier = s; },
    isActive: () => isRunning,
    getCurrentStage: () => (isRunning ? DEMO_STAGES[currentStageIndex] : null),
  };
}
