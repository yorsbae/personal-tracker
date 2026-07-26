import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export interface Profile {
  id: string;
  nama: string | null;
  username: string | null;
  umur: number | null;
  jenis_kelamin: string | null;
  tinggi_badan: number | null; // cm
  berat_badan: number | null; // kg
  target_berat_badan: number | null;
  aktivitas_level: string | null;
  onboarding_done: boolean | null;
}

export type ProfileInput = Omit<Profile, "id">;

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, nama, username, umur, jenis_kelamin, tinggi_badan, berat_badan, target_berat_badan, aktivitas_level, onboarding_done",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (!error) setProfile(data as Profile | null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (input: Partial<ProfileInput>) => {
    if (!user) return { error: "Belum login" };
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...input });
    if (error) return { error: error.message };
    await fetchProfile();
    return { error: null };
  };

  return { profile, loading, saveProfile };
}
