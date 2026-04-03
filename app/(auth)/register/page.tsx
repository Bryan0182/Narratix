"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { authClient } from "@/lib/auth-client"

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const { error } = await authClient.signUp.email({
            name,
            email,
            password,
        })

        if (error) {
            setError(error.message || "Registreren mislukt")
            setLoading(false)
            return
        }

        setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#383d3b" }}>
                <div className="w-full max-w-md p-8 rounded-2xl border text-center" style={{ backgroundColor: "#2d312f", borderColor: "rgba(124,124,124,0.3)" }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(0,243,255,0.1)", border: "1px solid rgba(0,243,255,0.3)" }}>
                        <span className="text-2xl">✉️</span>
                    </div>
                    <h2 className="text-xl mb-2" style={{ color: "#eee5e9" }}>Controleer je e-mail</h2>
                    <p className="text-sm" style={{ color: "#7c7c7c" }}>
                        We hebben een bevestigingslink gestuurd naar <strong style={{ color: "#eee5e9" }}>{email}</strong>. Klik op de link om je account te activeren.
                    </p>
                    <Link href="/login" className="block mt-6 text-sm" style={{ color: "#00f3ff" }}>
                        Terug naar inloggen
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#383d3b" }}>
            <div className="w-full max-w-md p-8 rounded-2xl border" style={{ backgroundColor: "#2d312f", borderColor: "rgba(124,124,124,0.3)" }}>

                <div className="flex items-center gap-3 mb-8">
                    <Image src="/logo.svg" alt="Narratix" width={40} height={40} className="rounded-xl" />
                    <span className="text-xl" style={{ color: "#eee5e9" }}>Narratix</span>
                </div>

                <h1 className="text-2xl mb-1" style={{ color: "#eee5e9" }}>Account aanmaken</h1>
                <p className="text-sm mb-8" style={{ color: "#7c7c7c" }}>Start vandaag met AI-gedreven content.</p>

                {error && (
                    <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(255,59,48,0.1)", color: "#ff3b30", border: "1px solid rgba(255,59,48,0.2)" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: "#7c7c7c" }}>Naam</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Jan Jansen"
                            required
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={{ backgroundColor: "#383d3b", border: "1px solid rgba(124,124,124,0.3)", color: "#eee5e9" }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: "#7c7c7c" }}>E-mailadres</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jij@bedrijf.nl"
                            required
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={{ backgroundColor: "#383d3b", border: "1px solid rgba(124,124,124,0.3)", color: "#eee5e9" }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: "#7c7c7c" }}>Wachtwoord</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimaal 8 tekens"
                            minLength={8}
                            required
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={{ backgroundColor: "#383d3b", border: "1px solid rgba(124,124,124,0.3)", color: "#eee5e9" }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl text-sm mt-2 transition-opacity"
                        style={{ backgroundColor: "#00f3ff", color: "#383d3b", opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? "Account aanmaken..." : "Account aanmaken"}
                    </button>
                </form>

                <p className="text-sm text-center mt-6" style={{ color: "#7c7c7c" }}>
                    Al een account?{" "}
                    <Link href="/login" style={{ color: "#00f3ff" }}>Inloggen</Link>
                </p>
            </div>
        </div>
    )
}