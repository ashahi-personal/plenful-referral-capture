import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plenful – 340B Referral Capture",
  description: "340B Referral Capture AI Automation Prototypes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
