# Next Enhancements Plan (Focus: Demo Dynamic Target Motion & Chase Cam)

## Completed Tasks
- [DONE] TASK-D01: Implement camera target tracking & orbital flyby helper in `src/demoTour.js`.
- [DONE] TASK-D02: Wire each of the 10 demo stages in `src/demoTour.js` to fly to live coordinates, lock onto moving entities, and execute orbital motion.
- [DONE] TASK-D03: Verify all 10 stage camera movements and tracking transitions with unit tests in `src/demoTour.test.mjs` and E2E suite `tests/04-indonesian-demo-mode.mjs`.

## Next Candidate Roadmap
- [TODO] TASK-E01: Add interactive stage drawer dropdown in demo HUD to allow direct 1-click jumping to any of the 10 stages.
- [TODO] TASK-E02: Add real-time telemetry card overlay in demo HUD displaying live altitude, speed, and coordinates.
- [TODO] TASK-E03: Implement smooth camera easing transitions between successive demo stages.
