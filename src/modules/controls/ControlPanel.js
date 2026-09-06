"use client";

import { useMemo } from "react";
import { useDesignStore } from "@/stores/design-store";
import { getAllTemplates } from "@/lib/data/rooms";
import { getAllNatColors, getProductById } from "@/lib/data/products";
import { getTrimById } from "@/lib/data/trims";
import { calculateStraightPattern, estimateNeeded } from "@/lib/math/tile-pattern";

const PATTERNS = [
  { id: "straight",    label: "Straight (Lurus)" },
  { id: "herringbone", label: "Herringbone" },
  { id: "diagonal",    label: "Diagonal" },
  { id: "brick",       label: "Brick (Bata)" },
];

const currency = new Intl.NumberFormat("id-ID");

export default function ControlPanel({ room }) {
  const templates = getAllTemplates();
  const natColors = getAllNatColors();

  const currentTemplateId = useDesignStore((s) => s.currentTemplateId);
  const surface = useDesignStore((s) => s.surface);
  const dimensions = useDesignStore((s) => s.dimensions);
  const pattern = useDesignStore((s) => s.pattern);
  const natWidth_mm = useDesignStore((s) => s.natWidth_mm);
  const natColor = useDesignStore((s) => s.natColor);
  const selectedTileId = useDesignStore((s) => s.selectedTileId);
  const selectedLisbonId = useDesignStore((s) => s.selectedLisbonId);

  const setTemplate = useDesignStore((s) => s.setTemplate);
  const setSurface = useDesignStore((s) => s.setSurface);
  const setDimensions = useDesignStore((s) => s.setDimensions);
  const setPattern = useDesignStore((s) => s.setPattern);
  const setNatWidth = useDesignStore((s) => s.setNatWidth);
  const setNatColor = useDesignStore((s) => s.setNatColor);

  const currentProduct = getProductById(selectedTileId);
  const currentLisbon = getTrimById(selectedLisbonId);

  const estimate = useMemo(() => {
    if (!currentProduct || !dimensions.width_m || !dimensions.height_m) return null;
    const p = calculateStraightPattern({
      area: dimensions,
      tile: {
        width_cm: currentProduct.size_cm.width,
        height_cm: currentProduct.size_cm.height,
      },
      natWidth_mm,
    });
    const { dusNeeded, tilesWithWaste } = estimateNeeded({
      totalTiles: p.totalFull,
      piecesPerDus: currentProduct.pieces_per_dus,
      wasteFactor: pattern === "herringbone" ? 0.12 : pattern === "diagonal" ? 0.1 : 0.05,
    });
    const tilePrice = dusNeeded * currentProduct.price_per_dus;
    const lisbonPrice = currentLisbon
      ? Math.round(2 * (dimensions.width_m + dimensions.height_m) * currentLisbon.price_per_meter)
      : 0;
    return {
      fullTiles: p.totalFull,
      tilesWithWaste,
      dusNeeded,
      tilePrice,
      lisbonPrice,
      totalPrice: tilePrice + lisbonPrice,
    };
  }, [currentProduct, currentLisbon, dimensions, natWidth_mm, pattern]);

  return (
    <div className="card p-5 flex flex-col gap-6 sticky top-[80px]">
      <div>
        <h1 className="text-3xl font-bold">{room.name}</h1>
        <p className="text-sm text-ink-soft mt-1">{room.description}</p>
      </div>

      <ControlSection label="PILIH TEMPLATE RUANGAN">
        <select
          value={currentTemplateId}
          onChange={(e) => setTemplate(e.target.value)}
          className="w-full py-2.5 px-3 rounded-lg border border-border bg-cream-dark text-sm"
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </ControlSection>

      <ControlSection label="TARGET PERMUKAAN">
        <div className="grid grid-cols-2 gap-2">
          {["wall", "floor"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSurface(s)}
              className={`py-2.5 rounded-lg border font-semibold text-sm transition ${
                surface === s
                  ? "bg-ink text-cream border-ink"
                  : "bg-transparent text-ink-soft border-border hover:border-ink-soft"
              }`}
            >
              {s === "wall" ? "Dinding" : "Lantai"}
            </button>
          ))}
        </div>
      </ControlSection>

      <ControlSection label="UKURAN AREA (m)">
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="Lebar"
            value={dimensions.width_m ?? ""}
            onChange={(v) => setDimensions(v, dimensions.height_m ?? 0)}
          />
          <NumberInput
            label="Tinggi"
            value={dimensions.height_m ?? ""}
            onChange={(v) => setDimensions(dimensions.width_m ?? 0, v)}
          />
        </div>
      </ControlSection>

      <ControlSection label="POLA SUSUNAN">
        <div className="grid grid-cols-2 gap-2">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPattern(p.id)}
              className={`py-2 rounded-lg border text-xs font-semibold transition ${
                pattern === p.id
                  ? "bg-ink text-cream border-ink"
                  : "bg-transparent text-ink-soft border-border hover:border-ink-soft"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </ControlSection>

      <ControlSection label="UKURAN NAT (mm)">
        <input
          type="number"
          step="0.5"
          min="1"
          max="20"
          value={natWidth_mm}
          onChange={(e) => setNatWidth(e.target.value)}
          className="w-full py-2.5 px-3 rounded-lg border border-border bg-cream-dark text-sm"
        />
      </ControlSection>

      <ControlSection label="PILIHAN WARNA NAT">
        <div className="flex gap-3 flex-wrap">
          {natColors.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setNatColor(c.id)}
              title={c.name}
              aria-label={c.name}
              className={`flex flex-col items-center gap-1 transition ${
                natColor === c.id ? "scale-110" : "opacity-80"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-full border-2 ${
                  natColor === c.id ? "border-ink" : "border-border"
                }`}
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-[10px] text-ink-soft">{c.name}</span>
            </button>
          ))}
        </div>
      </ControlSection>

      {estimate && (
        <ControlSection label="ESTIMASI KEBUTUHAN">
          <dl className="text-sm grid grid-cols-2 gap-x-3 gap-y-1">
            <dt className="text-ink-soft">Tile ({estimate.fullTiles} pcs)</dt>
            <dd className="text-right font-medium">+{estimate.tilesWithWaste} waste</dd>
            <dt className="text-ink-soft">Dus</dt>
            <dd className="text-right font-medium">{estimate.dusNeeded} dus</dd>
            <dt className="text-ink-soft">Harga tile</dt>
            <dd className="text-right font-medium">
              Rp {currency.format(estimate.tilePrice)}
            </dd>
            {estimate.lisbonPrice > 0 && (
              <>
                <dt className="text-ink-soft">Lisbon</dt>
                <dd className="text-right font-medium">
                  Rp {currency.format(estimate.lisbonPrice)}
                </dd>
              </>
            )}
            <dt className="text-ink pt-2 font-bold">Total</dt>
            <dd className="text-right pt-2 font-bold text-brand">
              Rp {currency.format(estimate.totalPrice)}
            </dd>
          </dl>
        </ControlSection>
      )}

      <button type="button" className="btn-primary w-full justify-center">
        Ekspor Spesifikasi
        <span aria-hidden="true">⬇</span>
      </button>
    </div>
  );
}

function ControlSection({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="section-label">{label}</span>
      {children}
    </div>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <input
        type="number"
        step="0.1"
        min="0.5"
        max="15"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-2 px-3 rounded-lg border border-border bg-cream-dark text-sm"
      />
    </label>
  );
}
