import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// 1. Definisikan "bentuk" data yang akan dibagikan ke seluruh app
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

// 2. Buat "wadah" context-nya, default undefined dulu
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider: komponen yang membungkus seluruh app dan menyimpan state auth
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Saat app pertama kali dibuka, cek apakah user sudah login sebelumnya
    // (Supabase menyimpan session di localStorage secara otomatis)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Dengarkan perubahan status auth secara realtime
    // (misal: login di tab lain, token refresh, logout, dll)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    // Bersihkan listener saat komponen unmount (best practice React)
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fungsi untuk register akun baru, sekaligus simpan username pilihan user
  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    // Simpan username ke profiles - cuma bisa langsung berhasil kalau "Confirm email"
    // dimatikan di Supabase (jadi session langsung aktif setelah signUp)
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: data.user.id, username });

      if (profileError) {
        // Kemungkinan besar username sudah dipakai orang lain (kolom unique)
        if (
          profileError.message.includes("duplicate") ||
          profileError.message.includes("unique")
        ) {
          return { error: "Username sudah dipakai, coba yang lain" };
        }
        return { error: profileError.message };
      }
    }

    return { error: null };
  };

  // Login bisa pakai email ATAU username - kalau bukan format email,
  // cari dulu email yang terhubung ke username itu lewat fungsi database
  const signIn = async (identifier: string, password: string) => {
    let email = identifier;

    if (!identifier.includes("@")) {
      const { data, error: lookupError } = await supabase.rpc(
        "get_email_by_username",
        {
          input_username: identifier,
        },
      );
      if (lookupError || !data) {
        return { error: "Username tidak ditemukan" };
      }
      email = data as string;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  // Fungsi untuk logout
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 4. Custom hook supaya pemanggilan di komponen lain jadi simpel: useAuth()
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider");
  }
  return context;
}
