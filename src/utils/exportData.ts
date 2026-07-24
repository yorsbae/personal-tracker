import { supabase } from "../lib/supabase";

const TABLES = [
  "expenses",
  "incomes",
  "budget_targets",
  "wishlists",
  "exercises",
  "learnings",
  "journals",
  "creative_projects",
  "notes",
  "events",
  "profiles",
];

export async function exportAllData(): Promise<{ error: string | null }> {
  try {
    const result: Record<string, unknown> = {};

    for (const table of TABLES) {
      const { data, error } = await supabase.from(table).select("*");
      if (error)
        return { error: `Gagal export tabel ${table}: ${error.message}` };
      result[table] = data;
    }

    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeos-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal export data" };
  }
}
