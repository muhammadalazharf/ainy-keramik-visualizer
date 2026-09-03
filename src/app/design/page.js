"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDesignStore } from "@/stores/design-store";

const Scene3D = dynamic(
  () => import("@/modules/design-3d/Scene3D"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px] rounded-2xl border-2 border-current/20">
        <p className="opacity-60">Memuat 3D scene (WebGL)...</p>
      </div>
    ),
  },
);

const CatalogPanel = dynamic(
  () => import("@/modules/catalog/CatalogPanel"),
  {
    ssr: false,
    loading: () => (
      <aside className="rounded-2xl border-2 border-current/20 p-4">
        <p className="opacity-60">Memuat katalog...</p>
      </aside>
    ),
  },
);

export default function DesignPage() {
  const router = useRouter();
  const surface = useDesignStore((state) => state.surface);
  const dimensions = useDesignStore((state) => state.dimensions);

  useEffect(() => {
    if (!surface || !dimensions.width_m || !dimensions.height_m) {
      router.replace("/");
    }
  }, [surface, dimensions, router]);

  if (!surface || !dimensions.width_m || !dimensions.height_m) return null;

  const surfaceLabel = surface === "floor" ? "Lantai" : "Dinding";
  const area = (dimensions.width_m * dimensions.height_m).toFixed(2);

  return (
    <main className="flex-1 flex flex-col p-6">
      <nav className="flex items-center justify-between mb-6 gap-3">
        <Link
          href="/dimension"
          className="min-h-12 px-5 py-3 rounded-xl border-2 border-current text-lg font-medium hover:bg-current/5 active:scale-95 transition"
        >
          ← Kembali
        </Link>
        <span className="text-lg opacity-70 hidden sm:inline">
          Desain {surfaceLabel} · {dimensions.width_m}m × {dimensions.height_m}m · {area} m²
        </span>
        <Link
          href="/preview"
          className="min-h-12 px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-lg font-semibold active:scale-95 transition"
        >
          Preview →
        </Link>
      </nav>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <section className="min-h-[400px]">
          <Scene3D />
        </section>

        <CatalogPanel />
      </div>
    </main>
  );
}
