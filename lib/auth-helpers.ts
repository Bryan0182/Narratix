import { auth } from "@/lib/auth"
import { getOrCreateOrganization } from "@/lib/organization"
import { headers } from "next/headers"

export async function getSessionWithOrg() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return null

    const org = await getOrCreateOrganization(session.user.id, session.user.name ?? "User")

    return { session, org }
}