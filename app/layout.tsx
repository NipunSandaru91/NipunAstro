import type { Metadata } from "next";
import "./globals.css";
import "./light-theme.css";

export const metadata: Metadata = {
  title: "N Astro | ජ්‍යොතිෂ නිරීක්ෂණය",
  description: "පැහැදිලි ජන්ම ගණනය සහ සිංහල ජ්‍යොතිෂ කියවීම.",
  icons: { icon: "/n-astro-logo.png", apple: "/n-astro-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="si">
      <body>{children}</body>
    </html>
  );
}
