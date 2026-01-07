import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://free-job-alert-ten.vercel.app'),
  title: {
    default: 'GovJobAlert - Latest Government Jobs, Admit Cards & Results',
    template: '%s | GovJobAlert'
  },
  description: 'The most reliable source for Sarkari Naukri, Bank Jobs, SSC, UPSC, and State Govt Job notifications. Get real-time updates on vacancies and exams.',
  keywords: ['Sarkari Naukri', 'Govt Jobs', 'Free Job Alert', 'SSC', 'Bank Jobs', 'UPSC', 'Sarkari Result'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GovJobAlert',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider defaultTheme="system" storageKey="govjob-theme">
          <Header />
          <main>{children}</main>
          <Footer />
          <MobileBottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
