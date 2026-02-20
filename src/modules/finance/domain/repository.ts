import type {
  ExpenseEntity,
  RevenueEntity,
  CreateExpenseInput,
  CreateRevenueInput,
} from "./entities";

export interface IExpenseRepository {
  create(data: CreateExpenseInput): Promise<ExpenseEntity>;
  findByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<ExpenseEntity[]>;
  sumByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<number>;
}

export interface IRevenueRepository {
  create(data: CreateRevenueInput): Promise<RevenueEntity>;
  findByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<RevenueEntity[]>;
  sumByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<number>;
}
