"use client";

import { useMemo } from "react";
import { useDesignStore } from "@/stores/design-store";
import { getAllTrims } from "@/lib/data/trims";

export default function LisbonCatalog() {
  const query = useDesignStore((s) => s.lisbonQuery);
  const setQuery = useDesignStore((s) => s.setLisbonQuery);
  const selectedLisbonId = useDesignStore((s) => s.selectedLisbonId);
  const setSelectedLisbon = useDesignStore((s) => s.setSelectedLisbon);

  const items = useMemo(() => {
    const all = getAllTrims();
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter((t) =>
      `${t.brand} ${t.name} ${t.size_cm?.width}x${t.size_cm?.height}`.toLowerCase().includes(q),
    );
  }, [query]);

  const currency = new Intl.NumberFormat("id-ID");

  return (
    <section className="card p-4 flex flex-col gap-3">
      <h2 className="text-2xl font-bold">Lisbon Catalog</h2>

      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari Lisbon motif, brand, ukuran..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-cream-dark text-sm"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">🔍</span>
      </div>

      <button
        type="button"
        onClick={() => setSelectedLisbon(null)}
        className={`flex items-center gap-3 p-2 rounded-lg border transition text-left ${
          !selectedLisbonId
            ? "border-ink bg-ink/5"
            : "border-border hover:border-ink-soft"
        }`}
      >
        <div className="w-14 h-14 rounded-md border border-dashed border-border bg-cream-dark flex items-center justify-center text-xs text-muted">
          none
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Tanpa Lisbon</p>
          <p className="text-xs text-muted">Tidak pakai border ulir</p>
        </div>
      </button>

      <ul className="flex flex-col gap-2">
        {items.map((t) => {
          const active = t.id === selectedLisbonId;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setSelectedLisbon(t.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg border transition text-left ${
                  active
                    ? "border-ink bg-ink/5"
                    : "border-border hover:border-ink-soft"
                }`}
              >
                <div
                  className="w-14 h-14 rounded-md border border-border flex-shrink-0"
                  style={{ backgroundColor: t.hex }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.name}</p>
                  <p className="text-xs text-muted truncate">
                    {t.size_cm.width}×{t.size_cm.height} cm · {t.brand}
                  </p>
                  <p className="text-xs text-muted truncate">
                    Rp {currency.format(t.price_per_meter)}/m
                  </p>
                </div>
                <span
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-sm flex-shrink-0 ${
                    active ? "bg-ink text-cream border-ink" : "border-border text-muted"
                  }`}
                  aria-hidden="true"
                >
                  {active ? "✓" : "+"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
