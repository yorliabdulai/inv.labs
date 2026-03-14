import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroller from "@/components/ui/SmoothScroller";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
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

import { ThemeProvider } from "next-themes";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${plusJakarta.variable} ${dmMono.variable} font-sans antialiased bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SmoothScroller />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
