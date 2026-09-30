import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kami AI — App Store Screenshot Studio",
  description: "Connected canvas, device frames, and store-ready exports for App Store & Google Play screenshots.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
