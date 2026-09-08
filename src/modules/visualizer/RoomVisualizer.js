"use client";

import { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import BrandBadge from "@/components/BrandBadge";
import TileCatalog from "@/modules/catalog/TileCatalog";
import LisbonCatalog from "@/modules/catalog/LisbonCatalog";
import ControlPanel from "@/modules/controls/ControlPanel";
import { useDesignStore } from "@/stores/design-store";
import SceneStoreBridge from "@/stores/SceneStoreBridge";

const Scene3D = dynamic(
  () => import("@/modules/design-3d/Scene3D"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-cream-dark">
        <p className="text-ink-soft">Memuat 3D scene (WebGL)...</p>
      </div>
    ),
  },
);

export default function RoomVisualizer({ room }) {
  const setRoom = useDesignStore((s) => s.setRoom);
  const currentRoomId = useDesignStore((s) => s.currentRoomId);

  useEffect(() => {
    if (currentRoomId !== room.id) {
      setRoom(room.id, {
        surface: room.default_surface,
        dimensions: room.default_dimensions,
      });
    }
  }, [room, currentRoomId, setRoom]);

  return (
    <main className="min-h-screen bg-cream text-ink flex flex-col">
      <SceneStoreBridge />
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border bg-cream/95 backdrop-blur sticky top-0 z-20">
        <BrandBadge />
        <Link href="/dashboard" className="text-sm text-ink-soft hover:text-ink transition">
          ← Ganti Ruangan
        </Link>
      </header>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[340px_1fr_400px] gap-3 p-3">
        <aside className="flex flex-col gap-3 order-2 xl:order-1 max-h-[calc(100vh-90px)] overflow-y-auto">
          <TileCatalog />
          <LisbonCatalog />
        </aside>

        <section className="order-1 xl:order-2 relative rounded-2xl overflow-hidden border border-border bg-cream-dark min-h-[400px] xl:min-h-0">
          <Scene3D />
        </section>

        <aside className="order-3 max-h-[calc(100vh-90px)] overflow-y-auto">
          <ControlPanel room={room} />
        </aside>
      </div>
    </main>
  );
}
