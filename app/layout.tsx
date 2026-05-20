import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elinic EMR System",
  icons: {
    icon: "/icon.svg",
  },
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