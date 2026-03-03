import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

/**
 * Edge middleware for route protection using NextAuth v5's `auth()` wrapper.
 *
 * - /admin/*  → requires valid session AND isAdmin === true
 *   Redirects silently to "/" on failure — does not reveal admin path exists.
 * - Everything else → public, passes through.
 */
export default auth(function middleware(req: NextAuthRequest) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/admin")) {
        const session = req.auth;

        if (!session?.user) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        if (!session.user.isAdmin) {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/admin/:path*"],
};
