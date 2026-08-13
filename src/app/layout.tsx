import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayUp",
  description: "Penitenze, prove, ranking e sfide tra amici.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
