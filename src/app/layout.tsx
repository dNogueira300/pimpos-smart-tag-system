// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Panadería y Minimarket Pimpos",
  description:
    "Sistema Web de Información Productiva y Gestión Presupuestaria mediante Etiquetas Inteligentes",
  keywords: ["panadería", "minimarket", "QR", "nutrición", "presupuesto"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
