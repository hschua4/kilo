import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Oswald } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Sporty, condensed athletic numerals for the dominant metrics.
const oswald = Oswald({
  variable: "--font-numeric",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Kilo",
  title: "Kilo — Understand your body's progress",
  description:
    "Track your weight, visualize the trend, and get AI-powered insights toward your goal.",
  appleWebApp: {
    capable: true,
    title: "Kilo",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  // Extend the layout viewport into the iOS safe areas (notch / home
  // indicator) so the PWA renders edge-to-edge. Required for the
  // env(safe-area-inset-*) values below to be non-zero.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" theme="dark" />
        <PwaRegister />
      </body>
    </html>
  );
}
