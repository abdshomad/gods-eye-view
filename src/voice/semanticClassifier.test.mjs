import test from 'node:test';
import assert from 'node:assert/strict';
import { INTENT_PROTOTYPES, classifySemanticIntent } from './semanticClassifier.js';

test('INTENT_PROTOTYPES contains platform capabilities', () => {
  assert.ok(INTENT_PROTOTYPES.length >= 5);
});

test('classifySemanticIntent: matches fuzzy and semantic Indonesian voice queries', () => {
  const res1 = classifySemanticIntent('tolong jalankan demo sistem');
  assert.ok(res1);
  assert.equal(res1.tool, 'start_demo_tour');

  const res2 = classifySemanticIntent('buka panduan sistem dong');
  assert.ok(res2);
  assert.equal(res2.tool, 'start_product_tour');

  const res3 = classifySemanticIntent('ubah ke mode kokpit pilot');
  assert.ok(res3);
  assert.equal(res3.tool, 'control_cockpit');
});
