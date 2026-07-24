import { Link, useLocation } from "react-router-dom";

interface BottomNavProps {
  onOpenMore: () => void;
}

// Cuma 4 menu paling sering dipakai + "More" untuk sisanya - standar UX bottom nav (maks 5 slot)
const PRIMARY_ITEMS = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/money", label: "Money", icon: "💰" },
  { path: "/calendar", label: "Calendar", icon: "🗓" },
  { path: "/creative", label: "Creative", icon: "🎬" },
];

export default function BottomNav({ onOpenMore }: BottomNavProps) {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around">
        {PRIMARY_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 flex-1 ${
                isActive
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={onOpenMore}
          className="flex flex-col items-center gap-0.5 py-2 px-3 flex-1 text-gray-400 dark:text-gray-500"
        >
          <span className="text-lg">⋯</span>
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}
