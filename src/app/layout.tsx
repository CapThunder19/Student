import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AppNavbar from "@/components/AppNavbar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Student App",
  description: "A comprehensive student management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-slate-900 transition-colors duration-500 bg-[#FDF9F1]">
        <Providers>
          <AppNavbar />
          <main className="w-full relative">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
