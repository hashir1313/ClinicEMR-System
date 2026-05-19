import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clinic EMR System",
  description: "Private clinic management system for doctors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh' }}>{children}</body>
    </html>
  );
}