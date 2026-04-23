import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = url.pathname.replace(
    "/_next/static/chunks/",
    "/static-chunks/",
  );
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/_next/static/chunks/:path*"],
};
