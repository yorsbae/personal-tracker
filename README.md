# Life OS

Personal life management app (PWA) — satu tempat untuk kelola keuangan, olahraga, pembelajaran, refleksi harian, workflow konten kreatif, catatan, kalender, dan analitik pribadi.

Dibangun dengan **React + Vite + TypeScript + Tailwind CSS + Supabase**.

---

## ✨ Fitur

### Global
- Autentikasi (email/username + password), App Lock (PIN), Dark Mode
- Quick-Add floating button, Search global lintas modul
- Bottom navigation yang bisa dikustomisasi (pilih menu favorit)
- Offline handling dasar (Service Worker + PWA installable)
- Push notification (opsional, tergantung environment browser/device)

### Modul Utama
| Modul | Isi |
|---|---|
| **Dashboard** | Ringkasan harian: cuaca, quote, reminder, jadwal, rencana latihan, aktivitas terakhir |
| **Money** | Expense, Income, Budget Target (+saran otomatis), Recurring Expense, Wishlist |
| **Body** | Log Latihan (tipe fleksibel), Jadwal Mingguan, **Coaching** (program terstruktur adaptif: 5K, Half Marathon, Fat Burner, Hiking Prep, Plyometric, General Fitness — dengan pilihan hari latihan/istirahat sendiri) |
| **Mind & Growth** | Learning, Reading (+streak), Journal (+streak), Weekly Review |
| **Creative Brain** | Pipeline produksi konten 6 tahap (Idea → Planning → Shooting → Editing → Uploaded → Analisa) |
| **Notes** | Catatan umum, kategori + tag + pin |
| **Project Tracker** | Project software/app: log harian, to-do, masalah/solusi |
| **Social Accounts** | Akun media sosial: metrics, earnings, password terenkripsi (AES-GCM, kunci dari PIN App Lock) |
| **Goals** | Target terhubung data asli (progress otomatis dari Reading/Exercise/Creative Brain) |
| **Achievements** | Feed pencapaian otomatis (buku selesai, upload konten, PR lari) |
| **Calendar** | Kalender bulanan + indikator harian (uang/olahraga/rencana) + panel ringkasan per tanggal |
| **Analytics** | Grafik tren tiap domain + insight otomatis (perhitungan, bukan AI) |
| **Profile** | Data diri, histori berat badan, BMI/BMR/TDEE, App Lock, export data |
| **Focus Mode** | Timer fullscreen distraction-free dengan konfirmasi keluar |

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security, Edge Functions)
- **Charts**: Recharts
- **Calendar**: react-big-calendar
- **PWA**: vite-plugin-pwa (Workbox)
- **Hosting**: Vercel

---

## 🚀 Setup dari Nol

### 1. Clone & Install

```bash
git clone <repo-url>
cd <project-folder>
npm install
```

### 2. Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Pilih region **Southeast Asia (Singapore)** untuk latency rendah dari Indonesia
3. Ambil **Project URL** dan **anon public key** dari **Settings → API**

### 3. Environment Variables

Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Opsional, cuma kalau mau aktifkan push notification
VITE_VAPID_PUBLIC_KEY=
```

### 4. Setup Database

Jalankan file skema SQL final (`schema_FINAL_LENGKAP.sql`) di **Supabase SQL Editor** — ini membuat semua tabel, Row Level Security policy, dan fungsi (`get_email_by_username`) sekaligus.

Kalau ada migrasi tambahan setelah itu, jalankan juga file `schema_migrasi_*.sql` yang tersedia.

### 5. Setting Auth Supabase

**Authentication → Providers → Email**:
- Aktifkan Email provider
- **Matikan "Confirm email"** untuk development (supaya bisa langsung login setelah daftar)

### 6. Jalankan Development Server

```bash
npm run dev
```

---

## 📦 Build & Deploy

### Build Lokal

```bash
npm run build
npm run preview   # cek hasil build sebelum deploy
```

> **Catatan**: Service Worker (offline mode, push notification) **cuma aktif setelah build**, tidak jalan di `npm run dev` kecuali `devOptions.enabled: true` di `vite.config.ts`.

### Deploy ke Vercel

1. Push project ke GitHub (pastikan `.env` **tidak ikut ter-push** — cek `.gitignore`)
2. Import repo di [vercel.com](https://vercel.com)
3. Tambahkan Environment Variables yang sama seperti `.env` di **Vercel → Settings → Environment Variables**
4. Deploy

File `vercel.json` di root project sudah menangani SPA routing (supaya refresh di halaman manapun tidak 404).

### Push Notification (Opsional)

Butuh setup tambahan di luar frontend:
```bash
web-push generate-vapid-keys      # generate VAPID key pair
supabase functions deploy send-reminders
supabase secrets set VAPID_PUBLIC_KEY=<public key>
supabase secrets set VAPID_PRIVATE_KEY=<private key>
```
Lalu jadwalkan Edge Function `send-reminders` jalan berkala (misal tiap 15 menit) lewat cron eksternal gratis seperti [cron-job.org](https://cron-job.org).

---

## 📁 Struktur Folder

```
src/
├── components/       # Komponen shared (Navbar, Layout, Search, dsb)
├── context/          # AuthContext, ThemeContext, PinLockContext
├── hooks/             # Custom hooks lintas modul
├── features/          # 1 folder per modul (money, exercise, creative, dst)
│   └── <modul>/
│       ├── use<Modul>.ts     # Hook CRUD (data layer)
│       └── <Modul>Page.tsx    # Komponen UI
├── lib/                # Supabase client
├── utils/              # Helper murni (kalkulasi, enkripsi, dsb)
├── types/              # TypeScript types
└── App.tsx             # Routing utama
```

**Pola arsitektur**: tiap modul punya custom hook terpisah dari UI (data layer vs presentation layer), supaya data yang sama bisa dipakai ulang di banyak tempat (Dashboard, Calendar, Analytics) tanpa duplikasi logic.

---

## 🔒 Keamanan

- **Row Level Security (RLS)** aktif di semua tabel — user cuma bisa akses data miliknya sendiri
- **App Lock (PIN)** untuk layer tambahan saat buka app
- **Password Social Account** dienkripsi AES-GCM dengan kunci diturunkan dari PIN (PBKDF2), bukan disimpan polos
- `anon key` di frontend memang didesain aman untuk publik — keamanan sebenarnya ada di RLS, bukan di key itu
- **Jangan pernah commit `.env`** — pastikan ada di `.gitignore`

---

## 📝 Lisensi

Project pribadi, bebas dipakai/dimodifikasi sesuai kebutuhan sendiri.
