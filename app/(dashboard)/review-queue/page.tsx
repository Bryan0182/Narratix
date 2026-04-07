import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getOrCreateOrganization } from "@/lib/organization"

export default async function ReviewQueuePage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login")

    const org = await getOrCreateOrganization(session.user.id, session.user.name ?? "User")
    const orgId = org.id

    const posts = await prisma.post.findMany({
        where: {
            organizationId: org.id,
            status: { in: ["in review", "pending", "approved"] },
        },
        orderBy: { updatedAt: "desc" },
    })

    const pending = posts.filter(p => p.status === "in review" || p.status === "pending")
    const approved = posts.filter(p => p.status === "approved")

    return (
        <div className="p-8 flex gap-6">

            {/* Left — Post list */}
            <div className="flex flex-col gap-4 w-80 shrink-0">
                <div>
                    <h3 className="text-base mb-1" style={{ color: "#eee5e9" }}>Pending Review</h3>
                    <p className="text-sm" style={{ color: "#7c7c7c" }}>
                        {pending.length} artikel{pending.length !== 1 ? "en" : ""} wacht{pending.length === 1 ? "" : "en"} op review
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {posts.length === 0 ? (
                        <div
                            className="p-6 rounded-2xl border text-center"
                            style={{ backgroundColor: "#2d312f", borderColor: "rgba(124,124,124,0.3)" }}
                        >
                            <p className="text-sm" style={{ color: "#7c7c7c" }}>
                                Geen artikelen in de review queue.
                            </p>
                            <Link href="/drafts" className="text-sm mt-2 block hover:opacity-80 transition-opacity" style={{ color: "#00f3ff" }}>
                                Ga naar Drafts →
                            </Link>
                        </div>
                    ) : (
                        posts.map((post) => {
                            const isPending = post.status === "in review" || post.status === "pending"
                            return (
                                <Link
                                    key={post.id}
                                    href={`/drafts/${post.id}`}
                                    className="block p-4 rounded-2xl border transition-all hover:opacity-90"
                                    style={{
                                        backgroundColor: isPending ? "rgba(0,243,255,0.1)" : "rgba(56,61,59,0.5)",
                                        borderColor: isPending ? "rgba(0,243,255,0.3)" : "rgba(124,124,124,0.3)",
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <p className="text-sm leading-5" style={{ color: "#eee5e9" }}>{post.title}</p>
                                        <span
                                            className="px-2 py-0.5 rounded-lg text-xs capitalize shrink-0"
                                            style={{
                                                backgroundColor: isPending ? "rgba(254,154,0,0.2)" : "rgba(0,201,80,0.2)",
                                                color: isPending ? "#ffb900" : "#05df72",
                                                border: `1px solid ${isPending ? "rgba(254,154,0,0.3)" : "rgba(0,201,80,0.3)"}`,
                                            }}
                                        >
                      {post.status}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                    <span className="text-xs" style={{ color: "#7c7c7c" }}>
                      {session.user.name}
                    </span>
                                        <span className="text-xs" style={{ color: "#7c7c7c" }}>
                      {post.updatedAt.toLocaleDateString("nl-NL", { dateStyle: "medium" })}
                    </span>
                                        {post.seoScore && (
                                            <span className="text-xs" style={{ color: "#00f3ff" }}>
                        SEO: {post.seoScore}
                      </span>
                                        )}
                                    </div>
                                </Link>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Right — Preview of first pending post */}
            <div className="flex-1 min-w-0">
                {posts.length > 0 ? (
                    <div
                        className="rounded-2xl border overflow-hidden"
                        style={{
                            backgroundColor: "#2d312f",
                            borderColor: "rgba(124,124,124,0.3)",
                            boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(124,124,124,0.3)" }}>
                            <div>
                                <p className="text-base" style={{ color: "#eee5e9" }}>Article Preview</p>
                                <p className="text-sm" style={{ color: "#7c7c7c" }}>By {session.user.name}</p>
                            </div>
                            <Link
                                href={`/drafts/${posts[0].id}`}
                                className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
                                style={{ backgroundColor: "#00f3ff", color: "#383d3b", boxShadow: "0px 0px 16px 0px rgba(0,243,255,0.3)" }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" />
                                </svg>
                                Review
                            </Link>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-6 flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <p className="text-xs uppercase tracking-wider" style={{ color: "#7c7c7c" }}>Title</p>
                                <h2 className="text-xl" style={{ color: "#eee5e9" }}>{posts[0].title}</h2>
                            </div>

                            {posts[0].summary && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs uppercase tracking-wider" style={{ color: "#7c7c7c" }}>Summary</p>
                                    <p className="text-base leading-6" style={{ color: "rgba(238,229,233,0.8)" }}>{posts[0].summary}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs uppercase tracking-wider" style={{ color: "#7c7c7c" }}>Content</p>
                                    <Link href={`/drafts/${posts[0].id}/full`} className="text-xs hover:opacity-80 transition-opacity" style={{ color: "#00f3ff" }}>
                                        View Full Article →
                                    </Link>
                                </div>
                                <p className="text-base leading-6" style={{ color: "rgba(238,229,233,0.7)" }}>
                                    {posts[0].content.slice(0, 500)}
                                    {posts[0].content.length > 500 && "..."}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-3">
                                {[
                                    { label: "Word Count", value: posts[0].content.split(/\s+/).length.toLocaleString("nl-NL") },
                                    { label: "Reading Time", value: `${Math.ceil(posts[0].content.split(/\s+/).length / 200)} min` },
                                    { label: "SEO Score", value: posts[0].seoScore ? `${posts[0].seoScore}/100` : "—", color: "#00f3ff" },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="flex-1 flex flex-col gap-1 p-3 rounded-xl border"
                                        style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                                    >
                                        <p className="text-xs" style={{ color: "#7c7c7c" }}>{stat.label}</p>
                                        <p className="text-base" style={{ color: stat.color ?? "#eee5e9" }}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 px-6 py-5 border-t" style={{ borderColor: "rgba(124,124,124,0.3)" }}>
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: "#00f3ff", color: "#383d3b", boxShadow: "0px 0px 16px 0px rgba(0,243,255,0.3)" }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                    Approve
                                </button>
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm transition-opacity hover:opacity-80"
                                    style={{ backgroundColor: "transparent", color: "#92dce5", border: "1px solid #92dce5" }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                                    </svg>
                                    Request Changes
                                </button>
                            </div>
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
                ) : (
                    <div
                        className="rounded-2xl border flex flex-col items-center justify-center p-12 gap-4"
                        style={{ backgroundColor: "#2d312f", borderColor: "rgba(124,124,124,0.3)" }}
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: "rgba(0,243,255,0.1)", border: "1px solid rgba(0,243,255,0.2)" }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#00f3ff">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                        </div>
                        <p className="text-base" style={{ color: "#eee5e9" }}>Geen artikelen in review</p>
                        <p className="text-sm text-center" style={{ color: "#7c7c7c" }}>
                            Artikelen die je ter review indient verschijnen hier.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}