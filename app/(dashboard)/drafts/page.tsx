import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
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

export default async function DraftsPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login")

    const posts = await prisma.post.findMany({
        where: { authorId: session.user.id },
        orderBy: { updatedAt: "desc" },
    })

    return (
        <div className="p-8 flex flex-col gap-6">

            {/* Filters bar */}
            <div
                className="rounded-2xl border p-4 flex items-center justify-between gap-4"
                style={{
                    backgroundColor: "#2d312f",
                    borderColor: "rgba(124,124,124,0.3)",
                    boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                }}
            >
                {/* Search */}
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
                    <svg
                        className="absolute left-3 top-3"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7c7c7c"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                </div>

                {/* Dropdowns */}
                <div className="flex items-center gap-3">
                    {["All Status", "All Categories", "All Authors", "Newest First"].map((label) => (
                        <select
                            key={label}
                            className="h-10 px-3 rounded-xl text-sm outline-none"
                            style={{
                                backgroundColor: "rgba(238,229,233,0.06)",
                                border: "1px solid rgba(146,220,229,0.14)",
                                color: "#eee5e9",
                            }}
                        >
                            <option>{label}</option>
                        </select>
                    ))}
                </div>

                {/* Create button */}
                <Link
                    href="/generate"
                    className="flex items-center gap-2 px-4 h-11 rounded-xl text-sm font-medium whitespace-nowrap"
                    style={{
                        backgroundColor: "#00f3ff",
                        color: "#383d3b",
                        boxShadow: "0px 0px 16px 0px rgba(0,243,255,0.3)",
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#383d3b">
                        <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
                    </svg>
                    Create New Draft
                </Link>
            </div>

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
                        ].map((h) => (
                            <th
                                key={h.label}
                                className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                                style={{ color: "#92dce5", width: h.width }}
                            >
                                {h.label}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {posts.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-16 text-center text-sm" style={{ color: "#7c7c7c" }}>
                                Nog geen drafts. Klik op{" "}
                                <Link href="/generate" style={{ color: "#00f3ff" }}>
                                    Create New Draft
                                </Link>{" "}
                                om te beginnen.
                            </td>
                        </tr>
                    ) : (
                        posts.map((post, i) => (
                            <tr
                                key={post.id}
                                style={{
                                    borderBottom: i < posts.length - 1 ? "1px solid rgba(238,229,233,0.06)" : "none",
                                    borderLeft: i === 0 ? "2px solid #00f3ff" : "2px solid transparent",
                                    backgroundColor: i === 0 ? "rgba(0,243,255,0.08)" : "transparent",
                                }}
                            >
                                {/* Title */}
                                <td className="px-6 py-5">
                                    <Link
                                        href={`/drafts/${post.id}`}
                                        className="text-sm leading-6 hover:text-[#00f3ff] transition-colors"
                                        style={{ color: "#eee5e9" }}
                                    >
                                        {post.title}
                                    </Link>
                                </td>

                                {/* Last Modified */}
                                <td className="px-6 py-5 text-sm" style={{ color: "#7c7c7c" }}>
                                    {post.updatedAt.toLocaleDateString("nl-NL", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </td>

                                {/* Author */}
                                <td className="px-6 py-5 text-sm" style={{ color: "#eee5e9" }}>
                                    {session.user.name}
                                </td>

                                {/* SEO Score */}
                                <td className="px-6 py-5">
                                    <SeoScore score={post.seoScore} />
                                </td>

                                {/* Status */}
                                <td className="px-6 py-5">
                                    <StatusChip status={post.status} />
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* Edit */}
                                        <Link
                                            href={`/drafts/${post.id}`}
                                            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-white/10"
                                            style={{ color: "#7c7c7c" }}
                                            title="Bewerken"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                            </svg>
                                        </Link>

                                        {/* Delete */}
                                        <button
                                            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-red-500/10"
                                            style={{ color: "#7c7c7c" }}
                                            title="Verwijderen"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                            </svg>
                                        </button>

                                        {/* Schedule */}
                                        <button
                                            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-white/10"
                                            style={{ color: "#7c7c7c" }}
                                            title="Inplannen"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
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