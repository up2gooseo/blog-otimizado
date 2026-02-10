'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare } from "bcryptjs";

// --- Helpers ---

const retryWithDelay = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (error?.code === 'P2024' || error?.message?.includes('Too many database connections'))) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryWithDelay(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

// --- Auth ---

export async function login(prevState: any, formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { error: "Preencha todos os campos." };
    }

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user || !(await compare(password, user.password))) {
        return { error: "Usuário ou senha inválidos." };
    }

    // Set session cookie
    (await cookies()).set("admin_session", user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
    });

    redirect("/admin");
}

export async function logout() {
    (await cookies()).delete("admin_session");
    redirect("/admin/login");
}

export async function getSession() {
    const cookie = (await cookies()).get("admin_session");
    return cookie?.value ? parseInt(cookie.value) : null;
}

// --- Posts ---

export async function createPost(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) redirect("/admin/login");

    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const imageUrl = formData.get("imageUrl") as string;
    let slug = formData.get("slug") as string;

    // Auto-generate slug if not provided
    if (!slug && title) {
        slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    // Category logic: Find or Create
    const categoryName = formData.get("category") as string;
    let categoryConnectId: number | undefined;

    if (categoryName) {
        const catSlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cat = await prisma.category.upsert({
            where: { slug: catSlug },
            update: { name: categoryName },
            create: { name: categoryName, slug: catSlug }
        });
        categoryConnectId = cat.id;
    }

    try {
        // Unique Slug check
        const existing = await prisma.post.findUnique({ where: { slug } });
        if (existing) return { error: "Slug já existe." };

        await retryWithDelay(() => prisma.post.create({
            data: {
                title,
                slug,
                excerpt,
                content,
                imageUrl,
                categoryName, // Compatibility field
                categoryId: categoryConnectId
            },
        }));

    } catch (e: any) {
        return { error: "Erro ao criar post: " + e.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    redirect("/admin");
}

export async function updatePost(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) redirect("/admin/login");

    const id = parseInt(formData.get("id") as string);
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const categoryName = formData.get("category") as string;
    const slug = formData.get("slug") as string;
    const imageUrl = formData.get("imageUrl") as string;

    // Category logic
    let categoryConnectId: number | undefined;
    if (categoryName) {
        const catSlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cat = await prisma.category.upsert({
            where: { slug: catSlug },
            update: { name: categoryName },
            create: { name: categoryName, slug: catSlug }
        });
        categoryConnectId = cat.id;
    }

    try {
        await retryWithDelay(() => prisma.post.update({
            where: { id },
            data: {
                title,
                slug,
                excerpt,
                content,
                imageUrl,
                categoryName,
                categoryId: categoryConnectId
            },
        }));
    } catch (e: any) {
        return { error: "Erro ao atualizar post: " + e.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/${slug}`); // Updated path
    redirect("/admin");
}

export async function deletePost(id: number) {
    const session = await getSession();
    if (!session) redirect("/admin/login");

    try {
        await prisma.post.delete({ where: { id } });
        revalidatePath("/");
        revalidatePath("/admin");
    } catch (e: any) {
        // In a server action called via formAction or event handler, we might want to return something or just throw
        console.error("Delete error:", e);
        throw e;
    }
}
