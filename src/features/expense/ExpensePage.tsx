import { useState } from "react";
import { useExpenses } from "./UseExpenses";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";
import type { Expense, ExpenseInput } from "../../types";

export default function ExpensePage() {
  const { expenses, loading, addExpense, updateExpense, deleteExpense } =
    useExpenses();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Fungsi ini dikirim ke ExpenseForm sebagai prop onSubmit.
  // Kalau sedang mode edit -> panggil updateExpense, kalau tidak -> addExpense
  const handleSubmit = async (input: ExpenseInput) => {
    if (editingExpense) {
      const result = await updateExpense(editingExpense.id, input);
      if (!result.error) setEditingExpense(null); // keluar dari mode edit setelah sukses
      return result;
    }
    return addExpense(input);
  };

  const totalBulanIni = expenses
    .filter((e) => {
      const d = new Date(e.tanggal);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + e.nominal, 0);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Pengeluaran</h1>
        <p className="text-sm text-gray-500">
          Total bulan ini:{" "}
          <span className="font-semibold text-red-600">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(totalBulanIni)}
          </span>
        </p>
      </div>

      <ExpenseForm
        onSubmit={handleSubmit}
        editingExpense={editingExpense}
        onCancelEdit={() => setEditingExpense(null)}
      />

      <ExpenseList
        expenses={expenses}
        loading={loading}
        onEdit={setEditingExpense}
        onDelete={deleteExpense}
      />
    </div>
  );
}
