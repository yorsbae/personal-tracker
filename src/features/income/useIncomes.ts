import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import type { Income, IncomeInput } from "../../types";

export function useIncomes() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncomes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("incomes")
      .select("*")
      .order("tanggal", { ascending: false });

    if (error) setError(error.message);
    else setIncomes(data as Income[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const addIncome = async (input: IncomeInput) => {
    if (!user) return { error: "Belum login" };
    const { error } = await supabase
      .from("incomes")
      .insert({ ...input, user_id: user.id });
    if (error) return { error: error.message };
    await fetchIncomes();
    return { error: null };
  };

  const updateIncome = async (id: string, input: IncomeInput) => {
    const { error } = await supabase.from("incomes").update(input).eq("id", id);
    if (error) return { error: error.message };
    await fetchIncomes();
    return { error: null };
  };

  const deleteIncome = async (id: string) => {
    const { error } = await supabase.from("incomes").delete().eq("id", id);
    if (error) return { error: error.message };
    await fetchIncomes();
    return { error: null };
  };

  return { incomes, loading, error, addIncome, updateIncome, deleteIncome };
}
