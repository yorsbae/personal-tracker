import { useState } from "react";
import MoneyRingkasanTab from "./MoneyRingkasanTab";
import WishlistTab from "./WishlistTab";
import ExpensePage from "../expense/ExpensePage";
import IncomePage from "../income/IncomePage";
import RecurringExpenseTab from "./RecurringExpenseTab";

type Tab = "ringkasan" | "expense" | "income" | "wishlist" | "recurring";

const TABS: { key: Tab; label: string }[] = [
  { key: "ringkasan", label: "Ringkasan" },
  { key: "expense", label: "Pengeluaran" },
  { key: "income", label: "Pemasukan" },
  { key: "recurring", label: "Recurring" },
  { key: "wishlist", label: "Wishlist" },
];

export default function MoneyPage() {
  const [tab, setTab] = useState<Tab>("ringkasan");

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Money
      </h1>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
              tab === t.key
                ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "ringkasan" && <MoneyRingkasanTab />}
      {tab === "wishlist" && <WishlistTab />}
      {tab === "recurring" && <RecurringExpenseTab />}
      {/* ExpensePage & IncomePage sudah punya <div className="max-w-2xl mx-auto p-4"> sendiri,
          jadi di sini kita bungkus ulang tanpa padding ganda */}
      {tab === "expense" && (
        <div className="-mx-4">
          <ExpensePage />
        </div>
      )}
      {tab === "income" && (
        <div className="-mx-4">
          <IncomePage />
        </div>
      )}
    </div>
  );
}
