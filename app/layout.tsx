import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthHandler from "@/components/AuthHandler";

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
        <body suppressHydrationWarning>
          <Navbar />
          <AuthHandler /> {/* Handles backend signup/login */}
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}