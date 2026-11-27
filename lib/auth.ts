// // import type { AuthOptions } from "next-auth";
// // import CredentialsProvider from "next-auth/providers/credentials";
// // //import bcrypt from "bcrypt";
// // import bcrypt from "bcryptjs";

// // import { prisma } from "lib/prisma";

// // export const authOptions: AuthOptions = {
// //   session: {
// //     strategy: "jwt",
// //   },

// //   providers: [
// //     CredentialsProvider({
// //       name: "Credentials",
// //       credentials: {
// //         email: { label: "Email", type: "email" },
// //         password: { label: "Password", type: "password" },
// //       },

// //       async authorize(credentials) {
// //         if (!credentials?.email || !credentials.password) {
// //           return null;
// //         }

// //         const user = await prisma.user.findUnique({
// //           where: { email: credentials.email },
// //         });

// //         if (!user) return null;

// //         const valid = await bcrypt.compare(
// //           credentials.password,
// //           user.passwordHash
// //         );

// //         if (!valid) return null;

// //         return {
// //           id: user.id,
// //           email: user.email,
// //           role: user.role,
// //           approved: user.approved,
// //           companyName: user.companyName,
// //         };
// //       },
// //     }),
// //   ],

// //   callbacks: {
// //     async jwt({ token, user }) {
// //       if (user) {
// //         token.id = user.id;
// //         token.role = (user as any).role;
// //         token.approved = (user as any).approved;
// //         token.companyName = (user as any).companyName;
// //       }
// //       return token;
// //     },

// //     async session({ session, token }) {
// //       if (session.user) {
// //         session.user.id = token.id as string;
// //         session.user.role = token.role as "admin" | "insurer";
// //         session.user.approved = token.approved as boolean;
// //         session.user.companyName = token.companyName as string;
// //       }
// //       return session;
// //     },
// //   },
// // };
// ///////////////////////////
// import Credentials from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import { prisma } from "./prisma";
// import type { AuthOptions } from "next-auth";

// export const authOptions: AuthOptions = {
//   session: {
//     strategy: "jwt",
//   },
//   providers: [
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials.password) {
//           return null;
//         }

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });

//         if (!user) return null;
//         if (!user.approved) return null;

//         const valid = await bcrypt.compare(
//           credentials.password,
//           user.passwordHash
//         );

//         if (!valid) return null;

//         return {
//           id: user.id,
//           email: user.email,
//           role: user.role,
//           approved: user.approved,
//           companyName: user.companyName,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.approved = user.approved;
//         token.companyName = user.companyName;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string;
//         session.user.role = token.role as "admin" | "insurer";
//         session.user.approved = token.approved as boolean;
//         session.user.companyName = token.companyName as string;
//       }
//       return session;
//     },
//   },
// };

/////TEST 2 / ABOVE IS WORKING///
// import Credentials from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import { prisma } from "./prisma";
// import type { AuthOptions } from "next-auth";

// export const authOptions: AuthOptions = {
//   session: {
//     strategy: "jwt",
//   },
//   providers: [
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials.password) {
//           return null;
//         }

//         const email = credentials.email.trim().toLowerCase();
//         const password = credentials.password.trim();

//         const user = await prisma.user.findUnique({
//           where: { email },
//         });

//         if (!user) return null;
//         if (!user.approved) return null;

//         const valid = await bcrypt.compare(
//           password,
//           user.passwordHash
//         );

//         if (!valid) return null;

//         return {
//           id: user.id,
//           email: user.email,
//           role: user.role,
//           approved: user.approved,
//           companyName: user.companyName,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.approved = user.approved;
//         token.companyName = user.companyName;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string;
//         session.user.role = token.role as "admin" | "insurer";
//         session.user.approved = token.approved as boolean;
//         session.user.companyName = token.companyName as string;
//       }
//       return session;
//     },
//   },
// };

/////TEST 3 ONLY TEST
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { AuthOptions } from "next-auth";
import { allow, limiters } from "@/lib/ratelimit";
import { checkVerificationCode } from "@/lib/twilio-verify";
import { CUSTOMER_IDLE_MS, isValidEmail, normaliseAuMobile } from "@/lib/customer";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },

  // 🔥 REQUIRED FOR PRODUCTION (THIS IS YOUR MAIN ISSUE)
  secret: process.env.NEXTAUTH_SECRET,

  // ✅ cookies config (this is fine)
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password.trim();

        // Brute-force throttle / lockout backoff: limit attempts per IP+email.
        const ip =
          ((req?.headers?.["x-forwarded-for"] as string) || "")
            .split(",")[0]
            .trim() || "unknown";
        if (!(await allow(limiters.login, `${ip}:${email}`))) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;
        // Customers log in with an SMS code only, never email + password.
        if (user.role === "customer") return null;
        if (!user.approved) return null;

        const valid = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          approved: user.approved,
          companyName: user.companyName,
        };
      },
    }),

    // Public customers: mobile + SMS code (no password). mode "signup" also
    // creates the account once the code is verified.
    Credentials({
      id: "customer-otp",
      name: "Mobile code",
      credentials: {
        mode: { type: "text" },
        phone: { type: "text" },
        code: { type: "text" },
        firstName: { type: "text" },
        lastName: { type: "text" },
        email: { type: "text" },
      },
      async authorize(credentials, req) {
        const phone = normaliseAuMobile(credentials?.phone);
        const code = String(credentials?.code ?? "").trim();
        const mode = credentials?.mode === "signup" ? "signup" : "login";
        if (!phone || !code) return null;

        const ip =
          ((req?.headers?.["x-forwarded-for"] as string) || "")
            .split(",")[0]
            .trim() || "unknown";
        if (!(await allow(limiters.codeCheck, `${ip}:${phone}`))) return null;

        if (!(await checkVerificationCode(phone, code))) return null;

        let user = await prisma.user.findUnique({ where: { phone } });

        if (mode === "signup" && !user) {
          const firstName = String(credentials?.firstName ?? "").trim();
          const lastName = String(credentials?.lastName ?? "").trim();
          const email = String(credentials?.email ?? "").trim().toLowerCase();
          if (!firstName || !lastName || !isValidEmail(email)) return null;
          if (await prisma.user.findUnique({ where: { email } })) return null;
          user = await prisma.user.create({
            data: {
              email,
              name: `${firstName} ${lastName}`,
              phone,
              phoneVerifiedAt: new Date(),
              passwordHash: "", // never matches: customers can't use email login
              companyName: "",
              role: "customer",
              approved: true, // verified by SMS, no admin approval
            },
          });
        }

        if (!user || user.role !== "customer") return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          approved: user.approved,
          companyName: user.companyName,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.approved = user.approved;
        token.companyName = user.companyName;
      }

      // Customers: logged out after 4 hours without using the site.
      // Agents and admins are unaffected.
      if (token.role === "customer") {
        const now = Date.now();
        const last = typeof token.lastSeen === "number" ? token.lastSeen : now;
        if (token.expired || now - last > CUSTOMER_IDLE_MS) {
          token.expired = true;
        } else {
          token.lastSeen = now;
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Expired customer login → no user, so every page/API treats it as logged out.
      if (token.expired) {
        return { expires: session.expires } as typeof session;
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "agent" | "customer";
        session.user.approved = token.approved as boolean;
        session.user.companyName = token.companyName as string;
      }

      return session;
    },
  },
};