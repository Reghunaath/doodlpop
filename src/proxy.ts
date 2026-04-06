// src/proxy.ts
// Locks all pages except /library and /comic/[id].
// All creation, Q&A, script review, and supervised review routes
// redirect to /library so the deployed app is read-only.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Always pass through ──────────────────────────────────────────────
  // Next.js internals, static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  // API routes — all needed for viewer + QR share + PDF + image serving
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // ── Allowed pages ────────────────────────────────────────────────────
  if (pathname === "/library") return NextResponse.next();
  if (/^\/comic\/[^/]+$/.test(pathname)) return NextResponse.next();

  // ── Everything else → redirect to library ───────────────────────────
  // This covers: / (home), /create, /script/[id], /review/[id]
  return NextResponse.redirect(new URL("/library", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
