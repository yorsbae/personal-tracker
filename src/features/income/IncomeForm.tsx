import { useState, type FormEvent } from "react";
import { KATEGORI_INCOME, type Income, type IncomeInput } from "../../types";

interface IncomeFormProps {
  onSubmit: (input: IncomeInput) => Promise<{ error: string | null }>;
  editingIncome?: Income | null;
  onCancelEdit?: () => void;
}

const initialForm: IncomeInput = {
  nominal: 0,
  sumber: "",
  kategori: "Gaji",
  catatan: "",
  tanggal: new Date().toISOString().split("T")[0],
};

export default function IncomeForm({
  onSubmit,
  editingIncome,
  onCancelEdit,
}: IncomeFormProps) {
  const [form, setForm] = useState<IncomeInput>(
    editingIncome
      ? {
          nominal: editingIncome.nominal,
          sumber: editingIncome.sumber,
          kategori: editingIncome.kategori,
          catatan: editingIncome.catatan,
          tanggal: editingIncome.tanggal,
        }
      : initialForm,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const { error } = await onSubmit(form);

    if (error) {
      setError(error);
      setIsSubmitting(false);
      return;
    }

    if (!editingIncome) setForm(initialForm);
    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-xl border border-gray-200 space-y-4"
    >
      <h2 className="font-semibold text-gray-900">
        {editingIncome ? "Edit Pemasukan" : "Tambah Pemasukan"}
      </h2>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nominal (Rp)
          </label>
          <input
            type="number"
            required
            min={0}
            value={form.nominal || ""}
            onChange={(e) =>
              setForm({ ...form, nominal: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="5000000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            value={form.kategori ?? ""}
            onChange={(e) => setForm({ ...form, kategori: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {KATEGORI_INCOME.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sumber
          </label>
          <input
            type="text"
            required
            value={form.sumber}
            onChange={(e) => setForm({ ...form, sumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Kantor ABC, Klien X..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal
          </label>
          <input
            type="date"
            required
            value={form.tanggal}
            onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catatan
        </label>
        <textarea
          value={form.catatan ?? ""}
          onChange={(e) => setForm({ ...form, catatan: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Opsional..."
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {isSubmitting ? "Menyimpan..." : editingIncome ? "Update" : "Simpan"}
        </button>
        {editingIncome && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
