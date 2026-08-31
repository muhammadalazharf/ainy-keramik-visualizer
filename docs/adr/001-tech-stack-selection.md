# ADR-001: Tech Stack Selection

**Date:** 2026-08-31
**Status:** Accepted

## Context

Membangun web-based tile visualizer untuk toko keramik. Butuh stack yang:
- Cocok untuk canvas rendering interaktif (drag-drop tile)
- Deploy mudah (owner solo, non-DevOps)
- Learning curve reasonable untuk junior dev (Azhar)
- Long-term maintainable

## Decision

**Framework:** Next.js 16 (App Router)
**UI:** React 19 + Tailwind CSS 4
**Canvas:** Konva 10 + react-konva 19
**State:** Zustand 5
**Language:** JavaScript (bukan TypeScript untuk V1)
**Package Manager:** Yarn 1.22 (via Corepack)
**Deploy:** Vercel (Hobby free tier V1)
**Data:** JSON file di repo (V1)

## Rationale

**Next.js dipilih daripada Vite + React murni:**
- Native Vercel integration (zero config deploy)
- App Router modern pattern, dukungan resmi long-term
- Server component + middleware built-in (untuk password gate)

**Konva daripada Fabric.js atau plain Canvas API:**
- React binding maintained (react-konva)
- Drag-drop + transformer built-in (menghemat waktu implementasi)
- Bundle size acceptable (~150KB gzipped)
- Dokumentasi lebih baik daripada Fabric untuk React use case

**Zustand daripada Redux Toolkit atau Context:**
- Boilerplate minimal (cocok untuk solo junior dev)
- Performance lebih baik daripada Context untuk state kompleks
- Redux overkill untuk scope V1

**JavaScript daripada TypeScript:**
- Learning curve lebih rendah untuk junior dev
- TS bisa migrate di V2 saat foundation stabil
- Trade-off: type safety hilang, tapi Azhar preference

**Tailwind CSS daripada CSS Modules atau Styled Components:**
- Utility-first cepat untuk prototype
- Small bundle setelah purge
- Consistent dengan design system approach

**JSON file daripada database:**
- Catalog < 200 produk, tidak butuh query kompleks
- Update via git commit + Vercel auto-deploy = zero downtime
- Free tier friendly (no database cost)
- Upgrade path jelas kalau perlu: Vercel KV atau Turso (SQLite)

## Consequences

**Positive:**
- Fast time-to-first-deploy (< 1 hari setup)
- Free tier friendly (spending $0 untuk V1)
- Active community setiap library
- Next.js + Vercel = zero-config CI/CD

**Negative:**
- Node 24 (Current, bukan LTS) — risiko bug bleeding-edge
- Next.js 16 sangat baru — dokumentasi community masih tipis
- No TypeScript = bug type-related bisa runtime saja (mitigation: ESLint strict + PropTypes optional)
- react-konva browser-only = harus dynamic import + `ssr:false` (lihat Section Konva SSR di ARCHITECTURE.md)

## Alternatives Considered

- **Vite + React + Vercel manual:** Simpler stack, tapi kehilangan Next.js middleware & auto-optimization
- **Fabric.js:** Lebih tua & complete, tapi React integration inferior
- **Redux Toolkit:** Powerful, tapi boilerplate berlebih untuk scope V1
- **TypeScript from start:** Type safety lebih baik, tapi learning tax untuk Azhar

## References

- Master prompt Section 14 (Tech Stack & Library Selection Framework)
- Next.js docs: https://nextjs.org/docs
- Konva docs: https://konvajs.org/docs/
- Zustand: https://github.com/pmndrs/zustand
