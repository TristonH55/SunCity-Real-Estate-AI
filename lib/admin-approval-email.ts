import { resend } from "@/lib/resend";
import { createApprovalToken } from "@/lib/approval-token";

/**
 * Sends the admin the approve/reject email for a newly-registered agent.
 * Links carry an HMAC approval token (lib/approval-token.ts) and point at the
 * token-verified endpoints (/api/admin/admin, /api/admin/admin/reject) — no raw
 * userId is ever exposed. Call this directly (server-side); it is not an HTTP
 * endpoint, so it cannot be abused by anonymous callers.
 */
export async function sendAdminApprovalEmail(opts: {
  userId: string;
  email: string;
  companyName: string;
}) {
  const token = createApprovalToken(opts.userId);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  const approveUrl = `${baseUrl}/api/admin/admin?token=${token}`;
  const rejectUrl = `${baseUrl}/api/admin/admin/reject?token=${token}`;

  return resend.emails.send({
    from: process.env.EMAIL_FROM || "SunCity <no-reply@suncityhotwater.com.au>",
    to: process.env.ADMIN_EMAIL!,
    subject: "New Agent Registration – Approval Required",
    html: `
      <h2>New Agent Registration</h2>
      <p><strong>Company:</strong> ${opts.companyName}</p>
      <p><strong>Email:</strong> ${opts.email}</p>
      <p>
        <a href="${approveUrl}">✅ Approve agent</a>
        &nbsp;|&nbsp;
        <a href="${rejectUrl}">❌ Reject agent</a>
      </p>
      <hr/>
      <p><strong>If the buttons do not work, copy &amp; paste:</strong></p>
      <p>Approve:<br/>${approveUrl}</p>
      <p>Reject:<br/>${rejectUrl}</p>
    `,
  });
}
