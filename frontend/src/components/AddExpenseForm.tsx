import { useState } from "react";
import { ALLOWED_CATEGORIES } from "../types";
import { createExpense } from "../api/expenses";

interface Props {
  onExpenseCreated: () => void;
}

interface FormErrors {
  amount?: string;
  date?: string;
  category?: string;
  description?: string;
  form?: string;
}

function validateForm(
  amount: string,
  date: string,
  category: string,
  description: string
): FormErrors {
  const errors: FormErrors = {};

  const amountNum = Number(amount);
  if (!amount || amountNum <= 0) {
    errors.amount = "Amount must be greater than 0";
  }

  if (!date) {
    errors.date = "Date is required";
  } else {
    const parsed = new Date(date + "T00:00:00");
    if (isNaN(parsed.getTime())) {
      errors.date = "Please enter a valid date";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsed > today) {
        errors.date = "Date cannot be in the future";
      }
    }
  }

  if (!category) {
    errors.category = "Please select a category";
  }

  if (description.length > 250) {
    errors.description = "Description must not exceed 250 characters";
  }

  return errors;
}

export default function AddExpenseForm({ onExpenseCreated }: Props) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const clientErrors = validateForm(amount, date, category, description);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);

    const result = await createExpense({
      amount: Number(amount),
      date,
      category,
      description: description || undefined,
    });

    setSubmitting(false);

    if (result.errors) {
      const serverErrors: FormErrors = {};
      for (const err of result.errors) {
        if (err.field === "amount") serverErrors.amount = err.message;
        else if (err.field === "date") serverErrors.date = err.message;
        else if (err.field === "category") serverErrors.category = err.message;
        else if (err.field === "description") serverErrors.description = err.message;
        else serverErrors.form = err.message;
      }
      setErrors(serverErrors);
      return;
    }

    setAmount("");
    setDate("");
    setCategory("");
    setDescription("");
    onExpenseCreated();
  };

  return (
    <form className="add-expense-form" onSubmit={handleSubmit}>
      <h2>Add Expense</h2>

      <div className="field">
        <label htmlFor="amount">Amount *</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 250.75"
        />
        {errors.amount && <span className="error">{errors.amount}</span>}
      </div>

      <div className="field">
        <label htmlFor="date">Date *</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {errors.date && <span className="error">{errors.date}</span>}
      </div>

      <div className="field">
        <label htmlFor="category">Category *</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">-- Select a category --</option>
          {ALLOWED_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.category && <span className="error">{errors.category}</span>}
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes..."
          maxLength={250}
        />
        <span className="char-count">{description.length}/250</span>
        {errors.description && <span className="error">{errors.description}</span>}
      </div>

      {errors.form && <div className="error form-error">{errors.form}</div>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save Expense"}
      </button>
    </form>
  );
}
