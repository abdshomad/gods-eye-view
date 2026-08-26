# Architecture and Feature Analysis

## 1. System Overview
God's Eye View (GEV) is an open-source, real-time spatial intelligence console rendered in a web browser using CesiumJS, Vite, and photorealistic 3D geospatial tiles. It delivers planetary situational awareness across air, sea, space, ground, infrastructure, and atmospheric domains.

## 2. Core Architectural Subsystems
- **3D Geospatial Engine (`src/index.js`, `src/mapStackController.js`)**:
  - Primary rendering pipeline backed by CesiumJS with Google Photorealistic 3D Tiles.
  - Multi-map fallback stack: OSM, Sentinel-2, CartoDB, and Re:Earth quantized-mesh terrain.
  - Viewport-bounded Level-of-Detail (LOD) and frustum culling.
- **Entity Tracking & Camera Director (`src/camera.js`, `src/data/trackedCamera.js`)**:
  - Smooth tracking modes: Orbit, Standoff, First-Person / Cockpit, and Cinematic Flythrough.
  - Camera Handoff and gesture arbitration preserving operator heading and pitch.
- **Cockpit & AR HUD (`src/cockpitVisionPolicy.js`, `src/hudAltitudeDatum.js`)**:
  - First-person aircraft/vessel HUD with dynamic altitude datums (MSL, AGL, Geoid EGM96).
  - Atmospheric weather rendering based on real-time Open-Meteo observations.
  - Local briefings (reverse-geocoded place labels, regional news via Google News / GDELT).
- **Voice Control & Multimodal Realtime (`src/voice/gevRealtime.js`, `src/voice/gevActions.js`)**:
  - OpenAI Realtime API integration with function calling tools (`GEV_REALTIME_TOOLS`).
  - Strict token and session cost tracking/metering (`src/voice/gevCostTracker.js`).
- **Memory & Allocation Governance (`src/gcAllocationTracker.js`)**:
  - Strict GC-bracketed allocation limits to guarantee 60 FPS performance without memory leaks.

## 3. High-Priority Functional Domains
1. **Live Air Traffic**: OpenSky Network worldwide snapshot + adsb.lol point API fallback.
2. **Maritime Traffic**: Real-time AIS vessel stream via AISStream.io.
3. **Space Missions & Satellites**: SGP4 orbit propagation via CelesTrak TLEs + Launch Library 2.
4. **Environmental & Hazards**: USGS live earthquakes + NASA FIRMS active fire hotspots.
5. **Infrastructure**: TeleGeography submarine cables, datacenters, dams, nuclear plants, and traffic.
6. **Ground Sensors & Media**: Public CCTV streams (Austin, Caltrans, London JamCams) + Radio Browser.
