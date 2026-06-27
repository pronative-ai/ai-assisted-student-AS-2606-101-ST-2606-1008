export interface CreateExpenseRequest {
  amount: number;
  date: string;
  category: string;
  description?: string;
}

export interface ExpenseResponse {
  expenseId: string;
  amount: number;
  date: string;
  category: string;
  description: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const ALLOWED_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Education",
  "Personal Care",
  "Other",
] as const;

export const API_BASE_URL = "http://localhost:5041";
