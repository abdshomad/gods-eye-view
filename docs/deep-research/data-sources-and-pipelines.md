# Data Sources, Ingestion, and Caching Pipelines

## 1. Real-Time Streaming & Live Ingestion Pipelines
- **ADS-B Live Flights**:
  - Primary: OpenSky Network REST API worldwide snapshot (10s cadence).
  - Fallback: adsb.lol point query bounded to 250 nm around camera subpoint when OpenSky is unavailable.
- **AIS Live Vessels**:
  - WebSockets feed via AISStream.io filtered by bounding box and message types (1, 2, 3, 5, 18, 19).
- **Satellite Tracking & Orbital Mechanics**:
  - Live TLE catalogs from CelesTrak, computed locally via `satellite.js` (SGP4/SDP4).
  - Launch metadata via The Space Devs Launch Library 2 v2.3 endpoint (15-min disk cache).
- **Environmental Hazard Feeds**:
  - USGS Earthquakes GeoJSON feed (M1.0+ hourly/daily).
  - NASA FIRMS satellite thermal anomaly coordinates.
- **Ground Media & CCTV**:
  - Live traffic cameras: City of Austin Open Data, Caltrans CWWP2, TfL JamCams.
  - Geolocated internet radio streams via Radio Browser directory (45-minute catalog cache).

## 2. Server-Side Proxying, Caching, and Fault Tolerance
- **Backend Proxy Architecture (`vite.config.js` / server middleware)**:
  - Cache directory: `.gev-cache/` for transient responses with TTL control.
  - Rate limiting & quota governance (e.g. TomTom 40k daily request cap, Open-Meteo caching).
  - Resilient stale-while-revalidate pattern across all upstream API calls.

## 3. License, Attribution, and Compliance Boundary
- **MIT Code Grant**: Applies strictly to source code, excluding external data assets.
- **Licensing Separation**:
  - Non-commercial datasets (TeleGeography cables, OpenSky) isolated in distinct modules.
  - Attribution credits dynamically mounted in Cesium credit display (`viewer.creditDisplay`).
