import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { usePinSettings } from "../hooks/usePinSettings";

const AUTO_LOCK_MINUTES = 5; // auto-lock kalau tidak ada aktivitas selama 5 menit

interface PinLockContextType {
  isLocked: boolean;
  unlock: (pin: string) => Promise<boolean>;
  pinEnabled: boolean;
  loading: boolean;
}

const PinLockContext = createContext<PinLockContextType | undefined>(undefined);

export function PinLockProvider({ children }: { children: ReactNode }) {
  const { pinEnabled, loading, verifyPin } = usePinSettings();
  const [isLocked, setIsLocked] = useState(false);

  // Begitu tahu PIN aktif (setelah fetch selesai), langsung kunci di awal buka app
  useEffect(() => {
    if (!loading && pinEnabled) {
      setIsLocked(true);
    }
  }, [loading, pinEnabled]);

  // Auto-lock kalau user tidak beraktivitas (tidak sentuh layar/klik/ketik) selama X menit
  useEffect(() => {
    if (!pinEnabled) return;

    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(
        () => setIsLocked(true),
        AUTO_LOCK_MINUTES * 60 * 1000,
      );
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [pinEnabled]);

  const unlock = useCallback(
    async (pin: string) => {
      const valid = await verifyPin(pin);
      if (valid) setIsLocked(false);
      return valid;
    },
    [verifyPin],
  );

  return (
    <PinLockContext.Provider value={{ isLocked, unlock, pinEnabled, loading }}>
      {children}
    </PinLockContext.Provider>
  );
}

export function usePinLock() {
  const context = useContext(PinLockContext);
  if (!context)
    throw new Error("usePinLock harus dipakai di dalam PinLockProvider");
  return context;
}
