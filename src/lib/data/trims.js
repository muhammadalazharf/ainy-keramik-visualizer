import trimsData from "../../../data/trims.json";

export function getAllTrims() {
  return trimsData;
}

export function getTrimsForSurface(surface) {
  if (!surface) return trimsData;
  return trimsData.filter((t) => t.for_surface.includes(surface));
}

export function getTrimById(id) {
  return trimsData.find((t) => t.id === id) ?? null;
}

export function estimateTrimCost({ trim, dimensions }) {
  if (!trim || !dimensions.width_m || !dimensions.height_m) return null;
  const perimeter_m = 2 * (dimensions.width_m + dimensions.height_m);
  const price = perimeter_m * trim.price_per_meter;
  return {
    perimeter_m: Number(perimeter_m.toFixed(2)),
    totalPrice: Math.round(price),
  };
}
