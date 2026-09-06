import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ainy Keramik — Mock Up Keramik 3D Realistic",
  description:
    "Preview pilihan keramik lantai dan dinding pada ruangan impian Anda sebelum membeli. Rasakan pengalaman interaktif tata letak ruang, pencahayaan, dan warna nat asli secara real-time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
