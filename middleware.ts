// import { getToken } from "next-auth/jwt";
// import { NextRequest, NextResponse } from "next/server";

// const PROTECTED_PATHS = [
//   "/pricing",
//   "/api/pricing",
//   "/pricing/confirmation",
// ];

// export async function middleware(req: NextRequest) {
//   const token = await getToken({
//     req,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   const pathname = req.nextUrl.pathname;

//   const isProtected = PROTECTED_PATHS.some((path) =>
//     pathname.startsWith(path)
//   );

//   if (!isProtected) {
//     return NextResponse.next();
//   }

//   // 🚫 Not logged in
//   if (!token) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   // ⛔ Logged in but not approved
//   if (token.role === "agent" && token.approved !== true) {
//     return NextResponse.redirect(
//       new URL("/awaiting-approval", req.url)
//     );
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/pricing/:path*",
//     "/api/pricing/:path*",
//   ],
// };
/////////////////////
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/pricing",
  "/api/pricing",
];

import { CUSTOMER_IDLE_MS } from "@/lib/customer";

// The only /api/pricing routes the quote form uses.
const CUSTOMER_PRICING_APIS = [
  "/api/pricing/quote",
  "/api/pricing/extras",
  "/api/pricing/sizes",
  "/api/pricing/regions",
];

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = req.nextUrl.pathname;

  // Public customers: logged out after 4 h idle (flagged in the JWT), kept out
  // of the agent dashboard/jobs, and limited to the pricing APIs the quote form
  // needs (no raw price lists).
  if (token?.role === "customer") {
    const lastSeen = typeof token.lastSeen === "number" ? token.lastSeen : 0;
    if (token.expired || Date.now() - lastSeen > CUSTOMER_IDLE_MS) {
      return pathname.startsWith("/api/")
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : NextResponse.redirect(new URL("/login?expired=1", req.url));
    }
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/my-quotes", req.url));
    }
    if (pathname.startsWith("/pricing/confirmation")) {
      return NextResponse.redirect(new URL("/my-quotes", req.url));
    }
    if (
      pathname.startsWith("/api/pricing/") &&
      !CUSTOMER_PRICING_APIS.some((p) => pathname.startsWith(p))
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // 🚫 Not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ⛔ Logged in but not approved
  if (token.role === "agent" && token.approved !== true) {
    return NextResponse.redirect(
      new URL("/awaiting-approval", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/pricing/:path*",
    "/api/pricing/:path*",
    "/dashboard/:path*",
  ],
};

