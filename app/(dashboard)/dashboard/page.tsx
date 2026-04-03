import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

// Status chip component
function StatusChip({ status }: { status: string }) {
    const styles: Record<string, { bg: string; color: string; border: string }> = {
        draft: {
            bg: "transparent",
            color: "#7c7c7c",
            border: "rgba(124,124,124,0.3)",
        },
        "in review": {
            bg: "rgba(146,220,229,0.2)",
            color: "#92dce5",
            border: "rgba(146,220,229,0.3)",
        },
        scheduled: {
            bg: "rgba(0,243,255,0.2)",
            color: "#00f3ff",
            border: "rgba(0,243,255,0.3)",
        },
        published: {
            bg: "rgba(0,201,80,0.2)",
            color: "#05df72",
            border: "rgba(0,201,80,0.3)",
        },
        pending: {
            bg: "rgba(254,154,0,0.2)",
            color: "#ffb900",
            border: "rgba(254,154,0,0.3)",
        },
    }

    const style = styles[status.toLowerCase()] ?? styles.draft

    return (
        <span
            className="px-2 py-1 rounded-lg text-xs capitalize"
            style={{
                backgroundColor: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
            }}
        >
      {status}
    </span>
    )
}

// KPI Card component
function KPICard({
                     label,
                     value,
                     trend,
                 }: {
    label: string
    value: string | number
    trend?: string
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
                        <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
                    </svg>
                </div>
                {trend && (
                    <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                            backgroundColor: "rgba(5,223,114,0.1)",
                            color: "#05df72",
                        }}
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

// Recente activiteit data (later vervangen door echte data)
const recentActivity = [
    { user: "Sarah Chen", initials: "SC", action: "Created", target: "10 AI Trends Shaping Content...", date: "2 hours ago", status: "draft" },
    { user: "Michael Torres", initials: "MT", action: "Submitted for Review", target: "How to Build a Content Strategy...", date: "5 hours ago", status: "in review" },
    { user: "Emma Johnson", initials: "EJ", action: "Scheduled", target: "The Future of Blogging...", date: "1 day ago", status: "scheduled" },
    { user: "David Park", initials: "DP", action: "Published", target: "AI Writing Tools Comparison 2025", date: "2 days ago", status: "published" },
    { user: "Lisa Anderson", initials: "LA", action: "Created", target: "SEO Best Practices for 2025", date: "3 days ago", status: "draft" },
]

export default async function DashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login")

    return (
        <div className="p-8 flex flex-col gap-8">

            {/* KPI Cards */}
            <div className="grid grid-cols-5 gap-6">
                <KPICard label="Drafts" value="24" trend="+12%" />
                <KPICard label="In Review" value="8" trend="+3" />
                <KPICard label="Scheduled" value="15" />
                <KPICard label="Published" value="142" trend="+8%" />
                <KPICard label="Avg SEO Score" value="87" trend="+5" />
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
                <div
                    className="px-6 py-5 border-b"
                    style={{ borderColor: "rgba(124,124,124,0.3)" }}
                >
                    <h2 className="text-lg font-medium" style={{ color: "#eee5e9" }}>
                        Recent Activity
                    </h2>
                </div>
                <table className="w-full">
                    <thead>
                    <tr style={{ borderBottom: "1px solid rgba(124,124,124,0.3)" }}>
                        {["User", "Action", "Target", "Date", "Status"].map((h) => (
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
                    {recentActivity.map((row, i) => (
                        <tr
                            key={i}
                            style={{ borderBottom: "1px solid rgba(124,124,124,0.15)" }}
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
                                        {row.initials}
                                    </div>
                                    <span className="text-sm" style={{ color: "#eee5e9" }}>
                      {row.user}
                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm" style={{ color: "#eee5e9" }}>
                                {row.action}
                            </td>
                            <td className="px-6 py-4 text-sm max-w-xs truncate" style={{ color: "#eee5e9" }}>
                                {row.target}
                            </td>
                            <td className="px-6 py-4 text-sm" style={{ color: "#7c7c7c" }}>
                                {row.date}
                            </td>
                            <td className="px-6 py-4">
                                <StatusChip status={row.status} />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
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
                        {[
                            { label: "New Draft", gradient: "linear-gradient(to bottom, #00f3ff, #92dce5)" },
                            { label: "AI Generate", gradient: "linear-gradient(135deg, #ad46ff 0%, #f6339a 100%)" },
                            { label: "Import Content", gradient: "linear-gradient(135deg, #00c950 0%, #00bc7d 100%)" },
                            { label: "Templates", gradient: "linear-gradient(135deg, #ff6900 0%, #fe9a00 100%)" },
                        ].map((action) => (
                            <button
                                key={action.label}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-opacity hover:opacity-80"
                                style={{
                                    backgroundColor: "rgba(56,61,59,0.5)",
                                    borderColor: "rgba(124,124,124,0.3)",
                                }}
                            >
                                <div
                                    className="w-11 h-11 rounded-xl"
                                    style={{ background: action.gradient }}
                                />
                                <span className="text-sm" style={{ color: "#eee5e9" }}>
                  {action.label}
                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Upcoming Posts */}
                <div
                    className="rounded-2xl border p-6 flex flex-col gap-4"
                    style={{
                        backgroundColor: "#2d312f",
                        borderColor: "rgba(124,124,124,0.3)",
                        boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                    }}
                >
                    <h3 className="text-base" style={{ color: "#eee5e9" }}>Upcoming Posts</h3>
                    <div className="flex flex-col gap-3">
                        {[
                            { title: "AI Content Marketing Guide", date: "Oct 20", time: "10:00 AM" },
                            { title: "SEO Optimization Tips", date: "Oct 21", time: "2:00 PM" },
                            { title: "Social Media Strategy 2025", date: "Oct 22", time: "9:00 AM" },
                        ].map((post, i) => (
                            <div
                                key={i}
                                className="flex flex-col gap-1 p-3 rounded-xl border"
                                style={{
                                    backgroundColor: "rgba(56,61,59,0.5)",
                                    borderColor: "rgba(124,124,124,0.3)",
                                }}
                            >
                                <p className="text-sm" style={{ color: "#eee5e9" }}>{post.title}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs" style={{ color: "#7c7c7c" }}>📅 {post.date}</span>
                                    <span className="text-xs" style={{ color: "#7c7c7c" }}>🕐 {post.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        className="w-full py-2.5 rounded-xl text-sm text-center border transition-opacity hover:opacity-80"
                        style={{
                            backgroundColor: "rgba(0,243,255,0.1)",
                            borderColor: "rgba(0,243,255,0.3)",
                            color: "#00f3ff",
                        }}
                    >
                        View All Scheduled
                    </button>
                </div>
            </div>
        </div>
    )
}