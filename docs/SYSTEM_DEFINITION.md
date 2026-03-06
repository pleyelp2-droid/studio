# AXIOM FRONTIER: SYSTEM DEFINITION
**Code Name:** Ouroboros Collective
**Status:** RELEASE_CANDIDATE_V1.0.6

## 1. PROJECT OVERVIEW
Axiom Frontier is a decentralized, persistent AI-MMORPG. It uses a hybrid architecture combining cloud-native scaling (GKE/GCP), relational integrity (PostgreSQL), real-time synchronization (Firestore), and high-speed cognitive caching (AWS ElastiCache).

## 2. CORE LOGIC (THE AXIOMS)
Reality is governed by five mathematical axioms centered on **KAPPA = 1000**:
1. **Continuity:** Information flow is never interrupted. World geometry is a sin/cos function of coordinates.
2. **Resource Density:** Scarcity is a function of coordinate distance from the Spire.
3. **Connectivity:** All nodes are linked through the Matrix.
4. **Complexity:** Emergent behavior scales with Civilization Index.
5. **Determinism:** The same input (seed + coords) always results in the same world state.

## 3. NEURAL NPC LOGIC (ENTITIES)
### Thinking Matrix
Each NPC possesses a unique profile of 8 cognitive variables: Aggression, Sociability, Curiosity, Alignment, etc.
### Heuristic Decision Making (AUE)
The Axiomatic Utility Engine calculates state transitions based on three primary needs:
- **Hunger:** Drives the need for trading or gathering.
- **Social:** Drives the need for interaction and alliance forming.
- **Wealth:** Drives the need for resource extraction and banking.
If Gemini AI is offline, the AUE uses deterministic utility scores to ensure 100% uptime of autonomous behavior.

## 4. WORLD GENERATION
Chunks are 400x400 unit cells generated on-the-fly.
- **Biome Logic:** Derived from the Continuity Axiom. If `f(x,z) > 0`, the sector manifests as a Forest/City; otherwise, it is a Desert/Waste.
- **Persistence:** Every change to a chunk is recorded in the Relational Core (Postgres) and synced via Firestore.

## 5. HIGH-SCIENCE RENDERING
To ensure 100% visibility of procedural textures:
- **Mist/Fog:** DISABLED (0.0 density).
- **Atmosphere/Sky:** DISABLED (Black Void).
- **Sun/Directional:** DISABLED (Prevents over-exposure/washout).
- **Ambient Boost:** Calibrated at 12.0 for laboratory-grade visual clarity.

## 6. INFRASTRUCTURE ENDPOINTS
- **Matrix Node (GKE):** 35.232.7.105 (Cognitive Orchestration)
- **Relational Core (Postgres):** 34.185.177.59 (Immutable Ledger)
- **Memory Cache (AWS):** arn:aws:elasticache:us-east-2:986523046654:serverlesscache:memory (Thinking Cache)
