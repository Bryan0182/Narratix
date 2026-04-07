"use client"

import { useState } from "react"
import Link from "next/link"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

type ScheduledPost = {
    id: string
    title: string
    scheduledAt: string
    seoScore: number | null
    wordCount: number
    authorName: string
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay()
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
}

export default function SchedulerClient({ posts }: { posts: ScheduledPost[] }) {
    const today = new Date()
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
    const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(posts[0] ?? null)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
    const goToToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))

    const getPostsForDay = (day: number) =>
        posts.filter(p => {
            const d = new Date(p.scheduledAt)
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
        })

    const cells: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)

    const isToday = (day: number) =>
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

    const isSelectedDay = (day: number) =>
        selectedPost
            ? new Date(selectedPost.scheduledAt).getDate() === day &&
            new Date(selectedPost.scheduledAt).getMonth() === month &&
            new Date(selectedPost.scheduledAt).getFullYear() === year
            : false

    return (
        <div className="p-8 flex gap-6 h-full">

            {/* Calendar */}
            <div className="flex-1 flex flex-col min-w-0">
                <div
                    className="rounded-2xl border p-6 flex flex-col gap-6"
                    style={{
                        backgroundColor: "#2d312f",
                        borderColor: "rgba(124,124,124,0.3)",
                        boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl" style={{ color: "#eee5e9" }}>
                            {MONTHS[month]} {year}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors" style={{ color: "#eee5e9" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
                            </button>
                            <button onClick={goToToday} className="px-3 h-7 rounded-xl text-sm hover:bg-white/10 transition-colors" style={{ color: "#00f3ff" }}>
                                Today
                            </button>
                            <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors" style={{ color: "#eee5e9" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-2">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-xs uppercase tracking-wider py-1" style={{ color: "#7c7c7c" }}>{d}</div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {cells.map((day, i) => {
                            if (!day) return <div key={`empty-${i}`} />
                            const dayPosts = getPostsForDay(day)
                            const isCurrentDay = isToday(day)
                            const isSelected = isSelectedDay(day)

                            return (
                                <div
                                    key={day}
                                    className="min-h-[100px] p-2 rounded-xl border flex flex-col gap-1"
                                    style={{
                                        backgroundColor: "#2d312f",
                                        borderColor: isSelected ? "#00f3ff" : "rgba(124,124,124,0.3)",
                                        boxShadow: isSelected ? "0px 0px 16px 0px rgba(0,243,255,0.2)" : "none",
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm" style={{ color: isCurrentDay ? "#00f3ff" : "#eee5e9" }}>{day}</span>
                                        {dayPosts.length > 0 && <span className="text-xs" style={{ color: "#7c7c7c" }}>{dayPosts.length}</span>}
                                    </div>
                                    {dayPosts.map(post => (
                                        <button
                                            key={post.id}
                                            onClick={() => setSelectedPost(post)}
                                            className="w-full text-left p-1.5 rounded text-xs leading-tight transition-colors hover:opacity-80"
                                            style={{
                                                backgroundColor: selectedPost?.id === post.id ? "rgba(0,243,255,0.15)" : "rgba(56,61,59,0.8)",
                                                border: `1px solid ${selectedPost?.id === post.id ? "rgba(0,243,255,0.3)" : "rgba(124,124,124,0.3)"}`,
                                                color: "#eee5e9",
                                            }}
                                        >
                                            <div className="truncate">{post.title}</div>
                                            <div style={{ color: "#7c7c7c" }}>{formatTime(post.scheduledAt)}</div>
                                        </button>
                                    ))}
                                </div>
                            )
                        })}
                    </div>

                    {/* Leeg state */}
                    {posts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                            <p className="text-sm" style={{ color: "#7c7c7c" }}>Geen ingeplande artikelen deze maand.</p>
                            <Link href="/drafts" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "#00f3ff" }}>
                                Plan een artikel in via Drafts →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Panel */}
            <div
                className="w-80 shrink-0 rounded-2xl border flex flex-col"
                style={{
                    backgroundColor: "#2d312f",
                    borderColor: "rgba(124,124,124,0.3)",
                    boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                }}
            >
                {selectedPost ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-4">
                            <h3 className="text-base" style={{ color: "#eee5e9" }}>Scheduled Post Details</h3>
                            <span className="text-xs px-3 py-1 rounded-lg" style={{ backgroundColor: "rgba(0,243,255,0.2)", color: "#00f3ff", border: "1px solid rgba(0,243,255,0.3)" }}>
                scheduled
              </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col gap-5 px-6 overflow-y-auto">

                            <div className="flex flex-col gap-2">
                                <p className="text-xs uppercase tracking-wider" style={{ color: "#7c7c7c" }}>Title</p>
                                <p className="text-base leading-6" style={{ color: "#eee5e9" }}>{selectedPost.title}</p>
                            </div>

                            {/* Date & Time */}
                            <div className="flex gap-3">
                                <div className="flex-1 flex flex-col gap-1 p-3 rounded-xl border" style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}>
                                    <div className="flex items-center gap-2">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#7c7c7c"><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14z" /></svg>
                                        <p className="text-xs" style={{ color: "#7c7c7c" }}>Date</p>
                                    </div>
                                    <p className="text-sm" style={{ color: "#eee5e9" }}>
                                        {new Date(selectedPost.scheduledAt).toLocaleDateString("nl-NL", { dateStyle: "medium" })}
                                    </p>
                                </div>
                                <div className="flex-1 flex flex-col gap-1 p-3 rounded-xl border" style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}>
                                    <div className="flex items-center gap-2">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#7c7c7c"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7z" /></svg>
                                        <p className="text-xs" style={{ color: "#7c7c7c" }}>Time</p>
                                    </div>
                                    <p className="text-sm" style={{ color: "#eee5e9" }}>{formatTime(selectedPost.scheduledAt)}</p>
                                </div>
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c7c7c"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                <div>
                                    <p className="text-xs" style={{ color: "#7c7c7c" }}>Author</p>
                                    <p className="text-sm" style={{ color: "#eee5e9" }}>{selectedPost.authorName}</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-3">
                                <div className="flex-1 flex flex-col gap-1 p-3 rounded-xl border" style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}>
                                    <p className="text-xs" style={{ color: "#7c7c7c" }}>Word Count</p>
                                    <p className="text-base" style={{ color: "#eee5e9" }}>{selectedPost.wordCount.toLocaleString("nl-NL")}</p>
                                </div>
                                <div className="flex-1 flex flex-col gap-1 p-3 rounded-xl border" style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}>
                                    <p className="text-xs" style={{ color: "#7c7c7c" }}>SEO Score</p>
                                    <p className="text-base" style={{ color: "#00f3ff" }}>{selectedPost.seoScore ? `${selectedPost.seoScore}/100` : "—"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 p-6 border-t" style={{ borderColor: "rgba(124,124,124,0.3)" }}>
                            <div className="flex gap-3">
                                <button className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm transition-opacity hover:opacity-80" style={{ border: "1px solid #92dce5", color: "#92dce5" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" /></svg>
                                    Reschedule
                                </button>
                                <Link href={`/drafts/${selectedPost.id}`} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm transition-opacity hover:opacity-80" style={{ border: "1px solid #92dce5", color: "#92dce5" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                                    Edit Post
                                </Link>
                            </div>

                            <button
                                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
                                style={{ backgroundColor: "#00f3ff", color: "#383d3b", boxShadow: "0px 0px 16px 0px rgba(0,243,255,0.3)" }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                Publish Now
                            </button>

                            <button className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm transition-opacity hover:opacity-80" style={{ color: "#7c7c7c" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                                Cancel Schedule
                            </button>

                            <div className="border-t pt-3" style={{ borderColor: "rgba(124,124,124,0.3)" }}>
                                <Link
                                    href="/drafts"
                                    className="w-full flex items-center justify-center h-10 rounded-xl text-sm transition-opacity hover:opacity-80"
                                    style={{ backgroundColor: "rgba(0,243,255,0.1)", border: "1px solid rgba(0,243,255,0.3)", color: "#00f3ff" }}
                                >
                                    + New Schedule
                                </Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(124,124,124,0.4)">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14z" />
                        </svg>
                        <p className="text-sm text-center" style={{ color: "#7c7c7c" }}>
                            Nog geen ingeplande artikelen. Plan een artikel in via de Drafts pagina.
                        </p>
                        <Link href="/drafts" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "#00f3ff" }}>
                            Naar Drafts →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}