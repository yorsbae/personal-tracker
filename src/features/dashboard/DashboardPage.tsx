import { useAuth } from "../../context/AuthContext";
import TodayScheduleWidget from "./widgets/TodayScheduleWidget";
import FinancialSummaryWidget from "./widgets/FinancialSummaryWidget";
import ExerciseSummaryWidget from "./widgets/ExerciseSummaryWidget";
import RecentActivityWidget from "./widgets/RecentActivityWidget";
import QuickStatsWidget from "./widgets/QuickStatsWidget";
import ReminderBanners from "./reminders/ReminderBanners";
import { Link } from "react-router-dom";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {getGreeting()}
          {user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{today}</p>
      </div>

      <Link
        to="/focus"
        className="block w-full text-center bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
      >
        🎯 Mulai Sesi Fokus
      </Link>

      <ReminderBanners />

      <QuickStatsWidget />

      <div className="grid md:grid-cols-2 gap-4">
        <TodayScheduleWidget />
        <FinancialSummaryWidget />
      </div>

      <ExerciseSummaryWidget />

      <RecentActivityWidget />
    </div>
  );
}
