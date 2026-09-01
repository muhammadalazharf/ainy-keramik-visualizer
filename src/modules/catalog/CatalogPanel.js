"use client";

import { useMemo } from "react";
import { useDesignStore } from "@/stores/design-store";
import { getAllProducts, getProductById, getAllNatColors } from "@/lib/data/products";
import { calculateStraightPattern, estimateNeeded } from "@/lib/math/tile-pattern";

const NAT_WIDTH_OPTIONS = [2, 3, 5, 8];
const currency = new Intl.NumberFormat("id-ID");

export default function CatalogPanel() {
  const dimensions = useDesignStore((s) => s.dimensions);
  const selectedTileId = useDesignStore((s) => s.selectedTileId);
  const natWidth_mm = useDesignStore((s) => s.natWidth_mm);
  const natColor = useDesignStore((s) => s.natColor);
  const setSelectedTile = useDesignStore((s) => s.setSelectedTile);
  const setNatWidth = useDesignStore((s) => s.setNatWidth);
  const setNatColor = useDesignStore((s) => s.setNatColor);

  const surface = useDesignStore((s) => s.surface);

  const products = useMemo(() => {
    const all = getAllProducts();
    if (!surface) return all;
    if (surface === "wall") {
      return all.filter((p) => p.category === "wall" || p.category === "granite");
    }
    return all.filter((p) => p.category === "floor" || p.category === "granite");
  }, [surface]);

  const natColors = getAllNatColors();
  const currentProduct = getProductById(selectedTileId);

  const estimate = useMemo(() => {
    if (!currentProduct || !dimensions.width_m || !dimensions.height_m) return null;
    const pattern = calculateStraightPattern({
      area: dimensions,
      tile: {
        width_cm: currentProduct.size_cm.width,
        height_cm: currentProduct.size_cm.height,
      },
      natWidth_mm,
    });
    const { dusNeeded, tilesWithWaste } = estimateNeeded({
      totalTiles: pattern.totalFull,
      piecesPerDus: currentProduct.pieces_per_dus,
      wasteFactor: 0.05,
    });
    return {
      fullTiles: pattern.totalFull,
      tilesWithWaste,
      dusNeeded,
      totalPrice: dusNeeded * currentProduct.price_per_dus,
    };
  }, [currentProduct, dimensions, natWidth_mm]);

  return (
    <aside className="rounded-2xl border-2 border-current/20 p-4 flex flex-col gap-5 max-h-full overflow-y-auto">
      {estimate && currentProduct && (
        <section className="flex flex-col gap-2 pb-4 border-b border-current/10">
          <h3 className="text-lg font-bold">Estimasi Kebutuhan</h3>
          <dl className="text-sm grid grid-cols-2 gap-x-3 gap-y-1">
            <dt className="opacity-70">Full tile</dt>
            <dd className="text-right font-medium">{estimate.fullTiles} pcs</dd>
            <dt className="opacity-70">+ Waste 5%</dt>
            <dd className="text-right font-medium">{estimate.tilesWithWaste} pcs</dd>
            <dt className="opacity-70">Dus</dt>
            <dd className="text-right font-medium">{estimate.dusNeeded} dus</dd>
            <dt className="opacity-70 pt-1">Total</dt>
            <dd className="text-right font-bold pt-1">
              Rp {currency.format(estimate.totalPrice)}
            </dd>
          </dl>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-bold">Katalog Keramik</h3>
        <div className="flex flex-col gap-2">
          {products.map((p) => {
            const active = p.id === selectedTileId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedTile(p.id)}
                className={`text-left rounded-lg border-2 p-3 transition ${
                  active
                    ? "border-slate-900 bg-slate-900/5 dark:border-slate-100 dark:bg-slate-100/10"
                    : "border-current/20 hover:border-current/50"
                }`}
              >
                <div className="text-sm font-semibold">
                  {p.brand} {p.name}
                </div>
                <div className="text-xs opacity-70 mt-0.5">
                  {p.size_cm.width}×{p.size_cm.height} cm · {p.pieces_per_dus} pcs/dus
                </div>
                <div className="text-xs opacity-70 mt-0.5">
                  Rp {currency.format(p.price_per_dus)}/dus
                </div>
              </button>
            );
          })}
          {products.length === 0 && (
            <p className="text-sm opacity-70">
              Belum ada produk cocok untuk {surface}.
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-bold">Nat (Grout)</h3>
        <div className="flex flex-col gap-2">
          <div>
            <label className="text-sm font-medium">Lebar</label>
            <div className="flex gap-2 mt-1">
              {NAT_WIDTH_OPTIONS.map((mm) => {
                const active = mm === natWidth_mm;
                return (
                  <button
                    key={mm}
                    type="button"
                    onClick={() => setNatWidth(mm)}
                    className={`flex-1 min-h-10 px-2 py-1 rounded-lg border-2 text-sm font-medium transition ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                        : "border-current/30 hover:border-current/60"
                    }`}
                  >
                    {mm}mm
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Warna</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {natColors.map((c) => {
                const active = c.id === natColor;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setNatColor(c.id)}
                    title={c.name}
                    aria-label={c.name}
                    className={`w-10 h-10 rounded-full border-2 transition ${
                      active
                        ? "border-slate-900 dark:border-slate-100 scale-110"
                        : "border-current/30 hover:border-current/60"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}
