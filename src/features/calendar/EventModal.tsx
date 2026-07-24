import { useState, useEffect, type FormEvent } from "react";
import {
  EVENT_TIPE_LABEL,
  type CalendarEvent,
  type CalendarEventInput,
  type EventTipe,
} from "../../types";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CalendarEventInput) => Promise<{ error: string | null }>;
  onDelete?: () => void;
  editingEvent?: CalendarEvent | null;
  defaultStart?: Date;
  defaultEnd?: Date;
}

// Helper: ubah Date jadi format string yang cocok untuk <input type="datetime-local">
function toLocalInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function EventModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editingEvent,
  defaultStart,
  defaultEnd,
}: EventModalProps) {
  const [judul, setJudul] = useState("");
  const [tipe, setTipe] = useState<EventTipe>("pribadi");
  const [mulai, setMulai] = useState("");
  const [selesai, setSelesai] = useState("");
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Setiap kali modal dibuka, isi form sesuai mode (edit atau tambah baru dari slot yang diklik)
  useEffect(() => {
    if (editingEvent) {
      setJudul(editingEvent.judul);
      setTipe(editingEvent.tipe);
      setMulai(toLocalInputValue(new Date(editingEvent.tanggal_mulai)));
      setSelesai(
        editingEvent.tanggal_selesai
          ? toLocalInputValue(new Date(editingEvent.tanggal_selesai))
          : "",
      );
      setCatatan(editingEvent.catatan ?? "");
    } else {
      setJudul("");
      setTipe("pribadi");
      setMulai(defaultStart ? toLocalInputValue(defaultStart) : "");
      setSelesai(defaultEnd ? toLocalInputValue(defaultEnd) : "");
      setCatatan("");
    }
    setError("");
  }, [editingEvent, defaultStart, defaultEnd, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await onSubmit({
      judul,
      tipe,
      tanggal_mulai: new Date(mulai).toISOString(),
      tanggal_selesai: selesai ? new Date(selesai).toISOString() : null,
      catatan: catatan || null,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    // Overlay gelap di belakang modal, klik di luar modal akan menutup modal
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-5 w-full max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()} // supaya klik di dalam modal tidak ikut menutup modal
      >
        <h2 className="font-semibold text-gray-900">
          {editingEvent ? "Edit Jadwal" : "Tambah Jadwal"}
        </h2>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Misal: Meeting tim, Long run 10K..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe
            </label>
            <select
              value={tipe}
              onChange={(e) => setTipe(e.target.value as EventTipe)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {Object.entries(EVENT_TIPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mulai
              </label>
              <input
                type="datetime-local"
                required
                value={mulai}
                onChange={(e) => setMulai(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selesai (opsional)
              </label>
              <input
                type="datetime-local"
                value={selesai}
                onChange={(e) => setSelesai(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {isSubmitting
                ? "Menyimpan..."
                : editingEvent
                  ? "Update"
                  : "Simpan"}
            </button>
            {editingEvent && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
              >
                Hapus
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
