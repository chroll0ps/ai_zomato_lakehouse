import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zomato AI — Flagship Analytics & Reviews RAG",
  description: "Unified Snowflake Text-to-SQL (MARTS) + Local Embeddings RAG (STG_REVIEWS) Flagship Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F7F3EA] text-[#141413] min-h-screen">
        {children}
      </body>
    </html>
  );
}

