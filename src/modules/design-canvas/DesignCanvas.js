"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import { useDesignStore } from "@/stores/design-store";
import { getProductById, getNatHexById } from "@/lib/data/products";
import { calculateStraightPattern } from "@/lib/math/tile-pattern";

const PADDING = 40;

const TAG_COLOR = {
  cream: "#f5e8d0",
  beige: "#e8d5b0",
  red: "#c8825a",
  grey: "#a0a0a0",
  black: "#3a3a3a",
  white: "#f8f5f0",
  brown: "#8b6b4a",
};

function tileFillFromProduct(product) {
  if (!product) return "#e8d5b0";
  const matchedTag = product.tags?.find((t) => TAG_COLOR[t]);
  return TAG_COLOR[matchedTag] ?? "#e8d5b0";
}

export default function DesignCanvas() {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const dimensions = useDesignStore((s) => s.dimensions);
  const selectedTileId = useDesignStore((s) => s.selectedTileId);
  const natWidth_mm = useDesignStore((s) => s.natWidth_mm);
  const natColor = useDesignStore((s) => s.natColor);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let raf = 0;
    const measure = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);
        setSize((prev) =>
          prev.width === w && prev.height === h ? prev : { width: w, height: h },
        );
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const product = getProductById(selectedTileId);
  const { width_m, height_m } = dimensions;
  const ready =
    width_m && height_m && size.width > 0 && size.height > 0 && product;

  const pattern = useMemo(() => {
    if (!ready) return null;
    return calculateStraightPattern({
      area: { width_m, height_m },
      tile: {
        width_cm: product.size_cm.width,
        height_cm: product.size_cm.height,
      },
      natWidth_mm,
    });
  }, [ready, width_m, height_m, product, natWidth_mm]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] rounded-2xl border-2 border-current/20 overflow-hidden bg-white dark:bg-slate-900"
    >
      {ready && pattern && (
        <CanvasStage
          size={size}
          pattern={pattern}
          product={product}
          natColorHex={getNatHexById(natColor)}
          widthLabel={`${width_m} m`}
          heightLabel={`${height_m} m`}
        />
      )}
    </div>
  );
}

function CanvasStage({ size, pattern, product, natColorHex, widthLabel, heightLabel }) {
  const scale = Math.min(
    (size.width - 2 * PADDING) / pattern.areaWidth_mm,
    (size.height - 2 * PADDING) / pattern.areaHeight_mm,
  );
  const areaWidthPx = pattern.areaWidth_mm * scale;
  const areaHeightPx = pattern.areaHeight_mm * scale;
  const originX = (size.width - areaWidthPx) / 2;
  const originY = (size.height - areaHeightPx) / 2;
  const fillColor = tileFillFromProduct(product);

  return (
    <Stage width={size.width} height={size.height}>
      <Layer>
        <Rect
          x={originX}
          y={originY}
          width={areaWidthPx}
          height={areaHeightPx}
          fill={natColorHex}
          stroke="#334155"
          strokeWidth={2}
        />
        {pattern.tiles.map((t, i) => (
          <Rect
            key={i}
            x={originX + t.x_mm * scale}
            y={originY + t.y_mm * scale}
            width={t.width_mm * scale}
            height={t.height_mm * scale}
            fill={fillColor}
            stroke="rgba(15,23,42,0.15)"
            strokeWidth={0.5}
            perfectDrawEnabled={false}
          />
        ))}
        <Text
          x={originX}
          y={originY + areaHeightPx + 8}
          width={areaWidthPx}
          text={widthLabel}
          fontSize={14}
          fill="#334155"
          align="center"
        />
        <Text
          x={originX - 60}
          y={originY + areaHeightPx / 2 - 8}
          width={50}
          text={heightLabel}
          fontSize={14}
          fill="#334155"
          align="right"
        />
      </Layer>
    </Stage>
  );
}
