import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import type { BudgetTarget, BudgetTargetInput } from "../../types";

// Helper: dapatkan tanggal "1" bulan ini dalam format YYYY-MM-01
function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export function useBudgetTarget() {
  const { user } = useAuth();
  const [target, setTarget] = useState<BudgetTarget | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTarget = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("budget_targets")
      .select("*")
      .eq("bulan", getCurrentMonthKey())
      .maybeSingle();

    if (!error) setTarget(data as BudgetTarget | null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTarget();
  }, [fetchTarget]);

  // Simpan/update target bulan ini. "upsert" karena mungkin belum ada row untuk bulan ini.
  const saveTarget = async (input: Partial<BudgetTargetInput>) => {
    if (!user) return { error: "Belum login" };

    const { error } = await supabase.from("budget_targets").upsert(
      {
        user_id: user.id,
        bulan: getCurrentMonthKey(),
        ...input,
      },
      { onConflict: "user_id,bulan" },
    );

    if (error) return { error: error.message };
    await fetchTarget();
    return { error: null };
  };

  return { target, loading, saveTarget };
}
