import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateOrganization } from "@/lib/organization"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const org = await getOrCreateOrganization(session.user.id, session.user.name ?? "User")

    const members = await prisma.organizationMember.findMany({
        where: { organizationId: org.id },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ organization: org, members })
}

export async function PATCH(request: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const org = await getOrCreateOrganization(session.user.id, session.user.name ?? "User")
    const { name } = await request.json()

    const updated = await prisma.organization.update({
        where: { id: org.id },
        data: { name },
    })

    return NextResponse.json({ organization: updated })
}