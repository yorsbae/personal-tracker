import { useOnlineStatus } from "../hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-yellow-500 text-white text-sm text-center py-2 px-4 sticky top-0 z-30">
      📶 Tidak ada koneksi internet — kamu masih bisa lihat data yang sudah
      dimuat, tapi perubahan (tambah/edit/hapus) tidak akan tersimpan sampai
      online lagi.
    </div>
  );
}
