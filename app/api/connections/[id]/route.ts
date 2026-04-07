import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateOrganization } from "@/lib/organization"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const org = await getOrCreateOrganization(session.user.id, session.user.name ?? "User")
    const { id } = await params

    await prisma.connection.deleteMany({
        where: { id, organizationId: org.id },
    })

    return NextResponse.json({ success: true })
}