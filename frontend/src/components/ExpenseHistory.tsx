import { useState, useEffect, useCallback } from "react";
import type { ExpenseResponse } from "../types";
import { getExpenses } from "../api/expenses";

export default function ExpenseHistory({ refreshKey }: { refreshKey: number }) {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (loading) {
    return (
      <div className="expense-history">
        <h2>Expense History</h2>
        <p className="empty">Loading...</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="expense-history">
        <h2>Expense History</h2>
        <p className="empty">No expenses recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="expense-history">
      <h2>Expense History</h2>
      <div className="expense-list">
        {expenses.map((exp) => (
          <div key={exp.expenseId} className="expense-item">
            <div className="expense-date">{exp.date}</div>
            <div className="expense-amount">{formatCurrency(exp.amount)}</div>
            <div className="expense-category">{exp.category}</div>
            {exp.description && (
              <div className="expense-description">{exp.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}
