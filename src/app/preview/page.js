"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDesignStore } from "@/stores/design-store";

export default function PreviewPage() {
  const router = useRouter();
  const surface = useDesignStore((state) => state.surface);
  const dimensions = useDesignStore((state) => state.dimensions);
  const reset = useDesignStore((state) => state.reset);

  useEffect(() => {
    if (!surface || !dimensions.width_m || !dimensions.height_m) {
      router.replace("/");
    }
  }, [surface, dimensions, router]);

  if (!surface || !dimensions.width_m || !dimensions.height_m) return null;

  const surfaceLabel = surface === "floor" ? "Lantai" : "Dinding";
  const area = (dimensions.width_m * dimensions.height_m).toFixed(2);

  const handleReset = () => {
    reset();
    router.push("/");
  };

  return (
    <main className="flex-1 flex flex-col p-6">
      <nav className="flex items-center justify-between mb-6">
        <Link
          href="/design"
          className="min-h-12 px-5 py-3 rounded-xl border-2 border-current text-lg font-medium hover:bg-current/5 active:scale-95 transition"
        >
          ← Kembali
        </Link>
        <span className="text-lg opacity-70">Preview {surfaceLabel}</span>
      </nav>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl flex flex-col gap-8">
          <section className="rounded-2xl border-2 border-dashed border-current/40 aspect-video flex flex-col items-center justify-center gap-3">
            <span className="text-6xl" aria-hidden="true">🖼️</span>
            <h2 className="text-2xl font-bold">Preview Hasil</h2>
            <div className="text-lg opacity-80 text-center px-6">
              <p>{surfaceLabel} · {dimensions.width_m}m × {dimensions.height_m}m</p>
              <p className="font-semibold">Luas: {area} m²</p>
            </div>
            <p className="text-sm opacity-60 text-center px-6 mt-2">
              Perspective 2D + hasil desain final. Implementasi Session 18-19.
            </p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              disabled
              className="min-h-14 px-5 py-3 rounded-xl border-2 border-current text-lg font-medium opacity-40 cursor-not-allowed"
            >
              💾 Simpan
            </button>
            <button
              type="button"
              disabled
              className="min-h-14 px-5 py-3 rounded-xl border-2 border-current text-lg font-medium opacity-40 cursor-not-allowed"
            >
              📤 Bagikan
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="min-h-14 px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-lg font-semibold active:scale-95 transition cursor-pointer"
            >
              🏠 Selesai
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
