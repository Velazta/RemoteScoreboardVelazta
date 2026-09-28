# Brief Plan: Sinkronisasi Real-Time Timer OBS & TikTok Live Studio
**Tech Stack:** Next.js (App Router) & Supabase Realtime (Broadcast)

---

## 1. Arsitektur Sistem & Alur Kerja
Sistem ini menggunakan pola **Controller-Client** berbasis WebSocket yang dikelola secara *serverless* oleh Supabase Channels.

```
[ HP / PC Kontroler ] 
       │ (Next.js)
       ▼ Kirim Event: 'timer_control' { action: 'START', targetTime }
┌──────────────┐
│ Supabase     │ ◄─── Broker Realtime (Broadcast)
└──────────────┘
       │
       ▼ Distribusi Otomatis (< 50ms)
[ OBS / TikTok Live Studio ]
       │ (Browser Source - Next.js Tampilan)
       ▼ Update State & Render UI
```

### Komponen Utama:
1. **Controller (`/controller`)**: Halaman web responsif (aman dibuka di HP) untuk mengatur durasi, memulai (`PLAY`), dan menghentikan (`STOP`) timer.
2. **Display (`/obs-display`)**: Halaman web minimalis berlatar belakang transparan untuk dimasukkan sebagai Browser Source di software *streaming*.
3. **Supabase Realtime**: Media transmisi data instan tanpa membebani performa *database read/write*.

---

## 2. Struktur Proyek (Next.js App Router)
```text
my-obs-timer/
├── app/
│   ├── layout.js          # Layout global
│   ├── controller/
│   │   └── page.js        # UI Remote Control (HP/PC)
│   └── obs-display/
│       └── page.js        # UI Tampilan Timer (OBS Source)
├── lib/
│   └── supabase.js        # Inisialisasi Supabase Client Singleton
├── .env.local             # Variabel Lingkungan (URL & Anon Key)
└── package.json
```

---

## 3. Langkah Implementasi Terperinci

### Langkah 1: Setup Proyek & Instalan Dependensi
1. Buat proyek Next.js baru dan instal SDK Supabase resmi:
   ```bash
   npx create-next-app@latest my-obs-timer --js --eslint --tailwind false --app
   cd my-obs-timer
   npm install @supabase/supabase-js
   ```
2. Buat file `.env.local` di akar proyek:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Langkah 2: Buat Modul Inisialisasi Supabase
Buat file `lib/supabase.js` agar koneksi client tidak diinisialisasi berulang kali:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Langkah 3: Implementasi Halaman Kontroler (`app/controller/page.js`)
* Menggunakan React `useState` untuk menyimpan durasi menit kustom.
* Memanfaatkan rumus `Date.now() + (menit * 60 * 1000)` untuk menghasilkan **Unix Timestamp masa depan**.
* Mengirim payload lewat `supabase.channel().send()`.

### Langkah 4: Implementasi Tampilan OBS (`app/obs-display/page.js`)
* Berlangganan (*subscribe*) ke channel yang sama.
* Menggunakan kombinasi `useRef` untuk memegang ID interval agar tidak terjadi kebocoran memori (*memory leak*).
* Menggunakan `setInterval` dengan presisi **100ms** untuk memastikan hitung mundur berjalan mulus dan memperbarui teks menjadi `00:00` tepat waktu saat `Date.now() >= targetTime`.

---

## 4. Konfigurasi Software Streaming (OBS & TikTok Live Studio)

Agar sinkronisasi tidak terputus di tengah jalan, lakukan konfigurasi wajib berikut saat menambahkan **Browser Source**:

| Properti OBS / TikTok Studio | Pengaturan Wajib | Alasan Teknis |
| :--- | :--- | :--- |
| **URL** | `http://localhost:3000/obs-display` (Lokal) atau URL Deployment (Vercel) | Alamat halaman *render* timer. |
| **Shutdown source when not visible** | ❌ **JANGAN DICENTANG** | Jika dicentang, koneksi WebSocket Supabase akan terputus saat scene disembunyikan. Timer akan membeku/lag saat scene dibuka kembali. |
| **Refresh browser when scene becomes active** | ❌ **JANGAN DICENTANG** | Pengaturan ini akan memaksa halaman reload dan menghapus sisa waktu yang sedang berjalan jika dipicu secara tidak sengaja. |

---

## 5. Fitur Lanjutan (Rencana Pengembangan/Scale Up)
Jika struktur dasar di atas sudah berjalan lancar, Anda dapat menambahkan fitur berikut untuk meningkatkan pengalaman pengguna:

1. **Status Persistence (Sinkronisasi Awal)**:
   * **Masalah:** Jika OBS tidak sengaja ter-refresh di tengah jalan, OBS akan kehilangan data `targetTime` yang sedang berjalan.
   * **Solusi:** Simpan nilai `targetTime` ke tabel database Supabase sederhana (misal tabel `timer_state`). Saat halaman `/obs-display` pertama kali dimuat (*mounted*), lakukan *fetch* awal untuk memeriksa apakah ada timer aktif yang sedang berjalan di *background*.
2. **Efek Suara & Visual**:
   * Menambahkan pemutar audio ringan (audio alarm) di sisi OBS saat waktu menyentuh `00:00`.
   * Mengubah warna teks menjadi merah berkedip saat waktu tersisa kurang dari 10 detik.
