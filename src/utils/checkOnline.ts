// Dipanggil di awal tiap fungsi add/update/delete di semua hook,
// supaya user dapat pesan jelas SEBELUM coba nembak request yang pasti gagal
export function checkOnline(): string | null {
  if (!navigator.onLine) {
    return "Tidak ada koneksi internet. Coba lagi setelah online.";
  }
  return null;
}
