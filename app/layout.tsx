import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NipunAstro | Jyotiṣa Observatory",
  description: "Calculation-first Jyotiṣa analysis and evidence observatory.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#02070b",
};

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  return (
    <html lang="si">
      <body>{children}</body>
    </html>
  );
}
