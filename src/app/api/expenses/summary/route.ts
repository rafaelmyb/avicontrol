import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaExpenseRepository } from "@/modules/finance/infrastructure/prisma-expense-repository";
import { getExpensesHistory } from "@/modules/finance/application/expenses-history";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repo = new PrismaExpenseRepository();
  const result = await getExpensesHistory(
    repo,
    session.user.id,
    new Date(),
    12
  );

  return NextResponse.json(result);
}
