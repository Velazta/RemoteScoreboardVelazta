# Procedure & Execution Plan: Esports Scoreboard Overlay Builder & Remote Control Panel

Dokumen ini berisi panduan langkah eksekusi pengembangan platform Custom Scoreboard Overlay Builder & Remote Control Panel berbasis Next.js, Supabase, Tailwind CSS, Zustand, dan react-rnd.

---

## 🚀 Ringkasan Proyek & Tech Stack

| Kategori | Teknologi | Peran & Fungsi Utama |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 16 (App Router) + React 19 | Routing Admin Dashboard, Layout Builder, Remote Control & OBS Overlay |
| **Runtime & PM** | Bun | Package manager & runtime untuk development secepat kilat |
| **Styling & UI** | Tailwind CSS v4 + Shadcn UI + Lucide Icons | Antarmuka dark mode esports modular & responsif |
| **State & Canvas Interactivity** | Zustand + react-rnd | Pengelolaan state kustomisasi & drag-and-drop koordinat presisi (X, Y) |
| **Database & Realtime** | Supabase (PostgreSQL + Realtime) | Menyimpan data match/layout JSONB & sinkronisasi instant via WebSocket |
| **Storage Engine** | Supabase Storage | Host gambar background (1920x1080) & custom font (.ttf/.woff2) |
| **Broadcast Integration** | OBS Studio (Browser Source) | Render 1920x1080 read-only latar transparan secara live tanpa reload |

---

## 📋 Tahapan Eksekusi (Phase Roadmap)

### Phase 1: Landing Page & Setup UI Design System (Prioritas Saat Ini)
- [ ] Inisialisasi komponen Shadcn UI (Button, Card, Dialog, Slider, Input, Badge, Tabs).
- [ ] Buat struktur halaman Landing Page berbasis desain Figma (Hero Section, Feature Highlights, Interactive Preview Section, Pricing/CTA, Footer).
- [ ] Integrasi Lenis Smooth Scroll & animasi GSAP untuk nuansa premium esports.
- [ ] Pengaturan Navigation Bar untuk akses cepat ke `/dashboard` dan `/editor`.

### Phase 2: Supabase Setup & Architecture Database
- [ ] Buat tabel `matches` (skor, nama tim, status pertandingan, layout_id).
- [ ] Buat tabel `layouts` (konfigurasi posisi X,Y, ukuran font, warna, JSONB schema).
- [ ] Buat Supabase Storage Buckets (`backgrounds` & `fonts`) dengan policy RLS public access.
- [ ] Setup Supabase Realtime Replication untuk tabel `matches`.

### Phase 3: Custom Layout Editor (`/editor/[id]`)
- [ ] Kanvas Visual 1920x1080 dengan zoom/pan viewport control.
- [ ] Integrasi `react-rnd` untuk drag, drop, dan resize elemen skor & nama tim.
- [ ] Feature Upload Gambar Background 1920x1080 ke Supabase Storage.
- [ ] Feature Upload Custom Font (.ttf / .woff2) & dynamic `@font-face` injection ke browser.
- [ ] Panel Inspector Presisi (Input angka koordinat X, Y, Width, Height, FontSize, Align, Z-Index).
- [ ] Simpan & muat skema JSON layout ke database.

### Phase 4: Remote Control Panel Operator (`/remote/[matchId]`)
- [ ] Interface responsif ramah sentuhan (HP/Tablet/PC).
- [ ] Tombol kontrol skor cepat (+1, -1, direct input, reset, swap team).
- [ ] Indikator status koneksi WebSocket (Realtime Sync Active Badge).

### Phase 5: OBS Browser Source Overlay (`/overlay/[matchId]`)
- [ ] Halaman read-only 1920x1080 latar transparan (`bg-transparent`).
- [ ] Dynamic font loader sesuai konfigurasi layout.
- [ ] Supabase Realtime Listener untuk perubahan skor instant sub-second tanpa refresh.

### Phase 6: Testing, Optimization & Deployment
- [ ] Latency benchmark real-time WebSocket sync.
- [ ] Uji coba Browser Source pada OBS Studio.
- [ ] Deployment ke Vercel & Supabase Cloud Production.
