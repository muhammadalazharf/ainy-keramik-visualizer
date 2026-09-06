import Link from "next/link";
import BrandBadge from "@/components/BrandBadge";
import { getAllProducts } from "@/lib/data/products";
import { getAllTrims } from "@/lib/data/trims";

const currency = new Intl.NumberFormat("id-ID");

export default function KatalogPage() {
  const products = getAllProducts();
  const lisbons = getAllTrims();

  return (
    <main className="min-h-screen bg-cream text-ink flex flex-col">
      <header className="px-6 sm:px-12 pt-8 flex items-center justify-between">
        <BrandBadge />
        <div className="flex gap-3">
          <Link href="/" className="text-sm text-ink-soft hover:text-ink transition">
            ← Beranda
          </Link>
          <Link href="/dashboard" className="btn-primary">
            Mulai Desain →
          </Link>
        </div>
      </header>

      <section className="max-w-[1440px] mx-auto w-full px-6 sm:px-12 py-8">
        <h1 className="hero-title mb-2">Katalog <em>Motif</em></h1>
        <p className="text-lg text-ink-soft mb-8 max-w-2xl">
          Semua motif keramik dan lisbon border yang tersedia di toko Ainy Keramik.
        </p>

        <h2 className="text-2xl font-bold mb-4">Tile Catalog</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {products.map((p) => (
            <article key={p.id} className="card p-4 flex flex-col gap-3">
              <div
                className="aspect-square rounded-lg bg-cream-dark border border-border"
                style={{
                  backgroundImage: `url(${p.thumbnail_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-muted">{p.brand}</p>
                <p className="text-xs text-muted">
                  {p.size_cm.width}×{p.size_cm.height} cm · {p.pieces_per_dus} pcs/dus
                </p>
                <p className="text-sm text-brand font-semibold mt-1">
                  Rp {currency.format(p.price_per_dus)}/dus
                </p>
              </div>
            </article>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">Lisbon Catalog</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {lisbons.map((l) => (
            <article key={l.id} className="card p-4 flex flex-col gap-3">
              <div
                className="aspect-square rounded-lg border border-border"
                style={{ backgroundColor: l.hex }}
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold">{l.name}</p>
                <p className="text-xs text-muted">{l.brand}</p>
                <p className="text-xs text-muted">
                  {l.size_cm.width}×{l.size_cm.height} cm
                </p>
                <p className="text-sm text-brand font-semibold mt-1">
                  Rp {currency.format(l.price_per_meter)}/m
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
