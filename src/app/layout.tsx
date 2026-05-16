import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/context/ProfileContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Virtual Co-founder | AI Study Assistant",
  description: "AI-powered time management and learning assistant for university freshmen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-brand-mint-light selection:text-brand-mint-dark">
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </body>
    </html>
  );
}
