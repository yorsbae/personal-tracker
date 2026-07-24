// Hash PIN dengan SHA-256 bawaan browser (Web Crypto API).
// Ini BUKAN enkripsi tingkat bank, tapi cukup untuk App Lock personal:
// PIN asli tidak pernah disimpan di database, cuma hash-nya.
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
