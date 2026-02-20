import { prisma } from "@/lib/prisma";
import type { ExpenseEntity, CreateExpenseInput } from "../domain/entities";
import type { IExpenseRepository, FinanceListOptions } from "../domain/repository";

function toEntity(row: {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  category: string | null;
  date: Date;
  chickenId: string | null;
  feedInventoryId: string | null;
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
    chickenId: row.chickenId ?? null,
    feedInventoryId: row.feedInventoryId ?? null,
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
        chickenId: data.chickenId ?? undefined,
        feedInventoryId: data.feedInventoryId ?? undefined,
      },
    });
    return toEntity(row);
  }

  async findById(id: string, userId: string): Promise<ExpenseEntity | null> {
    const row = await prisma.expense.findFirst({
      where: { id, userId },
    });
    return row ? toEntity(row) : null;
  }

  async findByChickenId(userId: string, chickenId: string): Promise<ExpenseEntity | null> {
    const row = await prisma.expense.findFirst({
      where: { userId, chickenId },
    });
    return row ? toEntity(row) : null;
  }

  async findByFeedInventoryId(userId: string, feedInventoryId: string): Promise<ExpenseEntity | null> {
    const row = await prisma.expense.findFirst({
      where: { userId, feedInventoryId },
    });
    return row ? toEntity(row) : null;
  }

  async findByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date,
    options?: FinanceListOptions
  ): Promise<ExpenseEntity[]> {
    const orderByField = options?.orderBy ?? "date";
    const orderDirection = options?.orderDirection ?? "desc";
    const rows = await prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { [orderByField]: orderDirection },
      skip: options?.skip,
      take: options?.take,
    });
    return rows.map(toEntity);
  }

  async countByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<number> {
    return prisma.expense.count({
      where: { userId, date: { gte: start, lte: end } },
    });
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

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<ExpenseEntity, "amount" | "description" | "category" | "date">>
  ): Promise<ExpenseEntity | null> {
    const row = await prisma.expense.updateMany({
      where: { id, userId },
      data: {
        ...(data.amount != null && { amount: data.amount }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.date != null && { date: data.date }),
      },
    });
    if (row.count === 0) return null;
    const updated = await prisma.expense.findFirst({
      where: { id, userId },
    });
    return updated ? toEntity(updated) : null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.expense.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }
}
