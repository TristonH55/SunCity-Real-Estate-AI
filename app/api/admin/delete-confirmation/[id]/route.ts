// import { prisma } from "lib/prisma";
// import { NextResponse } from "next/server";

// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     await prisma.pricingConfirmation.delete({
//       where: { id: params.id },
//     });

//     return NextResponse.json({ success: true });

//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to delete confirmation" },
//       { status: 500 }
//     );
//   }
// }

////v2
// import { prisma } from "../../../../../lib/prisma";
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../../../../lib/auth";

// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const session = await getServerSession(authOptions);

//   // Block if not logged in
//   if (!session) {
//     return NextResponse.json(
//       { error: "Not authenticated" },
//       { status: 401 }
//     );
//   }

//   // Block if not admin
//   if (session.user.role !== "admin") {
//     return NextResponse.json(
//       { error: "Not authorized" },
//       { status: 403 }
//     );
//   }

//   try {
//     await prisma.pricingConfirmation.delete({
//       where: { id: params.id },
//     });

//     return NextResponse.json({ success: true });

//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to delete confirmation" },
//       { status: 500 }
//     );
//   }
// }

////V3
import { prisma } from "../../../../../lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {

  const session = await getServerSession(authOptions);

  // Not logged in
  if (!session) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Not admin
  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Not authorized" },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {

    await prisma.pricingConfirmation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ Delete failed:", error);
    return NextResponse.json(
      { error: "Failed to delete confirmation" },
      { status: 500 }
    );

  }
}