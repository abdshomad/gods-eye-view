import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_STAGES, createDemoTourController } from './demoTour.js';

test('DEMO_STAGES contains all 10 core platform capabilities', () => {
  assert.equal(DEMO_STAGES.length, 10);
  assert.equal(DEMO_STAGES[0].id, 'archipelago');
  assert.equal(DEMO_STAGES[1].id, 'landmark');
  assert.equal(DEMO_STAGES[2].id, 'flights');
  assert.equal(DEMO_STAGES[3].id, 'satellites');
  assert.equal(DEMO_STAGES[4].id, 'vessels');
  assert.equal(DEMO_STAGES[5].id, 'infrastructure');
  assert.equal(DEMO_STAGES[6].id, 'disaster');
  assert.equal(DEMO_STAGES[7].id, 'cctv');
  assert.equal(DEMO_STAGES[8].id, 'thermal');
  assert.equal(DEMO_STAGES[9].id, 'cockpit');
});

test('createDemoTourController: start, pause, jump, and stop lifecycle', () => {
  const spoken = [];
  const enabledLayers = [];
  let activeStyle = 'normal';
  let cockpit = false;

  const mockViewer = {
    camera: {
      setView: () => {},
      flyTo: () => {},
    },
  };

  const mockDataManager = {
    setEnabled: (id, val) => enabledLayers.push({ id, val }),
  };

  const mockStyleManager = {
    setStyle: (s) => { activeStyle = s; },
    setCockpitMode: (c) => { cockpit = c; },
  };

  const mockTts = {
    speak: (text) => spoken.push(text),
  };

  const controller = createDemoTourController({
    viewer: mockViewer,
    styleManager: mockStyleManager,
    dataManager: mockDataManager,
    ttsController: mockTts,
    container: null,
  });

  assert.equal(controller.isActive(), false);
  assert.equal(controller.start(), true);
  assert.equal(controller.isActive(), true);
  assert.ok(spoken.length >= 1);

  // Jump to stage 8 (thermal)
  controller.jumpToStage(8);
  assert.equal(controller.getCurrentStage()?.id, 'thermal');

  // Stop
  assert.equal(controller.stop(), true);
  assert.equal(controller.isActive(), false);
  assert.equal(activeStyle, 'normal');
  assert.equal(cockpit, false);
});
