import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import type { Journal, JournalInput } from "../../types";

export function useJournals() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJournals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .order("tanggal", { ascending: false });

    if (!error) setJournals(data as Journal[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  const addJournal = async (input: JournalInput) => {
    if (!user) return { error: "Belum login" };
    const { error } = await supabase
      .from("journals")
      .insert({ ...input, user_id: user.id });
    if (error) return { error: error.message };
    await fetchJournals();
    return { error: null };
  };

  const updateJournal = async (id: string, input: JournalInput) => {
    const { error } = await supabase
      .from("journals")
      .update(input)
      .eq("id", id);
    if (error) return { error: error.message };
    await fetchJournals();
    return { error: null };
  };

  const deleteJournal = async (id: string) => {
    const { error } = await supabase.from("journals").delete().eq("id", id);
    if (error) return { error: error.message };
    await fetchJournals();
    return { error: null };
  };

  return { journals, loading, addJournal, updateJournal, deleteJournal };
}
