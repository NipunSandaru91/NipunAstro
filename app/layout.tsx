import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NipunAstro | Jyotiṣa Observatory",
  description: "Calculation-first Jyotiṣa analysis and evidence observatory.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
