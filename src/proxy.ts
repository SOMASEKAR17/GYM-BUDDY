import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const protectedRoutes = ["/discover", "/matches", "/chat", "/profile", "/settings"];
const authRoutes = ["/login", "/register"];

export function proxy(request: NextRequest) {
    const token = request.cookies.get("auth-token")?.value;
    const { pathname } = request.nextUrl;

    const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
    const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

    if (isProtected) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        const payload = verifyToken(token);
        if (!payload) {
            const response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("auth-token");
            return response;
        }
    }

    // Redirect already-logged-in users away from login/register pages
    if (isAuthRoute && token) {
        const payload = verifyToken(token);
        if (payload) {
            return NextResponse.redirect(new URL("/discover", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
