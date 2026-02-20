import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { InitialLoadGuard } from "@/components/initial-load-guard";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AviControl",
  description: "Sistema de gestão avícola",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <InitialLoadGuard>{children}</InitialLoadGuard>
        </Providers>
      </body>
    </html>
  );
}
