/**
 * Xenova / Transformers.js NLLB-200 Multi-Lingual Translation Bridge.
 * Translates Indonesian, Javanese, and Sundanese voice queries into canonical English action instructions.
 *
 * @module voice/nllbTranslator
 */

export const LANGUAGE_CODES = Object.freeze({
  indonesian: 'ind_Latn',
  javanese: 'jav_Latn',
  sundanese: 'sun_Latn',
  english: 'eng_Latn',
});

const LEXICAL_PATTERNS = Object.freeze([
  { pattern: /^(?:bisa|tolong|coba|mau|ingin|mohon|bisakah)\s+(?:ke|menuju ke|menuju|terbang ke|pergi ke|pindah ke|arahkan ke|bawa saya ke)\s+(.+)$/i, template: 'fly to $1' },
  { pattern: /^(?:ke|menuju ke|menuju|pindah ke|arah)\s+(.+)$/i, template: 'fly to $1' },
  { pattern: /^(?:tulung\s+miber\s+ning|tulung|cobi|miber\s+ning|menyang\s+ning|menyang)\s+(.+)$/i, template: 'fly to $1' }, // Javanese
  { pattern: /^(?:tiasa\s+ka|pindah\s+ka|angkar\s+ka|tiasa|mangga)\s+(.+)$/i, template: 'fly to $1' }, // Sundanese
  { pattern: /^(?:tampilkan|aktifkan|nyalakan|buka)\s+(.+)$/i, template: 'show $1' },
  { pattern: /^(?:sembunyikan|matikan|nonaktifkan|tutup)\s+(.+)$/i, template: 'hide $1' },
]);

/**
 * Fast client-side lexical translation fallback.
 * @param {string} text
 * @returns {string}
 */
export function fastLexicalTranslate(text) {
  if (!text || typeof text !== 'string') return text || '';
  const clean = text.trim();
  for (const { pattern, template } of LEXICAL_PATTERNS) {
    if (pattern.test(clean)) {
      return clean.replace(pattern, template);
    }
  }
  return clean;
}

/**
 * Creates an NLLB-200 Translation Controller with fallback.
 */
export function createNllbTranslator({ pipelineFactory = null, model = 'Xenova/nllb-200-distilled-600M' } = {}) {
  let pipelinePromise = null;

  async function getPipeline() {
    if (!pipelinePromise) {
      if (pipelineFactory) {
        pipelinePromise = pipelineFactory('translation', model);
      } else if (typeof window !== 'undefined' && window.transformers?.pipeline) {
        pipelinePromise = window.transformers.pipeline('translation', model);
      }
    }
    return pipelinePromise;
  }

  return {
    model,
    translateToEnglish: async function (text, srcLang = LANGUAGE_CODES.indonesian) {
      if (!text || typeof text !== 'string') return { translatedText: '', confidence: 0 };
      const trimmed = text.trim();

      // Fast lexical translation first
      const fastResult = fastLexicalTranslate(trimmed);
      if (fastResult !== trimmed) {
        return { translatedText: fastResult, srcLang, confidence: 0.95 };
      }

      try {
        const pipe = await getPipeline();
        if (pipe) {
          const output = await pipe(trimmed, {
            src_lang: srcLang,
            tgt_lang: LANGUAGE_CODES.english,
          });
          const translated = output?.[0]?.translation_text || output?.[0]?.generated_text || trimmed;
          return { translatedText: translated, srcLang, confidence: 0.9 };
        }
      } catch (_) {}

      return { translatedText: trimmed, srcLang, confidence: 0.5 };
    },
  };
}
