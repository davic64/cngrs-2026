import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CNGRS 2026",
  description: "Congreso Juvenil Internacional 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
