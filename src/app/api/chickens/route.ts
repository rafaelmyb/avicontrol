import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { PrismaChickenRepository } from "@/modules/chicken/infrastructure/prisma-chicken-repository";
import { createChicken } from "@/modules/chicken/application/create-chicken";
import { listChickensByUser } from "@/modules/chicken/application/list-chickens";

const createBodySchema = z.object({
  name: z.string().min(1),
  breed: z.string().min(1),
  birthDate: z.string().min(1),
  status: z.enum([
    "chick",
    "pullet",
    "laying",
    "brooding",
    "recovering",
    "retired",
    "sold",
    "deceased",
  ]),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const repo = new PrismaChickenRepository();
  const { searchParams } = new URL(request.url);
  const skip = Number(searchParams.get("skip")) || 0;
  const take = Number(searchParams.get("take")) || 50;
  const result = await listChickensByUser(repo, session.user.id, { skip, take });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = createBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { name, breed, birthDate, status } = parsed.data;
    const repo = new PrismaChickenRepository();
    const chicken = await createChicken(repo, {
      userId: session.user.id,
      name,
      breed,
      birthDate: new Date(birthDate),
      status,
    });
    return NextResponse.json(chicken);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
