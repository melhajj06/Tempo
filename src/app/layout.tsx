import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Loads the Geist Sans font and stores it as a CSS variable.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Loads the Geist Mono font and stores it as a CSS variable.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Defines the default page metadata for the Tempo app.
export const metadata: Metadata = {
  title: "Tempo",
  description: "Tempo student productivity scheduler",
};


// Defines the root layout shared across every page in the app.
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
        {children}
      </body>
    </html>
  );
}
