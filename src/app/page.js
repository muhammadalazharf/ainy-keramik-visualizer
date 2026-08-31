"use client";

import { useRouter } from "next/navigation";
import { useDesignStore } from "@/stores/design-store";

export default function SelectionPage() {
  const router = useRouter();
  const setSurface = useDesignStore((state) => state.setSurface);

  const handleSelect = (surface) => {
    setSurface(surface);
    router.push("/dimension");
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl flex flex-col gap-10">
        <header className="text-center flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Ainy Keramik Visualizer
          </h1>
          <p className="text-lg sm:text-xl opacity-80">
            Pilih permukaan yang ingin divisualisasikan
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => handleSelect("wall")}
            className="min-h-40 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-current p-8 text-2xl font-semibold hover:bg-current/5 active:scale-95 transition cursor-pointer"
          >
            <span className="text-5xl" aria-hidden="true">🧱</span>
            <span>Dinding</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect("floor")}
            className="min-h-40 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-current p-8 text-2xl font-semibold hover:bg-current/5 active:scale-95 transition cursor-pointer"
          >
            <span className="text-5xl" aria-hidden="true">🟫</span>
            <span>Lantai</span>
          </button>
        </div>

        <footer className="text-center text-sm opacity-60">
          Versi 0.1 · Phase 0 skeleton
        </footer>
      </div>
    </main>
  );
}
