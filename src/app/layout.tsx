import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SplashLayout from "../components/SplashLayout";
import Navbar from "../components/Navbar";
import { ThemeProvider } from "../components/ThemeProvider";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import ConditionalNavbar from "../components/ConditionalNavbar";


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
    <ClerkProvider>
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <SplashLayout>
              <AuthLayoutWrapper>
                {children}
              </AuthLayoutWrapper>
            </SplashLayout>
          </div>
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}

// Component to conditionally show navbar based on route
function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ConditionalNavbar />
      {children}
    </>
  );
}