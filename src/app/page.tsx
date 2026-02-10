import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import FAQSection from "@/components/FAQSection";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  // Fetch specific categories or all categories with posts
  const categories = await prisma.category.findMany({
    where: {
      posts: { some: {} } // Only categories with posts
    },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        take: 3, // Take 3 latest per category
      },
    },
    take: 5, // Limit homepage sections
  });

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="max-w-[800px] mx-auto text-center hero-content">
            <h1>Proteção Inteligente para o Mundo Moderno</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-[600px] mx-auto">
              O guia definitivo sobre segurança eletrônica, monitoramento e tecnologia de proteção patrimonial.
            </p>
            <a href="#artigos" className="btn btn-primary">Ler Artigos</a>
          </div>
        </div>
      </section>

      {categories.map((category) => (
        <section key={category.id} id="artigos" className="py-12 container">
          <div className="flex justify-between items-end mb-8 section-header border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold">{category.name}</h2>
            <Link href={`/category/${category.slug}`} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              Ver todos &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 posts-grid">
            {category.posts.map((post) => (
              <article key={post.id} className="post-card group">
                <div className="aspect-video bg-neutral-200 overflow-hidden post-image-wrapper relative">
                  {post.imageUrl ? (
                    // ...
                    <Image
                      src={post.imageUrl.startsWith('/') ? post.imageUrl : `/${post.imageUrl}`}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority={categories.indexOf(category) === 0} // Priority for first category
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-gray-200 to-gray-300" />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1 post-content">
                  <div className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2 post-meta">
                    {category.name} • {post.createdAt.toLocaleDateString('pt-BR')}
                  </div>
                  <h3 className="text-xl font-bold mb-4 leading-snug post-title">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3 post-excerpt">
                    {post.excerpt}
                  </p>
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500 post-footer">
                    <Link href={`/${post.slug}`} className="hover:text-[var(--color-primary)] transition-colors">
                      Ler mais &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
      <FAQSection />
    </>

  );
}
