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
////////////////

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { createApprovalToken } from "@/lib/approval-token";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, companyName } = body;

  if (!email || !password || !companyName) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email },
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
      email,
      passwordHash,
      companyName,
      role: "insurer",
      approved: false,
    },
  });

  // 🔐 Create approval token
  const token = createApprovalToken(user.id);

  // 📧 Email admin
  await sendMail({
    to: process.env.ADMIN_EMAIL!,
    subject: "New insurer awaiting approval",
    html: `
      <h2>New insurer registration</h2>
      <p><strong>Company:</strong> ${user.companyName}</p>
      <p><strong>Email:</strong> ${user.email}</p>

      <p>
        <a href="${process.env.APP_URL}/api/admin/approve?token=${token}">
          ✅ Approve insurer
        </a>
      </p>

      <p>
        <a href="${process.env.APP_URL}/api/admin/reject?token=${token}">
          ❌ Reject insurer
        </a>
      </p>
    `,
  });

  return NextResponse.json({ success: true });
}
