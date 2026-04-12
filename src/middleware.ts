import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin";

  // Admin routes — must be logged in AND admin
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protected user routes
  if (pathname.startsWith("/submit-event") || pathname === "/profile/edit") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/submit-event/:path*", "/profile/edit"],
};
