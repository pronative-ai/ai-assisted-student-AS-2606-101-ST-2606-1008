import type { CreateExpenseRequest, ExpenseResponse, ValidationError } from "../types";
import { API_BASE_URL } from "../types";

export async function createExpense(
  request: CreateExpenseRequest
): Promise<{ data?: ExpenseResponse; errors?: ValidationError[] }> {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (response.status === 400) {
    const body = await response.json();
    return { errors: body.errors };
  }

  if (response.status === 201) {
    const data = await response.json();
    return { data };
  }

  const data = await response.json();
  return { data };
}

export async function getExpenses(): Promise<ExpenseResponse[]> {
  const response = await fetch(`${API_BASE_URL}/expenses`);
  return response.json();
}
