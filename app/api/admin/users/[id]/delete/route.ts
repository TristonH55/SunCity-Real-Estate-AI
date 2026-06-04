// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// import { prisma } from "../../../../../../lib/prisma";
// import { NextResponse } from "next/server";

// export async function POST(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   await prisma.user.delete({
//     where: { id: params.id },
//   });

//   return NextResponse.json({ success: true });
// }

/////V2
import { prisma } from "../../../../../../lib/prisma";
import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/require-api-role";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // 🔒 Admin only
  const { error } = await requireApiRole("admin");
  if (error) return error;

  const { id } = await context.params;

  await prisma.user.delete({
    where: { id }
  });

  return NextResponse.json({ success: true });
}