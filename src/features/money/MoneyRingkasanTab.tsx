import { useState } from "react";
import { useMoneySummary } from "./UseMoneySummary";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function MoneyRingkasanTab() {
  const {
    loading,
    totalExpense,
    totalIncome,
    saldo,
    expensePerKategori,
    target,
    saveTarget,
    suggestion,
  } = useMoneySummary();

  const [editingSaving, setEditingSaving] = useState(false);
  const [savingInput, setSavingInput] = useState("");

  if (loading)
    return <p className="text-gray-400 text-sm py-8 text-center">Memuat...</p>;

  const targetSaving = target?.target_saving ?? null;
  const savingProgress =
    targetSaving && targetSaving > 0
      ? Math.min(100, Math.round((saldo / targetSaving) * 100))
      : null;

  const handleSetTarget = async (value: number) => {
    await saveTarget({
      target_saving: value,
      budget_kategori: target?.budget_kategori ?? null,
    });
    setEditingSaving(false);
  };

  const handleAcceptSuggestion = async () => {
    if (suggestion.suggestedSaving) {
      await saveTarget({
        target_saving: suggestion.suggestedSaving,
        budget_kategori: suggestion.suggestedBudget,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Angka utama */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Pemasukan</p>
          <p className="font-semibold text-green-600 text-sm">
            {formatRupiah(totalIncome)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Pengeluaran</p>
          <p className="font-semibold text-red-600 text-sm">
            {formatRupiah(totalExpense)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Saldo</p>
          <p
            className={`font-semibold text-sm ${saldo >= 0 ? "text-gray-900 dark:text-white" : "text-red-600"}`}
          >
            {formatRupiah(saldo)}
          </p>
        </div>
      </div>

      {/* Saran otomatis - cuma muncul kalau belum ada target diset dan ada cukup histori */}
      {!targetSaving && suggestion.hasEnoughHistory && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-sm text-blue-900 dark:text-blue-200 mb-2">
            💡 Berdasarkan rata-rata 3 bulan terakhir, saran target nabung bulan
            ini:{" "}
            <span className="font-semibold">
              {formatRupiah(suggestion.suggestedSaving ?? 0)}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleAcceptSuggestion}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
            >
              Pakai Saran Ini
            </button>
            <button
              onClick={() => setEditingSaving(true)}
              className="text-sm text-blue-600 dark:text-blue-300 px-3 py-1.5"
            >
              Set Manual
            </button>
          </div>
        </div>
      )}

      {/* Target Saving - progress bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Target Nabung Bulan Ini
          </h3>
          {targetSaving && (
            <button
              onClick={() => setEditingSaving(true)}
              className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Edit
            </button>
          )}
        </div>

        {editingSaving || !targetSaving ? (
          <div className="flex gap-2">
            <input
              type="number"
              autoFocus
              placeholder="Target nabung (Rp)"
              value={savingInput}
              onChange={(e) => setSavingInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg"
            />
            <button
              onClick={() =>
                savingInput && handleSetTarget(Number(savingInput))
              }
              className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded-lg text-sm"
            >
              Simpan
            </button>
          </div>
        ) : (
          <>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full ${saldo >= 0 ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${Math.max(0, savingProgress ?? 0)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatRupiah(saldo)} dari target {formatRupiah(targetSaving)} (
              {savingProgress}%)
            </p>
          </>
        )}
      </div>

      {/* Budget per kategori */}
      {target?.budget_kategori &&
        Object.keys(target.budget_kategori).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Budget per Kategori
            </h3>
            <div className="space-y-3">
              {Object.entries(target.budget_kategori).map(
                ([kategori, budget]) => {
                  const used = expensePerKategori[kategori] ?? 0;
                  const percent = Math.min(
                    100,
                    Math.round((used / budget) * 100),
                  );
                  return (
                    <div key={kategori}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">
                          {kategori}
                        </span>
                        <span className="text-gray-400">
                          {formatRupiah(used)} / {formatRupiah(budget)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${percent >= 100 ? "bg-red-500" : percent >= 80 ? "bg-yellow-500" : "bg-green-500"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}
    </div>
  );
}
