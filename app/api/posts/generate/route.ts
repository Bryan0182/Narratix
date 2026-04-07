import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateOrganization } from "@/lib/organization"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const org = await getOrCreateOrganization(session.user.id, session.user.name ?? "User")

    const { topic, tone, language, targetAudience, wordCount } = await request.json()
    if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 })

    const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
            {
                role: "user",
                content: `Write a professional blog post about: "${topic}"

Requirements:
- Tone: ${tone || "professional"}
- Language: ${language || "Dutch"}
- Target audience: ${targetAudience || "general"}
- Word count: approximately ${wordCount || 800} words

Return ONLY a valid JSON object with no markdown, no backticks:
{
  "title": "Blog post title",
  "content": "Full blog post content in markdown format",
  "summary": "2-3 sentence summary",
  "seoTitle": "SEO optimized title max 60 chars",
  "seoDesc": "Meta description max 160 chars",
  "seoScore": 85
}`,
            },
        ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""

    let parsed
    try {
        const clean = text.replace(/```json|```/g, "").trim()
        parsed = JSON.parse(clean)
    } catch {
        return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    const post = await prisma.post.create({
        data: {
            title: parsed.title,
            content: parsed.content,
            summary: parsed.summary,
            seoTitle: parsed.seoTitle,
            seoDesc: parsed.seoDesc,
            seoScore: parsed.seoScore ?? 0,
            status: "draft",
            authorId: session.user.id,
            organizationId: org.id,
        },
    })

    return NextResponse.json({ post })
}