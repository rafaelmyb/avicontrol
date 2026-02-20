export interface ExpenseEntity {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  category: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RevenueEntity {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  source: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseInput {
  userId: string;
  amount: number;
  description?: string | null;
  category?: string | null;
  date: Date;
}

export interface CreateRevenueInput {
  userId: string;
  amount: number;
  description?: string | null;
  source?: string | null;
  date: Date;
}
