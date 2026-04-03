"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import DashboardIcon from "@/assets/icons/dashboard.svg"
import DraftsIcon from "@/assets/icons/drafts.svg"
import ReviewIcon from "@/assets/icons/review.svg"
import SchedulerIcon from "@/assets/icons/scheduler.svg"
import PublishedIcon from "@/assets/icons/published.svg"
import SettingsIcon from "@/assets/icons/settings.svg"

const navItems = [
    { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
    { href: "/drafts", label: "Drafts", Icon: DraftsIcon },
    { href: "/review-queue", label: "Review Queue", Icon: ReviewIcon },
    { href: "/scheduler", label: "Scheduler", Icon: SchedulerIcon },
    { href: "/published", label: "Published", Icon: PublishedIcon },
    { href: "/settings", label: "Settings", Icon: SettingsIcon },
]

function NavIcon({ icon }: { icon: string }) {
    const icons: Record<string, string> = {
        grid: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
        file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM6 20V4h7v5h5v11z",
        clock: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7z",
        calendar: "M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14z",
        "check-circle": "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z",
        settings: "M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.2 7.2 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.47.47 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.47.47 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z",
    }

    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d={icons[icon]} />
        </svg>
    )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session } = authClient.useSession()

    const initials = session?.user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "?"

    const handleSignOut = async () => {
        await authClient.signOut()
        router.push("/login")
    }

    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#383d3b" }}>
            {/* Sidebar */}
            <aside className="flex flex-col w-64 h-full shrink-0 border-r" style={{ backgroundColor: "#2d312f", borderColor: "rgba(124,124,124,0.3)" }}>

                {/* Logo */}
                <div className="flex items-center gap-3 px-6 h-[89px] shrink-0 border-b" style={{ borderColor: "rgba(124,124,124,0.3)" }}>
                    <Image src="/logo.svg" alt="Narratix" width={40} height={40} className="rounded-xl" />
                    <span className="text-xl" style={{ color: "#eee5e9" }}>Narratix</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 h-[50px] px-[17px] rounded-xl transition-all"
                                style={{
                                    backgroundColor: isActive ? "rgba(0,243,255,0.15)" : "transparent",
                                    border: isActive ? "1px solid rgba(0,243,255,0.3)" : "1px solid transparent",
                                    boxShadow: isActive ? "0px 0px 16px 0px rgba(0,243,255,0.2)" : "none",
                                    color: isActive ? "#00f3ff" : "#eee5e9",
                                }}
                            >
                                <item.Icon
                                    width={20}
                                    height={20}
                                    fill={isActive ? "#00f3ff" : "#7c7c7c"}
                                />
                                <span className="text-base">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* User */}
                <div className="shrink-0 border-t p-4" style={{ borderColor: "rgba(124,124,124,0.3)" }}>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-medium" style={{ background: "linear-gradient(to bottom, #00f3ff, #92dce5)", color: "#383d3b" }}>
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm truncate" style={{ color: "#eee5e9" }}>{session?.user?.name ?? "..."}</p>
                            <p className="text-xs truncate" style={{ color: "#7c7c7c" }}>{session?.user?.email ?? "..."}</p>
                        </div>
                        <button onClick={handleSignOut} title="Uitloggen" className="shrink-0 opacity-50 hover:opacity-100 transition-opacity" style={{ color: "#eee5e9" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}