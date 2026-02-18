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
//   if (token.role === "insurer" && token.approved !== true) {
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

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = req.nextUrl.pathname;

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
  if (token.role === "insurer" && token.approved !== true) {
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
  ],
};

