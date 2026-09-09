import fs from "fs"

let content = fs.readFileSync("src/App.tsx", "utf8")

const replacements = [
  // Mock Data
  ['"Sen"', '"Mon"'],
  ['"Sel"', '"Tue"'],
  ['"Rab"', '"Wed"'],
  ['"Kam"', '"Thu"'],
  ['"Jum"', '"Fri"'],
  ['"Sab"', '"Sat"'],
  ['"Hari ini"', '"Today"'],
  [
    "Penyok pada sisi kiri pintu depan, perlu straightening dan dempul ulang.",
    "Dent on left front door, needs straightening and repainting.",
  ],
  ["Tiket dibuat setelah scan cabin", "Ticket created after scanning cabin"],
  ["Mulai pengerjaan straightening.", "Started straightening work."],
  [
    "Straightening selesai, melanjutkan ke proses dempul.",
    "Straightening finished, proceeding to putty.",
  ],
  ["Perbaikan selesai, cat sudah matching.", "Repair finished, paint matches."],
  ["Tiket dibuat.", "Ticket created."],
  [
    "Cat terkelupas di atap kabin, perlu re-paint area ± 30×20 cm.",
    "Paint peeled on cabin roof, needs repaint area ± 30x20 cm.",
  ],
  [
    "Mulai proses pembersihan area dan masking.",
    "Started cleaning and masking area.",
  ],
  [
    "Primer sudah diaplikasikan, menunggu kering.",
    "Primer applied, waiting to dry.",
  ],
  ["Re-paint selesai, area sudah bersih.", "Repaint finished, area cleaned."],
  ["Re-paint selesai.", "Repaint finished."],
  [
    "Jok pengemudi robek di bagian tengah, perlu re-upholstery.",
    "Driver seat torn in middle, needs re-upholstery.",
  ],
  ["Mulai proses re-upholstery jok.", "Started seat re-upholstery."],
  [
    "Lapisan lama sudah dilepas, menunggu material baru.",
    "Old layer removed, waiting for new material.",
  ],
  [
    "AC tidak dingin, kompresor perlu dicek.",
    "AC not cold, compressor needs checking.",
  ],
  ["Mulai diagnosa sistem AC.", "Started AC system diagnosis."],
  [
    "Menunggu sparepart kompresor dari gudang.",
    "Waiting for compressor spare part from warehouse.",
  ],

  // Helpers
  ["`${h}j ${m}m`", "`${h}h ${m}m`"],
  ["`${m}m ${sec}d`", "`${m}m ${sec}s`"],
  ["`${sec}d`", "`${sec}s`"],
  ['"Elektrikal"', '"Electrical"'],
  ['"Mekanikal"', '"Mechanical"'],
  ['"Cat"', '"Paint"'],
  ['"Lainnya"', '"Other"'],
  ['"Selesai"', '"Closed"'],
  ['"Rendah"', '"Low"'],
  ['"Tinggi"', '"High"'],
  ['"Tiket Dibuat"', '"Ticket Created"'],
  ['"Mulai Pengerjaan"', '"Started Work"'],
  ['"Update Progress"', '"Progress Update"'],
  ['"Ditahan"', '"On Hold"'],
  ['"Dilanjutkan"', '"Resumed"'],
  ['"Tiket Ditutup"', '"Ticket Closed"'],
  ['"Preventif"', '"Preventive"'],

  // UI text
  ["Arahkan kamera", "Point camera"],
  ["Scan tag barcode cabin", "Scan cabin barcode tag"],
  [
    "Kamera akan membaca QR/barcode pada cabin",
    "Camera will read QR/barcode on cabin",
  ],
  ["Mulai Scan", "Start Scan"],
  ["Mendeteksi...", "Detecting..."],
  ["Tahan kamera agar stabil", "Hold camera steady"],
  ["Cabin terdeteksi", "Cabin detected"],
  ["Informasi Cabin", "Cabin Information"],
  ["Tiket aktif ditemukan", "Active ticket found"],
  ["Lihat Tiket Aktif", "View Active Ticket"],
  [
    "Tidak ada tiket aktif. Buat tiket perbaikan baru.",
    "No active ticket. Create new repair ticket.",
  ],
  ["Buat Tiket Perbaikan", "Create Repair Ticket"],
  ["Scan Ulang", "Scan Again"],
  ["Jenis Kerusakan", "Damage Type"],
  ["Prioritas", "Priority"],
  ["Deskripsi Kerusakan", "Damage Description"],
  ["Dikerjakan oleh", "Assigned to"],
  [">Saya<", ">Me<"],
  ['"Saya"', '"Me"'],
  ["Jelaskan kerusakan yang ditemukan…", "Describe the damage found…"],
  ["Mulai Perbaikan", "Start Repair"],
  [">Tahan<", ">Hold<"],
  ["Lanjutkan", "Resume"],
  ["Tutup Tiket", "Close Ticket"],
  ["Catatan Penutupan", "Closure Notes"],
  ["Dibuat", "Created"],
  [">Mulai<", ">Started<"],
  ["Berlangsung", "Ongoing"],
  ["Durasi", "Duration"],
  ["Riwayat Tiket", "Ticket History"],
  ["Tambah Update Progress", "Add Progress Update"],
  [
    "Deskripsikan progress perbaikan saat ini…",
    "Describe current repair progress…",
  ],
  ["Simpan Update", "Save Update"],
  ["Tutup Tiket Perbaikan", "Close Repair Ticket"],
  [
    "Tambahkan catatan penutupan dan konfirmasi perbaikan selesai.",
    "Add closure notes and confirm repair completion.",
  ],
  [
    "Hasil perbaikan, kondisi akhir cabin…",
    "Repair results, final cabin condition…",
  ],
  ["Batal", "Cancel"],
  ["Semua tiket", "All tickets"],
  ["Tiket Perbaikan", "Repair Tickets"],
  ['"Semua"', '"All"'],
  ['"Proses"', '"In Progress"'],
  ["Tidak ada tiket", "No tickets"],
  ["Ringkasan hari ini", "Today's Summary"],
  ["Rata-rata", "Average"],
  ["Tren Tiket Selesai — 7 Hari", "Closed Tickets Trend — 7 Days"],
  ["Per Jenis Kerusakan", "By Damage Type"],
  ["Selamat Pagi", "Good Morning"],
  ["Selamat Siang", "Good Afternoon"],
  ["Selamat Sore", "Good Evening"],
  ["oleh saya", "by me"],
  ["dikerjakan", "in progress"],
  ["tiket saya", "my tickets"],
  ["Tidak ada tiket aktif", "No active tickets"],
  [">Baru<", ">New<"],
  ["Pengerjaan dimulai.", "Work started."],
  ["Pengerjaan ditahan sementara.", "Work temporarily on hold."],
  ["Pengerjaan dilanjutkan.", "Work resumed."],
  ["Deskripsi kerusakan wajib diisi.", "Damage description is required."],
  ['"tiket"', '"tickets"'],
  ['" Tiket"', '" Tickets"'],
  ['" tiket"', '" tickets"'],
  ["Menunggu sparepart", "Waiting for sparepart"],
]

for (let [id, en] of replacements) {
  content = content.split(id).join(en)
}

fs.writeFileSync("src/App.tsx", content)
console.log("Translation applied.")
