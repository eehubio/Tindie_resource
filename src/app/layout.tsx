import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import BottomTabBar from "@/components/BottomTabBar";

export const metadata: Metadata = {
  title: "Resources — Tindie",
  description: "Daily hardware discoveries and a trusted directory of tools, platforms and manufacturing partners.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tindie",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#22b8c4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>

        {/* 给底部 tab bar 留出空间，避免内容被遮挡 */}
        <div
          style={{ height: "calc(56px + env(safe-area-inset-bottom))" }}
          aria-hidden="true"
        />

        <BottomTabBar />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
