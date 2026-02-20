import { prisma } from "@/lib/prisma";
import type { BroodCycleEntity, CreateBroodCycleInput } from "../domain/entities";
import type { IBroodCycleRepository } from "../domain/repository";

function toEntity(row: {
  id: string;
  chickenId: string;
  startDate: Date;
  eggCount: number;
  expectedHatchDate: Date;
  expectedReturnToLayDate: Date;
  actualHatchedCount: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): BroodCycleEntity {
  return {
    id: row.id,
    chickenId: row.chickenId,
    startDate: row.startDate,
    eggCount: row.eggCount,
    expectedHatchDate: row.expectedHatchDate,
    expectedReturnToLayDate: row.expectedReturnToLayDate,
    actualHatchedCount: row.actualHatchedCount,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaBroodCycleRepository implements IBroodCycleRepository {
  async create(data: CreateBroodCycleInput): Promise<BroodCycleEntity> {
    const row = await prisma.broodCycle.create({
      data: {
        chickenId: data.chickenId,
        startDate: data.startDate,
        eggCount: data.eggCount,
        expectedHatchDate: data.expectedHatchDate,
        expectedReturnToLayDate: data.expectedReturnToLayDate,
        status: data.status,
      },
    });
    return toEntity(row);
  }

  async findById(id: string): Promise<BroodCycleEntity | null> {
    const row = await prisma.broodCycle.findUnique({
      where: { id },
    });
    return row ? toEntity(row) : null;
  }

  async findByChickenId(chickenId: string): Promise<BroodCycleEntity[]> {
    const rows = await prisma.broodCycle.findMany({
      where: { chickenId },
      orderBy: { startDate: "desc" },
    });
    return rows.map(toEntity);
  }

  async findByUserId(userId: string): Promise<BroodCycleEntity[]> {
    const rows = await prisma.broodCycle.findMany({
      where: { chicken: { userId } },
      include: { chicken: true },
      orderBy: { expectedHatchDate: "asc" },
    });
    return rows.map((r) => toEntity(r));
  }

  async update(
    id: string,
    data: Partial<Pick<BroodCycleEntity, "actualHatchedCount" | "status">>
  ): Promise<BroodCycleEntity | null> {
    const row = await prisma.broodCycle.update({
      where: { id },
      data: {
        ...(data.actualHatchedCount != null && { actualHatchedCount: data.actualHatchedCount }),
        ...(data.status != null && { status: data.status }),
      },
    });
    return toEntity(row);
  }
}
