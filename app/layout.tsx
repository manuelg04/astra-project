/* app/layout.tsx */
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
export const metadata: Metadata = {
  title: "Astra App",
  description: "Astra App",
  generator: "Astra App",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans", // nombre de tu CSS var
  display: "swap", // evita FOUT
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} dark`}
      suppressHydrationWarning
    >
      {/* ① color base y esquema oscuro */}
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
