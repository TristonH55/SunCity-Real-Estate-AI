// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcryptjs";

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { email, password, companyName } = body;

//   if (!email || !password || !companyName) {
//     return NextResponse.json(
//       { error: "Missing fields" },
//       { status: 400 }
//     );
//   }

//   const existing = await prisma.user.findUnique({
//     where: { email },
//   });

//   if (existing) {
//     return NextResponse.json(
//       { error: "Email already registered" },
//       { status: 409 }
//     );
//   }

//   const passwordHash = await bcrypt.hash(password, 12);

//   await prisma.user.create({
//     data: {
//       email,
//       passwordHash,
//       companyName,
//       role: "insurer",
//       approved: false, // 🔒 admin approval later
//     },
//   });

//   return NextResponse.json({ success: true });
// }
//////////////// WORKING BELOW /////

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";


// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import { prisma } from "@/lib/prisma";
// import { sendMail } from "@/lib/mailer";
// import { createApprovalToken } from "@/lib/approval-token";

// export async function POST(req: Request) {
//   const body = await req.json();
//   const { email, password, companyName } = body;

//   if (!email || !password || !companyName) {
//     return NextResponse.json({ error: "Missing fields" }, { status: 400 });
//   }

//   const existing = await prisma.user.findUnique({
//     where: { email },
//   });

//   if (existing) {
//     return NextResponse.json(
//       { error: "Email already registered" },
//       { status: 400 }
//     );
//   }

//   const passwordHash = await bcrypt.hash(password, 10);

//   const user = await prisma.user.create({
//     data: {
//       email,
//       passwordHash,
//       companyName,
//       role: "insurer",
//       approved: false,
//     },
//   });

//   // 🔐 Create approval token
//   const token = createApprovalToken(user.id);

//   // 📧 Email admin
//   await sendMail({
//     to: process.env.ADMIN_EMAIL!,
//     subject: "New insurer awaiting approval",
//     html: `
//       <h2>New insurer registration</h2>
//       <p><strong>Company:</strong> ${user.companyName}</p>
//       <p><strong>Email:</strong> ${user.email}</p>

//       <p>
//         <a href="${process.env.APP_URL}/api/admin/approve?token=${token}">
//           ✅ Approve insurer
//         </a>
//       </p>

//       <p>
//         <a href="${process.env.APP_URL}/api/admin/reject?token=${token}">
//           ❌ Reject insurer
//         </a>
//       </p>
//     `,
//   });

//   return NextResponse.json({ success: true });
// }

///////// NEW TEST //////
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";


// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import { prisma } from "@/lib/prisma";
// //import { sendMail } from "@/lib/mailer";
// import { createApprovalToken } from "@/lib/approval-token";

// export async function POST(req: Request) {
//   const body = await req.json();
//   const { email, password, companyName } = body;

//   if (!email || !password || !companyName) {
//     return NextResponse.json({ error: "Missing fields" }, { status: 400 });
//   }

//   const existing = await prisma.user.findUnique({
//     where: { email },
//   });

//   if (existing) {
//     return NextResponse.json(
//       { error: "Email already registered" },
//       { status: 400 }
//     );
//   }

//   const passwordHash = await bcrypt.hash(password, 10);

//   const user = await prisma.user.create({
//     data: {
//       email,
//       passwordHash,
//       companyName,
//       role: "insurer",
//       approved: false,
//     },
//   });
//   ////////new code ///
//   await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/send-admin-approval`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       userId: user.id,
//       email: user.email,
//       companyName: user.companyName,
//     }),
//   });



//   // 🔐 Create approval token
//   const token = createApprovalToken(user.id);

  
  

//   return NextResponse.json({ success: true });
// }

/////////? ////
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendAdminApprovalEmail } from "@/lib/admin-approval-email";
import { allow, limiters } from "@/lib/ratelimit";
import { clientIp } from "@/lib/client-ip";

export async function POST(req: Request) {
  try {
    if (!(await allow(limiters.register, clientIp(req)))) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password, companyName } = body;

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // Password policy: minimum length.
    if (String(password).length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normEmail = String(email).trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normEmail,
        passwordHash,
        companyName,
        role: "agent",
        approved: false,
      },
    });

    // 📧 SEND ADMIN APPROVAL EMAIL (RESEND)
    // await fetch(
    //   `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/send-admin-approval`,
    //   {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       userId: user.id,
    //       email: user.email,
    //       companyName: user.companyName,
    //     }),
    //   }
    // );
    // Send the HMAC-token approval email directly (no public HTTP hop).
    // Non-blocking: registration succeeds even if the email fails.
    try {
      await sendAdminApprovalEmail({
        userId: user.id,
        email: user.email,
        companyName: user.companyName,
      });
    } catch (e) {
      console.error("Approval email failed (non-blocking):", e);
    }



    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Registration failed:", error);

    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}