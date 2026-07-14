import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventOS X — Smart Stadium Command Center",
  description:
    "Real-time stadium operations dashboard that predicts problems before they happen. Monitor crowd density, weather impact, gate status, and risk scenarios with AI-powered recommendations.",
  keywords: [
    "stadium management",
    "crowd safety",
    "operations dashboard",
    "event management",
    "smart stadium",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#F7F8FA] antialiased" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
