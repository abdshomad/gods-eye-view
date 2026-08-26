import test from 'node:test';
import assert from 'node:assert/strict';
import { LANGUAGE_CODES, fastLexicalTranslate, createNllbTranslator } from './nllbTranslator.js';

test('LANGUAGE_CODES contains supported regional codes', () => {
  assert.equal(LANGUAGE_CODES.indonesian, 'ind_Latn');
  assert.equal(LANGUAGE_CODES.javanese, 'jav_Latn');
  assert.equal(LANGUAGE_CODES.sundanese, 'sun_Latn');
  assert.equal(LANGUAGE_CODES.english, 'eng_Latn');
});

test('fastLexicalTranslate: translates Indonesian natural queries into canonical instructions', () => {
  assert.equal(fastLexicalTranslate('bisa ke new york'), 'fly to new york');
  assert.equal(fastLexicalTranslate('tolong terbang ke tokyo'), 'fly to tokyo');
  assert.equal(fastLexicalTranslate('mau ke monas jakarta'), 'fly to monas jakarta');
  assert.equal(fastLexicalTranslate('pindah ke london'), 'fly to london');
  assert.equal(fastLexicalTranslate('ke paris'), 'fly to paris');
});

test('fastLexicalTranslate: translates Javanese & Sundanese regional queries', () => {
  assert.equal(fastLexicalTranslate('miber ning new york'), 'fly to new york');
  assert.equal(fastLexicalTranslate('tiasa ka bandung'), 'fly to bandung');
});

test('createNllbTranslator: handles translation lifecycle and custom pipeline', async () => {
  const mockPipeline = async (input) => [{ translation_text: `translated: ${input}` }];
  const translator = createNllbTranslator({ pipelineFactory: async () => mockPipeline });
  
  const res1 = await translator.translateToEnglish('bisa ke new york');
  assert.equal(res1.translatedText, 'fly to new york');

  const res2 = await translator.translateToEnglish('cuaca hari ini');
  assert.equal(res2.translatedText, 'translated: cuaca hari ini');
});
