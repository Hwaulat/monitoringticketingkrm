import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  ['"Mulai"','"Start"'],
  ['"Selesai"','"Done"'],
  ['"Close Ticket Perbaikan"','"Close Repair Ticket"'],
  ['"Tiket Selesai"','"Completed Tickets"'],
  ['"Hari ini"','"Today"'],
  ['"Sistem Monitoring Perbaikan Cabin"','"Cabin Repair Monitoring System"'],
  ['label: "Tiket"','label: "Tickets"'],
  ['"profil"','"profile"'],
  ['"Profil"','"Profile"'],
  ['"Keluar dari Akun"','"Sign Out"'],
  ['"Masukkan NIK kamu"','"Enter your NIK"'],
  ['"Masuk"','"Login"'],
  ['"Profil Screen"','"Profile Screen"'],
  ['ProfilScreen','ProfileScreen']
];

for (let [id, en] of replacements) {
  content = content.split(id).join(en);
}

fs.writeFileSync('src/App.tsx', content);
console.log("Translation 2 applied.");
