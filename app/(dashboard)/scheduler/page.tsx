import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateOrganization } from "@/lib/organization"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import SchedulerClient from "./SchedulerClient"

export default async function SchedulerPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login")

    const org = await getOrCreateOrganization(session.user.id, session.user.name ?? "User")

    const posts = await prisma.post.findMany({
        where: {
            organizationId: org.id,
            status: "scheduled",
            scheduledAt: { not: null },
        },
        orderBy: { scheduledAt: "asc" },
        select: {
            id: true,
            title: true,
            scheduledAt: true,
            seoScore: true,
            content: true,
            author: { select: { name: true } },
        },
    })

    // Serialiseer dates voor de client component
    const serializedPosts = posts.map(p => ({
        id: p.id,
        title: p.title,
        scheduledAt: p.scheduledAt!.toISOString(),
        seoScore: p.seoScore,
        wordCount: p.content.split(/\s+/).length,
        authorName: p.author.name ?? session.user.name ?? "Onbekend",
    }))

    return <SchedulerClient posts={serializedPosts} />
}