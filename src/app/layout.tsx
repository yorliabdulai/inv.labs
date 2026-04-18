import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroller from "@/components/ui/SmoothScroller";
import Script from "next/script";
import { ThemeProvider } from "next-themes";

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
        
        {/* Referral Tracking System */}
        <Script id="referral-tracker" strategy="afterInteractive">
          {`
            (function() {
              try {
                var params = new URLSearchParams(window.location.search);
                var ref = params.get('ref');
                if (!ref) return;
                var existing = document.cookie.split('; ').find(row => row.startsWith('inv_referral='));
                if (!existing) {
                  document.cookie = 'inv_referral=' + encodeURIComponent(ref) + '; path=/; max-age=' + (30 * 24 * 60 * 60) + '; SameSite=Lax';
                  fetch('/api/referral-click?ref=' + encodeURIComponent(ref)).catch(console.error);
                }
              } catch (e) {}
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
