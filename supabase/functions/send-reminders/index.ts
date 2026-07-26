// supabase/functions/send-reminders/index.ts
//
// Fungsi ini dijadwalkan jalan tiap 15 menit (lewat cron-job.org gratis, lihat instruksi di bawah).
// Tugasnya: cek event Calendar yang mulai dalam 30 menit ke depan, lalu kirim push notification
// ke semua subscription milik user pemilik event itu.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

webpush.setVapidDetails(
  "mailto:rowzakdaya8@gmail.com",
  vapidPublicKey,
  vapidPrivateKey,
);

Deno.serve(async () => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const now = new Date();
  const in30min = new Date(now.getTime() + 30 * 60 * 1000);

  // Cari event yang mulai antara sekarang sampai 30 menit ke depan
  const { data: events, error } = await supabase
    .from("events")
    .select("id, user_id, judul, tanggal_mulai")
    .gte("tanggal_mulai", now.toISOString())
    .lte("tanggal_mulai", in30min.toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  let sentCount = 0;

  for (const event of events ?? []) {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", event.user_id);

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({
            title: "🗓 Jadwal Sebentar Lagi",
            body: `${event.judul} - ${new Date(event.tanggal_mulai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
            url: "/calendar",
          }),
        );
        sentCount++;
      } catch (err) {
        // Subscription mungkin sudah kadaluarsa (user uninstall app dsb) - hapus dari database
        if (err instanceof Error && err.message.includes("410")) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }
  }

  return new Response(
    JSON.stringify({
      eventsChecked: events?.length ?? 0,
      notificationsSent: sentCount,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
});
