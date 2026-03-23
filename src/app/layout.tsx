import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keyword Clustering Tool",
  description: "Automatically group keywords into topic clusters for SEO",
  authors: [{ name: "Sean G" }],
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
