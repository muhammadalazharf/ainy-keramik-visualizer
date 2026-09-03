import { create } from "zustand";

const DEFAULT_TILE_ID = "roman-crema-marfil-60x60";

const initialState = {
  surface: null,
  dimensions: {
    width_m: null,
    height_m: null,
  },
  selectedTileId: DEFAULT_TILE_ID,
  natWidth_mm: 3,
  natColor: "white",
  selectedTrimId: null,
};

export const useDesignStore = create((set) => ({
  ...initialState,

  setSurface: (surface) => set({ surface }),

  setDimensions: (width_m, height_m) =>
    set({
      dimensions: {
        width_m: Number(width_m),
        height_m: Number(height_m),
      },
    }),

  setSelectedTile: (id) => set({ selectedTileId: id }),

  setNatWidth: (mm) => set({ natWidth_mm: Number(mm) }),

  setNatColor: (color) => set({ natColor: color }),

  setSelectedTrim: (id) => set({ selectedTrimId: id }),

  reset: () => set(initialState),
}));
