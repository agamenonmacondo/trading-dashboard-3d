import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trading Dashboard 3D",
  description: "Dashboard de trading en 3D con Three.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
