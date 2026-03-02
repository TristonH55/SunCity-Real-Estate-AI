// import { NextResponse } from "next/server";
// import { resend } from "lib/resend";

// export async function POST(req: Request) {
//     const { userId, email, companyName } = await req.json();

//     const approveUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/approve?userId=${userId}`;
//     const rejectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/reject?userId=${userId}`;

//   await resend.emails.send({
//     from: "SunCity <no-reply@suncityhotwater.com.au>",
//     to: process.env.ADMIN_EMAIL!,
//     subject: "New User Registration Approval Required",
//     html: `
//       <h2>New User Registration</h2>
//       <p><strong>Name:</strong> ${userId}</p>
//       <p><strong>Email:</strong> ${email}</p>
//       <p><strong>Company:</strong> ${companyName}</p>

//       <div style="margin-top:20px">
//         <a href="${approveUrl}"
//            style="background:#16a34a;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;margin-right:10px">
//           ✅ Approve
//         </a>

//         <a href="${rejectUrl}"
//            style="background:#dc2626;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">
//           ❌ Reject
//         </a>
//       </div>
//     `,
//   });

//   return NextResponse.json({ success: true });
// }

//V2 TEST
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { userId, email, companyName } = await req.json();

    if (!userId || !email || !companyName) {
      return NextResponse.json(
        { error: "Missing email data" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const approveUrl = `${baseUrl}/api/auth/approve?userId=${userId}`;
    const rejectUrl = `${baseUrl}/api/auth/reject?userId=${userId}`;

    const result = await resend.emails.send({
      from: "SunCity <no-reply@suncityhotwater.com.au>",
      to: process.env.ADMIN_EMAIL!,
      subject: "New Insurer Registration – Approval Required",
      html: `
        <h2>New Insurer Registration</h2>

        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Email:</strong> ${email}</p>

        <p>
          <a href="${approveUrl}">✅ Approve user</a>
          &nbsp;|&nbsp;
          <a href="${rejectUrl}">❌ Reject user</a>
        </p>

        <hr />

        <p><strong>If buttons do not work, copy & paste:</strong></p>
        <p>Approve:<br/>${approveUrl}</p>
        <p>Reject:<br/>${rejectUrl}</p>
      `,
    });

    console.log("✅ Resend response:", result);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Email send failed:", err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}