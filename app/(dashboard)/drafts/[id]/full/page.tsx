import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

export default async function FullArticlePage({
                                                  params,
                                              }: {
    params: Promise<{ id: string }>
}) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login")

    const { id } = await params
    const post = await prisma.post.findUnique({
        where: { id, authorId: session.user.id },
    })

    if (!post) notFound()

    return (
        <div className="p-8 max-w-3xl">
            <Link
                href={`/drafts/${post.id}`}
                className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity"
                style={{ color: "#7c7c7c" }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                Terug naar preview
            </Link>

            <h1 className="text-2xl mb-2" style={{ color: "#eee5e9" }}>{post.title}</h1>
            <p className="text-sm mb-8" style={{ color: "#7c7c7c" }}>
                {post.updatedAt.toLocaleDateString("nl-NL", { dateStyle: "long" })}
            </p>

            <div
                className="prose max-w-none text-base leading-7 whitespace-pre-wrap"
                style={{ color: "rgba(238,229,233,0.85)" }}
            >
                {post.content}
            </div>
        </div>
    )
}