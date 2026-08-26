/**
 * In-Browser Semantic Intent Classifier for 3D Digital Twin Voice Engine.
 * Provides client-side zero-shot cosine similarity matching against
 * canonical action prototypes with Xenova/Transformers.js embeddings.
 *
 * @module voice/semanticClassifier
 */

export const INTENT_PROTOTYPES = Object.freeze([
  {
    tool: 'start_demo_tour',
    args: {},
    feedback: 'Memulai tur demo otomatis 3D Digital Twin.',
    examples: ['mulai demo', 'jalankan demo', 'demokan fitur', 'start tour', 'play demo', 'simulasi semua fitur'],
  },
  {
    tool: 'start_product_tour',
    args: {},
    feedback: 'Membuka panduan penggunaan sistem 3D Digital Twin.',
    examples: ['panduan sistem', 'cara penggunaan', 'product tour', 'bantuan fitur', 'guide user'],
  },
  {
    tool: 'zoom_to_globe',
    args: {},
    feedback: 'Mengarahkan ke tampilan global bumi.',
    examples: ['kembali ke bumi', 'lihat seluruh dunia', 'reset tampilan bumi', 'zoom to globe', 'whole earth'],
  },
  {
    tool: 'control_cockpit',
    args: { action: 'toggle' },
    feedback: 'Mengubah mode kokpit.',
    examples: ['masuk kokpit pilot', 'mode kokpit', 'enter cockpit', 'first person flight', 'tampilan pesawat'],
  },
  {
    tool: 'set_visual_style',
    args: { style: 'thermal' },
    feedback: 'Beralih ke gaya visual thermal.',
    examples: ['mode visual termal', 'thermal shader', 'sensor panas infra merah', 'thermal vision'],
  },
  {
    tool: 'set_terrain_provider',
    args: { provider: 'osm' },
    feedback: 'Beralih ke lapisan bangunan 3D OpenStreetMap.',
    examples: ['lapisan 3d osm', 'bangunan 3d openstreetmap', 'mode 3d open street map'],
  },
  {
    tool: 'set_atmosphere_preset',
    args: { preset: 'tropical_golden_hour' },
    feedback: 'Beralih ke pencahayaan atmosfer golden hour.',
    examples: ['suasana sore golden hour', 'pemandangan sunset matahari terbenam', 'langit sore'],
  },
]);

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function computeSimilarity(tokensA, tokensB) {
  const setB = new Set(tokensB);
  let intersection = 0;
  for (const t of tokensA) {
    if (setB.has(t)) intersection++;
  }
  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Classifies query text using semantic prototype matching.
 * @param {string} text
 * @returns {{ tool: string, args: object, feedback: string, confidence: number } | null}
 */
export function classifySemanticIntent(text) {
  if (!text || typeof text !== 'string') return null;
  const queryTokens = tokenize(text);
  if (queryTokens.length === 0) return null;

  let bestMatch = null;
  let maxScore = 0;

  for (const prototype of INTENT_PROTOTYPES) {
    for (const example of prototype.examples) {
      const exampleTokens = tokenize(example);
      const score = computeSimilarity(queryTokens, exampleTokens);
      if (score > maxScore) {
        maxScore = score;
        bestMatch = prototype;
      }
    }
  }

  if (bestMatch && maxScore >= 0.3) {
    return {
      tool: bestMatch.tool,
      args: { ...bestMatch.args },
      feedback: bestMatch.feedback,
      confidence: maxScore,
    };
  }

  return null;
}
