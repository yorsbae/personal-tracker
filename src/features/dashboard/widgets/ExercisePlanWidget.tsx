import { Link } from "react-router-dom";
import { useExerciseSchedule } from "../../exercise/useExerciseSchedule";

export default function ExercisePlanWidget() {
  const { getScheduleForDate, loading } = useExerciseSchedule();

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todaySchedule = getScheduleForDate(today);
  const tomorrowSchedule = getScheduleForDate(tomorrow);

  if (loading) return null;
  if (!todaySchedule && !tomorrowSchedule) return null; // belum atur jadwal, tidak usah tampilkan widget kosong

  const renderLine = (
    label: string,
    schedule: ReturnType<typeof getScheduleForDate>,
  ) => {
    if (!schedule) return null;
    const isRest = schedule.tipe === "Rest";
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400 w-14 shrink-0">{label}</span>
        {isRest ? (
          <span className="text-gray-500 dark:text-gray-400">😴 Rest Day</span>
        ) : (
          <span className="text-gray-900 dark:text-white">
            🏋️ {schedule.tipe}
            {schedule.sub_kategori ? ` - ${schedule.sub_kategori}` : ""}
          </span>
        )}
      </div>
    );
  };

  return (
    <Link
      to="/exercises"
      className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-400 dark:hover:border-gray-500 transition"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
        Rencana Latihan
      </h3>
      <div className="space-y-1.5">
        {renderLine("Hari ini", todaySchedule)}
        {renderLine("Besok", tomorrowSchedule)}
      </div>
    </Link>
  );
}
