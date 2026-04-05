"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

const settingsNav = [
    { key: "profile", label: "Profile", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
    { key: "organization", label: "Organization", icon: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z" },
    { key: "brand", label: "Brand & Tone", icon: "M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0 1 12 24" },
    { key: "prompts", label: "Prompts", icon: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" },
    { key: "connections", label: "Connections", icon: "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" },
    { key: "secrets", label: "Secret Store", icon: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" },
    { key: "publishing", label: "Publishing", icon: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" },
    { key: "audit", label: "Audit Log", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" },
]

const inputStyle = {
    backgroundColor: "rgba(238,229,233,0.06)",
    border: "1px solid rgba(146,220,229,0.14)",
    color: "#eee5e9",
    borderRadius: "12px",
    padding: "10px 16px",
    width: "100%",
    outline: "none",
    fontSize: "16px",
    height: "46px",
}

export default function SettingsPage() {
    const router = useRouter()
    const { data: session } = authClient.useSession()
    const [activeTab, setActiveTab] = useState("profile")
    const [name, setName] = useState(session?.user?.name ?? "")
    const [twoFactor, setTwoFactor] = useState(false)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })

    const initials = session?.user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "?"

    const handleSaveProfile = async () => {
        setSaving(true)
        await new Promise(r => setTimeout(r, 800))
        setSuccess(true)
        setSaving(false)
        setTimeout(() => setSuccess(false), 3000)
    }

    const handleSignOut = async () => {
        await authClient.signOut()
        router.push("/login")
    }

    return (
        <div className="p-8 flex gap-6">

            {/* Settings Nav */}
            <div
                className="w-60 shrink-0 rounded-2xl border p-4 flex flex-col gap-1"
                style={{
                    backgroundColor: "#2d312f",
                    borderColor: "rgba(124,124,124,0.3)",
                    boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                    height: "fit-content",
                }}
            >
                {settingsNav.map((item) => {
                    const isActive = activeTab === item.key
                    return (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            className="flex items-center gap-3 h-[46px] px-[17px] rounded-xl transition-all text-left"
                            style={{
                                backgroundColor: isActive ? "rgba(0,243,255,0.15)" : "transparent",
                                border: isActive ? "1px solid rgba(0,243,255,0.3)" : "1px solid transparent",
                                boxShadow: isActive ? "0px 0px 16px 0px rgba(0,243,255,0.2)" : "none",
                                color: isActive ? "#00f3ff" : "#eee5e9",
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                                <path d={item.icon} />
                            </svg>
                            <span className="text-sm">{item.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Settings Content */}
            <div className="flex-1 min-w-0">
                <div
                    className="rounded-2xl border p-6 flex flex-col gap-6"
                    style={{
                        backgroundColor: "#2d312f",
                        borderColor: "rgba(124,124,124,0.3)",
                        boxShadow: "0px 8px 24px 0px rgba(0,0,0,0.25)",
                    }}
                >
                    {activeTab === "profile" && (
                        <>
                            {/* Header */}
                            <div>
                                <h2 className="text-xl mb-1" style={{ color: "#eee5e9" }}>Profile Settings</h2>
                                <p className="text-sm" style={{ color: "#7c7c7c" }}>Manage your personal information and security settings</p>
                            </div>

                            {/* Avatar */}
                            <div
                                className="flex items-center gap-4 pb-6 border-b"
                                style={{ borderColor: "rgba(124,124,124,0.3)" }}
                            >
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-medium shrink-0"
                                    style={{ background: "linear-gradient(to bottom, #00f3ff, #92dce5)", color: "#383d3b" }}
                                >
                                    {initials}
                                </div>
                                <div>
                                    <button
                                        className="px-4 py-2 rounded-xl text-sm mb-1 transition-opacity hover:opacity-80"
                                        style={{
                                            backgroundColor: "rgba(0,243,255,0.1)",
                                            border: "1px solid rgba(0,243,255,0.3)",
                                            color: "#00f3ff",
                                        }}
                                    >
                                        Change Avatar
                                    </button>
                                    <p className="text-xs" style={{ color: "#7c7c7c" }}>JPG, PNG or GIF. Max 2MB.</p>
                                </div>
                            </div>

                            {/* Success message */}
                            {success && (
                                <div
                                    className="p-3 rounded-xl text-sm"
                                    style={{
                                        backgroundColor: "rgba(5,223,114,0.1)",
                                        color: "#05df72",
                                        border: "1px solid rgba(5,223,114,0.2)",
                                    }}
                                >
                                    ✓ Instellingen opgeslagen
                                </div>
                            )}

                            {/* Full Name */}
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm" style={{ color: "#92dce5" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm" style={{ color: "#92dce5" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                    </svg>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={session?.user?.email ?? ""}
                                    readOnly
                                    style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
                                />
                            </div>

                            {/* Save Profile */}
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="w-full h-11 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
                                style={{
                                    backgroundColor: "#00f3ff",
                                    color: "#383d3b",
                                    boxShadow: "0px 0px 16px 0px rgba(0,243,255,0.3)",
                                    opacity: saving ? 0.7 : 1,
                                }}
                            >
                                {saving ? "Opslaan..." : "Wijzigingen opslaan"}
                            </button>

                            {/* Change Password */}
                            <div
                                className="flex flex-col gap-4 pt-6 border-t"
                                style={{ borderColor: "rgba(124,124,124,0.3)" }}
                            >
                                <h3 className="flex items-center gap-2 text-base" style={{ color: "#eee5e9" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#92dce5">
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                    </svg>
                                    Change Password
                                </h3>

                                {["Current Password", "New Password", "Confirm New Password"].map((label, i) => (
                                    <div key={label} className="flex flex-col gap-2">
                                        <label className="text-sm" style={{ color: "#92dce5" }}>{label}</label>
                                        <input
                                            type="password"
                                            placeholder={`Enter ${label.toLowerCase()}`}
                                            value={Object.values(passwords)[i]}
                                            onChange={(e) => {
                                                const keys = ["current", "new", "confirm"] as const
                                                setPasswords({ ...passwords, [keys[i]]: e.target.value })
                                            }}
                                            style={inputStyle}
                                        />
                                    </div>
                                ))}

                                <button
                                    className="w-full h-11 rounded-xl text-sm transition-opacity hover:opacity-80"
                                    style={{
                                        backgroundColor: "transparent",
                                        border: "1px solid rgba(146,220,229,0.3)",
                                        color: "#92dce5",
                                    }}
                                >
                                    Wachtwoord wijzigen
                                </button>
                            </div>

                            {/* 2FA */}
                            <div
                                className="pt-6 border-t"
                                style={{ borderColor: "rgba(124,124,124,0.3)" }}
                            >
                                <div
                                    className="flex items-center justify-between p-4 rounded-xl border"
                                    style={{ backgroundColor: "rgba(56,61,59,0.5)", borderColor: "rgba(124,124,124,0.3)" }}
                                >
                                    <div className="flex items-center gap-3">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#92dce5">
                                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm" style={{ color: "#eee5e9" }}>Two-Factor Authentication</p>
                                            <p className="text-xs" style={{ color: "#7c7c7c" }}>Add an extra layer of security to your account</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setTwoFactor(!twoFactor)}
                                        className="w-8 h-[18px] rounded-full relative transition-colors"
                                        style={{ backgroundColor: twoFactor ? "#00f3ff" : "rgba(124,124,124,0.3)" }}
                                    >
                    <span
                        className="absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all"
                        style={{
                            backgroundColor: "#383d3b",
                            left: twoFactor ? "calc(100% - 16px)" : "2px",
                        }}
                    />
                                    </button>
                                </div>
                            </div>

                            {/* Sign out */}
                            <button
                                onClick={handleSignOut}
                                className="w-full h-11 rounded-xl text-sm transition-opacity hover:opacity-80"
                                style={{
                                    backgroundColor: "rgba(255,59,48,0.1)",
                                    border: "1px solid rgba(255,59,48,0.2)",
                                    color: "#ff3b30",
                                }}
                            >
                                Uitloggen
                            </button>
                        </>
                    )}

                    {activeTab !== "profile" && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: "rgba(0,243,255,0.1)", border: "1px solid rgba(0,243,255,0.2)" }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#00f3ff">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                            </div>
                            <p className="text-base" style={{ color: "#eee5e9" }}>Coming Soon</p>
                            <p className="text-sm text-center" style={{ color: "#7c7c7c" }}>
                                Deze sectie is nog in ontwikkeling en wordt binnenkort beschikbaar.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}