import Link from "next/link";
import BrandBadge from "@/components/BrandBadge";
import { getAllRooms } from "@/lib/data/rooms";

export default function DashboardPage() {
  const rooms = getAllRooms();

  return (
    <main className="min-h-screen bg-cream text-ink flex flex-col">
      <header className="px-6 sm:px-12 pt-8 flex items-center justify-between">
        <BrandBadge />
        <Link href="/" className="text-sm text-ink-soft hover:text-ink transition">
          ← Kembali ke Beranda
        </Link>
      </header>

      <section className="max-w-[1440px] mx-auto w-full px-6 sm:px-12 py-10 lg:py-14 flex flex-col gap-4 text-center">
        <h1 className="hero-title">
          Pilih Eksplorasi <em>Ruangan Anda</em>
        </h1>
        <p className="text-lg text-ink-soft max-w-3xl mx-auto">
          Wujudkan ruangan impian dengan fitur yang telah kami siapkan
          khusus untuk customer setia seperti Anda.
        </p>
      </section>

      <section className="max-w-[1440px] mx-auto w-full px-6 sm:px-12 pb-16 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </section>
    </main>
  );
}

function RoomCard({ room }) {
  return (
    <article className="card p-6 flex flex-col gap-5 min-h-[420px]">
      <div className="aspect-[4/3] rounded-xl bg-cream-dark border border-border flex items-center justify-center text-7xl">
        <span aria-hidden="true">{room.emoji}</span>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-2xl font-bold">{room.name}</h3>
        <p className="text-sm text-ink-soft leading-relaxed">
          {room.description}
        </p>
      </div>
      <Link href={`/room/${room.id}`} className="btn-primary self-start">
        START
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
