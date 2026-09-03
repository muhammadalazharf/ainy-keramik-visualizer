# PROJECT STATUS

**Last Updated:** 2026-09-03 (Session 3b — Real Textures)
**Overall Phase:** Phase 5-6 + real texture (Phase D per ADR-003) — production-ready V1, awaiting Vercel deploy

## Session 1 Progress (2026-08-31)

- ✅ Environment verified: Node 24.19.0, Yarn 1.22.22 (via Corepack), Git 2.55.0
- ✅ Scaffold Next.js 16.3.3 (App Router, JavaScript, Tailwind 4, ESLint 9)
- ✅ Dev server verified jalan (localhost:3000, Ready in 688ms via Turbopack)
- ✅ Deps terinstall: konva@10.3.2, react-konva@19.2.5, zustand@5.0.15
- ✅ Master prompt structure setup (`.claude/CLAUDE.md`, `PROJECT_STATUS.md`, `NEXT_SESSION.md`, `docs/`, `data/`)
- ✅ ADR-001, ADR-002 written
- ✅ Skeleton screens 4 route (Home / Dimension / Design / Preview) — HTTP 200 semua
- ✅ Layout metadata Indonesia (`lang="id"`, title, description)
- ✅ **Zustand store** (`src/stores/design-store.js`) — persist surface + dimensions antar screen
- ✅ Navigasi flow end-to-end tested via browser automation (4m×3m → 12m² correct)
- ✅ UI bug fixed: button visibility (`bg-current` → `slate-900/white` eksplisit)
- ✅ **Konva canvas basic** (`src/modules/design-canvas/DesignCanvas.js`)
  - Dynamic import `ssr: false` (SSR gotcha handled)
  - Responsive sizing via ResizeObserver
  - Scaling math correct (Section 15.2 formula)
  - Grid overlay 0.5m step
  - Dimension labels
- 🔲 Initial git commit — pending (menunggu keputusan Azhar)
- 🔲 GitHub push + Vercel deploy — deferred ke session 2

## Module Status Matrix

Kategori status: PLANNED / IN_DESIGN / IN_DEVELOPMENT / IMPLEMENTED / TESTED / STAGING_DEPLOYED / PRODUCTION_DEPLOYED / VALIDATED / BATTLE_TESTED

| Module | Status | Notes |
|--------|--------|-------|
| A. Auth (password gate) | PLANNED | Next.js middleware + bcrypt hash + signed cookie |
| B. Selection (wall/floor) | IMPLEMENTED | Zustand-backed, 2 tombol besar |
| C. Dimension Input | IMPLEMENTED | Controlled form + validation basic |
| D. Trim Options | IMPLEMENTED | 3D frame render, perimeter cost (single trim per area V1) |
| E. Product Catalog | IMPLEMENTED | Panel filter by surface, click-to-select, estimation display |
| F. Drag-Drop | PLANNED | Konva Stage + Transformer |
| G. Tile Pattern | IMPLEMENTED | Straight grid, pure math function separated (Section 15.3) |
| H. Nat Rendering | IMPLEMENTED | Width 2/3/5/8mm, 5 colors, live re-render |
| I. Perspective (2D) | SUPERSEDED | Replaced by full 3D via ADR-003 (Three.js OrbitControls) |
| J. Save/Export | PLANNED | Konva stage.toDataURL() + download |
| K. Admin Catalog | PLANNED | V2 kemungkinan (edit JSON via GitHub V1) |

## Marketing Parallel Track (Path A) — WAJIB paralel dengan development

| Item | Status | Notes |
|------|--------|-------|
| Google Business Profile | PLANNED | Bulan 1 wajib per master prompt Section 3.6 |
| WhatsApp Business + katalog | PLANNED | Bulan 1 wajib |
| Instagram foundation | PLANNED | Bulan 1-2 wajib |
| TikTok foundation | PLANNED | Bulan 1-2 wajib |
| Content Calendar mingguan | PLANNED | Ongoing |

⚠️ **REMINDER:** Kalau Azhar coba skip Path A fokus coding, remind bahwa tanpa traffic, tool visualizer tidak dipakai saat selesai.

## Active Blockers

_(none saat ini)_

## Deferred Decisions

- **Turbopack production build:** Default di Next.js 16, evaluasi stability setelah first production build
- **ESLint 9 support warning:** Current works, monitor upstream
- **Node 24 (Current) vs 20 (LTS):** Aman untuk sekarang, switch ke 20 LTS kalau ada bug production
- **Tablet target device:** Android atau iPad — belum diputuskan, tunggu diskusi dengan ortu

## ADRs Created

- **ADR-001** — Tech stack selection (baseline)
- **ADR-002** — Next.js 16 adoption (divergence dari master prompt Next.js 14)

## Recent Sessions Log

### Session 3b — 2026-09-03 (Real Texture Assets)

- **Duration:** ~30 menit
- **Trigger:** User provide 3 real image tile keramik (upload via chat)
- **Accomplished:**
  - Add 3 new floor products (Roman Calacatta White, Roman Onyx Cream, Mulia Vintage Grey Pattern)
  - Implement `useTileTexture` hook: try load real image first, fallback procedural
  - Global `REAL_TEXTURE_CACHE` untuk avoid duplicate loading
  - File rename debug (initial guess wrong, fixed via visual verification)
- **Verified via browser:**
  - Calacatta White render as marble putih dengan black veining ✓
  - Onyx Cream render as warm cream dengan orange veining ✓
  - Vintage Grey Pattern render as grey geometric pattern ✓
- **Deferred:** Real thumbnails (currently reusing texture image as thumbnail, works but suboptimal size)
- **Learned:**
  - File cache invalidation di JS module scope perlu hard reload
  - `git status` diagnostic penting untuk detect ambient file changes
  - Visual verification kritis untuk asset mapping — filename saja bisa salah

### Session 3 — 2026-09-01 (Debug Session: Audit-Driven Fixes)

- **Duration:** ~30 menit
- **Trigger:** External audit report (`AUDIT_REPORT_AND_DEBUG_PROMPT.md`) berdasar screen recording user
- **Method:** Reproduce di browser + JS instrumentation, bukan asumsi buta ke hypothesis audit
- **Findings vs Audit:**
  - **P0 Auto-Zoom Loop:** NOT REPRODUCED di code current. Container size stabil 891.2×676px (later 927.2×711.2) selama 5 detik. Defensive fix diapply preventive.
  - **P1 Bug #1 & #2 (tile count + price mismatch):** REAL BUG, single root cause. `selectedTileId` default = `roman-crema-marfil-60x60` (floor category). Saat user pilih Dinding, katalog filter → tile visible = Roman Onyx Beige, tapi `selectedTileId` masih pointing ke tile yang ke-filter out (invisible tapi selected). Estimation pakai tile hidden. Angka mismatch dengan card visible sebenarnya BENAR untuk tile hidden (286 dus × 285k = 81.510.000).
  - **P1 Bug #3 (tile texture):** NOT A BUG. Texture image feature belum implement (Phase 6 roadmap). Solid color = expected.
  - **P2 Bug #4 (nat not visible):** Physics artifact at 20×20m — nat 3mm scaled ke pixel = sub-pixel. Bukan bug rendering, tapi UX issue karena dimensi unrealistic.
  - **P2 Issue #1 (default dimension):** Valid concern. Fixed.
- **Fixes Applied:**
  - `CatalogPanel.js`: `useEffect` auto-select first product saat filter tidak include current selection
  - `DesignCanvas.js`: ResizeObserver defensive (rAF debounce + Math.floor + no-op guard `Object.is`)
  - `dimension/page.js`: Realistic defaults per surface, range validation 0.5-15m
- **Verified via browser automation:**
  - Wall + 3m×2.5m + Onyx Beige + nat 3mm → 36 tiles, 7 dus, Rp 1.365.000 ✓ math correct
  - Nat 8mm + hitam → visible gap terlihat di canvas
  - Container size stable 5s (927.2 × 711.2, no growth)
- **Deferred:** Real texture image loading (Phase 6), Drag-drop (Phase 7), Trim rendering (Phase 8), Perspective view (Phase 8)
- **Next Priority:** Vercel deploy + missing features V1

### Session 2 — 2026-09-01 (Tile Pattern + Catalog)
- **Duration:** ~1 jam (efisien, di bawah estimate)
- **Accomplished:**
  - Extended Zustand: `selectedTileId`, `natWidth_mm`, `natColor`
  - Data helpers: `getProductById`, `getNatHexById`, `getAllProducts`
  - Pure math: `calculateStraightPattern`, `estimateNeeded` (Section 15.3-15.4)
  - Konva render: tile grid with nat backdrop
  - CatalogPanel module: filter by surface, click tile, nat controls, live estimation
- **Learned:**
  - Turbopack Fast Refresh butuh browser refresh untuk dynamic imports baru
  - Zustand selector optimal (subscribe per state slice, avoid re-render)
  - React `useMemo` untuk expensive calculation (pattern re-compute only when deps change)
- **Verified via browser automation:**
  - Roman Crema 60×60 + nat 3mm + white → 24 tiles, 7 dus, Rp 1.995.000
  - Mulia Cotto 40×40 + nat 8mm + grey → 63 tiles, 12 dus, Rp 936.000
- **Deferred:** Real texture images (Phase 6), partial tile rendering at edges, offset pattern
- **Next Priority:** Vercel deploy + Path A marketing check-in

### Session 1 — 2026-08-31 (Foundation Setup)
- **Duration:** ~1 jam
- **Accomplished:** Environment + scaffold + core deps + docs structure
- **Learned:**
  - Next.js 16 auto-generate `CLAUDE.md`/`AGENTS.md` (bagus untuk AI-friendly workflow)
  - `react-konva` browser-only, wajib `dynamic + ssr:false` di Next.js App Router
  - npm package name rule: no capital letters, no spaces (kena saat scaffold pertama kali)
- **Deferred:** Skeleton screens, git commit, Vercel deploy → Session 2
- **Next Priority:** Lihat `NEXT_SESSION.md`
