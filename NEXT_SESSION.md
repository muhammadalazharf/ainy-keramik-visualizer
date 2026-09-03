# NEXT SESSION PLAN

**Target Date:** Sunday berikutnya setelah 2026-09-01

## Konteks: Session 3 melebihi ekspektasi (lagi)

Session 3 cover: audit-driven bug fixes → nuclear rewrite ke 3D (per ADR-003) → procedural texture → trim rendering. Tech stack shift dari Konva ke Three.js/R3F. Semua working di localhost.

## Session 4 Goal

**Deploy Vercel + polish 3D UX untuk boomer usability.**

Target akhir sesi: **Ortu bisa buka URL Vercel dari HP, navigate 3D scene tanpa training** (touch gestures work, tombol reset view visible, controls intuitive).

## Preparation Before Session

- [ ] Test manual current localhost — apakah 3D touch gesture jalan di HP browser
- [ ] Signup Vercel (login GitHub muhammadalazharf)
- [ ] Ambil 3-5 foto produk keramik di toko dengan HP (siapkan untuk real texture upgrade nanti)

## Planned Tasks (Prioritized)

### 1. Camera UX Polish (~45 min)
- Reset view button di sudut canvas
- Help tooltip / keyboard hints (drag=rotate, scroll=zoom, right-click=pan)
- Auto-center camera saat surface/dimension change
- Touch gesture optimization (mobile-friendly OrbitControls)
- Definition of done: Boomer bisa navigate tanpa nyasar

### 2. Vercel Deploy (~30 min)
- Install Vercel CLI atau pakai dashboard (dashboard lebih mudah untuk pertama)
- Import repo GitHub → configure build
- Verify preview URL accessible
- Test dari HP (WiFi + 4G)
- Definition of done: Preview URL live, ortu bisa buka dari HP

### 3. Save/Export as Image (~30 min)
- Tombol "Simpan" di /preview
- Capture Three.js canvas frame → PNG
- Download atau share via native API
- Definition of done: User bisa save gambar 3D scene ke HP

### 4. Path A Marketing Setup (~30 min) - WAJIB
Per master prompt Section 3.6:
- Google Business Profile create untuk toko
- Foto exterior toko dengan HP
- WhatsApp Business setup basic (nama toko, jam operasional)
- Definition of done: Google Maps pin ada, WA Business live

## Reference Materials
- Master prompt Section 16 (UX for boomer)
- Master prompt Section 21 (security — belum urgent tapi cek sebelum public deploy)
- Three.js OrbitControls docs: touch gesture config
- Vercel deploy docs: https://vercel.com/docs/deployments

## Notes / Warnings

- **Deploy public =** siapa saja bisa akses URL. Belum ada password gate. Untuk V1 sementara it's OK karena tidak ada sensitive data, tapi rencana add auth di Session 5+
- **Turbopack production build** — belum test. Kalau `vercel build` fail, fallback ke `next build` webpack (uncheck Turbopack di next.config)
- **Performance mobile** — 3D + banyak tiles bisa lag di tablet murah. Ukur FPS di ortu tablet real
- **Emergency rollback** — kalau 3D bermasalah production, `git checkout v0.3.0-pre-3d-rewrite` untuk kembali ke 2D working version

## Backlog (V2+)

- Real product texture photos (drop di /public/textures/, kode fallback ke procedural)
- Realistic shadow/lighting tuning
- Instancing untuk large tile count (>5000)
- Camera preset views (top-down, iso, front)
- Multiple trim per side (top/right/bottom/left berbeda)
- Undo/redo history
- Auth middleware (password protect)
- Admin catalog UI (edit products.json via web)
- Multi-page comparison (bandingkan 2-3 desain side-by-side)
