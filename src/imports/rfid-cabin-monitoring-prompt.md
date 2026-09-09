# SYSTEM PROMPT — APLIKASI MONITORING TICKETING TERHUBUNG RFID/BARCODE
> Sistem monitoring pengerjaan perbaikan cabin mobil, terhubung dengan tag RFID/barcode yang terpasang di tiap cabin. Terdiri dari **Mobile App** (untuk teknisi/manpower melakukan scan & monitoring lapangan) dan **Web App** (Dashboard, Report, Master Data, User Management untuk supervisor/manajemen).

---

## CATATAN PENTING — RFID vs BARCODE (perlu dikonfirmasi di awal)

Pada brief, judul menyebut "RFID" tapi detail requirement menyebut "scan barcode". Kedua teknologi ini berbeda secara hardware:
- **Barcode/QR Code** — cukup di-scan pakai kamera HP biasa, tidak butuh hardware tambahan, paling murah & cepat diimplementasikan
- **RFID** — butuh **RFID reader** (baik reader genggam terpisah yang terhubung Bluetooth ke HP, atau reader tetap terpasang di tiap stasiun kerja yang terhubung ke gateway/jaringan), atau memanfaatkan **NFC** built-in di HP jika tag RFID yang dipakai kompatibel NFC

**Asumsi default prompt ini**: menggunakan **QR/Barcode yang di-scan lewat kamera HP** (paling sederhana & cepat rilis), karena tidak memerlukan pengadaan hardware reader tambahan. Jika yang dimaksud adalah RFID sungguhan (radio frequency, tanpa perlu kontak visual), sebagian besar desain di bawah tetap berlaku — hanya modul scan di mobile app yang perlu diganti dari kamera-scanner menjadi integrasi SDK RFID reader (Bluetooth) atau NFC. **Mohon konfirmasi mana yang dipakai sebelum development dimulai.**

---

## ROLE & OBJECTIVE

Kamu adalah senior full-stack developer + mobile developer + UI/UX engineer untuk aplikasi industrial.

Bangun sistem **monitoring perbaikan cabin mobil** berbasis scan tag (RFID/barcode), terdiri dari 2 aplikasi yang terhubung ke backend & database yang sama:

1. **Mobile App** — dipakai teknisi/manpower di lapangan untuk scan tag cabin dan memulai/mengakhiri sesi pengerjaan
2. **Web App** — dipakai supervisor/manajemen untuk memantau dashboard, membuat laporan, melihat master data (sinkron dari sistem lain), dan mengelola akses user

Prioritas desain (berurutan):
1. **Scan harus cepat & tidak membingungkan** — teknisi di lapangan tidak punya waktu berpikir lama, alur scan harus jelas dalam 1-2 detik
2. **Akurasi durasi pengerjaan** — inti nilai sistem ini adalah data waktu yang presisi, timestamp harus tercatat tepat saat scan terjadi
3. **Visibilitas real-time** — supervisor di web harus bisa lihat progress pengerjaan cabin manapun tanpa delay berarti
4. **Master Data adalah cermin, bukan sumber** — data cabin & manpower berasal dari sistem lain (sinkron), aplikasi ini tidak menjadi tempat input data induk tersebut

---

## KONSEP & TERMINOLOGI

| Istilah | Arti |
|---|---|
| **Cabin** | Unit cabin mobil yang diperbaiki, tiap unit punya 1 tag RFID/barcode unik terpasang fisik |
| **Manpower** | Teknisi yang mengerjakan perbaikan cabin |
| **Work Session** | 1 periode pengerjaan — dimulai saat scan "Mulai", berakhir saat scan "Selesai" |
| **Scan Mulai (Check-in)** | Scan pertama pada cabin yang belum ada sesi aktif → mencatat waktu mulai + manpower yang mengerjakan |
| **Scan Selesai (Check-out)** | Scan pada cabin yang sedang punya sesi aktif → mencatat waktu selesai, durasi terhitung otomatis |
| **Durasi per Sesi** | Waktu 1 manpower mengerjakan cabin dalam 1 sesi (selesai - mulai) |
| **Total Durasi Cabin** | Total waktu cabin tersebut dikerjakan — bisa lebih dari 1 sesi jika ditangani beberapa manpower secara bergantian |

### Logika Scan (penting)
```
Scan tag cabin
      |
      v
Apakah cabin ini sedang punya sesi aktif (belum di-scan "Selesai")?
      |
      +-- TIDAK ada sesi aktif -> Mulai sesi baru
      |     - Catat: cabin_id, manpower_id (yang login di device), start_time = sekarang
      |     - Tampilkan konfirmasi "Mulai kerjakan Cabin [ID]?"
      |
      `-- SUDAH ada sesi aktif -> Selesaikan sesi
            |
            +-- Sesi aktif dimulai oleh manpower yang SAMA (device ini)
            |     -> Selesaikan langsung, hitung durasi, tampilkan "Selesai! Durasi: 00:45:12"
            |
            `-- Sesi aktif dimulai oleh manpower LAIN
                  -> Tampilkan konfirmasi "Cabin ini sedang dikerjakan oleh [Nama Lain].
                     Ambil alih / selesaikan sesi ini?" (mencegah tumpang tindih tanpa sadar)
```

> Skenario "manpower lain" di atas adalah rekomendasi desain untuk mencegah data tumpang tindih — silakan sesuaikan jika di lapangan memang lazim 1 cabin dikerjakan beberapa orang bersamaan (butuh keputusan bisnis lebih lanjut).

### Penanganan sesi "lupa di-scan selesai"
- Supervisor di **Web App** perlu bisa **menutup paksa** (force close) sesi yang kelihatannya "menggantung" terlalu lama (mis. lebih dari X jam tanpa scan selesai), dengan catatan alasan — supaya data durasi tidak rusak oleh human error di lapangan

---

## TECH STACK

| Layer | Teknologi |
|---|---|
| Mobile App | React Native (Expo) + TypeScript |
| Scan Barcode/QR | `expo-camera` + `expo-barcode-scanner` (jika barcode/QR) |
| Scan RFID (alternatif, jika dikonfirmasi RFID sungguhan) | SDK reader Bluetooth (`react-native-ble-plx`) atau NFC (`react-native-nfc-manager`) |
| Mobile UI | React Native Paper / Tamagui + komponen kustom |
| Mobile Local Storage | SQLite (`expo-sqlite`) — offline-first, penting karena area kerja/gudang sering sinyal lemah |
| Web Frontend | Next.js 14 (App Router) + TypeScript |
| Web UI Components | shadcn/ui — https://ui.shadcn.com/ |
| Icons | lucide-react |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Database | PostgreSQL (Neon) + TimescaleDB extension (data scan/work session bervolume tinggi) |
| ORM | Drizzle ORM |
| Real-time | WebSocket (Socket.io) — supaya dashboard web update begitu ada scan baru dari mobile |
| Auth | JWT httpOnly (web) + token tersimpan aman di mobile (`expo-secure-store`) |
| Sync Engine (Master Data) | Scheduled job (cron) yang menarik data dari API sistem existing, ditulis ke tabel lokal sebagai cache/mirror |
| Export Report | jsPDF + xlsx |

---

## SECTION A — MOBILE APP

### A.1 — Login
- Login sederhana: NIK + PIN, atau scan badge/kartu ID pribadi manpower (jika tersedia)
- Setelah login, sesi tetap aktif (tidak perlu login ulang tiap shift, kecuali logout manual)

### A.2 — Home / Scan Screen (halaman utama)

**Header:**
- Nama manpower yang sedang login
- Jam & tanggal saat ini

**Kartu Ringkasan Hari Ini (3 kartu):**
| Kartu | Data |
|---|---|
| Cabin Selesai Hari Ini | Jumlah cabin yang sudah di-scan "Selesai" hari ini (oleh manpower ini atau semua, sesuai kebutuhan — tampilkan keduanya jika perlu: "oleh saya: X" dan "total tim: Y") |
| Sedang Dikerjakan | Jumlah cabin dengan sesi aktif saat ini |
| Rata-rata Durasi Hari Ini | Rata-rata waktu pengerjaan per cabin yang sudah selesai hari ini |

**Tombol Scan (besar, di tengah/bawah layar, mudah dijangkau)**
- Tap → buka kamera scanner
- Setelah tag terdeteksi → ikuti logika scan di atas (Mulai/Selesai/Konfirmasi ambil alih)
- Setelah aksi berhasil → tampilkan toast/animasi konfirmasi singkat, langsung siap scan berikutnya (tidak perlu banyak tap untuk kembali ke mode scan)

### A.3 — Riwayat Saya (`/riwayat`)
- List cabin yang sudah/sedang dikerjakan oleh manpower yang login, terurut terbaru
- Tiap item: ID Cabin, waktu mulai, waktu selesai (jika sudah), durasi, status (Selesai/Sedang Dikerjakan)
- Filter: Hari Ini / 7 Hari Terakhir

### A.4 — Detail Cabin (saat tap salah satu riwayat, atau setelah scan)
- ID/kode cabin, model (dari master data sync)
- Timeline seluruh sesi pengerjaan cabin ini (jika ditangani lebih dari 1 manpower secara bergantian): siapa, kapan, berapa lama
- Total durasi kumulatif cabin ini

### A.5 — Mode Offline
- Jika tidak ada koneksi saat scan → data tersimpan lokal (SQLite), ditandai "Menunggu sinkronisasi"
- Auto-sync ke server saat koneksi kembali tersedia
- Indikator kecil di header menunjukkan status koneksi (online/offline, jumlah data menunggu sync)

---

## SECTION B — WEB APP

### B.1 — Dashboard (`/dashboard`)

**Baris 1 — KPI Cards (5 kartu)**
| # | Metrik | Ikon |
|---|---|---|
| 1 | Cabin Diperbaiki Hari Ini | `lucide CheckCircle2` |
| 2 | Sedang Dikerjakan (in progress) | `lucide Loader` |
| 3 | Rata-rata Durasi per Cabin | `lucide Timer` |
| 4 | Manpower Aktif Hari Ini | `lucide Users` |
| 5 | Sesi Menggantung (belum di-scan selesai > batas waktu) | `lucide AlertTriangle` |

**Baris 2 — Grafik Tren Cabin Diperbaiki**
- Line/bar chart: jumlah cabin selesai per hari, rentang waktu bisa difilter (7 hari/30 hari/custom)
- Overlay opsional: garis rata-rata bergerak (moving average) untuk melihat tren tanpa terganggu fluktuasi harian

**Baris 3 — Summary per Manpower**
- Tabel/leaderboard: Nama Manpower, Jumlah Cabin Dikerjakan (periode terpilih), Total Durasi Kerja, Rata-rata Durasi per Cabin
- Ditampilkan dengan **inline horizontal bar** di kolom jumlah/durasi (bukan angka polos) supaya mudah dibandingkan sekilas
- Bisa diurutkan (paling produktif/paling lama rata-ratanya)
- Klik nama → detail riwayat cabin yang dikerjakan manpower tersebut

**Baris 4 — Summary per Cabin**
- Tabel: ID/Model Cabin, Jumlah Sesi Pengerjaan, Total Durasi, Status Terakhir
- Bisa difilter untuk highlight cabin dengan durasi pengerjaan jauh di atas rata-rata (indikasi ada kendala/kerusakan lebih kompleks)
- Grafik pendukung: bar chart perbandingan rata-rata durasi per model/tipe cabin (jika cabin punya beberapa model berbeda) — membantu identifikasi model mana yang secara konsisten butuh waktu perbaikan lebih lama

**Filter dashboard (berlaku ke semua elemen di atas)**
- Rentang tanggal, Manpower, Model Cabin, Line/Stasiun kerja (jika ada)

### B.2 — Report (`/report`)

**Jenis Laporan:**
| Jenis | Isi |
|---|---|
| Laporan Harian Perbaikan | Rekap cabin selesai per hari, dengan detail manpower & durasi |
| Laporan Produktivitas Manpower | Per manpower: total cabin, total durasi kerja, rata-rata, ranking |
| Laporan Durasi per Cabin/Model | Analisis durasi pengerjaan, identifikasi model/cabin dengan waktu perbaikan tidak wajar |
| Laporan Sesi Menggantung | Daftar sesi yang pernah/sedang menggantung (lupa di-scan selesai) beserta tindakan force-close yang diambil |

**Report Builder:**
1. Pilih jenis laporan
2. Pilih parameter (rentang tanggal, manpower, model cabin)
3. Preview
4. Export PDF/Excel

### B.3 — Master Data (`/master`) — SYNC, BUKAN CRUD

> **Penting**: Seluruh sub-menu di bawah ini bersifat **read-only** di aplikasi ini. Data berasal dari sinkronisasi dengan sistem existing (mis. sistem HR untuk data manpower, sistem produksi/inventory untuk data cabin). **Tidak ada tombol Tambah/Edit/Hapus** di halaman-halaman ini.

**Sub-menu:**

**1. Master Cabin (`/master/cabin`)**
- Tabel: Kode/Tag Cabin, Model, Line/Stasiun Terkait (jika ada), Status Terakhir Sync
- Search & filter, tapi tanpa aksi ubah data

**2. Master Manpower (`/master/manpower`)**
- Tabel: NIK, Nama, Departemen, Status Aktif (dari sistem HR), Status Terakhir Sync
- Catatan: ini adalah **roster sumber** — berbeda dari "Users Management" (Section B.4) yang mengatur siapa yang punya **akses login** ke aplikasi ini

**Header tiap halaman Master Data:**
- Indikator **"Terakhir Sync: [tanggal & jam]"**
- Status sync terakhir (Berhasil/Gagal, dengan jumlah record yang ter-update)
- Tombol **"Sync Sekarang"** (manual trigger, untuk Admin) — memicu proses tarik data terbaru dari sistem sumber di luar jadwal otomatis
- Jika sync gagal → tampilkan pesan error yang jelas (mis. "Gagal terhubung ke sistem sumber, percobaan terakhir 09:15")

### B.4 — Users Management (`/users`)

Berbeda dari Master Data Manpower — ini mengatur **akun yang punya akses login** ke Mobile App & Web App.

**Tab 1 — Akun Pengguna**
- Tabel: Nama, NIK (link ke Master Data Manpower jika berlaku), Role, Status, Terakhir Login, Aksi
- Role: **Manpower** (akses mobile app saja), **Supervisor** (akses web, lihat dashboard/report area tanggung jawabnya), **Admin** (akses penuh + trigger sync manual)
- Tambah/Edit akun: pilih dari daftar Master Data Manpower (agar konsisten dengan roster asli) atau buat akun khusus (untuk Supervisor/Admin yang mungkin tidak ada di roster manpower produksi), set role, set PIN/password awal

**Tab 2 — Role & Permission**
- Matrix: Dashboard, Report, Master Data, Users Management — kolom Lihat/Kelola per role
- Manpower secara default hanya punya akses Mobile App, tidak punya akses ke Web App sama sekali (kecuali dikonfigurasikan lain)

---

## DATABASE SCHEMA

```sql
-- Cabin (sinkron dari sistem existing -- tabel ini di-refresh oleh sync job, bukan diisi manual)
CREATE TABLE cabins (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_code          TEXT UNIQUE NOT NULL,     -- kode RFID/barcode fisik
  model             TEXT,
  line_station      TEXT,
  external_ref_id   TEXT,                     -- ID di sistem sumber
  last_synced_at    TIMESTAMPTZ,
  is_active         BOOLEAN DEFAULT true
);

-- Manpower (sinkron dari sistem HR existing)
CREATE TABLE manpower (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik               TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  department        TEXT,
  external_ref_id   TEXT,
  last_synced_at    TIMESTAMPTZ,
  is_active         BOOLEAN DEFAULT true
);

-- Work Session (data transaksional inti dari scan)
CREATE TABLE work_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabin_id        UUID REFERENCES cabins(id),
  manpower_id     UUID REFERENCES manpower(id),
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ,
  duration_seconds INT,                        -- dihitung otomatis saat end_time diisi
  status          TEXT DEFAULT 'in_progress',   -- 'in_progress' | 'completed' | 'force_closed'
  force_closed_by UUID,                          -- user_id supervisor jika force close
  force_close_reason TEXT,
  created_offline BOOLEAN DEFAULT false,         -- true jika sesi dibuat saat mobile offline
  synced_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_work_sessions_cabin ON work_sessions(cabin_id, start_time DESC);
CREATE INDEX idx_work_sessions_manpower ON work_sessions(manpower_id, start_time DESC);
CREATE INDEX idx_work_sessions_status ON work_sessions(status);

-- Users (akun login aplikasi -- beda dari roster manpower)
CREATE TABLE app_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manpower_id     UUID REFERENCES manpower(id),   -- nullable, jika akun tidak terkait roster manpower (mis. Admin)
  name            TEXT NOT NULL,
  role            TEXT NOT NULL,                   -- 'manpower' | 'supervisor' | 'admin'
  pin_hash        TEXT,                             -- untuk login mobile
  password_hash   TEXT,                             -- untuk login web
  is_active       BOOLEAN DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Log sinkronisasi Master Data
CREATE TABLE sync_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     TEXT,               -- 'cabin' | 'manpower'
  triggered_by    TEXT,               -- 'scheduled' | 'manual'
  status          TEXT,               -- 'success' | 'failed'
  records_synced  INT,
  error_message   TEXT,
  started_at      TIMESTAMPTZ DEFAULT now(),
  finished_at     TIMESTAMPTZ
);
```

---

## ARSITEKTUR SINKRONISASI MASTER DATA

```
Sistem Existing (HR / Produksi)
        |
        |  REST API / DB Link (sesuai yang tersedia di sistem sumber)
        v
Scheduled Sync Job (cron, mis. tiap 30 menit / tiap jam)
        |
        v
Backend App  --tulis/update--> Tabel cabins & manpower (mirror lokal)
        |
        v
Web App Master Data (read-only) + Mobile App (mengacu ke data cabin/manpower yang sudah tersinkron)
```

- Sync job membandingkan data dari sumber vs data lokal → insert baru / update yang berubah / tandai nonaktif yang sudah tidak ada di sumber (bukan hapus permanen, demi jejak historis work session yang sudah terjadi)
- Setiap proses sync tercatat di `sync_logs` untuk audit & troubleshooting jika ada data tidak sinkron
- Jika sync gagal berturut-turut → notifikasi ke Admin

---

## SECURITY & AKSES

- Role: Manpower (mobile only), Supervisor (web, lihat data), Admin (web, akses penuh + trigger sync)
- JWT httpOnly (web), token aman di secure storage (mobile)
- Audit log untuk force-close sesi (siapa, kapan, alasan)
- Sync job berjalan dengan kredensial service account terbatas ke sistem sumber (read-only), tidak menulis balik ke sistem existing

---

## UI SHELL

### Web Sidebar
- Dashboard (`lucide LayoutDashboard`)
- Report (`lucide FileBarChart`)
- Master Data [grup] (`lucide Database`)
  - Cabin
  - Manpower
- Users Management (`lucide Users2`)

### Mobile Navigation
- Bottom tab: Scan (utama) / Riwayat / Profil

### Responsive
- Web: desktop-first untuk Dashboard/Report, tetap accessible tablet
- Mobile: dioptimalkan untuk penggunaan satu tangan di lapangan, tombol scan besar & mudah dijangkau jempol

---

## DELIVERABLE CHECKLIST

| Platform | Route/Screen | Keterangan |
|---|---|---|
| Mobile | Login | NIK + PIN atau scan badge |
| Mobile | Home/Scan | Kartu ringkasan + tombol scan utama |
| Mobile | Riwayat | Riwayat pengerjaan manpower yang login |
| Mobile | Detail Cabin | Timeline sesi pengerjaan 1 cabin |
| Web | `/dashboard` | KPI, tren, summary manpower & cabin |
| Web | `/report` | Report builder 4 jenis laporan |
| Web | `/master/cabin` | Master cabin (read-only, sync) |
| Web | `/master/manpower` | Master manpower (read-only, sync) |
| Web | `/users` | User management (2 tab) |

---

## ACCEPTANCE CRITERIA

Sistem siap rilis ketika:

1. ✅ Mobile app bisa scan tag cabin dan otomatis menentukan aksi (Mulai/Selesai) berdasarkan status sesi aktif
2. ✅ Durasi pengerjaan tercatat akurat berdasarkan timestamp scan aktual
3. ✅ Skenario "cabin sedang dikerjakan manpower lain" ditangani dengan konfirmasi, tidak menimbulkan data tumpang tindih diam-diam
4. ✅ Mobile app tetap bisa mencatat scan saat offline, dan sinkron otomatis saat online kembali
5. ✅ Dashboard web menampilkan tren cabin selesai per hari, summary per manpower, dan summary per cabin secara akurat & real-time
6. ✅ Report bisa digenerate dan diexport untuk 4 jenis laporan yang didefinisikan
7. ✅ Master Data (Cabin & Manpower) sepenuhnya read-only, tidak ada tombol tambah/edit/hapus manual, dan menampilkan status sync terakhir dengan jelas
8. ✅ Sync Master Data berjalan terjadwal dan bisa dipicu manual oleh Admin, dengan log yang tercatat
9. ✅ Supervisor/Admin bisa force-close sesi yang menggantung, dengan alasan tercatat
10. ✅ Users Management terpisah jelas dari Master Data Manpower — akses login vs roster sumber
11. ✅ Dark mode & responsive di web; mobile dioptimalkan untuk kondisi lapangan (satu tangan, sinyal lemah)
