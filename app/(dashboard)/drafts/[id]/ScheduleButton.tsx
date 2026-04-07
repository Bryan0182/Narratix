"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ScheduleButton({ postId }: { postId: string }) {
    const router = useRouter()
    const [date, setDate] = useState("")
    const [time, setTime] = useState("09:00")
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSchedule = async () => {
        if (!date || !time) return
        setSaving(true)

        const scheduledAt = new Date(`${date}T${time}:00`).toISOString()

        const res = await fetch(`/api/posts/${postId}/schedule`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scheduledAt }),
        })

        if (res.ok) {
            setSuccess(true)
            setTimeout(() => {
                router.refresh()
                setSuccess(false)
            }, 1000)
        }

        setSaving(false)
    }

    const inputStyle = {
        backgroundColor: "rgba(56,61,59,0.5)",
        border: "1px solid rgba(124,124,124,0.3)",
        color: "#eee5e9",
        borderRadius: "12px",
        padding: "0 12px",
        height: "40px",
        outline: "none",
        fontSize: "14px",
        colorScheme: "dark" as const,
    }

    return (
        <div
            className="flex flex-col gap-3 pt-3 border-t"
            style={{ borderColor: "rgba(124,124,124,0.3)" }}
        >
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#7c7c7c" }}>
                Inplannen
            </p>

            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: "#7c7c7c" }}>Datum</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        style={inputStyle}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: "#7c7c7c" }}>Tijd</label>
                    <input
                        type="time"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        style={inputStyle}
                    />
                </div>
            </div>

            <button
                onClick={handleSchedule}
                disabled={saving || !date || !time}
                className="w-full h-10 rounded-xl text-sm font-medium transition-all"
                style={{
                    backgroundColor: success
                        ? "rgba(5,223,114,0.2)"
                        : "rgba(0,243,255,0.1)",
                    border: `1px solid ${success ? "rgba(5,223,114,0.3)" : "rgba(0,243,255,0.3)"}`,
                    color: success ? "#05df72" : "#00f3ff",
                    opacity: !date || !time ? 0.5 : 1,
                    cursor: !date || !time ? "not-allowed" : "pointer",
                }}
            >
                {success ? "✓ Ingepland!" : saving ? "Inplannen..." : "📅 Inplannen"}
            </button>
        </div>
    )
}