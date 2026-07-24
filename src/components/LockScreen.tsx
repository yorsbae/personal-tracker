import { useState, type FormEvent } from "react";
import { usePinLock } from "../context/PinLockContext";

export default function LockScreen() {
  const { unlock } = usePinLock();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const success = await unlock(pin);

    if (!success) {
      setError("PIN salah, coba lagi.");
      setPin("");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-100 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Terkunci
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Masukkan PIN untuk membuka
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={6}
            className="w-full text-center text-2xl tracking-[0.5em] px-3 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
            placeholder="••••"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || pin.length === 0}
            className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {isSubmitting ? "Memeriksa..." : "Buka"}
          </button>
        </form>
      </div>
    </div>
  );
}
