import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter from Google Fonts via Next.js
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Blog de Segurança | Performance Extrema",
  description: "Blog especializado em equipamentos de segurança.",
};

import { prisma } from "@/lib/prisma";

// ...

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await prisma.category.findMany({
    where: {
      posts: {
        some: {} // Only categories with posts
      }
    },
    orderBy: {
      posts: {
        _count: 'desc'
      }
    },
    take: 5
  });

  return (
    <html lang="pt-BR">
      <body className={inter.variable}>
        <div className="flex flex-col min-h-screen">
          <header className="site-header">
            <div className="container flex justify-between items-center w-full">
              <Link href="/" className="logo block">
                // ... inside component
                <Link href="/" className="logo block">
                  <Image
                    src="/logo.png"
                    alt="Bom Trabalho Blog"
                    width={200}
                    height={48}
                    className="h-12 w-auto object-contain"
                    priority
                  />
                </Link>
              </Link>
              <nav className="hidden md:flex gap-8 main-nav">
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main className="flex-grow">
            {children}
          </main>

          <footer className="site-footer border-t border-white/5 py-16 text-center text-gray-400 text-sm">
            <div className="container">
              <p>&copy; 2024 SegurançaPro. Referência em Segurança Eletrônica.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
