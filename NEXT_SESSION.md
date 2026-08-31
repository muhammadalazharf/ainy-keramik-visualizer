# NEXT SESSION PLAN

**Target Date:** Sunday berikutnya setelah 2026-08-31

## Konteks: Progress Session 1 Melebihi Ekspektasi

Session 1 sudah cover: Phase 0 foundation + Phase 3-4 skeleton screens + Zustand state + Konva basic canvas (rectangle + grid). Sudah initial commit lokal (`ae17e3e`).

## Session 2 Goal

**Deploy live + mulai implementasi tile pattern rendering.**

Target akhir sesi: **Ortu bisa akses URL Vercel dari HP dan lihat area kanvas render dengan tile placeholder.**

## Preparation Before Session

- [ ] Verify repo GitHub sudah public/private sesuai preference
- [ ] Signup Vercel (login pakai GitHub)
- [ ] Share preview URL ke ortu untuk lihat progress fisik

## Planned Tasks (Prioritized)

### 1. Deploy Vercel (~30 menit)

- Install Vercel CLI: `npm i -g vercel` (per session start advisory)
- Login Vercel: `vercel login`
- Import repo GitHub ke Vercel (via dashboard atau CLI)
- Deploy preview otomatis via `git push`
- Verify URL preview accessible dari HP

**Definition of done:** Preview URL live, ortu bisa buka dari HP, semua 4 route + canvas jalan.

### 2. Implement Tile Pattern Rendering di Canvas (~2 jam)

Follow Section 15.3 master prompt (Tile Rendering Math).

Files:
- Add pattern logic: `src/lib/math/tile-pattern.js` — pure function `calculateStraightPattern()`
- Extend `DesignCanvas.js` — render tile grid inside area
- Pattern V1 = straight only (grid layout)

Test skenario:
- Area 4m × 3m, tile 60×60 cm, nat 3mm → ~35 tiles
- Area 3.5m × 2.5m, tile 30×60 cm, nat 3mm → ~49 tiles

**Definition of done:** Canvas render tile grid dengan spacing nat sesuai config, math accurate.

### 3. State Extension: Selected Tile + Nat Config (~30 menit)

Extend Zustand store:
- `selectedTileId`: ProductId | null
- `natWidth_mm`: number (default 3)
- `natColor`: string (default 'white')

Untuk sekarang, hard-code tile from `data/products.json` (belum ada UI catalog yang interaktif).

**Definition of done:** Ganti tile config via console (temp) → canvas re-render dengan pattern baru.

### 4. Path A Marketing Check-in (~30 menit)

Per master prompt Section 3.6 — WAJIB paralel.

- Google Business Profile: status? Belum setup → priority 1
- WhatsApp Business: status? Belum setup → priority 1
- Ambil 5-10 foto produk toko dengan HP (foundation catalog)

**Definition of done:** Minimum 1 dari 3 marketing infra live (GBP atau WA Business).

## Reference Materials

- Master prompt Section 12 (domain — waste factor, brand)
- Master prompt Section 15.3-15.4 (tile & dus math)
- Konva docs (react-konva Rect, Group, useImage untuk texture)
- Vercel CLI docs: https://vercel.com/docs/cli

## Notes / Warnings

- **Belum pakai texture image** — tile masih rectangle warna solid. Texture image (WebP) di Phase 6 nanti.
- **Turbopack production build** — belum test. Kalau `vercel build` gagal karena Turbopack, fallback ke `next build` dengan webpack.
- **Ortu-friendly UX** — belum evaluate. Session 3 fokus polish + test dengan ortu.
- **Konva SSR gotcha** — sudah handled di `DesignCanvas.js` via dynamic import ssr:false. Kalau tambah component Konva baru, INGAT wrap pattern yang sama.

## Backlog (V2+)

- Zustand persist middleware (survive refresh — pakai localStorage)
- Offset / brick pattern (V1 optional)
- Undo/redo history stack
- Product photo library (perlu foto real dari toko)
- Real product catalog UI (bukan hardcode)
- Password auth middleware
- Perspective transform (2D)
- Save/export as image
