import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SplashLayout from "../components/SplashLayout";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GOTUS",
  description: "Global Online Tracking for Unclaimed Stuff",
  icons: {
    icon: '/Logo.png', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SplashLayout>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            {children}
          </div>
        </SplashLayout>
      </body>
    </html>
  );
}