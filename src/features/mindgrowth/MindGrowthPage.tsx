import { useState } from "react";
import LearningPage from "../learning/LearningPage";
import JournalPage from "../journal/JournalPage";

type Tab = "learning" | "journal";

export default function MindGrowthPage() {
  const [tab, setTab] = useState<Tab>("learning");

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Mind & Growth
      </h1>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setTab("learning")}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
            tab === "learning"
              ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
              : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          Learning
        </button>
        <button
          onClick={() => setTab("journal")}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
            tab === "journal"
              ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
              : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          Journal
        </button>
      </div>

      {/* LearningPage & JournalPage sudah punya wrapper max-w-2xl mx-auto p-4 sendiri (khusus Learning),
          jadi dibungkus ulang tanpa padding ganda */}
      {tab === "learning" && (
        <div className="-mx-4 -mt-2">
          <LearningPage />
        </div>
      )}
      {tab === "journal" && <JournalPage />}
    </div>
  );
}
