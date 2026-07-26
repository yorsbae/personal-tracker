import { useMemo } from "react";
import { useMoneySummary } from "../../money/useMoneySummary";
import { useExercises } from "../../exercise/useExercises";
import { useJournals } from "../../journal/useJournals";
import { useCreativeProjects } from "../../creative/useCreativeProjects";

export interface Reminder {
  id: string;
  message: string;
  severity: "info" | "warning";
  icon: string;
  link: string;
}

function isToday(tanggal: string) {
  const d = new Date(tanggal);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function useReminders(): Reminder[] {
  const { target, expensePerKategori } = useMoneySummary(new Date());
  const { exercises } = useExercises();
  const { journals } = useJournals();
  const { projects } = useCreativeProjects();

  return useMemo(() => {
    const reminders: Reminder[] = [];

    // 1. Budget kategori yang sudah >= 80%
    if (target?.budget_kategori) {
      for (const [kategori, budget] of Object.entries(target.budget_kategori)) {
        const used = expensePerKategori[kategori] ?? 0;
        const percent = (used / budget) * 100;
        if (percent >= 100) {
          reminders.push({
            id: `budget-${kategori}`,
            message: `Budget "${kategori}" sudah TERLAMPAUI (${Math.round(percent)}%)`,
            severity: "warning",
            icon: "💸",
            link: "/money",
          });
        } else if (percent >= 80) {
          reminders.push({
            id: `budget-${kategori}`,
            message: `Budget "${kategori}" sudah ${Math.round(percent)}% terpakai`,
            severity: "warning",
            icon: "💸",
            link: "/money",
          });
        }
      }
    }

    // 2. Belum olahraga hari ini (nudge lembut, bukan warning)
    const exerciseToday = exercises.some((e) => isToday(e.tanggal));
    if (!exerciseToday) {
      reminders.push({
        id: "no-exercise-today",
        message: "Belum ada catatan olahraga hari ini",
        severity: "info",
        icon: "💪",
        link: "/exercises",
      });
    }

    // 3. Belum isi journal hari ini
    const journalToday = journals.some((j) => isToday(j.tanggal));
    if (!journalToday) {
      reminders.push({
        id: "no-journal-today",
        message: "Belum menulis journal hari ini",
        severity: "info",
        icon: "📝",
        link: "/mind-growth",
      });
    }

    // 4. Target upload Creative Brain mendekati deadline (<= 2 hari, belum uploaded/archived)
    const now = new Date();
    projects
      .filter(
        (p) =>
          !p.is_archived &&
          p.status !== "uploaded" &&
          p.status !== "analisa" &&
          p.target_upload,
      )
      .forEach((p) => {
        const target = new Date(p.target_upload!);
        const diffDays = Math.ceil(
          (target.getTime() - now.getTime()) / 86400000,
        );
        if (diffDays <= 2 && diffDays >= 0) {
          reminders.push({
            id: `upload-${p.id}`,
            message: `"${p.judul}" target upload ${diffDays === 0 ? "HARI INI" : `tinggal ${diffDays} hari lagi`}`,
            severity: "warning",
            icon: "🎬",
            link: "/creative",
          });
        } else if (diffDays < 0) {
          reminders.push({
            id: `upload-${p.id}`,
            message: `"${p.judul}" sudah lewat target upload ${Math.abs(diffDays)} hari`,
            severity: "warning",
            icon: "🎬",
            link: "/creative",
          });
        }
      });

    return reminders;
  }, [target, expensePerKategori, exercises, journals, projects]);
}
