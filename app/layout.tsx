import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Golf Charity Platform | Play. Win. Give.",
  description:
    "Subscribe, enter your Stableford scores, win monthly prizes, and support your chosen charity. Where golf meets generosity.",
  keywords: ["golf", "charity", "subscription", "prize draw", "Stableford"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased bg-[#0a0f1e] text-white`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a2035",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
