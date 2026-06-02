import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ÉtrendTervező – Személyre szabott étkezési asszisztens",
  description: "AI-alapú étrendtervező app kalóriaszámlálással, naplóval és orvosi dokumentumkezeléssel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
