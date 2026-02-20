import { prisma } from "@/lib/prisma";
import type { ExpenseEntity, CreateExpenseInput } from "../domain/entities";
import type { IExpenseRepository } from "../domain/repository";

function toEntity(row: {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  category: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}): ExpenseEntity {
  return {
    id: row.id,
    userId: row.userId,
    amount: row.amount,
    description: row.description,
    category: row.category,
    date: row.date,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaExpenseRepository implements IExpenseRepository {
  async create(data: CreateExpenseInput): Promise<ExpenseEntity> {
    const row = await prisma.expense.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        description: data.description ?? null,
        category: data.category ?? null,
        date: data.date,
      },
    });
    return toEntity(row);
  }

  async findByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<ExpenseEntity[]> {
    const rows = await prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { date: "desc" },
    });
    return rows.map(toEntity);
  }

  async sumByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<number> {
    const result = await prisma.expense.aggregate({
      where: { userId, date: { gte: start, lte: end } },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }
}
