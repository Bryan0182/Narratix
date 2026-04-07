import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getOrCreateOrganization } from "@/lib/organization"

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

function KPICard({
                     label,
                     value,
                     trend,
                     iconPath,
                 }: {
    label: string
    value: string | number
    trend?: string
    iconPath: string
}) {
    return (
        <div
            className="flex flex-col gap-4 p-6 rounded-2xl border"
            style={{
                backgroundColor: "#2d312f",
                borderColor: "rgba(124,124,124,0.3)",
                boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
            }}
        >
            <div className="flex items-start justify-between">
                <div
                    className="w-[42px] h-[42px] rounded-xl flex items-center justify-center"
                    style={{
                        backgroundColor: "rgba(0,243,255,0.1)",
                        border: "1px solid rgba(0,243,255,0.2)",
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#00f3ff">
                        <path d={iconPath} />
                    </svg>
                </div>
                {trend && (
                    <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: "rgba(5,223,114,0.1)", color: "#05df72" }}
                    >
            {trend}
          </span>
                )}
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-sm" style={{ color: "#7c7c7c" }}>{label}</p>
                <p className="text-3xl" style={{ color: "#eee5e9" }}>{value}</p>
            </div>
        </div>
    )
}

function timeAgo(date: Date): string {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 60) return `${minutes} minuten geleden`
    if (hours < 24) return `${hours} uur geleden`
    return `${days} dag${days > 1 ? "en" : ""} geleden`
}

export default async function DashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login")

    const org = await getOrCreateOrganization(session.user.id, session.user.name ?? "User")
    const orgId = org.id

    const [drafts, inReview, scheduled, published, postsWithSeo, recentPosts] = await Promise.all([
        prisma.post.count({ where: { organizationId: orgId, status: "draft" } }),
        prisma.post.count({ where: { organizationId: orgId, status: "in review" } }),
        prisma.post.count({ where: { organizationId: orgId, status: "scheduled" } }),
        prisma.post.count({ where: { organizationId: orgId, status: "published" } }),
        prisma.post.findMany({
            where: { organizationId: orgId, seoScore: { not: null } },
            select: { seoScore: true },
        }),
        prisma.post.findMany({
            where: { organizationId: orgId },
            orderBy: { updatedAt: "desc" },
            take: 5,
            select: {
                id: true,
                title: true,
                status: true,
                updatedAt: true,
                author: { select: { name: true } },
            },
        }),
    ])

    const avgSeoScore = postsWithSeo.length > 0
        ? Math.round(postsWithSeo.reduce((sum, p) => sum + (p.seoScore ?? 0), 0) / postsWithSeo.length)
        : 0

    const totalPosts = drafts + inReview + scheduled + published

    const initials = session.user.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "?"

    return (
        <div className="p-8 flex flex-col gap-8">

            {/* KPI Cards */}
            <div className="grid grid-cols-5 gap-6">
                <KPICard
                    label="Drafts"
                    value={drafts}
                    iconPath="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"
                />
                <KPICard
                    label="In Review"
                    value={inReview}
                    iconPath="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7z"
                />
                <KPICard
                    label="Scheduled"
                    value={scheduled}
                    iconPath="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14z"
                />
                <KPICard
                    label="Published"
                    value={published}
                    iconPath="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                />
                <KPICard
                    label="Avg SEO Score"
                    value={avgSeoScore > 0 ? avgSeoScore : "—"}
                    iconPath="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
                />
            </div>

            {/* Recent Activity */}
            <div
                className="rounded-2xl border overflow-hidden"
                style={{
                    backgroundColor: "#2d312f",
                    borderColor: "rgba(124,124,124,0.3)",
                    boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                }}
            >
                <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(124,124,124,0.3)" }}>
                    <h2 className="text-lg font-medium" style={{ color: "#eee5e9" }}>Recent Activity</h2>
                </div>

                {recentPosts.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm mb-3" style={{ color: "#7c7c7c" }}>
                            Nog geen activiteit. Genereer je eerste blog post!
                        </p>
                        <Link
                            href="/generate"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-opacity hover:opacity-80"
                            style={{
                                background: "linear-gradient(135deg, #ad46ff 0%, #f6339a 100%)",
                                color: "#eee5e9",
                            }}
                        >
                            ✨ AI Generate
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                        <tr style={{ borderBottom: "1px solid rgba(124,124,124,0.3)" }}>
                            {["Auteur", "Actie", "Artikel", "Datum", "Status"].map((h) => (
                                <th
                                    key={h}
                                    className="px-6 py-3 text-left text-sm font-bold"
                                    style={{ color: "#7c7c7c" }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {recentPosts.map((post, i) => (
                            <tr
                                key={post.id}
                                style={{ borderBottom: i < recentPosts.length - 1 ? "1px solid rgba(124,124,124,0.15)" : "none" }}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                                            style={{
                                                background: "linear-gradient(to bottom, #00f3ff, #92dce5)",
                                                color: "#383d3b",
                                            }}
                                        >
                                            {initials}
                                        </div>
                                        <span className="text-sm" style={{ color: "#eee5e9" }}>
                        {post.author.name}
                      </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm" style={{ color: "#eee5e9" }}>
                                    {post.status === "draft" ? "Aangemaakt" : "Bijgewerkt"}
                                </td>
                                <td className="px-6 py-4 text-sm max-w-xs" style={{ color: "#eee5e9" }}>
                                    <Link
                                        href={`/drafts/${post.id}`}
                                        className="hover:text-[#00f3ff] transition-colors truncate block"
                                    >
                                        {post.title.length > 50 ? post.title.slice(0, 50) + "..." : post.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-sm" style={{ color: "#7c7c7c" }}>
                                    {timeAgo(post.updatedAt)}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusChip status={post.status} />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-2 gap-6">

                {/* Quick Actions */}
                <div
                    className="rounded-2xl border p-6 flex flex-col gap-4"
                    style={{
                        backgroundColor: "#2d312f",
                        borderColor: "rgba(124,124,124,0.3)",
                        boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                    }}
                >
                    <h3 className="text-base" style={{ color: "#eee5e9" }}>Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/drafts/new"
                              className="flex flex-col items-center gap-2 pt-[17px] px-[17px] pb-4 rounded-xl border transition-opacity hover:opacity-80"
                              style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                        >
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                                 style={{ background: "linear-gradient(to bottom, #00f3ff, #92dce5)" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#383d3b">
                                    <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
                                </svg>
                            </div>
                            <span className="text-sm" style={{ color: "#eee5e9" }}>New Draft</span>
                        </Link>

                        <Link href="/generate"
                              className="flex flex-col items-center gap-2 pt-[17px] px-[17px] pb-4 rounded-xl border transition-opacity hover:opacity-80"
                              style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                        >
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                                 style={{ background: "linear-gradient(135deg, rgb(173,70,255) 0%, rgb(246,51,154) 100%)" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
                                </svg>
                            </div>
                            <span className="text-sm" style={{ color: "#eee5e9" }}>AI Generate</span>
                        </Link>

                        <button
                            className="flex flex-col items-center gap-2 pt-[17px] px-[17px] pb-4 rounded-xl border transition-opacity hover:opacity-80"
                            style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                        >
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                                 style={{ background: "linear-gradient(135deg, rgb(0,201,80) 0%, rgb(0,188,125) 100%)" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                                </svg>
                            </div>
                            <span className="text-sm" style={{ color: "#eee5e9" }}>Import Content</span>
                        </button>

                        <button
                            className="flex flex-col items-center gap-2 pt-[17px] px-[17px] pb-4 rounded-xl border transition-opacity hover:opacity-80"
                            style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                        >
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                                 style={{ background: "linear-gradient(135deg, rgb(255,105,0) 0%, rgb(254,154,0) 100%)" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
                                </svg>
                            </div>
                            <span className="text-sm" style={{ color: "#eee5e9" }}>Templates</span>
                        </button>
                    </div>
                </div>

                {/* Stats overzicht */}
                <div
                    className="rounded-2xl border p-6 flex flex-col gap-4"
                    style={{
                        backgroundColor: "#2d312f",
                        borderColor: "rgba(124,124,124,0.3)",
                        boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                    }}
                >
                    <h3 className="text-base" style={{ color: "#eee5e9" }}>Jouw statistieken</h3>

                    {totalPosts === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8">
                            <p className="text-sm" style={{ color: "#7c7c7c" }}>
                                Nog geen artikelen. Begin met genereren!
                            </p>
                            <Link
                                href="/generate"
                                className="text-sm hover:opacity-80 transition-opacity"
                                style={{ color: "#00f3ff" }}
                            >
                                ✨ Genereer je eerste artikel →
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {[
                                { label: "Totaal artikelen", value: totalPosts, color: "#eee5e9" },
                                { label: "Gepubliceerd", value: published, color: "#05df72" },
                                { label: "In behandeling", value: drafts + inReview, color: "#ffb900" },
                                { label: "Gemiddelde SEO score", value: avgSeoScore > 0 ? `${avgSeoScore}/100` : "—", color: "#00f3ff" },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex items-center justify-between p-3 rounded-xl border"
                                    style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                                >
                                    <span className="text-sm" style={{ color: "#7c7c7c" }}>{stat.label}</span>
                                    <span className="text-sm font-medium" style={{ color: stat.color }}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}