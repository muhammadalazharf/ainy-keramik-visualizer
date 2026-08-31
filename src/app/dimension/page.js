"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDesignStore } from "@/stores/design-store";

export default function DimensionPage() {
  const router = useRouter();
  const surface = useDesignStore((state) => state.surface);
  const dimensions = useDesignStore((state) => state.dimensions);
  const setDimensions = useDesignStore((state) => state.setDimensions);

  const [width, setWidth] = useState(dimensions.width_m ?? "");
  const [height, setHeight] = useState(dimensions.height_m ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!surface) {
      router.replace("/");
    }
  }, [surface, router]);

  if (!surface) return null;

  const surfaceLabel = surface === "floor" ? "Lantai" : "Dinding";

  const handleNext = () => {
    const w = Number(width);
    const h = Number(height);
    if (!w || !h || w <= 0 || h <= 0) {
      setError("Masukkan lebar dan tinggi lebih dari 0.");
      return;
    }
    if (w > 20 || h > 20) {
      setError("Ukuran maksimum 20 meter.");
      return;
    }
    setDimensions(w, h);
    router.push("/design");
  };

  return (
    <main className="flex-1 flex flex-col p-6">
      <nav className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="min-h-12 px-5 py-3 rounded-xl border-2 border-current text-lg font-medium hover:bg-current/5 active:scale-95 transition"
        >
          ← Kembali
        </Link>
        <span className="text-lg opacity-70">{surfaceLabel}</span>
      </nav>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl flex flex-col gap-8">
          <header className="text-center flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Ukuran {surfaceLabel}</h1>
            <p className="text-lg opacity-80">Masukkan ukuran dalam meter</p>
          </header>

          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-lg font-medium">Lebar (m)</span>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="20"
                inputMode="decimal"
                placeholder="Contoh: 3.5"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="min-h-14 px-4 py-3 text-xl rounded-xl border-2 border-current bg-transparent"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-lg font-medium">Tinggi (m)</span>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="20"
                inputMode="decimal"
                placeholder="Contoh: 2.5"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="min-h-14 px-4 py-3 text-xl rounded-xl border-2 border-current bg-transparent"
              />
            </label>

            {error && (
              <p className="text-red-600 text-base font-medium" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="min-h-14 px-8 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-lg font-semibold active:scale-95 transition cursor-pointer"
            >
              Lanjut →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
