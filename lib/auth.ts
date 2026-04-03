import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { Resend } from "resend"
import { prisma } from "@/src/lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await resend.emails.send({
                from: "Narratix <noreply@narratix.nl>",
                to: user.email,
                subject: "Bevestig je e-mailadres",
                html: `<p>Klik <a href="${url}">hier</a> om je account te bevestigen.</p>`,
            })
        },
    },
})