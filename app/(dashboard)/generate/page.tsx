"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const inputStyle = {
    backgroundColor: "#383d3b",
    border: "1px solid rgba(124,124,124,0.3)",
    color: "#eee5e9",
    borderRadius: "12px",
    padding: "12px 16px",
    width: "100%",
    outline: "none",
    fontSize: "14px",
}

const labelStyle = {
    color: "#7c7c7c",
    fontSize: "14px",
    marginBottom: "6px",
    display: "block",
}

export default function GeneratePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [form, setForm] = useState({
        topic: "",
        tone: "professional",
        language: "Dutch",
        targetAudience: "",
        wordCount: "800",
    })

    const handleGenerate = async () => {
        if (!form.topic) return
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/posts/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Er is iets misgegaan")
                setLoading(false)
                return
            }

            router.push(`/drafts/${data.post.id}`)
        } catch {
            setError("Er is iets misgegaan, probeer opnieuw")
            setLoading(false)
        }
    }

    return (
        <div className="p-8">
            <div className="max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-2xl mb-1" style={{ color: "#eee5e9" }}>
                        AI Blog Generator
                    </h1>
                    <p className="text-sm" style={{ color: "#7c7c7c" }}>
                        Genereer een professionele blog post met AI in enkele seconden.
                    </p>
                </div>

                <div
                    className="rounded-2xl border p-6 flex flex-col gap-5"
                    style={{
                        backgroundColor: "#2d312f",
                        borderColor: "rgba(124,124,124,0.3)",
                        boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                    }}
                >
                    {error && (
                        <div
                            className="p-3 rounded-xl text-sm"
                            style={{
                                backgroundColor: "rgba(255,59,48,0.1)",
                                color: "#ff3b30",
                                border: "1px solid rgba(255,59,48,0.2)",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Onderwerp */}
                    <div>
                        <label style={labelStyle}>Onderwerp *</label>
                        <textarea
                            rows={3}
                            placeholder="Bijv: De voordelen van AI voor kleine bedrijven in 2025"
                            value={form.topic}
                            onChange={(e) => setForm({ ...form, topic: e.target.value })}
                            style={{ ...inputStyle, resize: "none" }}
                        />
                    </div>

                    {/* Toon + Taal */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label style={labelStyle}>Toon</label>
                            <select
                                value={form.tone}
                                onChange={(e) => setForm({ ...form, tone: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="professional">Professioneel</option>
                                <option value="casual">Casual</option>
                                <option value="informative">Informatief</option>
                                <option value="persuasive">Overtuigend</option>
                                <option value="storytelling">Verhalend</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Taal</label>
                            <select
                                value={form.language}
                                onChange={(e) => setForm({ ...form, language: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="Dutch">Nederlands</option>
                                <option value="English">Engels</option>
                                <option value="German">Duits</option>
                                <option value="French">Frans</option>
                            </select>
                        </div>
                    </div>

                    {/* Doelgroep + Woordenaantal */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label style={labelStyle}>Doelgroep</label>
                            <input
                                type="text"
                                placeholder="Bijv: MKB ondernemers"
                                value={form.targetAudience}
                                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Aantal woorden</label>
                            <select
                                value={form.wordCount}
                                onChange={(e) => setForm({ ...form, wordCount: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="400">~400 woorden (kort)</option>
                                <option value="800">~800 woorden (medium)</option>
                                <option value="1200">~1200 woorden (lang)</option>
                                <option value="2000">~2000 woorden (uitgebreid)</option>
                            </select>
                        </div>
                    </div>

                    {/* Generate button */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !form.topic}
                        className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                        style={{
                            background: loading || !form.topic
                                ? "rgba(173,70,255,0.3)"
                                : "linear-gradient(135deg, #ad46ff 0%, #f6339a 100%)",
                            color: "#eee5e9",
                            cursor: loading || !form.topic ? "not-allowed" : "pointer",
                            border: "none",
                        }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Genereren... (dit duurt ~15 seconden)
              </span>
                        ) : (
                            "✨ Genereer Blog Post"
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}