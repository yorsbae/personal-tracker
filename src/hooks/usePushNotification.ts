import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// VAPID key dari server dikirim base64, browser butuh format Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotification() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setIsSupported(false);
      return;
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    });
  }, []);

  const subscribe = async () => {
    if (!user) return { error: "Belum login" };
    setError("");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return { error: "Izin notifikasi ditolak" };

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJson = sub.toJSON();
      const { error: dbError } = await supabase
        .from("push_subscriptions")
        .upsert(
          {
            user_id: user.id,
            endpoint: subJson.endpoint!,
            p256dh: subJson.keys!.p256dh,
            auth: subJson.keys!.auth,
          },
          { onConflict: "endpoint" },
        );

      if (dbError) return { error: dbError.message };

      setIsSubscribed(true);
      return { error: null };
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal subscribe notifikasi";
      setError(msg);
      return { error: msg };
    }
  };

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", sub.endpoint);
      await sub.unsubscribe();
    }
    setIsSubscribed(false);
  };

  return { isSubscribed, isSupported, error, subscribe, unsubscribe };
}
