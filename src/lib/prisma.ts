import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    // Append connection limit to the URL if not present
    const url = process.env.DATABASE_URL;
    const connectionLimit = 3; // Strict limit for Vercel serverless

    const enhancedUrl = url && !url.includes('connection_limit')
        ? `${url}${url.includes('?') ? '&' : '?'}connection_limit=${connectionLimit}&pool_timeout=20`
        : url;

    return new PrismaClient({
        datasources: {
            db: {
                url: enhancedUrl,
            },
        },
        // Log queries in dev for debugging, but keep production clean
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

const prismaInstance = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;

// Export the instance directly for now, retry logic should be handled at call site or via extension if needed
// For now, increasing pool timeout and limiting concurrency is the key fix.
export const prisma = prismaInstance;
