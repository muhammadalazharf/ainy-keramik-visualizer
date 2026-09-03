# ADR-003: Full 3D Nuclear Rewrite (Three.js Replacement)

**Date:** 2026-09-01
**Status:** Accepted (against multiple recommendations)
**Decision Maker:** Azhar (explicit, after formal push-back 3x)

## Context

Setelah Session 2-3 completed working 2D visualizer (Konva.js), external audit report merekomendasikan staged approach (P0-P3 fixes → complete V1 2D → evaluate view upgrade). Master prompt Section 2.3 explicitly listed Full 3D sebagai V3 out of scope.

Azhar memutuskan **Full 3D Nuclear Rewrite sekarang** — discard Konva code, rebuild dari nol dengan Three.js.

## Decision

**Nuclear Replacement:**
- Uninstall `konva`, `react-konva`
- Delete `src/modules/design-canvas/DesignCanvas.js`
- Install `three`, `@react-three/fiber`, `@react-three/drei`
- Rebuild 3D scene di `src/modules/design-3d/`
- Keep: pure math functions (`tile-pattern.js`), catalog panel logic, state store, screens, data
- Learning mode: "Just implement, user reads commit" (no verbal explanation)

## Rationale (User's, not Claude's)

Azhar mempertimbangkan konsekuensi dan tetap decide untuk 3D karena:
- Personal vision untuk end product
- Willing to extend timeline
- Accepts risk that ortu might lose patience

## Consequences (Documented Risks)

**Timeline Impact:**
- Original plan: 24 bulan
- 3D rewrite: **+12 to +18 bulan** additional
- **New total: 36-42 bulan** (3-3.5 tahun)
- Sunday-only bandwidth (~24-40 jam/bulan) unchanged

**Technical Debt:**
- Session 2-3 Konva canvas work DISCARDED
- Learning curve WebGL/Three.js: ~100-200 jam untuk basics
- 3D asset pipeline needed (materials, lighting, textures)
- Performance target lebih agresif (60fps 3D lebih hard daripada 60fps 2D)

**Business Risk:**
- Ortu kemungkinan kehilangan patience sebelum tool ready
- Roman 3D Visualizer sudah gratis + superior quality — competing head-on
- Path A marketing tetap urgent (traffic prospect), tidak menunggu tool jadi

**Scope Creep Precedent:**
- Master prompt Section 2.3 dilanggar (Full 3D adalah V3 out of scope)
- Future scope creep decisions punya justifikasi lebih lemah

## Alternatives Rejected

Setelah 3x push-back:
- **Staged 2D V1 → evaluate 3D setelah production feedback** (audit recommendation)
- **Front-facing 2D dengan perspective** (4-8 minggu, middle ground)
- **Additive 3D** (keep 2D, add 3D preview screen — best-of-both)
- **Hybrid** (2D desain workspace + 3D preview mode)

## Migration Plan

**Phase A — Foundation (Session 3-4):**
- ADR-003 (this)
- Install Three.js stack
- Uninstall Konva stack
- Delete Konva files
- Basic 3D scene stub (camera + light + placeholder plane)

**Phase B — Tile Rendering (Session 5-8):**
- Reuse math functions untuk grid position
- Convert 2D positions → 3D coordinates (x, z axes for floor; x, y for wall)
- Tile mesh with material color
- Nat as visible seam (thin boxes atau shader)

**Phase C — Interaction (Session 9-12):**
- OrbitControls (rotate camera around scene)
- Zoom in/out
- Reset view button

**Phase D — Realistic Rendering (Session 13-20):**
- Texture loading (WebGL texture mapping)
- Lighting realistic (shadow, ambient, directional)
- Materials PBR (roughness, metalness)

**Phase E — Polish (Session 21-28):**
- Performance optimization (instancing untuk banyak tiles)
- Loading states
- Ortu-friendly camera controls

## Reversibility

**Low.** Once Konva code deleted + team investment in Three.js, going back = same rewrite cost dari lain arah. Decision effectively locked-in.

Git tag `v0.3.0-pre-3d-rewrite` created at commit `be9c3bb` untuk emergency rollback jika required.

## Success Criteria

- Ortu bisa lihat visualisasi 3D dengan tile custom di /design
- Camera control mudah dipahami boomer
- Performance minimum 30fps di tablet toko
- Feature parity dengan 2D version yang di-discard (surface, dimension, catalog, nat, estimation)

## Sign-Off

- Azhar (developer + decision maker): confirmed 2026-09-01
- Claude (executor): push-back 3x completed, executing per authorization
