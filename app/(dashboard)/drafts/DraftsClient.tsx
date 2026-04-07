"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Post = {
    id: string
    title: string
    status: string
    seoScore: number | null
    updatedAt: string
    authorName: string
}

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
            className="px-2.5 py-1 rounded-lg text-xs capitalize whitespace-nowrap"
            style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
        >
      {status}
    </span>
    )
}

function SeoScore({ score }: { score: number | null }) {
    if (!score) return <span style={{ color: "#7c7c7c" }}>—</span>
    const color = score >= 80 ? "#05df72" : score >= 60 ? "#00f3ff" : "#ffb900"
    return <span style={{ color, fontSize: "14px" }}>{score}/100</span>
}

export default function DraftsClient({ posts: initialPosts }: { posts: Post[] }) {
    const router = useRouter()
    const [posts, setPosts] = useState(initialPosts)
    const [loading, setLoading] = useState<string | null>(null)
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

    const handleStatusChange = async (id: string, status: string) => {
        setLoading(id + status)
        const res = await fetch(`/api/posts/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        })
        if (res.ok) {
            setPosts(posts.map(p => p.id === id ? { ...p, status } : p))
            router.refresh()
        }
        setLoading(null)
    }

    const handleDelete = async (id: string) => {
        setLoading(id + "delete")
        const res = await fetch(`/api/posts/${id}`, { method: "DELETE" })
        if (res.ok) {
            setPosts(posts.filter(p => p.id !== id))
            setConfirmDelete(null)
        }
        setLoading(null)
    }

    return (
        <div className="p-8 flex flex-col gap-6">

            {/* Filters */}
            <div
                className="rounded-2xl border p-4 flex items-center gap-4"
                style={{
                    backgroundColor: "#2d312f",
                    borderColor: "rgba(124,124,124,0.3)",
                    boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                }}
            >
                <div className="relative flex-1 max-w-xs">
                    <input
                        type="text"
                        placeholder="Search in drafts..."
                        className="w-full h-11 pl-10 pr-4 rounded-xl text-sm outline-none"
                        style={{
                            backgroundColor: "rgba(238,229,233,0.06)",
                            border: "1px solid rgba(146,220,229,0.14)",
                            color: "#eee5e9",
                        }}
                    />
                    <svg className="absolute left-3 top-3" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c7c7c" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                </div>
                <div className="flex items-center gap-3">
                    {["All Status", "All Categories", "Newest First"].map(label => (
                        <select key={label} className="h-10 px-3 rounded-xl text-sm outline-none"
                                style={{ backgroundColor: "rgba(238,229,233,0.06)", border: "1px solid rgba(146,220,229,0.14)", color: "#eee5e9" }}>
                            <option>{label}</option>
                        </select>
                    ))}
                </div>
                <Link
                    href="/generate"
                    className="flex items-center gap-2 px-4 h-11 rounded-xl text-sm font-medium whitespace-nowrap ml-auto"
                    style={{ backgroundColor: "#00f3ff", color: "#383d3b", boxShadow: "0px 0px 16px 0px rgba(0,243,255,0.3)" }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#383d3b">
                        <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
                    </svg>
                    Create New Draft
                </Link>
            </div>

            {/* Delete confirm modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
                    <div className="rounded-2xl border p-6 flex flex-col gap-4 w-80" style={{ backgroundColor: "#2d312f", borderColor: "rgba(124,124,124,0.3)" }}>
                        <h3 className="text-base" style={{ color: "#eee5e9" }}>Artikel verwijderen?</h3>
                        <p className="text-sm" style={{ color: "#7c7c7c" }}>
                            Dit kan niet ongedaan worden gemaakt.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDelete(confirmDelete)}
                                disabled={loading === confirmDelete + "delete"}
                                className="flex-1 h-10 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
                                style={{ backgroundColor: "#ff3b30", color: "#fff" }}
                            >
                                {loading === confirmDelete + "delete" ? "Verwijderen..." : "Verwijderen"}
                            </button>
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 h-10 rounded-xl text-sm transition-opacity hover:opacity-80"
                                style={{ border: "1px solid rgba(124,124,124,0.3)", color: "#7c7c7c" }}
                            >
                                Annuleren
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div
                className="rounded-2xl border overflow-hidden"
                style={{
                    backgroundColor: "#2d312f",
                    borderColor: "rgba(124,124,124,0.3)",
                    boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                }}
            >
                <table className="w-full">
                    <thead>
                    <tr style={{ backgroundColor: "rgba(56,61,59,0.5)", borderBottom: "1px solid rgba(124,124,124,0.3)" }}>
                        {[
                            { label: "Title", width: "36%" },
                            { label: "Last Modified", width: "13%" },
                            { label: "Author", width: "13%" },
                            { label: "SEO Score", width: "11%" },
                            { label: "Status", width: "13%" },
                            { label: "Actions", width: "14%" },
                        ].map(h => (
                            <th key={h.label} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                                style={{ color: "#92dce5", width: h.width }}>
                                {h.label}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {posts.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-16 text-center text-sm" style={{ color: "#7c7c7c" }}>
                                Nog geen drafts.{" "}
                                <Link href="/generate" style={{ color: "#00f3ff" }}>Genereer je eerste artikel</Link>
                            </td>
                        </tr>
                    ) : (
                        posts.map((post, i) => (
                            <tr key={post.id} style={{ borderBottom: i < posts.length - 1 ? "1px solid rgba(238,229,233,0.06)" : "none" }}>
                                <td className="px-6 py-5">
                                    <Link href={`/drafts/${post.id}`} className="text-sm leading-6 hover:text-[#00f3ff] transition-colors" style={{ color: "#eee5e9" }}>
                                        {post.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-5 text-sm" style={{ color: "#7c7c7c" }}>
                                    {new Date(post.updatedAt).toLocaleDateString("nl-NL", { dateStyle: "medium" })}
                                </td>
                                <td className="px-6 py-5 text-sm" style={{ color: "#eee5e9" }}>{post.authorName}</td>
                                <td className="px-6 py-5"><SeoScore score={post.seoScore} /></td>
                                <td className="px-6 py-5"><StatusChip status={post.status} /></td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-1">

                                        {/* Approve */}
                                        {post.status !== "published" && post.status !== "approved" && (
                                            <button
                                                onClick={() => handleStatusChange(post.id, "approved")}
                                                disabled={loading === post.id + "approved"}
                                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-green-500/10 transition-colors"
                                                style={{ color: "#05df72" }}
                                                title="Approve"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                </svg>
                                            </button>
                                        )}

                                        {/* Publish */}
                                        {(post.status === "approved" || post.status === "draft") && (
                                            <button
                                                onClick={() => handleStatusChange(post.id, "published")}
                                                disabled={loading === post.id + "published"}
                                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-cyan-500/10 transition-colors"
                                                style={{ color: "#00f3ff" }}
                                                title="Publish"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                                </svg>
                                            </button>
                                        )}

                                        {/* Edit */}
                                        <Link
                                            href={`/drafts/${post.id}`}
                                            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
                                            style={{ color: "#7c7c7c" }}
                                            title="Bewerken"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                            </svg>
                                        </Link>

                                        {/* Delete */}
                                        <button
                                            onClick={() => setConfirmDelete(post.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-500/10 transition-colors"
                                            style={{ color: "#7c7c7c" }}
                                            title="Verwijderen"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}