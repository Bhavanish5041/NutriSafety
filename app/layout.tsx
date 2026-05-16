import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppNav } from "@/components/app-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NutriShield AI",
  description: "AI-powered food compliance and personalized nutrition intelligence.",
  manifest: "/manifest.json"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,#c9f4d2,transparent_35%),linear-gradient(180deg,#f8fbf6,#edfdf1)] dark:bg-[radial-gradient(circle_at_top_left,#145c41,transparent_35%),linear-gradient(180deg,#062a1f,#0a3b2b)]">
            <AppNav />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
