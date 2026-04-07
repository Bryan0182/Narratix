import { prisma } from "@/lib/prisma"

export async function getOrCreateOrganization(userId: string, userName: string) {
    // Check of user al lid is van een organisatie
    const membership = await prisma.organizationMember.findFirst({
        where: { userId },
        include: { organization: true },
    })

    if (membership) return membership.organization

    const slug = userName.toLowerCase().replace(/\s+/g, "-") + "-" + userId.slice(0, 6)

    try {
        const org = await prisma.organization.create({
            data: {
                name: `${userName}'s Organization`,
                slug,
                members: {
                    create: {
                        userId,
                        role: "owner",
                    },
                },
            },
        })
        return org
    } catch (e: unknown) {
        // Als er een unique constraint violation is (race condition),
        // haal dan de bestaande org op
        if (
            typeof e === "object" &&
            e !== null &&
            "code" in e &&
            (e as { code: string }).code === "P2002"
        ) {
            const existing = await prisma.organizationMember.findFirst({
                where: { userId },
                include: { organization: true },
            })
            if (existing) return existing.organization
        }
        throw e
    }
}

export async function getUserOrganization(userId: string) {
    const membership = await prisma.organizationMember.findFirst({
        where: { userId },
        include: { organization: true },
    })

    return membership?.organization ?? null
}