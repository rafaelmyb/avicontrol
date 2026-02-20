import type {
  ExpenseEntity,
  RevenueEntity,
  CreateExpenseInput,
  CreateRevenueInput,
} from "./entities";

export type FinanceOrderBy = "date" | "amount";

export interface FinanceListOptions {
  orderBy?: FinanceOrderBy;
  orderDirection?: "asc" | "desc";
  skip?: number;
  take?: number;
}

export interface IExpenseRepository {
  create(data: CreateExpenseInput): Promise<ExpenseEntity>;
  findById(id: string, userId: string): Promise<ExpenseEntity | null>;
  findByChickenId(userId: string, chickenId: string): Promise<ExpenseEntity | null>;
  findByFeedInventoryId(userId: string, feedInventoryId: string): Promise<ExpenseEntity | null>;
  findByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date,
    options?: FinanceListOptions
  ): Promise<ExpenseEntity[]>;
  countByUserIdAndDateRange(userId: string, start: Date, end: Date): Promise<number>;
  sumByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<number>;
  update(
    id: string,
    userId: string,
    data: Partial<Pick<ExpenseEntity, "amount" | "description" | "category" | "date">>
  ): Promise<ExpenseEntity | null>;
  delete(id: string, userId: string): Promise<boolean>;
}

export interface IRevenueRepository {
  create(data: CreateRevenueInput): Promise<RevenueEntity>;
  findById(id: string, userId: string): Promise<RevenueEntity | null>;
  findByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date,
    options?: FinanceListOptions
  ): Promise<RevenueEntity[]>;
  countByUserIdAndDateRange(userId: string, start: Date, end: Date): Promise<number>;
  sumByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<number>;
  update(
    id: string,
    userId: string,
    data: Partial<Pick<RevenueEntity, "amount" | "description" | "source" | "date">>
  ): Promise<RevenueEntity | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
