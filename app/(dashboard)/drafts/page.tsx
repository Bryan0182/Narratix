import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateOrganization } from "@/lib/organization"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import DraftsClient from "./DraftsClient"

export default async function DraftsPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login")

    const org = await getOrCreateOrganization(session.user.id, session.user.name ?? "User")

    const posts = await prisma.post.findMany({
        where: { organizationId: org.id },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            title: true,
            status: true,
            seoScore: true,
            updatedAt: true,
            author: { select: { name: true } },
        },
    })

    const serialized = posts.map(p => ({
        ...p,
        updatedAt: p.updatedAt.toISOString(),
        authorName: p.author.name ?? session.user.name ?? "Onbekend",
    }))

    return <DraftsClient posts={serialized} />
}