import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import type { CalendarEvent, CalendarEventInput } from "../../types";

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("tanggal_mulai", { ascending: true });

    if (error) setError(error.message);
    else setEvents(data as CalendarEvent[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = async (input: CalendarEventInput) => {
    if (!user) return { error: "Belum login" };
    const { error } = await supabase
      .from("events")
      .insert({ ...input, user_id: user.id });
    if (error) return { error: error.message };
    await fetchEvents();
    return { error: null };
  };

  const updateEvent = async (id: string, input: CalendarEventInput) => {
    const { error } = await supabase.from("events").update(input).eq("id", id);
    if (error) return { error: error.message };
    await fetchEvents();
    return { error: null };
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return { error: error.message };
    await fetchEvents();
    return { error: null };
  };

  return { events, loading, error, addEvent, updateEvent, deleteEvent };
}
