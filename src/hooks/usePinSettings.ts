import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { hashPin } from "../utils/hashPin";

export function usePinSettings() {
  const { user } = useAuth();
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinHash, setPinHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Cek dulu apakah row profile sudah ada (mungkin belum, kalau user baru daftar
    // dan belum pernah isi Profile). Kalau belum ada, anggap PIN belum aktif.
    const { data, error } = await supabase
      .from("profiles")
      .select("pin_lock_enabled, pin_lock_hash")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data) {
      setPinEnabled(data.pin_lock_enabled ?? false);
      setPinHash(data.pin_lock_hash ?? null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Aktifkan PIN baru. "upsert" dipakai karena row profile mungkin belum ada sama sekali.
  const setupPin = async (pin: string) => {
    if (!user) return { error: "Belum login" };
    const hash = await hashPin(pin);

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, pin_lock_enabled: true, pin_lock_hash: hash });

    if (error) return { error: error.message };
    await fetchSettings();
    return { error: null };
  };

  // Matikan App Lock
  const disablePin = async () => {
    if (!user) return { error: "Belum login" };
    const { error } = await supabase
      .from("profiles")
      .update({ pin_lock_enabled: false })
      .eq("id", user.id);

    if (error) return { error: error.message };
    await fetchSettings();
    return { error: null };
  };

  // Cek apakah PIN yang diketik user cocok dengan hash tersimpan
  const verifyPin = async (pin: string): Promise<boolean> => {
    if (!pinHash) return false;
    const hash = await hashPin(pin);
    return hash === pinHash;
  };

  return { pinEnabled, loading, setupPin, disablePin, verifyPin };
}
