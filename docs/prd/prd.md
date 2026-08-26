# Product Requirements Document (PRD): God's Eye View

## 1. Executive Summary
God's Eye View provides an open-source, browser-based geospatial command center delivering multi-domain operational awareness (Air, Sea, Space, Ground, Infrastructure, Climate) on a photorealistic 3D globe with AI-driven voice interaction.

## 2. Core Architecture & Contracts
- **Rendering Engine**: CesiumJS with Google 3D Tiles, fallback OSM / Sentinel-2 / CartoDB imagery, and Re:Earth terrain.
- **Path Policy**: All internal references, data assets, and modules strictly use relative paths.
- **Complexity Governance**: Strict 256 LOC per file limit to ensure maintainability and agent context efficiency.
- **Allocation & GC Budget**: Hard performance budget to prevent garbage collection pauses during continuous rendering.
- **Fail-Soft Data Layer**: Every live stream (ADS-B, AIS, TLEs, CCTV, Weather) must implement graceful degradation, local cache fallback, or simulated mock mode.

## 3. Functional Requirements
- **FR-1 [Global 3D Visualization]**: Render interactive globe with real-time camera transitions, smooth panning, and level-of-detail management.
- **FR-2 [Multi-Domain Entity Tracking]**:
  - Live aircraft tracking with ADS-B fallback reconciliation.
  - Live maritime vessel monitoring via AIS streaming.
  - Real-time orbital propagation of satellites and spacecraft missions.
- **FR-3 [Cockpit & Tactical HUD]**:
  - First-person immersive camera mode with dynamic altitude datums (MSL/AGL/Geoid).
  - Synthetic atmospheric weather rendering matched to live Open-Meteo observations.
  - Tactical situational briefing (reverse geocoding, regional news).
- **FR-4 [Voice Command & AI Copilot]**:
  - Hands-free natural language camera steering and layer toggling via OpenAI Realtime API.
  - Robust session usage and token cost metering with configurable budget alerts.
- **FR-5 [First-Run Mission Launcher & Context Trays]**:
  - Intuitive onboarding modal with selectable mission presets.
  - Responsive toggle trays for discrete layer filtering and inspection.

## 4. Non-Functional & Verification Requirements
- **NFR-1 [Performance]**: Sustained 60 FPS under normal layer density.
- **NFR-2 [Compliance & Attribution]**: Dynamic attribution rendered for all third-party data providers.
- **NFR-3 [Test Verification Gate]**: All feature modifications must maintain 100% pass rate across unit, integration, and memory regression test suites (`npm test`).
