import { usePushNotification } from "../../hooks/usePushNotification";

export default function NotificationSettings() {
  const { isSubscribed, isSupported, error, subscribe, unsubscribe } =
    usePushNotification();

  if (!isSupported) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
          🔔 Notifikasi
        </h2>
        <p className="text-xs text-gray-400">
          Browser/device ini tidak mendukung push notification (umumnya karena
          belum di-install ke homescreen, atau browsernya belum support).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-2">
      <h2 className="font-semibold text-gray-900 dark:text-white">
        🔔 Notifikasi
      </h2>
      <p className="text-xs text-gray-400">
        Dapat pengingat asli di HP untuk jadwal Calendar yang mendekat, walau
        app tertutup.
      </p>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {isSubscribed ? "Notifikasi aktif" : "Notifikasi belum aktif"}
        </p>
        {isSubscribed ? (
          <button
            onClick={unsubscribe}
            className="text-sm text-red-500 border border-red-200 dark:border-red-900 px-3 py-1.5 rounded-lg"
          >
            Matikan
          </button>
        ) : (
          <button
            onClick={subscribe}
            className="text-sm bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-3 py-1.5 rounded-lg"
          >
            Aktifkan
          </button>
        )}
      </div>
    </div>
  );
}
