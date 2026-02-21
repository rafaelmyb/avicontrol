import { queryClient } from "@/lib/query-client";
import { createExpense } from "@/services/requests/expenses/create-expense";
import { deleteExpense as deleteExpenseRequest } from "@/services/requests/expenses/delete-expense";
import {
  loadExpenses,
  type ExpenseListOptions,
} from "@/services/requests/expenses/load-expenses";
import { loadExpense } from "@/services/requests/expenses/load-expense";
import { updateExpense as updateExpenseRequest } from "@/services/requests/expenses/update-expense";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export type { ExpenseListOptions } from "@/services/requests/expenses/load-expenses";

export const useLoadExpenses = (options: ExpenseListOptions) => {
  return useQuery({
    queryKey: ["expenses", ...Object.values(options)],
    queryFn: () => loadExpenses(options),
    enabled: !!options.start && !!options.end,
  });
};

export const useLoadExpense = (id: string | null) => {
  return useQuery({
    queryKey: ["expenses", id],
    queryFn: () => loadExpense(id!),
    enabled: !!id,
  });
};

const useCreateExpense = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/finance");
    },
  });
};

const useUpdateExpense = (id: string) => {
  return useMutation({
    mutationFn: (body: Parameters<typeof updateExpenseRequest>[1]) =>
      updateExpenseRequest(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

const useDeleteExpense = () => {
  return useMutation({
    mutationFn: deleteExpenseRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const ExpenseQueries = {
  useLoadExpenses,
  useLoadExpense,
};

export const ExpenseMutations = {
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
};
