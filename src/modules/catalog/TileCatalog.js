"use client";

import { useMemo } from "react";
import { useDesignStore } from "@/stores/design-store";
import { filterProducts } from "@/lib/data/products";

const TABS = [
  { id: "all", label: "Semua" },
  { id: "floor", label: "Lantai" },
  { id: "wall", label: "Dinding" },
  { id: "premium", label: "Premium" },
];

export default function TileCatalog() {
  const catalogTab = useDesignStore((s) => s.catalogTab);
  const catalogQuery = useDesignStore((s) => s.catalogQuery);
  const selectedTiles = useDesignStore((s) => s.selectedTiles);
  const surface = useDesignStore((s) => s.surface);
  const setCatalogTab = useDesignStore((s) => s.setCatalogTab);
  const setCatalogQuery = useDesignStore((s) => s.setCatalogQuery);
  const applyTileToCurrentSurface = useDesignStore(
    (s) => s.applyTileToCurrentSurface,
  );

  const products = useMemo(
    () =>
      filterProducts({
        surface: catalogTab === "premium" ? "all" : catalogTab,
        tag: catalogTab === "premium" ? "premium" : "all",
        query: catalogQuery,
      }),
    [catalogTab, catalogQuery],
  );

  return (
    <section className="card p-4 flex flex-col gap-3">
      <div>
        <h2 className="text-2xl font-bold">Tile Catalog</h2>
        <p className="text-xs text-muted mt-0.5">
          Klik untuk aplikasi ke {surface === "wall" ? "Dinding" : "Lantai"} · atau drag ke slot
        </p>
      </div>

      <div className="relative">
        <input
          type="search"
          value={catalogQuery}
          onChange={(e) => setCatalogQuery(e.target.value)}
          placeholder="Cari motif, brand, ukuran..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-cream-dark text-sm"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">🔍</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCatalogTab(tab.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
              catalogTab === tab.id
                ? "bg-ink text-cream border-ink"
                : "bg-transparent text-ink-soft border-border hover:border-ink-soft"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2 min-h-[80px]">
        {products.length === 0 && (
          <li className="text-sm text-muted text-center py-6">
            Tidak ada tile cocok.
          </li>
        )}
        {products.map((p) => (
          <TileCard
            key={p.id}
            product={p}
            activeWall={p.id === selectedTiles.wall}
            activeFloor={p.id === selectedTiles.floor}
            onClick={() => applyTileToCurrentSurface(p.id)}
          />
        ))}
      </ul>
    </section>
  );
}

function TileCard({ product, activeWall, activeFloor, onClick }) {
  const anyActive = activeWall || activeFloor;

  return (
    <li>
      <button
        type="button"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "copy";
          e.dataTransfer.setData("application/x-tile-id", product.id);
          e.dataTransfer.setData("text/plain", product.id);
        }}
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-2 rounded-lg border transition text-left cursor-grab active:cursor-grabbing ${
          anyActive
            ? "border-ink bg-ink/5"
            : "border-border hover:border-ink-soft"
        }`}
      >
        <div
          className="w-14 h-14 rounded-md border border-border bg-cream-dark flex-shrink-0 overflow-hidden"
          style={{
            backgroundImage: `url(${product.thumbnail_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{product.name}</p>
          <p className="text-xs text-muted truncate">
            {product.size_cm.width}×{product.size_cm.height} cm · {product.brand}
          </p>
          {anyActive && (
            <div className="flex gap-1 mt-1">
              {activeWall && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand text-cream font-semibold">
                  Dinding
                </span>
              )}
              {activeFloor && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand text-cream font-semibold">
                  Lantai
                </span>
              )}
            </div>
          )}
        </div>
        <span className="text-lg text-muted flex-shrink-0" aria-hidden="true">
          ⋮⋮
        </span>
      </button>
    </li>
  );
}
