import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Offerzonline",
  description: "Test",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen antialiased`}>
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
