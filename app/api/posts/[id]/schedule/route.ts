import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateOrganization } from "@/lib/organization"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const org = await getOrCreateOrganization(session.user.id, session.user.name ?? "User")
    const { id } = await params
    const { scheduledAt } = await request.json()

    if (!scheduledAt) return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 })

    const post = await prisma.post.updateMany({
        where: { id, organizationId: org.id },
        data: {
            status: "scheduled",
            scheduledAt: new Date(scheduledAt),
        },
    })

    if (post.count === 0) return NextResponse.json({ error: "Post not found" }, { status: 404 })

    return NextResponse.json({ success: true })
}