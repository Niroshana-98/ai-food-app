import type { Metadata } from "next";
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import AuthHandler from "@/components/AuthHandler";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Food Recommendation App",
  description: "AI-powered food recommendation website with Clerk & MongoDB",
  icons: {
    icon: "/favicon.svg", 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning className={inter.className}>
          {/* <Navbar /> */}
          <AuthHandler /> 
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}