import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Sans, Instrument_Serif, DM_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroller from "@/components/ui/SmoothScroller";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: "400",
});

export const metadata: Metadata = {
  title: "GSE Investment Simulator",
  description: "Learn to invest in the Ghana Stock Exchange",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${instrumentSans.variable} ${instrumentSerif.variable} ${dmMono.variable}`}>
        <SmoothScroller />
        {children}
      </body>
    </html>
  );
}
