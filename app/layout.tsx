import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creo Photo Finder",
  description: "AI face recognition event photo finder"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
