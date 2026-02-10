'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Post } from '@prisma/client';
import Image from "next/image";

interface PostCarouselProps {
    posts: Post[];
    title?: string;
}

export default function PostCarousel({ posts, title = "Conteúdos relacionados" }: PostCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (!posts || posts.length === 0) return null;

    return (
        <div className="relative group/carousel w-full">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-2 block">Continue lendo</span>
                    <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 shadow-sm bg-white"
                        aria-label="Anterior"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 shadow-sm bg-white"
                        aria-label="Próximo"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {posts.map((post) => (
                    <article
                        key={post.id}
                        className="min-w-[280px] md:min-w-[320px] lg:min-w-[calc(33.333%-16px)] snap-start group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                        <Link href={`/${post.slug}`} className="block aspect-[16/10] overflow-hidden relative bg-neutral-100">

                            {
                                post.imageUrl ? (
                                    <Image
                                        src={post.imageUrl.startsWith('/') ? post.imageUrl : `/${post.imageUrl}`}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-gray-100 to-gray-200" />
                                )
                            }
                        </Link>
                        <div className="p-5 flex flex-col flex-1">
                            <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2 block">
                                {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3 line-clamp-2">
                                <Link href={`/${post.slug}`} className="hover:text-[var(--color-primary)] transition-colors">
                                    {post.title}
                                </Link>
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                                {post.excerpt}
                            </p>
                            <Link
                                href={`/${post.slug}`}
                                className="text-sm font-bold text-gray-900 hover:text-[var(--color-primary)] transition-colors flex items-center gap-1 mt-auto"
                            >
                                Ler artigo complet
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                            </Link>
                        </div>
                    </article>
                ))}
            </div>

            <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
}
