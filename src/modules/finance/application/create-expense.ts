import type { IExpenseRepository } from "../domain/repository";
import type { CreateExpenseInput } from "../domain/entities";

export interface ExpenseDto {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  category: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export async function createExpense(
  repo: IExpenseRepository,
  input: CreateExpenseInput
): Promise<ExpenseDto> {
  const entity = await repo.create(input);
  return {
    id: entity.id,
    userId: entity.userId,
    amount: entity.amount,
    description: entity.description,
    category: entity.category,
    date: entity.date.toISOString(),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
