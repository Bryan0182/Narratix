import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

export default async function DraftPage({
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
        <div className="p-8 max-w-4xl">
            <div className="mb-6 flex items-center gap-3">
        <span
            className="text-xs px-2 py-1 rounded-lg capitalize"
            style={{
                backgroundColor: "rgba(124,124,124,0.2)",
                color: "#7c7c7c",
                border: "1px solid rgba(124,124,124,0.3)",
            }}
        >
          {post.status}
        </span>
                {post.seoScore && (
                    <span className="text-xs" style={{ color: "#00f3ff" }}>
            SEO: {post.seoScore}/100
          </span>
                )}
            </div>

            <h1 className="text-3xl mb-4" style={{ color: "#eee5e9" }}>
                {post.title}
            </h1>

            {post.summary && (
                <p className="text-sm mb-8 pb-8 border-b" style={{ color: "#7c7c7c", borderColor: "rgba(124,124,124,0.3)" }}>
                    {post.summary}
                </p>
            )}

            <div
                className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "#eee5e9" }}
            >
                {post.content}
            </div>
        </div>
    )
}