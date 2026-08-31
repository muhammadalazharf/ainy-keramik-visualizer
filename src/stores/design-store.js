import { create } from "zustand";

const initialState = {
  surface: null,
  dimensions: {
    width_m: null,
    height_m: null,
  },
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

  reset: () => set(initialState),
}));
