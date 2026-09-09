import fs from "fs"

let content = fs.readFileSync("src/App.tsx", "utf8")

const replacements = [
  ["Keluar dari Akun", "Sign Out"],
  [">Masuk<", ">Login<"],
  ["Masukkan NIK kamu", "Enter your NIK"],
  ["Belum punya akun?", "Don't have an account?"],
  ["Daftar sekarang", "Sign up now"],
  ["Kata Sandi", "Password"],
  ["Nomor Induk Karyawan (NIK)", "Employee ID (NIK)"],
  ["Sistem Monitoring Perbaikan Cabin", "Cabin Repair Monitoring System"],
]

for (let [id, en] of replacements) {
  content = content.split(id).join(en)
}

fs.writeFileSync("src/App.tsx", content)
console.log("Translation 3 applied.")
