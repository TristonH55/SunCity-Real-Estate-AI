import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, companyName } = body;

  if (!email || !password || !companyName) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      companyName,
      role: "insurer",
      approved: false, // 🔒 admin approval later
    },
  });

  return NextResponse.json({ success: true });
}
