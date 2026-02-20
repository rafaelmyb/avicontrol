import { prisma } from "@/lib/prisma";
import type { RevenueEntity, CreateRevenueInput } from "../domain/entities";
import type { IRevenueRepository } from "../domain/repository";

function toEntity(row: {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  source: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}): RevenueEntity {
  return {
    id: row.id,
    userId: row.userId,
    amount: row.amount,
    description: row.description,
    source: row.source,
    date: row.date,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaRevenueRepository implements IRevenueRepository {
  async create(data: CreateRevenueInput): Promise<RevenueEntity> {
    const row = await prisma.revenue.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        description: data.description ?? null,
        source: data.source ?? null,
        date: data.date,
      },
    });
    return toEntity(row);
  }

  async findByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<RevenueEntity[]> {
    const rows = await prisma.revenue.findMany({
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
    const result = await prisma.revenue.aggregate({
      where: { userId, date: { gte: start, lte: end } },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }
}
