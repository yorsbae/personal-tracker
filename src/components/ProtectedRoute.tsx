import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  // Selagi masih cek status login (misal saat pertama buka app),
  // jangan langsung redirect - tunggu dulu supaya tidak "kedip" ke halaman login
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Memuat...</p>
      </div>
    );
  }

  // Kalau tidak ada user (belum login), lempar ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Sudah login, tampilkan halaman yang diminta
  return <>{children}</>;
}
