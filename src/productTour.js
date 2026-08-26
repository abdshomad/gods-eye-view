/**
 * Interactive 7-Step Spotlight Product Tour for 3D Digital Twin.
 * Highlights and encircles UI components with neon bounding rings
 * and spoken Bahasa Indonesia guidance.
 *
 * @module productTour
 */

export const TOUR_STEPS = [
  {
    id: 'header',
    target: '#title-bar',
    title: '1/7: Identitas & Status Sistem',
    desc: 'Menampilkan status koneksi 3D Digital Twin dan kontrol platform digital twin.',
    narration: 'Langkah satu: Identitas dan status sistem.',
  },
  {
    id: 'nav_actions',
    target: '#top-center-actions',
    title: '2/7: Navigasi & Tur Otomatis',
    desc: 'Akses cepat ke simulasi fitur otomatis (DEMO), rotasi orbit 360°, dan orientasi kamera.',
    narration: 'Langkah dua: Navigasi cepat dan tur fitur otomatis.',
  },
  {
    id: 'voice_mic',
    target: '#mic-button, #gev-mic-panel',
    title: '3/7: Asisten Suara Bahasa Indonesia',
    desc: 'Tekan spasi atau klik mikrofon untuk navigasi dan kontrol suara luring tanpa API key.',
    narration: 'Langkah tiga: Asisten perintah suara luring Bahasa Indonesia.',
  },
  {
    id: 'data_layers',
    target: '#data-toggles',
    title: '4/7: Panel Lapisan Data Real-Time',
    desc: 'Pantau penerbangan ADS-B, satelit orbit, pelayaran maritim, kabel laut, dan sensor gempa.',
    narration: 'Langkah empat: Panel lapisan data real-time.',
  },
  {
    id: 'visual_shaders',
    target: '#styles-menu, #style-indicator',
    title: '5/7: Sensor Visual & Shader Taktis',
    desc: 'Beralih ke mode sensor termal malam, pengawasan intelijen, mode retro, dan noir.',
    narration: 'Langkah lima: Sensor visual dan shader taktis.',
  },
  {
    id: 'cockpit_mode',
    target: '#cockpit-toggle',
    title: '6/7: Mode Kokpit Pilot 3D',
    desc: 'Simulasi navigasi penerbangan dari perspektif kokpit first-person dengan instrumen HUD.',
    narration: 'Langkah enam: Mode kokpit pilot first-person.',
  },
  {
    id: 'intel_hud',
    target: '#hud-container, #tracked-readout-mount',
    title: '7/7: Intel HUD & Telemetri Global',
    desc: 'Pelacakan koordinat telemetri presisi dan ringkasan observasi sensor cerdas.',
    narration: 'Langkah tujuh: Intel HUD dan telemetri global.',
  },
];

export function createProductTourController({
  ttsController = null,
  container = typeof document !== 'undefined' ? document.body : null,
} = {}) {
  let isRunning = false;
  let currentStepIndex = 0;
  let tourElements = null;

  function createTourDom() {
    if (!container || tourElements) return;
    const overlay = document.createElement('div');
    overlay.id = 'product-tour-overlay';
    overlay.className = 'spotlight-overlay';

    const ring = document.createElement('div');
    ring.id = 'product-tour-ring';
    ring.className = 'spotlight-ring';

    const card = document.createElement('div');
    card.id = 'product-tour-card';
    card.className = 'spotlight-card';

    container.appendChild(overlay);
    container.appendChild(ring);
    container.appendChild(card);

    tourElements = { overlay, ring, card };
  }

  function removeTourDom() {
    if (tourElements) {
      tourElements.overlay?.remove?.();
      tourElements.ring?.remove?.();
      tourElements.card?.remove?.();
      tourElements = null;
    }
  }

  function positionAroundTarget(targetEl) {
    if (!tourElements || !targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const pad = 6;

    // Position the highlight ring around the element
    const ring = tourElements.ring;
    ring.style.top = `${Math.max(0, rect.top - pad)}px`;
    ring.style.left = `${Math.max(0, rect.left - pad)}px`;
    ring.style.width = `${rect.width + pad * 2}px`;
    ring.style.height = `${rect.height + pad * 2}px`;

    // Position guidance card
    const card = tourElements.card;
    const cardWidth = 340;
    let cardTop = rect.bottom + 14;
    let cardLeft = Math.max(16, rect.left + rect.width / 2 - cardWidth / 2);

    if (cardTop + 200 > window.innerHeight) {
      cardTop = Math.max(16, rect.top - 210);
    }
    if (cardLeft + cardWidth > window.innerWidth - 16) {
      cardLeft = window.innerWidth - cardWidth - 16;
    }

    card.style.top = `${cardTop}px`;
    card.style.left = `${cardLeft}px`;
  }

  function renderStep(index) {
    if (!isRunning) return;
    if (index >= TOUR_STEPS.length) {
      finish();
      return;
    }
    currentStepIndex = Math.max(0, index);
    const step = TOUR_STEPS[currentStepIndex];

    createTourDom();
    if (typeof document !== 'undefined') {
      const targetEl = document.querySelector(step.target) || document.body;
      positionAroundTarget(targetEl);
    }

    if (tourElements?.card) {
      tourElements.card.innerHTML = `
        <div class="spotlight-card-header">
          <span class="spotlight-hud-dot"></span>
          <span class="spotlight-badge">PANDUAN SISTEM</span>
          <span class="spotlight-counter">${currentStepIndex + 1}/${TOUR_STEPS.length}</span>
        </div>
        <div class="spotlight-card-title">${step.title}</div>
        <div class="spotlight-card-desc">${step.desc}</div>
        <div class="spotlight-card-actions">
          <button id="tour-prev-btn" type="button" class="tour-btn" ${currentStepIndex === 0 ? 'disabled' : ''}>◀ KEMBALI</button>
          <button id="tour-next-btn" type="button" class="tour-btn tour-btn-accent">${currentStepIndex === TOUR_STEPS.length - 1 ? 'SELESAI ✓' : 'LANJUT ▶'}</button>
          <button id="tour-skip-btn" type="button" class="tour-btn tour-btn-ghost">LEWATI ✕</button>
        </div>
      `;

      tourElements.card.querySelector('#tour-prev-btn').onclick = () => renderStep(currentStepIndex - 1);
      tourElements.card.querySelector('#tour-next-btn').onclick = () => renderStep(currentStepIndex + 1);
      tourElements.card.querySelector('#tour-skip-btn').onclick = () => stop();
    }

    if (ttsController?.speak) ttsController.speak(step.narration);
  }

  function start() {
    if (isRunning) return false;
    isRunning = true;
    currentStepIndex = 0;
    renderStep(0);
    return true;
  }

  function stop() {
    if (!isRunning) return false;
    isRunning = false;
    removeTourDom();
    if (ttsController?.speak) ttsController.speak('Panduan sistem ditutup.');
    return true;
  }

  function finish() {
    isRunning = false;
    removeTourDom();
    if (ttsController?.speak) ttsController.speak('Panduan pengenalan sistem telah selesai.');
  }

  function mountHelpButton() {
    if (typeof document === 'undefined') return;
    const topBar = document.getElementById('top-center-actions');
    if (topBar && !document.getElementById('product-tour-help-btn')) {
      const btn = document.createElement('button');
      btn.id = 'product-tour-help-btn';
      btn.type = 'button';
      btn.className = 'product-tour-help-btn';
      btn.title = 'Buka Panduan Penggunaan Sistem (Tour)';
      btn.setAttribute('aria-label', 'Buka Panduan Sistem');
      btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">help</span>';
      btn.addEventListener('click', () => {
        if (isRunning) stop();
        else start();
      });
      topBar.appendChild(btn);
    }
  }

  mountHelpButton();

  return {
    start,
    stop,
    next: () => renderStep(currentStepIndex + 1),
    prev: () => renderStep(currentStepIndex - 1),
    isActive: () => isRunning,
    getCurrentStep: () => (isRunning ? TOUR_STEPS[currentStepIndex] : null),
  };
}
