import { useMemo } from "react";
import { useExpenses } from "../expense/UseExpenses";
import { useIncomes } from "../income/UseIncomes";
import { useBudgetTarget } from "./UseBudgetTarget";

function isInMonth(tanggal: string, monthsAgo: number) {
  const d = new Date(tanggal);
  const target = new Date();
  target.setMonth(target.getMonth() - monthsAgo);
  return (
    d.getMonth() === target.getMonth() &&
    d.getFullYear() === target.getFullYear()
  );
}

export function useMoneySummary() {
  const { expenses, loading: le } = useExpenses();
  const { incomes, loading: li } = useIncomes();
  const { target, loading: lt, saveTarget } = useBudgetTarget();

  const loading = le || li || lt;

  // ---- Angka bulan ini ----
  const expenseThisMonth = useMemo(
    () => expenses.filter((e) => isInMonth(e.tanggal, 0)),
    [expenses],
  );
  const incomeThisMonth = useMemo(
    () => incomes.filter((i) => isInMonth(i.tanggal, 0)),
    [incomes],
  );

  const totalExpense = expenseThisMonth.reduce((sum, e) => sum + e.nominal, 0);
  const totalIncome = incomeThisMonth.reduce((sum, i) => sum + i.nominal, 0);
  const saldo = totalIncome - totalExpense;

  // Breakdown pengeluaran per kategori bulan ini
  const expensePerKategori = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenseThisMonth) {
      map[e.kategori] = (map[e.kategori] ?? 0) + e.nominal;
    }
    return map;
  }, [expenseThisMonth]);

  // ---- Saran otomatis: rata-rata 3 bulan terakhir (bulan -1, -2, -3, TIDAK termasuk bulan ini) ----
  const suggestion = useMemo(() => {
    const monthsBack = [1, 2, 3];

    // Saran saving = rata-rata (income - expense) 3 bulan terakhir
    const netPerMonth = monthsBack.map((m) => {
      const inc = incomes
        .filter((i) => isInMonth(i.tanggal, m))
        .reduce((s, i) => s + i.nominal, 0);
      const exp = expenses
        .filter((e) => isInMonth(e.tanggal, m))
        .reduce((s, e) => s + e.nominal, 0);
      return inc - exp;
    });
    const validNet = netPerMonth.filter((n) => n !== 0);
    const suggestedSaving =
      validNet.length > 0
        ? Math.round(validNet.reduce((a, b) => a + b, 0) / validNet.length)
        : null;

    // Saran budget per kategori = rata-rata pengeluaran kategori itu 3 bulan terakhir, +10% buffer
    const kategoriTotals: Record<string, number[]> = {};
    for (const m of monthsBack) {
      const expMonth = expenses.filter((e) => isInMonth(e.tanggal, m));
      const perKategori: Record<string, number> = {};
      for (const e of expMonth) {
        perKategori[e.kategori] = (perKategori[e.kategori] ?? 0) + e.nominal;
      }
      for (const [kat, val] of Object.entries(perKategori)) {
        if (!kategoriTotals[kat]) kategoriTotals[kat] = [];
        kategoriTotals[kat].push(val);
      }
    }
    const suggestedBudget: Record<string, number> = {};
    for (const [kat, vals] of Object.entries(kategoriTotals)) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      suggestedBudget[kat] = Math.round(avg * 1.1); // +10% buffer
    }

    // Ada cukup data historis kalau minimal 1 bulan sebelumnya ada transaksi
    const hasEnoughHistory = validNet.length > 0;

    return { suggestedSaving, suggestedBudget, hasEnoughHistory };
  }, [expenses, incomes]);

  return {
    loading,
    totalExpense,
    totalIncome,
    saldo,
    expensePerKategori,
    target,
    saveTarget,
    suggestion,
  };
}
