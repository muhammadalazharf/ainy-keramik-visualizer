import { create } from "zustand";

const DEFAULT_FLOOR_TILE = "travertine-stone-60x60";

const initialState = {
  currentRoomId: null,
  currentTemplateId: "modern",
  surface: "wall",
  dimensions: { width_m: null, height_m: null },

  selectedTiles: {
    wall: null,
    floor: DEFAULT_FLOOR_TILE,
  },
  selectedLisbonId: null,

  pattern: "straight",
  natWidth_mm: 3,
  natColor: "putih",

  catalogTab: "all",
  catalogQuery: "",
  lisbonQuery: "",
};

export const useDesignStore = create((set) => ({
  ...initialState,

  setRoom: (roomId, defaults = {}) =>
    set((state) => ({
      currentRoomId: roomId,
      surface: defaults.surface ?? state.surface,
      dimensions: defaults.dimensions ?? state.dimensions,
    })),

  setTemplate: (id) => set({ currentTemplateId: id }),
  setSurface: (surface) => set({ surface }),

  setDimensions: (width_m, height_m) =>
    set({
      dimensions: {
        width_m: Number(width_m),
        height_m: Number(height_m),
      },
    }),

  setSurfaceTile: (surfaceKey, tileId) =>
    set((state) => ({
      selectedTiles: {
        ...state.selectedTiles,
        [surfaceKey]: tileId,
      },
    })),

  applyTileToCurrentSurface: (tileId) =>
    set((state) => ({
      selectedTiles: {
        ...state.selectedTiles,
        [state.surface]: tileId,
      },
    })),

  clearSurfaceTile: (surfaceKey) =>
    set((state) => ({
      selectedTiles: {
        ...state.selectedTiles,
        [surfaceKey]: null,
      },
    })),

  setSelectedLisbon: (id) => set({ selectedLisbonId: id }),

  setPattern: (pattern) => set({ pattern }),
  setNatWidth: (mm) => set({ natWidth_mm: Number(mm) }),
  setNatColor: (color) => set({ natColor: color }),

  setCatalogTab: (tab) => set({ catalogTab: tab }),
  setCatalogQuery: (query) => set({ catalogQuery: query }),
  setLisbonQuery: (query) => set({ lisbonQuery: query }),

  reset: () => set(initialState),
}));
