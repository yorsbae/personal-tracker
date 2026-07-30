import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { generateSalt } from "../utils/cryptoUtils";

export function useEncryptionSalt() {
  const { user } = useAuth();
  const [salt, setSalt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureSalt = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from("profiles")
      .select("encryption_salt")
      .eq("id", user.id)
      .maybeSingle();

    if (data?.encryption_salt) {
      setSalt(data.encryption_salt);
    } else {
      // Belum ada salt - generate sekali, simpan permanen (jangan pernah diganti setelah ada data terenkripsi,
      // karena data lama tidak akan bisa didekripsi lagi kalau salt berubah)
      const newSalt = generateSalt();
      await supabase
        .from("profiles")
        .upsert({ id: user.id, encryption_salt: newSalt });
      setSalt(newSalt);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    ensureSalt();
  }, [ensureSalt]);

  return { salt, loading };
}
