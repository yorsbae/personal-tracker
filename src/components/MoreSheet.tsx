import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

interface MoreSheetProps {
  onClose: () => void;
  onOpenSearch: () => void;
}

const MORE_ITEMS = [
  { path: "/exercises", label: "Body", icon: "💪" },
  { path: "/mind-growth", label: "Mind & Growth", icon: "🧠" },
  { path: "/notes", label: "Notes", icon: "📝" },
  { path: "/projects", label: "Project Tracker", icon: "🛠️" },
  { path: "/analytics", label: "Analytics", icon: "📊" },
  { path: "/profile", label: "Profile", icon: "👤" },
];

export default function MoreSheet({ onClose, onOpenSearch }: MoreSheetProps) {
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="md:hidden fixed inset-0 bg-black/40 z-40 flex items-end"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full rounded-t-2xl p-4 space-y-1 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3" />

        {MORE_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}

        <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2 space-y-1">
          <button
            onClick={() => {
              onOpenSearch();
              onClose();
            }}
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-gray-900 dark:text-white"
          >
            <span className="text-lg">🔍</span>
            <span className="text-sm font-medium">Search</span>
          </button>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-gray-900 dark:text-white"
          >
            <span className="text-lg">{theme === "light" ? "🌙" : "☀️"}</span>
            <span className="text-sm font-medium">
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </span>
          </button>

          <div className="px-3 py-2 text-xs text-gray-400 truncate">
            {user?.email}
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 w-full text-red-500"
          >
            <span className="text-lg">🚪</span>
            <span className="text-sm font-medium">Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
