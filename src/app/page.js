import Link from "next/link";
import BrandBadge from "@/components/BrandBadge";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-cream text-ink flex flex-col">
      <header className="px-6 sm:px-12 pt-8">
        <BrandBadge />
      </header>

      <section className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,640px)_1fr] gap-8 lg:gap-16 px-6 sm:px-12 py-10 lg:py-16 max-w-[1440px] mx-auto w-full items-center">
        <div className="rounded-2xl overflow-hidden aspect-[640/520] w-full bg-gradient-to-br from-[#E85A2F] via-[#C34A25] to-[#8b3d20] flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(45deg,#fff2,#fff2_2px,transparent_2px,transparent_10px)]" />
          <div className="relative text-cream text-center px-8">
            <div className="text-8xl mb-4" aria-hidden="true">🏠</div>
            <p className="text-xl font-semibold opacity-90">
              Preview keramik langsung di ruangan Anda
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <h1 className="hero-title">
            Mock Up Keramik <em>3D&nbsp;Realistic</em>
          </h1>

          <p className="text-lg sm:text-xl leading-relaxed text-ink-soft max-w-xl">
            Preview pilihan keramik lantai dan dinding pada ruangan impian
            Anda sebelum membeli. Rasakan pengalaman interaktif tata letak
            ruang, pencahayaan, dan warna nat asli secara real-time.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard" className="btn-primary">
              <span>Start Designing</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/katalog" className="btn-outline">
              <span>Lihat Katalog Motif</span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-6 sm:px-12 py-6 text-sm text-muted">
        © Ainy Keramik · Sidoarjo · Versi 0.4 (Figma-driven redesign)
      </footer>
    </main>
  );
}
