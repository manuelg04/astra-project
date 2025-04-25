/* app/layout.tsx */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astra App",
  description: "Astra App",
  generator: "Astra App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      {/* ① color base y esquema oscuro */}
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}