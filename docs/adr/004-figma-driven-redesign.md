# ADR-004: Figma-Driven Redesign (Effective Discard)

**Date:** 2026-09-06
**Status:** Accepted
**Trigger:** User provided Figma design (`Desain Visualizer`) as blueprint for rebuild

## Context

User created Figma design after Session 3b real-texture work. Design specifies:
- Room-based navigation (Kamar Mandi, Kamar Tidur, Ruang Tamu, Ruang Keluarga)
- Landing Page + Dashboard + 4 Room screens + Katalog
- 3-column room visualizer layout (Tile Catalog | 3D Scene | Control Panel)
- Different catalog (Travertine, Hexagonal Teal, Statutario Gold, Terrazzo Grey + Lisbon Ulir/Teal)
- 4 patterns (Straight, Herringbone, Diagonal, Brick)
- 4 nat colors (Putih, Semen, Grey, Charcoal)
- New terminology: "Katalog Motif", "Ekspor Spesifikasi", "Pilih Template Ruangan"

User wanted "full discard fresh start" (Q3). After 3x push-back, agreed to **Effective Discard**: UI shell rewritten from scratch, engineering preserved.

## Decision

**Delete (UI Shell):**
- `src/app/dimension/`, `src/app/design/`, `src/app/preview/`
- `src/modules/catalog/CatalogPanel.js` (single-list catalog)
- Old `src/app/page.js` (surface-picker home)
- Old `src/app/layout.js` metadata

**Preserve (Engineering):**
- `src/lib/math/tile-pattern.js` (pure math, framework-agnostic)
- `src/lib/textures/proceduralTile.js` (texture generator)
- `src/lib/data/products.js`, `trims.js` (data helpers, refactored)
- `src/modules/design-3d/Scene3D.js` (Three.js scene, minor prop adjust)
- Real texture assets in `public/textures/*.png`

**Rebuild (Fresh per Figma):**
- `src/app/page.js` — Landing Page
- `src/app/dashboard/page.js` — Room selection grid
- `src/app/room/[id]/page.js` — Dynamic room routes
- `src/app/katalog/page.js` — Public catalog view
- `src/components/BrandBadge.js` — Reusable brand mark
- `src/modules/visualizer/RoomVisualizer.js` — 3-column room layout
- `src/modules/catalog/TileCatalog.js` — Tile picker with search + filter tabs
- `src/modules/catalog/LisbonCatalog.js` — Lisbon (border) picker
- `src/modules/controls/ControlPanel.js` — Full control panel per Figma
- `src/app/globals.css` — New design tokens (cream/brand/ink palette)
- Refactored `src/stores/design-store.js` — Room + Template + Pattern + tabs

**Data Reset:**
- `data/products.json` — 7 products (4 Figma + 3 preserved real-texture)
- `data/trims.json` — 2 Lisbon items (Ulir, Teal)
- `data/nat-colors.json` — 4 colors (Putih, Semen, Grey, Charcoal)
- `data/rooms.json` — NEW: 4 room types with defaults
- `data/templates.json` — NEW: 5 style templates

## Rationale

- User's Figma design is deliberate UX architecture (room-first is more intuitive for boomer)
- Engineering (Three.js, math, textures) had zero UX overlap — safe to preserve
- Rewriting engineering identically would waste ~200 hours of prior work

## Consequences

**Positive:**
- UI matches user's mental model + Figma spec exactly
- 4 room types more relatable than "wall vs floor" for end users (ortu)
- 4 pattern types unlock design variety (was Straight-only)
- Freeform nat width input more flexible than 4-button preset
- Search + filter tabs improve findability as catalog grows

**Negative:**
- 8 commits of Session 1-3b UI work discarded (Section 25.3 precedent risk for future scope creep)
- 4 patterns declared but only Straight actually implemented; Herringbone/Diagonal/Brick still fall back to Straight math
- Template dropdown is UI-only; no rendering variation per template yet
- "Ekspor Spesifikasi" button is stub (no PDF export logic yet)
- Multiple room types share single 3D scene; no room-specific geometry (bathroom vs bedroom render same way)
- Real texture images only for 3 of 7 products; 4 fall back to procedural cream

**Follow-up backlog:**
- Implement herringbone/diagonal/brick pattern math
- PDF/image export for "Ekspor Spesifikasi"
- Room-specific 3D geometry (wall shape for bathroom, floor+furniture for living room)
- Template-driven color/lighting variations
- Real texture upload for remaining 4 products
- Reintroduce trim rendering on 3D scene (currently visual-only in catalog)

## Rollback

Emergency rollback: `git checkout v0.4.0-pre-figma-rewrite` (tag pushed to GitHub before this rewrite).

## Sign-Off

- Azhar (decision maker): confirmed 2026-09-06 after 3x push-back cycle
- Claude (executor): built Landing + Dashboard + Room screens + Katalog + control panel in single session
