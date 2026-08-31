# NEXT SESSION PLAN

**Target Date:** Sunday berikutnya setelah 2026-08-31

## Session Goal

Selesaikan Phase 0 penuh dengan git commit + Vercel deploy, lalu mulai Phase 3 (skeleton screens navigasi).

Target akhir sesi: **Ortu bisa akses URL Vercel dan navigasi 4 screen (walau kosong isi).**

## Preparation Before Session

- [ ] Akun GitHub sudah login di browser
- [ ] Akun Vercel siap (signup dengan GitHub — free tier cukup)
- [ ] Share screenshot progress current ke ortu (manage expectation)
- [ ] Sync OneDrive kalau ada perubahan dari luar

## Planned Tasks (Prioritized)

### 1. Initial Git Commit + GitHub Push (~30 menit)

- Verify `.gitignore` sudah exclude `node_modules`, `.env*`, `.next/`
- `git add .` + review dengan `git status`
- Commit pertama: `chore: initial scaffold Next.js 16 + Konva + Zustand`
- Buat repo GitHub private (nama: `ainy-keramik-visualizer`)
- Push ke remote

**Definition of done:** Repo GitHub live, semua kode ke-push, tidak ada secret leak.

### 2. Setup Vercel Deploy (~30 menit)

- Install Vercel CLI: `npm i -g vercel` (per session start advisory)
- Connect Vercel ke GitHub repo
- Deploy preview otomatis via `git push`
- Verify URL preview accessible

**Definition of done:** Preview URL live, bisa dibuka dari HP ortu.

### 3. Bikin Skeleton Screens (~2 jam)

Ikuti component hierarchy Section 13.5 master prompt.

Routes yang dibuat:
- `/` → Selection (Wall vs Floor) — 2 tombol besar
- `/dimension` → Dimension input (form width + height meter)
- `/design` → Design canvas (placeholder Konva stage kosong)
- `/preview` → Preview & export (placeholder)

Setiap screen: heading + button "Back" + button "Next" untuk navigation flow.

**Definition of done:** User bisa klik dari `/` sampai `/preview` end-to-end via keyboard/touch, tanpa error console.

### 4. Setup Password Auth Middleware (~1 jam, kalau waktu cukup)

- Buat `src/middleware.js`
- Password hash disimpan di `.env.local`
- Session cookie `next/headers cookies` + signed value
- Redirect ke `/login` kalau tidak auth

**Definition of done:** URL `/`, `/dimension`, `/design`, `/preview` protected. Wrong password rejected.

## Reference Materials

- Master prompt Section 13 (component hierarchy)
- Master prompt Section 16 (state & interaction design)
- Master prompt Section 21 (security & auth)
- Next.js 16 middleware docs: baca `node_modules/next/dist/docs/` sebelum implement
- Vercel CLI docs: https://vercel.com/docs/cli

## Notes / Warnings

- **Skeleton dulu, canvas belakangan** — jangan implement Konva sebelum navigation kerja end-to-end
- **Deploy Vercel early** — biar ortu bisa lihat progress fisik (bukan cuma cerita)
- **Belum spend money** — Vercel Hobby free tier, GitHub free tier, semua $0
- **Konva SSR gotcha** — WAJIB dynamic import `ssr: false` saat implement DesignCanvas
- **Path A marketing** — sisakan minimal 30 menit di akhir session untuk marketing task (per Section 3.6)
