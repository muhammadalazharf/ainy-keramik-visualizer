import productsData from "../../../data/products.json";
import natColorsData from "../../../data/nat-colors.json";

export function getAllProducts() {
  return productsData;
}

export function getProductById(id) {
  return productsData.find((p) => p.id === id) ?? null;
}

export function getAllNatColors() {
  return natColorsData;
}

export function getNatColorById(id) {
  return natColorsData.find((c) => c.id === id) ?? null;
}

export function getNatHexById(id) {
  return getNatColorById(id)?.hex ?? "#F5F5F5";
}
