import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    const sessionToken =
        request.cookies.get("better-auth.session_token") ??
        request.cookies.get("__Secure-better-auth.session_token")

    const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/register")

    const isProtectedPage = request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/drafts") ||
        request.nextUrl.pathname.startsWith("/review-queue") ||
        request.nextUrl.pathname.startsWith("/scheduler") ||
        request.nextUrl.pathname.startsWith("/published") ||
        request.nextUrl.pathname.startsWith("/settings")

    if (isProtectedPage && !sessionToken) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    if (isAuthPage && sessionToken) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|logo).*)"],
}