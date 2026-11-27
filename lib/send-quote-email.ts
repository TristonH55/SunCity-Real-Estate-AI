import { resend } from "@/lib/resend";
import { renderQuotePdf } from "@/lib/quote-pdf";
import { createQuoteApprovalToken } from "@/lib/quote-approval-token";
import { OFFICE_PHONE } from "@/lib/customer";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Emails the quote PDF (attached) with the approval link. Used by the
 * "Email quote to homeowner" button and automatically for customer quotes.
 * forCustomer swaps "reply to your agent" for the office phone number.
 */
export async function sendQuoteEmail({
  quoteId,
  to,
  firstName,
  forCustomer,
}: {
  quoteId: string;
  to: string;
  firstName?: string;
  forCustomer: boolean;
}): Promise<boolean> {
  const rendered = await renderQuotePdf(quoteId);
  if (!rendered) return false;

  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  const approveUrl = `${base}/approve/${createQuoteApprovalToken(quoteId)}`;
  const help = forCustomer
    ? `If you have any questions, just call us on ${OFFICE_PHONE}.`
    : "If you have any questions, just reply to your agent.";

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "SunCity <no-reply@suncityhotwater.com.au>",
    to,
    subject: "Your SunCity hot water quote",
    html: `
        <p>Hi ${escapeHtml(firstName || "there")},</p>
        <p>Please find your SunCity hot water system quote attached as a PDF.
        It shows up to three system options with full pricing.</p>
        <p>When you're ready, you can choose your preferred system and approve it
        online:</p>
        <p>
          <a href="${approveUrl}"
             style="display:inline-block;background:#db231f;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
            Review &amp; approve your quote online
          </a>
        </p>
        <p style="font-size:12px;color:#666">Or paste this link into your browser:<br/>${approveUrl}</p>
        <p>${help}</p>
        <p>Thanks,<br/>SunCity Hot Water</p>
      `,
    attachments: [
      {
        filename: rendered.filename,
        content: rendered.buffer.toString("base64"),
      },
    ],
  });
  return true;
}
