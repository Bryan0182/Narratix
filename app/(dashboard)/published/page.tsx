import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"

function SeoScore({ score }: { score: number | null }) {
    if (!score) return <span style={{ color: "#7c7c7c" }}>—</span>
    const color = score >= 90 ? "#05df72" : score >= 70 ? "#00f3ff" : "#ffb900"
    return <span style={{ color, fontSize: "14px" }}>{score}/100</span>
}

export default async function PublishedPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login")

    const userId = session.user.id

    const [posts, totalPublished, postsWithSeo] = await Promise.all([
        prisma.post.findMany({
            where: { authorId: userId, status: "published" },
            orderBy: { publishedAt: "desc" },
            include: { author: { select: { name: true } } },
        }),
        prisma.post.count({ where: { authorId: userId, status: "published" } }),
        prisma.post.findMany({
            where: { authorId: userId, status: "published", seoScore: { not: null } },
            select: { seoScore: true, author: { select: { name: true } } },
        }),
    ])

    const avgSeoScore = postsWithSeo.length > 0
        ? Math.round(postsWithSeo.reduce((sum, p) => sum + (p.seoScore ?? 0), 0) / postsWithSeo.length)
        : 0

    // Top performing author
    const authorCounts: Record<string, number> = {}
    postsWithSeo.forEach(p => {
        const name = p.author.name ?? "Unknown"
        authorCounts[name] = (authorCounts[name] ?? 0) + (p.seoScore ?? 0)
    })
    const topAuthor = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

    return (
        <div className="p-8 flex flex-col gap-6">

            {/* Filters */}
            <div
                className="rounded-2xl border p-4 flex flex-col gap-4"
                style={{
                    backgroundColor: "#2d312f",
                    borderColor: "rgba(124,124,124,0.3)",
                    boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                }}
            >
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search by title or keyword"
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

                    {/* Dropdowns */}
                    {["All Status", "All Categories", "All Authors"].map(label => (
                        <select
                            key={label}
                            className="h-11 px-3 rounded-xl text-sm outline-none"
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

                <div className="flex items-center justify-between">
                    {/* Date range */}
                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            className="h-10 px-3 rounded-xl text-sm outline-none"
                            style={{
                                backgroundColor: "rgba(238,229,233,0.06)",
                                border: "1px solid rgba(146,220,229,0.14)",
                                color: "#7c7c7c",
                            }}
                        />
                        <span className="text-sm" style={{ color: "#7c7c7c" }}>to</span>
                        <input
                            type="date"
                            className="h-10 px-3 rounded-xl text-sm outline-none"
                            style={{
                                backgroundColor: "rgba(238,229,233,0.06)",
                                border: "1px solid rgba(146,220,229,0.14)",
                                color: "#7c7c7c",
                            }}
                        />
                    </div>

                    {/* Export CSV */}
                    <button
                        className="flex items-center gap-2 px-4 h-11 rounded-xl text-sm font-medium"
                        style={{
                            backgroundColor: "#00f3ff",
                            color: "#383d3b",
                            boxShadow: "0px 0px 16px 0px rgba(0,243,255,0.3)",
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#383d3b">
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                        </svg>
                        Export CSV
                    </button>
                </div>
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
                            { label: "Title", width: "22%" },
                            { label: "Author", width: "12%" },
                            { label: "Published Date", width: "13%" },
                            { label: "SEO Score", width: "10%" },
                            { label: "Target", width: "17%" },
                            { label: "Status", width: "12%" },
                            { label: "Actions", width: "14%" },
                        ].map(h => (
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
                            <td colSpan={7} className="px-6 py-16 text-center text-sm" style={{ color: "#7c7c7c" }}>
                                Nog geen gepubliceerde artikelen.{" "}
                                <Link href="/generate" style={{ color: "#00f3ff" }}>Genereer je eerste artikel</Link>.
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

                                {/* Author */}
                                <td className="px-6 py-5 text-sm" style={{ color: "#eee5e9" }}>
                                    {post.author.name}
                                </td>

                                {/* Published Date */}
                                <td className="px-6 py-5 text-sm" style={{ color: "#7c7c7c" }}>
                                    {post.publishedAt
                                        ? post.publishedAt.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })
                                        : post.updatedAt.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })
                                    }
                                </td>

                                {/* SEO Score */}
                                <td className="px-6 py-5">
                                    <SeoScore score={post.seoScore} />
                                </td>

                                {/* Target */}
                                <td className="px-6 py-5 text-sm" style={{ color: "#7c7c7c" }}>
                                    narratix.nl
                                </td>

                                {/* Status */}
                                <td className="px-6 py-5">
                    <span
                        className="px-2.5 py-1 rounded-lg text-xs capitalize"
                        style={{
                            backgroundColor: "rgba(0,201,80,0.2)",
                            color: "#05df72",
                            border: "1px solid rgba(0,201,80,0.3)",
                        }}
                    >
                      published
                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* View */}
                                        <Link
                                            href={`/drafts/${post.id}/full`}
                                            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
                                            style={{ color: "#7c7c7c" }}
                                            title="Bekijken"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                            </svg>
                                        </Link>

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

                                        {/* Archive */}
                                        <button
                                            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-500/10 transition-colors"
                                            style={{ color: "#7c7c7c" }}
                                            title="Archiveren"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.83 1H5.42l.82-1zM5 19V8h14v11H5zm8.45-9l-3.45 3.44V11H8v5h5v-2h-1.44L15 10.56z" />
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

            {/* KPI Cards onderaan */}
            <div className="grid grid-cols-3 gap-6">
                {[
                    { label: "Total Published", value: totalPublished, iconPath: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" },
                    { label: "Avg SEO Score", value: avgSeoScore > 0 ? `${avgSeoScore}/100` : "—", iconPath: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" },
                    { label: "Top Performing Author", value: topAuthor, iconPath: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
                ].map(card => (
                    <div
                        key={card.label}
                        className="rounded-2xl border p-6 flex flex-col gap-4"
                        style={{
                            backgroundColor: "#2d312f",
                            borderColor: "rgba(124,124,124,0.3)",
                            boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                        }}
                    >
                        <div
                            className="w-[42px] h-[42px] rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: "rgba(0,243,255,0.1)", border: "1px solid rgba(0,243,255,0.2)" }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#00f3ff">
                                <path d={card.iconPath} />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm mb-1" style={{ color: "#7c7c7c" }}>{card.label}</p>
                            <p className="text-3xl" style={{ color: "#eee5e9" }}>{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}