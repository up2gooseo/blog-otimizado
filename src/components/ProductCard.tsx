import Link from 'next/link';
import Image from "next/image";

interface Product {
    id: number;
    title: string;
    sku: string;
    price: string | null;
    imageUrl: string | null;
    url: string;
}

export default function ProductCard({ product }: { product: Product }) {
    return (
        <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="product-card group block border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
            <div className="aspect-square bg-gray-100 overflow-hidden relative">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain transition-transform duration-500 group-hover:scale-105 p-4"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-gray-100 to-gray-200" />
                )}
            </div>
            <div className="p-4">
                <h3 className="text-sm font-semibold mb-2 line-clamp-2 min-h-[2.5rem]">{product.title}</h3>
                {product.price && (
                    <div className="text-lg font-bold text-[var(--color-primary)] mb-2">
                        {product.price}
                    </div>
                )}
                <div className="flex items-center justify-center gap-2 mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Compra Rápida
                </div>
            </div>
        </a>
    );
}
