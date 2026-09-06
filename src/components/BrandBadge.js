import Link from "next/link";

export default function BrandBadge({ href = "/" }) {
  return (
    <Link href={href} className="brand-badge" aria-label="Ainy Keramik home">
      <span className="brand-badge-mark" aria-hidden="true" />
      <span>AINY KERAMIK</span>
    </Link>
  );
}
