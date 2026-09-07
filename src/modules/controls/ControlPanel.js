"use client";

import { useMemo } from "react";
import { useDesignStore } from "@/stores/design-store";
import { getAllTemplates } from "@/lib/data/rooms";
import { getAllNatColors, getProductById } from "@/lib/data/products";
import { getTrimById } from "@/lib/data/trims";
import { calculateStraightPattern, estimateNeeded } from "@/lib/math/tile-pattern";
import { getTemplateStyle } from "@/lib/data/room-styles";

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
  const selectedTiles = useDesignStore((s) => s.selectedTiles);
  const selectedLisbonId = useDesignStore((s) => s.selectedLisbonId);

  const setTemplate = useDesignStore((s) => s.setTemplate);
  const setSurface = useDesignStore((s) => s.setSurface);
  const setDimensions = useDesignStore((s) => s.setDimensions);
  const setSurfaceTile = useDesignStore((s) => s.setSurfaceTile);
  const clearSurfaceTile = useDesignStore((s) => s.clearSurfaceTile);
  const setPattern = useDesignStore((s) => s.setPattern);
  const setNatWidth = useDesignStore((s) => s.setNatWidth);
  const setNatColor = useDesignStore((s) => s.setNatColor);

  const wallProduct = getProductById(selectedTiles.wall);
  const floorProduct = getProductById(selectedTiles.floor);
  const currentLisbon = getTrimById(selectedLisbonId);
  const style = getTemplateStyle(currentTemplateId);

  const wasteFactor =
    pattern === "herringbone" ? 0.12 : pattern === "diagonal" ? 0.1 : 0.05;

  const estimate = useMemo(() => {
    if (!dimensions.width_m || !dimensions.height_m) return null;

    const patternCountFor = (product, targetArea) => {
      if (!product || !targetArea.width_m || !targetArea.height_m) return 0;
      const p = calculateStraightPattern({
        area: targetArea,
        tile: {
          width_cm: product.size_cm.width,
          height_cm: product.size_cm.height,
        },
        natWidth_mm,
      });
      return p.totalFull + p.totalPartial;
    };

    const wallEst = wallProduct
      ? (() => {
          const backCount = patternCountFor(wallProduct, {
            width_m: dimensions.width_m,
            height_m: style.ceilingHeight_m,
          });
          const sideCount = patternCountFor(wallProduct, {
            width_m: dimensions.height_m,
            height_m: style.ceilingHeight_m,
          });
          const totalTiles = backCount + 2 * sideCount;
          const { dusNeeded, tilesWithWaste } = estimateNeeded({
            totalTiles,
            piecesPerDus: wallProduct.pieces_per_dus,
            wasteFactor,
          });
          return {
            product: wallProduct,
            fullTiles: totalTiles,
            tilesWithWaste,
            dusNeeded,
            price: dusNeeded * wallProduct.price_per_dus,
          };
        })()
      : null;

    const floorEst = floorProduct
      ? (() => {
          const count = patternCountFor(floorProduct, dimensions);
          const { dusNeeded, tilesWithWaste } = estimateNeeded({
            totalTiles: count,
            piecesPerDus: floorProduct.pieces_per_dus,
            wasteFactor,
          });
          return {
            product: floorProduct,
            fullTiles: count,
            tilesWithWaste,
            dusNeeded,
            price: dusNeeded * floorProduct.price_per_dus,
          };
        })()
      : null;

    const perimeter_m = 2 * (dimensions.width_m + dimensions.height_m);
    const lisbonPrice = currentLisbon
      ? Math.round(perimeter_m * currentLisbon.price_per_meter)
      : 0;

    const total =
      (wallEst?.price ?? 0) + (floorEst?.price ?? 0) + lisbonPrice;

    return {
      wall: wallEst,
      floor: floorEst,
      lisbonPrice,
      perimeter_m,
      total,
    };
  }, [wallProduct, floorProduct, currentLisbon, dimensions, natWidth_mm, wasteFactor, style]);

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

      <ControlSection label="TILE PER PERMUKAAN">
        <p className="text-xs text-muted">
          Drag tile dari katalog kiri ke slot bawah, atau klik tile setelah pilih target di bawah.
        </p>
        <div className="grid grid-cols-1 gap-2 mt-2">
          <TileDropSlot
            surfaceKey="wall"
            label="Dinding"
            product={wallProduct}
            isActive={surface === "wall"}
            onSelect={() => setSurface("wall")}
            onDropTile={(id) => setSurfaceTile("wall", id)}
            onClear={() => clearSurfaceTile("wall")}
          />
          <TileDropSlot
            surfaceKey="floor"
            label="Lantai"
            product={floorProduct}
            isActive={surface === "floor"}
            onSelect={() => setSurface("floor")}
            onDropTile={(id) => setSurfaceTile("floor", id)}
            onClear={() => clearSurfaceTile("floor")}
          />
        </div>
      </ControlSection>

      <ControlSection label="UKURAN RUANGAN (m)">
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="Lebar"
            value={dimensions.width_m ?? ""}
            onChange={(v) => setDimensions(v, dimensions.height_m ?? 0)}
          />
          <NumberInput
            label="Panjang"
            value={dimensions.height_m ?? ""}
            onChange={(v) => setDimensions(dimensions.width_m ?? 0, v)}
          />
        </div>
        <p className="text-xs text-muted">
          Tinggi langit-langit otomatis dari template.
        </p>
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
            {estimate.wall && (
              <>
                <dt className="text-ink-soft">Dinding · {estimate.wall.product.name}</dt>
                <dd className="text-right font-medium">
                  {estimate.wall.dusNeeded} dus
                </dd>
                <dt className="text-muted text-xs">
                  ({estimate.wall.fullTiles} pcs + waste)
                </dt>
                <dd className="text-right text-xs">
                  Rp {currency.format(estimate.wall.price)}
                </dd>
              </>
            )}
            {estimate.floor && (
              <>
                <dt className="text-ink-soft">Lantai · {estimate.floor.product.name}</dt>
                <dd className="text-right font-medium">
                  {estimate.floor.dusNeeded} dus
                </dd>
                <dt className="text-muted text-xs">
                  ({estimate.floor.fullTiles} pcs + waste)
                </dt>
                <dd className="text-right text-xs">
                  Rp {currency.format(estimate.floor.price)}
                </dd>
              </>
            )}
            {estimate.lisbonPrice > 0 && (
              <>
                <dt className="text-ink-soft">
                  Lisbon ({estimate.perimeter_m.toFixed(1)} m)
                </dt>
                <dd className="text-right font-medium">
                  Rp {currency.format(estimate.lisbonPrice)}
                </dd>
              </>
            )}
            <dt className="text-ink pt-2 font-bold border-t border-border/50 mt-1">
              Total
            </dt>
            <dd className="text-right pt-2 font-bold text-brand border-t border-border/50 mt-1">
              Rp {currency.format(estimate.total)}
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

function TileDropSlot({ surfaceKey, label, product, isActive, onSelect, onDropTile, onClear }) {
  const handleDragOver = (e) => {
    if (e.dataTransfer.types.includes("application/x-tile-id")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("application/x-tile-id");
    if (id) onDropTile(id);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={onSelect}
      className={`p-3 rounded-lg border-2 transition cursor-pointer ${
        isActive ? "border-brand bg-brand/5" : "border-dashed border-border"
      }`}
    >
      <div className="flex items-center gap-3">
        {product ? (
          <div
            className="w-12 h-12 rounded-md border border-border flex-shrink-0 overflow-hidden"
            style={{
              backgroundImage: `url(${product.thumbnail_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden="true"
          />
        ) : (
          <div className="w-12 h-12 rounded-md border border-dashed border-border flex items-center justify-center text-xl text-muted">
            +
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs section-label">{label}</p>
          <p className="text-sm font-semibold truncate">
            {product ? product.name : "Kosong · drag/klik tile"}
          </p>
          {product && (
            <p className="text-xs text-muted truncate">
              {product.size_cm.width}×{product.size_cm.height} cm · {product.brand}
            </p>
          )}
        </div>
        {product && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            aria-label={`Kosongkan ${label}`}
            className="w-6 h-6 rounded-full bg-ink/10 hover:bg-ink/20 text-ink-soft text-xs font-bold flex items-center justify-center"
          >
            ×
          </button>
        )}
      </div>
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
