import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ainy Keramik Visualizer",
  description: "Konsultasi visual keramik untuk toko Ainy Keramik Sidoarjo",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-base sm:text-lg">
        {children}
      </body>
    </html>
  );
}
