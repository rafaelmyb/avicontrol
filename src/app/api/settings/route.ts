import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchBodySchema = z.object({
  eggPricePerUnit: z.number().min(0).nullable().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { eggPricePerUnit: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    eggPricePerUnit: user.eggPricePerUnit,
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(parsed.data.eggPricePerUnit !== undefined && {
        eggPricePerUnit: parsed.data.eggPricePerUnit,
      }),
    },
    select: { eggPricePerUnit: true },
  });
  return NextResponse.json({
    eggPricePerUnit: updated.eggPricePerUnit,
  });
}
