# Ainy Keramik Visualizer — Claude Code Instructions

**Source of truth (full document):** `C:\Users\Azhar\Downloads\CLAUDE_CODE_MASTER_PROMPT.md`

File ini adalah ringkasan operational + project state. Baca source di atas untuk konteks lengkap Section 0-30 + Appendices A-E.

## Session Start Protocol

1. Baca file ini (`.claude/CLAUDE.md`)
2. Baca `PROJECT_STATUS.md` — current state
3. Baca `NEXT_SESSION.md` — today's plan
4. Baca root `CLAUDE.md` / `AGENTS.md` — Next.js 16 warnings dari Vercel
5. Konfirmasi today's focus dengan Azhar sebelum mulai kerja

## Core Operating Rules

### Communication
- Bahasa Indonesia default, technical term boleh English
- Direct, no BS, honest tentang uncertainty
- Explain-then-execute (mentor mode aktif — Azhar sedang belajar)

### Decision & Execution
- **Step-by-step konfirmasi** (pilihan Azhar di Session 1)
- Explain flag/library sebelum install
- Ask sebelum destructive action (`rm -rf`, force push, deploy prod, spend money)

### Anti-Hallucination
- Verify library existence via WebSearch/npm sebelum reference
- Admit uncertainty daripada fabrikasi
- Cite source untuk claim critical

## Actual Tech Stack (post-scaffold, 2026-08-31)

Diverge dari master prompt Section 14 (yang tulis "Next.js 14+"). Lihat ADR-002.

- **Next.js 16.3.3** (Turbopack default)
- **React 19.2.8**
- **Tailwind CSS 4**
- **Konva 10.3.2** + **react-konva 19.2.5**
- **Zustand 5.0.15**
- **JavaScript** (bukan TypeScript untuk V1 — pilihan Azhar)
- **Yarn 1.22.22** (via Corepack)
- **Node 24.19.0**

### Konva SSR Gotcha (WAJIB tahu)

`react-konva` browser-only. Di Next.js App Router yang default SSR, WAJIB wrap dengan dynamic import:

```javascript
'use client'
import dynamic from 'next/dynamic'

const DesignCanvas = dynamic(() => import('./DesignCanvas'), { ssr: false })
```

Kalau lupa ini → error `window is not defined` saat build/render.

## Boomer-Friendly UX Rules (Section 16.5)

- Font min 16px, headings 24px+
- Touch target min 60×60px
- Bahasa Indonesia semua UI text (icon-heavy, minim text)
- Flow linear, no nested menu
- Autosave state (ortu tidak boleh kehilangan progress)
- Konfirmasi untuk destructive action

## People

### Owner (Developer)
- **Azhar** (azharlevthan@gmail.com)
- Background: Elektro Otomasi
- Skill baseline: junior web dev, familiar Python/SQL
- Bandwidth: Sunday-only (~24-40 jam/bulan)
- Goal ganda: ship product + upgrade skill junior → intermediate

### End User (Tool Operator)
- **Ortu Azhar** — pemilik toko Ainy Keramik (Sidoarjo)
- Boomer, tech-lite
- Motivasi bertahan, sensitif kalau tool susah
- Butuh training 3-5 sesi

## Full Reference

Section detail lengkap ada di file source. Jangan improvise kalau ada rule spesifik di master prompt.
