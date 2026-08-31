# Architecture

**Version:** 0.1 (Session 1 baseline)
**Status:** Draft — akan iterate saat implementation dimulai

Source of truth untuk detail: master prompt Section 13.

## High-Level

```
┌──────────────────────────────────────────────────┐
│              CLIENT (Tablet toko)                 │
│                                                   │
│  Next.js 16 App Router (React 19)                │
│  ├── Screens (React Client/Server Components)    │
│  ├── State: Zustand store                        │
│  ├── Canvas: react-konva (dynamic, ssr:false)    │
│  └── Data: JSON catalog dari /data               │
└─────────────────────┬────────────────────────────┘
                      │ HTTPS
                      ↓
┌──────────────────────────────────────────────────┐
│                 VERCEL EDGE                       │
│  ├── Middleware auth (password gate)             │
│  └── Static asset (textures, thumbnails)         │
└─────────────────────┬────────────────────────────┘
                      │
                      ↓
┌──────────────────────────────────────────────────┐
│                   GITHUB                          │
│  Source + JSON catalog + assets                  │
│  Auto-deploy on push to main                     │
└──────────────────────────────────────────────────┘
```

## Layer Separation

1. **Presentation** (React components) — UI only, no business logic
2. **State** (Zustand store di `src/stores/`) — global app state
3. **Business Logic** (`src/lib/math/`, `src/lib/data/`) — pure functions, testable
4. **Rendering Engine** (react-konva components di `src/modules/design-canvas/`)
5. **Data** (`data/*.json`) — catalog products, trims, nat colors

## Data Flow (Unidirectional)

```
User action → Event handler → Zustand action → State change →
React re-render → Canvas re-render → Visual feedback
```

## Directory Structure (Target)

Belum semua ada — akan dibuat sambil implement per module.

```
ainy-keramik-visualizer/
├── .claude/CLAUDE.md              # Session instructions
├── src/
│   ├── app/                       # Next.js App Router routes
│   │   ├── layout.js              # Root layout
│   │   ├── page.js                # Home (selection)
│   │   ├── dimension/page.js
│   │   ├── design/page.js
│   │   └── preview/page.js
│   ├── components/                # Shared UI (Button, Input, dll)
│   ├── modules/                   # Feature modules (per Section 13.5)
│   │   ├── auth/
│   │   ├── selection/
│   │   ├── dimension/
│   │   ├── trim/
│   │   ├── catalog/
│   │   ├── design-canvas/         # Konva-based, client-only
│   │   └── export/
│   ├── stores/                    # Zustand stores
│   │   └── design-store.js
│   └── lib/                       # Utilities
│       ├── math/                  # Tile pattern, perspective
│       ├── data/                  # JSON loaders
│       └── utils/
├── data/                          # Static JSON (V1)
│   ├── products.json
│   ├── trims.json
│   └── nat-colors.json
├── public/
│   ├── textures/                  # Tile texture images
│   ├── thumbnails/                # Product thumbnails
│   └── trims/                     # Trim images
├── docs/
│   ├── ARCHITECTURE.md            # (dokumen ini)
│   ├── DOMAIN.md                  # Tile domain knowledge
│   └── adr/                       # Architecture Decision Records
├── PROJECT_STATUS.md              # Living project state
├── NEXT_SESSION.md                # Next Sunday plan
└── package.json
```

## Key Architectural Decisions

- **Client-heavy app**: Business logic + rendering di browser, Vercel hanya serve static + middleware
- **No database V1**: JSON file cukup untuk catalog < 200 produk. Upgrade path: Vercel KV atau Turso
- **JavaScript, bukan TypeScript**: Junior-dev friendly, migrate TS di V2 kalau perlu
- **Konva vs Fabric vs Plain Canvas**: Konva dipilih karena React binding stabil + drag-drop built-in (lihat ADR-001)
- **Zustand vs Redux vs Context**: Zustand dipilih karena minimal boilerplate (lihat ADR-001)

## Konva SSR Constraint

`react-konva` requires browser (window, canvas element). Next.js App Router default SSR akan crash.

**Pattern wajib:**

```javascript
// src/modules/design-canvas/index.js
'use client'
import dynamic from 'next/dynamic'

export const DesignCanvas = dynamic(
  () => import('./DesignCanvasClient'),
  { ssr: false, loading: () => <div>Loading canvas...</div> }
)
```

Component actual (`DesignCanvasClient.js`) baru boleh import `react-konva`.

## Performance Targets

- Initial load: < 3 detik di 4G
- Canvas render 60fps
- Bundle size: < 500KB gzipped (post-tree-shake)
- Konva stage redraw: throttled saat drag, immediate saat drop
