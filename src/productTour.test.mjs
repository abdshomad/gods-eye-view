import test from 'node:test';
import assert from 'node:assert/strict';
import { TOUR_STEPS, createProductTourController } from './productTour.js';

test('TOUR_STEPS contains all 7 guided spotlight steps', () => {
  assert.equal(TOUR_STEPS.length, 7);
  assert.equal(TOUR_STEPS[0].id, 'header');
  assert.equal(TOUR_STEPS[1].id, 'nav_actions');
  assert.equal(TOUR_STEPS[2].id, 'voice_mic');
  assert.equal(TOUR_STEPS[3].id, 'data_layers');
  assert.equal(TOUR_STEPS[4].id, 'visual_shaders');
  assert.equal(TOUR_STEPS[5].id, 'cockpit_mode');
  assert.equal(TOUR_STEPS[6].id, 'intel_hud');
});

test('createProductTourController: start, next, prev, and stop lifecycle', () => {
  const spoken = [];
  const mockTts = {
    speak: (text) => spoken.push(text),
  };

  const controller = createProductTourController({
    ttsController: mockTts,
    container: null,
  });

  assert.equal(controller.isActive(), false);
  assert.equal(controller.start(), true);
  assert.equal(controller.isActive(), true);
  assert.equal(controller.getCurrentStep()?.id, 'header');

  controller.next();
  assert.equal(controller.getCurrentStep()?.id, 'nav_actions');

  controller.prev();
  assert.equal(controller.getCurrentStep()?.id, 'header');

  assert.equal(controller.stop(), true);
  assert.equal(controller.isActive(), false);
  assert.ok(spoken.length >= 2);
});
