import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

function StatusChip({ status }: { status: string }) {
    const styles: Record<string, { bg: string; color: string; border: string }> = {
        draft: { bg: "transparent", color: "#7c7c7c", border: "rgba(124,124,124,0.3)" },
        "in review": { bg: "rgba(146,220,229,0.2)", color: "#92dce5", border: "rgba(146,220,229,0.3)" },
        scheduled: { bg: "rgba(0,243,255,0.2)", color: "#00f3ff", border: "rgba(0,243,255,0.3)" },
        published: { bg: "rgba(0,201,80,0.2)", color: "#05df72", border: "rgba(0,201,80,0.3)" },
        pending: { bg: "rgba(254,154,0,0.2)", color: "#ffb900", border: "rgba(254,154,0,0.3)" },
        approved: { bg: "rgba(0,201,80,0.2)", color: "#05df72", border: "rgba(0,201,80,0.3)" },
    }
    const s = styles[status.toLowerCase()] ?? styles.draft
    return (
        <span
            className="px-3 py-1 rounded-lg text-xs capitalize"
            style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
        >
      {status}
    </span>
    )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div
            className="flex-1 flex flex-col gap-1 p-3 rounded-xl border"
            style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
        >
            <p className="text-xs" style={{ color: "#7c7c7c" }}>{label}</p>
            <p className="text-base" style={{ color: color ?? "#eee5e9" }}>{value}</p>
        </div>
    )
}

export default async function DraftDetailPage({
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

    const wordCount = post.content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)
    const contentPreview = post.content.slice(0, 600)

    return (
        <div className="p-8 max-w-4xl">

            {/* Terug naar drafts */}
            <Link
                href="/drafts"
                className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity"
                style={{ color: "#7c7c7c" }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                Terug naar Drafts
            </Link>

            <div
                className="rounded-2xl border overflow-hidden"
                style={{
                    backgroundColor: "#2d312f",
                    borderColor: "rgba(124,124,124,0.3)",
                    boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-start justify-between px-6 py-5 border-b"
                    style={{ borderColor: "rgba(124,124,124,0.3)" }}
                >
                    <div>
                        <p className="text-base mb-1" style={{ color: "#eee5e9" }}>Article Preview</p>
                        <p className="text-sm" style={{ color: "#7c7c7c" }}>
                            By {session.user.name}
                        </p>
                    </div>
                    <StatusChip status={post.status} />
                </div>

                {/* Content */}
                <div className="px-6 py-6 flex flex-col gap-6">

                    {/* Title */}
                    <div className="flex flex-col gap-2">
                        <p className="text-xs uppercase tracking-wider" style={{ color: "#7c7c7c" }}>Title</p>
                        <h1 className="text-xl" style={{ color: "#eee5e9" }}>{post.title}</h1>
                    </div>

                    {/* Summary */}
                    {post.summary && (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs uppercase tracking-wider" style={{ color: "#7c7c7c" }}>Summary</p>
                            <p className="text-base leading-6" style={{ color: "rgba(238,229,233,0.8)" }}>
                                {post.summary}
                            </p>
                        </div>
                    )}

                    {/* Content preview */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-wider" style={{ color: "#7c7c7c" }}>Content</p>
                            <Link
                                href={`/drafts/${post.id}/full`}
                                className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
                                style={{ color: "#00f3ff" }}
                            >
                                View Full Article
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                                </svg>
                            </Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            <p className="text-base leading-6" style={{ color: "rgba(238,229,233,0.7)" }}>
                                {contentPreview}
                                {post.content.length > 600 && "..."}
                            </p>
                            {post.content.length > 600 && (
                                <p className="text-base italic" style={{ color: "#7c7c7c" }}>
                                    ... (Click "View Full Article" to read more)
                                </p>
                            )}
                        </div>
                    </div>

                    {/* SEO Metadata */}
                    {(post.seoTitle || post.seoDesc) && (
                        <div
                            className="flex flex-col gap-4 p-4 rounded-xl border"
                            style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                        >
                            <p className="text-sm" style={{ color: "#eee5e9" }}>SEO Metadata</p>
                            {post.seoTitle && (
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs" style={{ color: "#7c7c7c" }}>SEO Title</p>
                                    <p className="text-sm" style={{ color: "#eee5e9" }}>{post.seoTitle}</p>
                                </div>
                            )}
                            {post.seoDesc && (
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs" style={{ color: "#7c7c7c" }}>Meta Description</p>
                                    <p className="text-sm leading-5" style={{ color: "#eee5e9" }}>{post.seoDesc}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex gap-3">
                        <StatCard label="Word Count" value={wordCount.toLocaleString("nl-NL")} />
                        <StatCard label="Reading Time" value={`${readingTime} min`} />
                        <StatCard label="SEO Score" value={post.seoScore ? `${post.seoScore}/100` : "—"} color="#00f3ff" />
                    </div>
                </div>

                {/* Actions */}
                <div
                    className="flex flex-col gap-3 px-6 py-5 border-t"
                    style={{ borderColor: "rgba(124,124,124,0.3)" }}
                >
                    <div className="flex gap-3">
                        {/* Approve */}
                        <button
                            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
                            style={{
                                backgroundColor: "#00f3ff",
                                color: "#383d3b",
                                boxShadow: "0px 0px 16px 0px rgba(0,243,255,0.3)",
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            Approve
                        </button>

                        {/* Request Changes */}
                        <button
                            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm transition-opacity hover:opacity-80"
                            style={{
                                backgroundColor: "transparent",
                                color: "#92dce5",
                                border: "1px solid #92dce5",
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" />
                            </svg>
                            Request Changes
                        </button>
                    </div>

                    {/* AI Rewrite */}
                    <button
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm transition-opacity hover:opacity-80"
                        style={{ backgroundColor: "transparent", color: "#00f3ff" }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
                        </svg>
                        AI Rewrite
                    </button>
                </div>
            </div>
        </div>
    )
}