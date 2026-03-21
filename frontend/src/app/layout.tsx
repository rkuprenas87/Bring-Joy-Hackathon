import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bring Joy",
  description: "A floating note board built with Next.js",
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
