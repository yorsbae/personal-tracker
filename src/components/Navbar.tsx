import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import GlobalSearchModal from "./Search/GlobalSearchModal";
import BottomNav from "./BottomNav";
import MoreSheet from "./MoreSheet";

const menuItems = [
  { path: "/", label: "Dashboard" },
  { path: "/money", label: "Money" },
  { path: "/exercises", label: "Body" },
  { path: "/mind-growth", label: "Mind & Growth" },
  { path: "/creative", label: "Creative Brain" },
  { path: "/notes", label: "Notes" },
  { path: "/projects", label: "Projects" },
  { path: "/calendar", label: "Calendar" },
  { path: "/analytics", label: "Analytics" },
  { path: "/profile", label: "Profile" },
];

export default function Navbar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      {/* ===== DESKTOP: top bar horizontal, semua menu tampil ===== */}
      <nav className="hidden md:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 overflow-x-auto">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex gap-1 shrink-0">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  location.pathname === item.path
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-lg text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              title="Cari"
            >
              🔍
            </button>
            <button
              onClick={toggleTheme}
              className="text-lg"
              title="Toggle dark mode"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <span className="text-xs text-gray-400 hidden lg:inline">
              {user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE: header ringkas di atas (cuma judul + search) ===== */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-20">
        <span className="font-semibold text-gray-900 dark:text-white">
          Life OS
        </span>
        <button
          onClick={() => setIsSearchOpen(true)}
          className="text-lg"
          aria-label="Search"
        >
          🔍
        </button>
      </div>

      {/* ===== MOBILE: bottom tab bar ===== */}
      <BottomNav onOpenMore={() => setIsMoreOpen(true)} />

      {isMoreOpen && (
        <MoreSheet
          onClose={() => setIsMoreOpen(false)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      )}
      {isSearchOpen && (
        <GlobalSearchModal onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  );
}
