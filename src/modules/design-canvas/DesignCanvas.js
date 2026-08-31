"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Line } from "react-konva";
import { useDesignStore } from "@/stores/design-store";

const PADDING = 40;
const GRID_STEP_M = 0.5;

export default function DesignCanvas() {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const surface = useDesignStore((state) => state.surface);
  const dimensions = useDesignStore((state) => state.dimensions);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width_m, height_m } = dimensions;
  const ready = width_m && height_m && size.width > 0 && size.height > 0;

  let scale = 0;
  let areaWidth = 0;
  let areaHeight = 0;
  let originX = 0;
  let originY = 0;
  let gridLines = [];

  if (ready) {
    scale = Math.min(
      (size.width - 2 * PADDING) / width_m,
      (size.height - 2 * PADDING) / height_m,
    );
    areaWidth = width_m * scale;
    areaHeight = height_m * scale;
    originX = (size.width - areaWidth) / 2;
    originY = (size.height - areaHeight) / 2;

    const gridStepPx = GRID_STEP_M * scale;
    for (let x = gridStepPx; x < areaWidth; x += gridStepPx) {
      gridLines.push({
        points: [originX + x, originY, originX + x, originY + areaHeight],
      });
    }
    for (let y = gridStepPx; y < areaHeight; y += gridStepPx) {
      gridLines.push({
        points: [originX, originY + y, originX + areaWidth, originY + y],
      });
    }
  }

  const fillColor = surface === "floor" ? "#e8dfc9" : "#f0e7d4";

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] rounded-2xl border-2 border-current/20 overflow-hidden bg-white dark:bg-slate-900"
    >
      {ready && (
        <Stage width={size.width} height={size.height}>
          <Layer>
            <Rect
              x={originX}
              y={originY}
              width={areaWidth}
              height={areaHeight}
              fill={fillColor}
              stroke="#334155"
              strokeWidth={2}
            />
            {gridLines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke="#94a3b8"
                strokeWidth={0.5}
                dash={[4, 4]}
              />
            ))}
            <Text
              x={originX}
              y={originY + areaHeight + 8}
              width={areaWidth}
              text={`${width_m} m`}
              fontSize={14}
              fill="#334155"
              align="center"
            />
            <Text
              x={originX - 60}
              y={originY + areaHeight / 2 - 8}
              width={50}
              text={`${height_m} m`}
              fontSize={14}
              fill="#334155"
              align="right"
            />
            <Text
              x={originX + areaWidth / 2 - 100}
              y={originY + areaHeight / 2 - 30}
              width={200}
              text={`${(width_m * height_m).toFixed(2)} m²`}
              fontSize={20}
              fontStyle="bold"
              fill="#0f172a"
              align="center"
            />
            <Text
              x={originX + areaWidth / 2 - 100}
              y={originY + areaHeight / 2 + 4}
              width={200}
              text="area kosong · drag keramik ke sini"
              fontSize={12}
              fill="#64748b"
              align="center"
            />
          </Layer>
        </Stage>
      )}
    </div>
  );
}
