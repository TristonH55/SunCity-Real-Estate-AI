export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import { resend } from "@/lib/resend";
import { renderQuotePdf } from "@/lib/quote-pdf";
import { createQuoteApprovalToken } from "@/lib/quote-approval-token";
import { allow, limiters } from "@/lib/ratelimit";
import { checkOrigin } from "@/lib/origin-check";
import { clientIp } from "@/lib/client-ip";

// Emails the homeowner the 3-option quote PDF (attached). Recipient is the
// homeowner email currently on the quote (editable via the pencil). Homeowner only.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Agents only (admins pass). Route is outside the middleware matcher.
  const { session, error } = await requireApiRole("agent");
  if (error) return error;

  const originError = checkOrigin(req);
  if (originError) return originError;

  const { id } = await params;

  try {
    if (!(await allow(limiters.sendEmail, `${id}:${clientIp(req)}`))) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      select: { agentId: true, customerSnapshot: true },
    });
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Per-agent ownership.
    const isOwner = quote.agentId === session!.user.id;
    const isAdmin = session!.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const customer = (quote.customerSnapshot ?? {}) as Record<string, any>;
    const email = String(customer.email ?? "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "No valid homeowner email on this quote" },
        { status: 400 }
      );
    }

    const rendered = await renderQuotePdf(id);
    if (!rendered) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const firstName = customer.firstName || "there";
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const approveUrl = `${base}/approve/${createQuoteApprovalToken(id)}`;

    await resend.emails.send({
      from:
        process.env.EMAIL_FROM || "SunCity <no-reply@suncityhotwater.com.au>",
      to: email,
      subject: "Your SunCity hot water quote",
      html: `
        <p>Hi ${firstName},</p>
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
        <p>If you have any questions, just reply to your agent.</p>
        <p>Thanks,<br/>SunCity Hot Water</p>
      `,
      attachments: [
        {
          filename: rendered.filename,
          content: rendered.buffer.toString("base64"),
        },
      ],
    });

    return NextResponse.json({ success: true, sentTo: email });
  } catch (err: any) {
    console.error("send-email failed:", err?.message || err);
    return NextResponse.json(
      { error: "Failed to send email – check email configuration." },
      { status: 500 }
    );
  }
}
