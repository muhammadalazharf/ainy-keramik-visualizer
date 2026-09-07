# PROJECT STATUS

**Last Updated:** 2026-09-07 (Session 4 — Figma Rewrite + Vercel Deploy)
**Overall Phase:** V1 LIVE PRODUCTION

## 🌐 Live URLs

- **Production:** https://ainy-keramik-visual.vercel.app
- **GitHub:** https://github.com/muhammadalazharf/ainy-keramik-visualizer
- **Vercel Dashboard:** (login vercel.com/muhammadalazharf)

## Deployment

- **Platform:** Vercel Hobby (free tier)
- **Auto-deploy:** enabled (git push main → production build)
- **Build time:** ~30-60 detik di Vercel
- **Framework:** Next.js 16.3.3 (Turbopack)
- **Regions:** Global CDN edge
- **Cost:** Rp 0/bulan

## Routes Live

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Static | Landing Page |
| `/dashboard` | Static | Room selection grid |
| `/room/kamar-mandi` | SSG | Bathroom visualizer |
| `/room/kamar-tidur` | SSG | Bedroom visualizer |
| `/room/ruang-tamu` | SSG | Living room visualizer |
| `/room/ruang-keluarga` | SSG | Family room visualizer |
| `/katalog` | Static | Public catalog view |

## Feature Coverage (Session 4 Post-Deploy)

| Feature | Status | Note |
|---------|--------|------|
| Landing Page | ✅ Production | Match Figma |
| Dashboard (4 rooms) | ✅ Production | Match Figma |
| Room Visualizer 3-col | ✅ Production | Match Figma |
| Tile Catalog (7 tiles) | ✅ Production | Search + filter tabs work |
| Lisbon Catalog | ✅ Production | 2 items |
| Control Panel | ✅ Production | Template + Surface + Dim + Pattern + Nat |
| 3D Scene rendering | ✅ Production | Three.js via r3f, real texture 3 tiles |
| Estimation math | ✅ Production | Math correct at all dimensions |
| Straight pattern | ✅ Production | Working |
| Herringbone pattern | 🔲 UI-only | Math not yet different |
| Diagonal pattern | 🔲 UI-only | Math not yet different |
| Brick pattern | 🔲 UI-only | Math not yet different |
| Real textures (3 of 7) | ✅ Production | Calacatta/Onyx/Vintage Grey |
| Procedural fallback | ✅ Production | For products without real image |
| Ekspor Spesifikasi | 🔲 Stub | Button ada, functionality belum |
| Template style variation | 🔲 UI-only | Dropdown works, no rendering diff |
| Auth (password gate) | 🔲 None | Public URL |
| Path A marketing | 🔲 Not started | GBP + WA Business |

## Emergency Rollback

- **Pre-3D nuclear:** `git checkout v0.3.0-pre-3d-rewrite` (Konva 2D era)
- **Pre-Figma:** `git checkout v0.4.0-pre-figma-rewrite` (Three.js 3D era)
- **Current:** `main` (Figma-driven UI + Three.js 3D)

## Next Session Priorities

1. Test dengan ortu di tablet toko real device
2. Implement Herringbone / Diagonal / Brick pattern math
3. Ekspor Spesifikasi (generate PDF spec sheet)
4. Room-specific 3D geometry (bathroom walls vs bedroom floor)
5. Path A marketing setup (WAJIB paralel per master prompt)
