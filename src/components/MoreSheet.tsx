import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface MoreSheetProps {
  onClose: () => void;
}

const MODULE_ITEMS = [
  { path: "/money", label: "Money", icon: "💰" },
  { path: "/exercises", label: "Body", icon: "💪" },
  { path: "/mind-growth", label: "Mind & Growth", icon: "🧠" },
  { path: "/notes", label: "Notes", icon: "📝" },
  { path: "/projects", label: "Project Tracker", icon: "🛠️" },
  { path: "/social-accounts", label: "Social Accounts", icon: "📱" },
  { path: "/goals", label: "Goals", icon: "🎯" },
  { path: "/achievements", label: "Achievements", icon: "🏆" },
  { path: "/analytics", label: "Analytics", icon: "📊" },
  { path: "/calendar", label: "Calendar", icon: "📅" },
  { path: "/creative", label: "Creative", icon: "🎨" },
];

export default function MoreSheet({ onClose }: MoreSheetProps) {
  const { signOut, user } = useAuth();

  return (
    <div
      className="md:hidden fixed inset-0 bg-black/40 z-40 flex items-end"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full rounded-t-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        <div className="overflow-y-auto p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase px-1 mb-2">
              Modul
            </p>
            <div className="grid grid-cols-3 gap-2">
              {MODULE_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium text-center leading-tight">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase px-1 mb-2">
              Akun
            </p>
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            >
              <span className="text-lg">👤</span>
              <span className="text-sm font-medium">Profile</span>
            </Link>

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
    </div>
  );
}
