import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id

    const [drafts, inReview, scheduled, published, posts] = await Promise.all([
        prisma.post.count({ where: { authorId: userId, status: "draft" } }),
        prisma.post.count({ where: { authorId: userId, status: "in review" } }),
        prisma.post.count({ where: { authorId: userId, status: "scheduled" } }),
        prisma.post.count({ where: { authorId: userId, status: "published" } }),
        prisma.post.findMany({
            where: { authorId: userId, seoScore: { not: null } },
            select: { seoScore: true },
        }),
    ])

    const avgSeoScore = posts.length > 0
        ? Math.round(posts.reduce((sum, p) => sum + (p.seoScore ?? 0), 0) / posts.length)
        : 0

    const recentActivity = await prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
            author: { select: { name: true } },
        },
    })

    return NextResponse.json({
        kpis: { drafts, inReview, scheduled, published, avgSeoScore },
        recentActivity,
    })
}