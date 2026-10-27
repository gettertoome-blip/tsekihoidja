import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tšekihoidja",
  description: "Hoia oma tšekid digitaalselt ja leia need vajadusel kiiresti üles.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c65d3b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="et">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
