import { prisma } from "lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.redirect("/login?error=missing_user");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { approved: false },
  });

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/login?rejected=1`
  );
}