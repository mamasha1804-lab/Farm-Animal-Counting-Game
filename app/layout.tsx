import type { Metadata } from "next";
import "./globals.css";
import "./fairytale.css";

export const metadata: Metadata = {
  title: "Farm Animal Counting Game",
  description: "A fun counting game for young English learners.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
