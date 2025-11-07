import type { Metadata } from "next";
import "@/styles/globals.css";
import Script from "next/script";


export const metadata: Metadata = {
  title: "Beacon",
  description: "Beacon - CivMC Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js" />
        <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.topology.min.js" />
      </head>
      <body className="bg-black">{children}</body>
    </html>
  );
}

