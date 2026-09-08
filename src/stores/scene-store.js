/**
 * Scene Store — the new source of truth for the 3D scene as of STEP 2.
 *
 * Shape:
 *   {
 *     roomId,             // string | null   ← "kamar-mandi" | "kamar-tidur" | ...
 *     templateId,         // string           ← "modern" | "classic" | ...
 *     dimensions: {
 *       widthM,            // number           ← room width (X)
 *       depthM,            // number           ← room depth (Z)
 *       ceilingM,          // number           ← comes from template.ceilingHeight_m
 *     },
 *     surfaces: {
 *       [SURFACE_ID.FLOOR]:      SurfaceState,
 *       [SURFACE_ID.WALL_BACK]:  SurfaceState,
 *       [SURFACE_ID.WALL_LEFT]:  SurfaceState,
 *       [SURFACE_ID.WALL_RIGHT]: SurfaceState,
 *       [SURFACE_ID.CEILING]:    SurfaceState,
 *     },
 *     furniture: FurnitureInstance[],   // reserved for STEP 14
 *     selection: {
 *       hoverSurfaceId: SurfaceId | null,
 *       activeSurfaceId: SurfaceId | null,
 *       activeFurnitureId: string | null,
 *     },
 *   }
 *
 * SurfaceState (per surface):
 *   {
 *     tileId,             // string | null   ← product id assigned to this surface, null = plain
 *     pattern,            // string           ← "straight" | ... (STEP 9+ math)
 *     groutMm,            // number           ← grout gap width in mm
 *     groutColorId,       // string           ← nat color id from data/nat-colors.json
 *     orientation,        // number           ← degrees, 0 default (STEP 9+ pattern uses it)
 *   }
 *
 * Design principles:
 *   1. Scene store is INDEPENDENT of the old design-store; no auto-sync. Callers
 *      that need to migrate legacy state must invoke `hydrateFromLegacy()`.
 *   2. Every mutation is action-only (no direct state assignment from consumers).
 *   3. Actions accept surfaceId as first argument for uniform ergonomics
 *      (matches SurfaceRegistry vocabulary).
 *   4. Unknown surfaceIds are rejected with a thrown error so bugs surface loud.
 *
 * NOT in scope for STEP 2:
 *   - Actually wiring Scene3D to read from this store (STEP 5+).
 *   - Rewriting UI components to write into this store (STEP 15).
 *   - Furniture add/move/delete actions beyond the placeholder array (STEP 14).
 */

import { create } from "zustand";
import { SURFACE_ID, isKnownSurfaceId } from "@/modules/engine-3d/SurfaceRegistry";

export const DEFAULT_PATTERN = "straight";
export const DEFAULT_GROUT_MM = 3;
export const DEFAULT_GROUT_COLOR_ID = "putih";

function makeInitialSurfaceState(overrides = {}) {
  return {
    tileId: null,
    pattern: DEFAULT_PATTERN,
    groutMm: DEFAULT_GROUT_MM,
    groutColorId: DEFAULT_GROUT_COLOR_ID,
    orientation: 0,
    ...overrides,
  };
}

function makeInitialSurfaces() {
  return {
    [SURFACE_ID.FLOOR]:      makeInitialSurfaceState(),
    [SURFACE_ID.WALL_BACK]:  makeInitialSurfaceState(),
    [SURFACE_ID.WALL_LEFT]:  makeInitialSurfaceState(),
    [SURFACE_ID.WALL_RIGHT]: makeInitialSurfaceState(),
    [SURFACE_ID.CEILING]:    makeInitialSurfaceState(),
  };
}

const initialState = {
  roomId: null,
  templateId: "modern",
  dimensions: { widthM: null, depthM: null, ceilingM: null },
  surfaces: makeInitialSurfaces(),
  furniture: [],
  selection: {
    hoverSurfaceId: null,
    activeSurfaceId: null,
    activeFurnitureId: null,
  },
};

function requireSurfaceId(id, actionName) {
  if (!isKnownSurfaceId(id)) {
    throw new Error(
      `scene-store: ${actionName}() called with unknown surfaceId "${id}". ` +
        `Expected one of ${Object.values(SURFACE_ID).join(", ")}.`,
    );
  }
}

export const useSceneStore = create((set, get) => ({
  ...initialState,

  // -------- Room / Template / Dimensions --------

  setRoom(roomId) {
    set({ roomId });
  },

  setTemplate(templateId) {
    set({ templateId });
  },

  setDimensions({ widthM, depthM, ceilingM }) {
    set((state) => ({
      dimensions: {
        widthM: widthM ?? state.dimensions.widthM,
        depthM: depthM ?? state.dimensions.depthM,
        ceilingM: ceilingM ?? state.dimensions.ceilingM,
      },
    }));
  },

  // -------- Per-Surface --------

  setSurfaceTile(surfaceId, tileId) {
    requireSurfaceId(surfaceId, "setSurfaceTile");
    set((state) => ({
      surfaces: {
        ...state.surfaces,
        [surfaceId]: { ...state.surfaces[surfaceId], tileId: tileId ?? null },
      },
    }));
  },

  setSurfacePattern(surfaceId, pattern) {
    requireSurfaceId(surfaceId, "setSurfacePattern");
    set((state) => ({
      surfaces: {
        ...state.surfaces,
        [surfaceId]: { ...state.surfaces[surfaceId], pattern },
      },
    }));
  },

  setSurfaceGrout(surfaceId, { widthMm, colorId }) {
    requireSurfaceId(surfaceId, "setSurfaceGrout");
    set((state) => {
      const current = state.surfaces[surfaceId];
      return {
        surfaces: {
          ...state.surfaces,
          [surfaceId]: {
            ...current,
            groutMm: widthMm ?? current.groutMm,
            groutColorId: colorId ?? current.groutColorId,
          },
        },
      };
    });
  },

  setSurfaceOrientation(surfaceId, orientationDeg) {
    requireSurfaceId(surfaceId, "setSurfaceOrientation");
    set((state) => ({
      surfaces: {
        ...state.surfaces,
        [surfaceId]: {
          ...state.surfaces[surfaceId],
          orientation: Number(orientationDeg) || 0,
        },
      },
    }));
  },

  clearSurface(surfaceId) {
    requireSurfaceId(surfaceId, "clearSurface");
    set((state) => ({
      surfaces: {
        ...state.surfaces,
        [surfaceId]: makeInitialSurfaceState(),
      },
    }));
  },

  // -------- Selection / Hover --------

  setHoverSurface(surfaceId) {
    if (surfaceId !== null && !isKnownSurfaceId(surfaceId)) {
      throw new Error(
        `scene-store: setHoverSurface() called with unknown surfaceId "${surfaceId}".`,
      );
    }
    set((state) => ({
      selection: { ...state.selection, hoverSurfaceId: surfaceId },
    }));
  },

  setActiveSurface(surfaceId) {
    if (surfaceId !== null && !isKnownSurfaceId(surfaceId)) {
      throw new Error(
        `scene-store: setActiveSurface() called with unknown surfaceId "${surfaceId}".`,
      );
    }
    set((state) => ({
      selection: { ...state.selection, activeSurfaceId: surfaceId },
    }));
  },

  clearSelection() {
    set((state) => ({
      selection: {
        ...state.selection,
        hoverSurfaceId: null,
        activeSurfaceId: null,
      },
    }));
  },

  // -------- Furniture (placeholder — real API arrives in STEP 14) --------

  addFurniture(instance) {
    set((state) => ({ furniture: [...state.furniture, instance] }));
  },

  removeFurniture(id) {
    set((state) => ({
      furniture: state.furniture.filter((f) => f.id !== id),
    }));
  },

  // -------- Bulk / migration helpers --------

  /**
   * One-shot conversion from the legacy design-store shape into scene-store.
   * Intentionally NOT auto-invoked — callers (e.g. RoomVisualizer bootstrap in
   * a later step) opt in when they migrate.
   *
   * Legacy shape assumptions:
   *   {
   *     currentRoomId, currentTemplateId,
   *     dimensions: { width_m, height_m },
   *     selectedTiles: { floor, wall },
   *     natWidth_mm, natColor,
   *     pattern,
   *   }
   *
   * We spread the legacy `selectedTiles.wall` across all 3 wall surfaces so
   * the initial impression matches what the user was seeing before migration.
   * The ceiling stays untiled.
   */
  hydrateFromLegacy(legacy, { ceilingM } = {}) {
    if (!legacy) return;
    const legacyWall = legacy.selectedTiles?.wall ?? null;
    const legacyFloor = legacy.selectedTiles?.floor ?? null;
    const surfaceDefaults = {
      pattern: legacy.pattern ?? DEFAULT_PATTERN,
      groutMm: legacy.natWidth_mm ?? DEFAULT_GROUT_MM,
      groutColorId: legacy.natColor ?? DEFAULT_GROUT_COLOR_ID,
      orientation: 0,
    };
    set(() => ({
      roomId: legacy.currentRoomId ?? null,
      templateId: legacy.currentTemplateId ?? "modern",
      dimensions: {
        widthM: legacy.dimensions?.width_m ?? null,
        depthM: legacy.dimensions?.height_m ?? null,
        ceilingM: ceilingM ?? null,
      },
      surfaces: {
        [SURFACE_ID.FLOOR]:      { tileId: legacyFloor, ...surfaceDefaults },
        [SURFACE_ID.WALL_BACK]:  { tileId: legacyWall,  ...surfaceDefaults },
        [SURFACE_ID.WALL_LEFT]:  { tileId: legacyWall,  ...surfaceDefaults },
        [SURFACE_ID.WALL_RIGHT]: { tileId: legacyWall,  ...surfaceDefaults },
        [SURFACE_ID.CEILING]:    makeInitialSurfaceState(),
      },
    }));
  },

  reset() {
    set({
      ...initialState,
      surfaces: makeInitialSurfaces(),
    });
  },
}));

/**
 * Selector helpers (pure functions, not part of the store) — importable by
 * consumers so they don't have to remember the state shape.
 */
export function selectSurface(state, surfaceId) {
  return state.surfaces?.[surfaceId] ?? null;
}

export function selectTiledSurfaceIds(state) {
  return Object.entries(state.surfaces ?? {})
    .filter(([, s]) => s?.tileId)
    .map(([id]) => id);
}

export function selectSurfaceCount(state) {
  return Object.keys(state.surfaces ?? {}).length;
}
