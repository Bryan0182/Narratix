"use client"

import { useState } from "react"
import Link from "next/link"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

// Mock scheduled posts — later vervangen door echte database data
const scheduledPosts = [
    { id: "1", title: "AI Writing Tools Comparison 2025", date: new Date(2026, 3, 19), time: "1:00 PM", author: "Bryan", wordCount: 1847, seoScore: 88 },
    { id: "2", title: "10 AI Trends Shaping Content Marketing", date: new Date(2026, 3, 21), time: "10:00 AM", author: "Bryan", wordCount: 2341, seoScore: 92 },
    { id: "3", title: "SEO Best Practices for AI Content", date: new Date(2026, 3, 21), time: "3:30 PM", author: "Bryan", wordCount: 1563, seoScore: 85 },
    { id: "4", title: "How to Build a Content Strategy with AI", date: new Date(2026, 3, 23), time: "2:00 PM", author: "Bryan", wordCount: 1932, seoScore: 88 },
    { id: "5", title: "The Future of Blogging: AI-Powered Workflows", date: new Date(2026, 3, 25), time: "9:00 AM", author: "Bryan", wordCount: 2105, seoScore: 91 },
    { id: "6", title: "Content Automation: A Beginner's Guide", date: new Date(2026, 3, 28), time: "11:00 AM", author: "Bryan", wordCount: 1678, seoScore: 84 },
    { id: "7", title: "Measuring Content ROI in the AI Era", date: new Date(2026, 3, 30), time: "10:00 AM", author: "Bryan", wordCount: 2087, seoScore: 89 },
]

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay()
}

function getPostsForDay(day: number, month: number, year: number) {
    return scheduledPosts.filter(p =>
        p.date.getDate() === day &&
        p.date.getMonth() === month &&
        p.date.getFullYear() === year
    )
}

export default function SchedulerPage() {
    const today = new Date()
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
    const [selectedPost, setSelectedPost] = useState(scheduledPosts[3])

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
    const goToToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))

    // Bouw kalender grid
    const cells: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)

    const isToday = (day: number) =>
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

    return (
        <div className="p-8 flex gap-6 h-full">

            {/* Calendar */}
            <div className="flex-1 flex flex-col min-w-0">
                <div
                    className="rounded-2xl border p-6 flex flex-col gap-6 overflow-hidden"
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
                            <button
                                onClick={prevMonth}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
                                style={{ color: "#eee5e9" }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                </svg>
                            </button>
                            <button
                                onClick={goToToday}
                                className="px-3 h-7 rounded-xl text-sm hover:bg-white/10 transition-colors"
                                style={{ color: "#00f3ff" }}
                            >
                                Today
                            </button>
                            <button
                                onClick={nextMonth}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
                                style={{ color: "#eee5e9" }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-2">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-xs uppercase tracking-wider py-1" style={{ color: "#7c7c7c" }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {cells.map((day, i) => {
                            if (!day) return <div key={`empty-${i}`} />

                            const posts = getPostsForDay(day, month, year)
                            const isCurrentDay = isToday(day)
                            const isSelected = selectedPost && posts.some(p => p.id === selectedPost.id)

                            return (
                                <div
                                    key={day}
                                    className="min-h-[100px] p-2 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all"
                                    style={{
                                        backgroundColor: "#2d312f",
                                        borderColor: isSelected
                                            ? "#00f3ff"
                                            : "rgba(124,124,124,0.3)",
                                        boxShadow: isSelected
                                            ? "0px 0px 16px 0px rgba(0,243,255,0.2)"
                                            : "none",
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                    <span
                        className="text-sm"
                        style={{ color: isCurrentDay ? "#00f3ff" : "#eee5e9" }}
                    >
                      {day}
                    </span>
                                        {posts.length > 0 && (
                                            <span className="text-xs" style={{ color: "#7c7c7c" }}>
                        {posts.length}
                      </span>
                                        )}
                                    </div>
                                    {posts.map(post => (
                                        <button
                                            key={post.id}
                                            onClick={() => setSelectedPost(post)}
                                            className="w-full text-left p-1.5 rounded text-xs leading-tight truncate transition-colors"
                                            style={{
                                                backgroundColor: "rgba(56,61,59,0.8)",
                                                border: "1px solid rgba(124,124,124,0.3)",
                                                color: "#eee5e9",
                                            }}
                                        >
                                            <div className="truncate">{post.title}</div>
                                            <div style={{ color: "#7c7c7c" }}>{post.time}</div>
                                        </button>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
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
                            <span
                                className="text-xs px-3 py-1 rounded-lg capitalize"
                                style={{
                                    backgroundColor: "rgba(0,243,255,0.2)",
                                    color: "#00f3ff",
                                    border: "1px solid rgba(0,243,255,0.3)",
                                }}
                            >
                scheduled
              </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col gap-5 px-6 overflow-y-auto">
                            {/* Title */}
                            <div className="flex flex-col gap-2">
                                <p className="text-xs uppercase tracking-wider" style={{ color: "#7c7c7c" }}>Title</p>
                                <p className="text-base leading-6" style={{ color: "#eee5e9" }}>{selectedPost.title}</p>
                            </div>

                            {/* Date & Time */}
                            <div className="flex gap-3">
                                <div
                                    className="flex-1 flex flex-col gap-1 p-3 rounded-xl border"
                                    style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#7c7c7c">
                                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14z" />
                                        </svg>
                                        <p className="text-xs" style={{ color: "#7c7c7c" }}>Date</p>
                                    </div>
                                    <p className="text-sm" style={{ color: "#eee5e9" }}>
                                        {selectedPost.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                </div>
                                <div
                                    className="flex-1 flex flex-col gap-1 p-3 rounded-xl border"
                                    style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#7c7c7c">
                                            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7z" />
                                        </svg>
                                        <p className="text-xs" style={{ color: "#7c7c7c" }}>Time</p>
                                    </div>
                                    <p className="text-sm" style={{ color: "#eee5e9" }}>{selectedPost.time}</p>
                                </div>
                            </div>

                            {/* Target & Author */}
                            <div className="flex flex-col gap-3">
                                <div
                                    className="flex items-center gap-3 p-3 rounded-xl border"
                                    style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c7c7c">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                    </svg>
                                    <div>
                                        <p className="text-xs" style={{ color: "#7c7c7c" }}>Target Website</p>
                                        <p className="text-sm" style={{ color: "#eee5e9" }}>blog.narratix.nl</p>
                                    </div>
                                </div>
                                <div
                                    className="flex items-center gap-3 p-3 rounded-xl border"
                                    style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c7c7c">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                    <div>
                                        <p className="text-xs" style={{ color: "#7c7c7c" }}>Author</p>
                                        <p className="text-sm" style={{ color: "#eee5e9" }}>{selectedPost.author}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-3">
                                <div
                                    className="flex-1 flex flex-col gap-1 p-3 rounded-xl border"
                                    style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                                >
                                    <p className="text-xs" style={{ color: "#7c7c7c" }}>Word Count</p>
                                    <p className="text-base" style={{ color: "#eee5e9" }}>{selectedPost.wordCount.toLocaleString("nl-NL")}</p>
                                </div>
                                <div
                                    className="flex-1 flex flex-col gap-1 p-3 rounded-xl border"
                                    style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                                >
                                    <p className="text-xs" style={{ color: "#7c7c7c" }}>SEO Score</p>
                                    <p className="text-base" style={{ color: "#00f3ff" }}>{selectedPost.seoScore}/100</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div
                            className="flex flex-col gap-3 p-6 border-t"
                            style={{ borderColor: "rgba(124,124,124,0.3)" }}
                        >
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm transition-opacity hover:opacity-80"
                                    style={{ border: "1px solid #92dce5", color: "#92dce5" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
                                    </svg>
                                    Reschedule
                                </button>
                                <Link
                                    href={`/drafts/${selectedPost.id}`}
                                    className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm transition-opacity hover:opacity-80"
                                    style={{ border: "1px solid #92dce5", color: "#92dce5" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                    </svg>
                                    Edit Post
                                </Link>
                            </div>

                            <button
                                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
                                style={{
                                    backgroundColor: "#00f3ff",
                                    color: "#383d3b",
                                    boxShadow: "0px 0px 16px 0px rgba(0,243,255,0.3)",
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                                Publish Now
                            </button>

                            <button
                                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm transition-opacity hover:opacity-80"
                                style={{ color: "#7c7c7c" }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                                Cancel Schedule
                            </button>

                            <div className="border-t pt-3" style={{ borderColor: "rgba(124,124,124,0.3)" }}>
                                <button
                                    className="w-full flex items-center justify-center h-10 rounded-xl text-sm transition-opacity hover:opacity-80"
                                    style={{
                                        backgroundColor: "rgba(0,243,255,0.1)",
                                        border: "1px solid rgba(0,243,255,0.3)",
                                        color: "#00f3ff",
                                    }}
                                >
                                    + New Schedule
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <p className="text-sm text-center" style={{ color: "#7c7c7c" }}>
                            Klik op een ingepland artikel om de details te zien
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}