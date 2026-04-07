import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateOrganization } from "@/lib/organization"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const org = await getOrCreateOrganization(session.user.id, session.user.name ?? "User")

    const connections = await prisma.connection.findMany({
        where: { organizationId: org.id },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ connections })
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const org = await getOrCreateOrganization(session.user.id, session.user.name ?? "User")
    const { name, type, url, apiKey, username } = await request.json()

    if (!name || !url) return NextResponse.json({ error: "Name and URL required" }, { status: 400 })

    const connection = await prisma.connection.create({
        data: { name, type, url, apiKey, username, organizationId: org.id },
    })

    return NextResponse.json({ connection })
}