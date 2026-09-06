import productsData from "../../../data/products.json";
import natColorsData from "../../../data/nat-colors.json";

export function getAllProducts() {
  return productsData;
}

export function getProductById(id) {
  return productsData.find((p) => p.id === id) ?? null;
}

export function filterProducts({ surface, tag, query } = {}) {
  let list = productsData;
  if (surface && surface !== "all") {
    list = list.filter((p) =>
      p.surface_type?.includes(surface) || p.category === surface,
    );
  }
  if (tag && tag !== "all") {
    list = list.filter((p) => p.tags?.includes(tag));
  }
  if (query) {
    const q = query.toLowerCase();
    list = list.filter((p) => {
      const hay = `${p.brand} ${p.name} ${p.size_cm.width}x${p.size_cm.height} ${p.tags?.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }
  return list;
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
