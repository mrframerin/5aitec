import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const prebakedChunkNames = new Set([
  "003qcun9_z40b.js",
  "01rpcm9oxyz4o.js",
  "03~yq9q893hmn.js",
  "03r54qy_a1k2c.js",
  "0-4avss~~5x31.js",
  "0_2dh_hbsn4k2.js",
  "0_4n59_u4tn.y.js",
  "0f9pmwk9~iqf..js",
  "0nr6lqdt2xw72.js",
  "12vmxu4i7-3qm.js",
  "17.79-onzp9ko.js",
  "0671of7zsd06h.js",
  "07k6izpr80.um.js",
  "09d2g3rtnbzgs.hero-lines.js",
  "09d2g3rtnbzgs.js",
  "turbopack-06237-s6b4.it.js",
]);

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/app-pages-internals.js" ||
    request.nextUrl.pathname === "/static/chunks/app-pages-internals.js"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/_next/static/chunks/app-pages-internals.js";
    return NextResponse.rewrite(url);
  }

  const chunkName = request.nextUrl.pathname.split("/").pop();

  if (!chunkName || !prebakedChunkNames.has(chunkName)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = url.pathname.replace(
    "/_next/static/chunks/",
    "/static-chunks/",
  );
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/_next/static/chunks/:path*",
    "/app-pages-internals.js",
    "/static/chunks/app-pages-internals.js",
  ],
};
