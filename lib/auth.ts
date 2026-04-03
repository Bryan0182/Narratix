import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { Resend } from "resend"
import { prisma } from "@/lib/prisma"

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
                from: "onboarding@resend.dev", // tijdelijk voor development
                to: user.email,
                subject: "Bevestig je e-mailadres — Narratix",
                html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <img src="https://narratix.nl/logo.svg" width="40" style="margin-bottom: 16px;" />
        <h2 style="color: #eee5e9; background: #2d312f; padding: 0;">Welkom bij Narratix!</h2>
        <p style="color: #7c7c7c;">Klik op de knop hieronder om je account te bevestigen.</p>
        <a href="${url}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #00f3ff; color: #383d3b; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Account bevestigen
        </a>
      </div>
    `,
            })
        },
    },
})