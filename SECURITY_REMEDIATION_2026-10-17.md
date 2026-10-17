> Function (EN): Public Appraisal access, submission protection, browser ownership and final QC.
> Fungsi (ID): Akses Appraisal publik, perlindungan submit, kepemilikan browser dan QC akhir.
> Created: 2026-10-17
> Last Modified / Replaced: 2026-10-17T13:36:35+07:00

# Appraisal — akses publik dan perlindungan form

Pengguna menegaskan Appraisal adalah produk publik, termasuk dashboard. Kebijakan publik ini menggantikan login admin yang sempat diterapkan pada audit sebelumnya. Login/logout dan modul lama telah dihapus dari frontend/backend; AUTH_USERNAME, AUTH_PASSWORD dan AUTH_SESSION_SECRET tidak lagi dibaca. Proyek lain tidak diubah oleh pekerjaan ini.

Perubahan terbaru berada di workspace, belum di-commit/push/deploy oleh agen. Pengguna sebelumnya melaporkan deploy versi login commit 5fe750d berhasil dan bisa login. Itu bukan konfirmasi bahwa perubahan publik terbaru ini sudah production.

## Perilaku produk

Landing, daftar proyek, katalog, dashboard, hasil dan ekspor tetap publik dan dapat dibagikan. Form menjelaskan hasil publik dan meminta pengunjung tidak memasukkan informasi rahasia.

Saat proyek dibuat, server otomatis menerbitkan token acak 256-bit pada cookie HttpOnly/Secure/SameSite=Strict bernama __Host-appraisal_visitor di production. Cookie tidak memiliki Domain, berlaku 30 hari, dan hash SHA256-nya dicatat sebagai owner proyek. Tidak ada token owner atau hash owner pada respons publik/ekspor. Prefix host mencegah cookie Domain dari sibling subdomain dipakai untuk menetapkan owner. Tidak perlu akun atau kunci bersama dari env.

Hapus, analisis ulang dan reproject hanya diizinkan untuk browser pembuat. Browser lain tetap dapat membaca hasil atau membuat analisis baru. Proyek lama tanpa owner tetap public read-only; tidak ada klaim otomatis atas proyek lama. Jika cookie dihapus/kedaluwarsa, hak edit tidak bisa dipulihkan lewat URL publik; buat analisis baru. Tombol Recalculate dinonaktifkan untuk pembaca dan menampilkan tautan membuat analisis sendiri.

## Perlindungan server

- JSON maksimum 16KiB; JSON rusak, content type salah dan submit lintas Origin ditolak. Fetch Metadata cross-site juga ditolak. CORS memakai origin eksplisit.
- Validasi Zod strict di server: trim sebelum cek panjang, teks satu baris tanpa markup/control characters, field yang tidak dikenal ditolak, locale/currency dibatasi, angka finite dan berbatas, struktur asumsi dan query filter dibatasi. SQL tetap memakai parameter; SQL-looking keyword disimpan sebagai teks.
- UUID proyek divalidasi. Server memeriksa owner untuk semua metode perubahan, termasuk endpoint analisis/reproject/delete; perubahan saat pipeline berjalan ditolak. Pemeriksaan GET tidak lagi melakukan self-healing/write pada data bersama.
- Ekspor CSV mengutip/escape sel dan menetralkan formula spreadsheet. Nama file menggunakan UUID server, bukan keyword. Error internal dan owner hash tidak dikirim dalam detail/status/export.
- Rate limit umum 150 request/menit/IP; submit/perubahan 15/menit/IP. Kuota harian SQLite tetap ada setelah restart: 200 pembuatan total/hari, 10 per IP/browser/hari, maksimum 5000 proyek tersimpan; 10 analisis total/hari, 3 per IP/hari dan satu percobaan/proyek/hari UTC. Percobaan analisis gagal tetap dihitung. Satu pipeline aktif per instance; gunakan satu replika backend.
- MAX_KEYWORDS_PER_RUN dibatasi 1–500; katalog dan agregat dicache agar request publik tidak berulang kali membaca/parsing file besar. Waktu request/header dibatasi.

Validasi input bukan pengganti encoding output: frontend tetap memakai rendering teks React. [Panduan OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).

## Data provider dan container

Submit HTTP memakai katalog tersimpan di server; tidak menerima URL/file path untuk fetch arbitrer. DataForSEO tetap hard-disabled, credential lamanya diabaikan, dan tren lokal/mock bukan data live. Pipeline publik tidak memanggil Google Ads/Autocomplete live. FX adalah integrasi terpisah pada host tetap dengan timeout dan fallback. Pengumpulan data/catalog oleh script admin terpisah tidak diaktifkan melalui form publik.

Perbaikan Dockerfile npm ci --include=dev pada kedua builder dipertahankan, sehingga konfigurasi build Coolify tidak menghilangkan Vite/TypeScript. Backend dipangkas ke dependency production; runner Node24 menjalankan server sebagai UID1000. Env/database lokal tidak ikut image. Tidak ada dependency baru pada perubahan publik ini; hasil audit dependency sebelumnya tercatat terpisah.

## Env Coolify setelah deploy perubahan ini

```env
NODE_ENV=production
PORT=3100
CORS_ORIGIN=https://appraisal.ypym.app
DATABASE_PATH=./data/ypym-appraisal.db
ANALYSIS_MAX_PER_DAY=10
ANALYSIS_MAX_PER_CLIENT_DAY=3
PROJECTS_MAX_PER_DAY=200
PROJECTS_MAX_PER_CLIENT_DAY=10
PROJECTS_MAX_STORED=5000
MAX_KEYWORDS_PER_RUN=500
TRUST_PROXY=loopback,linklocal,uniquelocal
```

Masukkan sebagai runtime env. AUTH_USERNAME/PASSWORD/SESSION_SECRET dan DATAFORSEO_LOGIN/PASSWORD/ENABLED serta DEPLOYMENT_ENV dapat dihapus khusus dari Appraisal. Mount persistent storage pada /app/backend/data dan cadangkan SQLite sebelum migrasi. Migrasi menambah kolom owner_hash dan client_hash tanpa menghapus proyek lama; pengulangan startup sudah diuji.

TRUST_PROXY harus sesuai IP/CIDR reverse proxy yang benar. Default hanya mempercayai jaringan lokal/proxy Docker, bukan semua header dari internet. Batasi port origin ke proxy Coolify. Jika Cloudflare menambahkan hop publik, operator perlu memastikan trusted proxy/forwarding headers sesuai topologi agar IP edge tidak dianggap sebagai satu pengunjung bersama. [Panduan Express](https://expressjs.com/en/guide/behind-proxies/).

Kuota global membatasi dampak abuse; tidak menjamin aplikasi tidak bisa terkena spam/DoS. Rate limit per menit berlaku per instance dan concurrency hanya untuk satu backend. Perlindungan WAF/bot di edge dan konfigurasi firewall VPS belum diverifikasi pada pekerjaan lokal ini.

## QC final

- 9 tes unit/backend lulus: 7 akses publik/ownership/validasi/quota/CSV dan 2 provider OFF. Tes login lama dihapus bersama modul yang sudah tidak dipakai.
- Build frontend Vite, typecheck/build TypeScript backend dan Docker image final berhasil.
- HTTP Linux: akses publik tanpa AUTH env; legacy read-only; penolakan owner palsu/lintas browser; Origin/Fetch Metadata/JSON/payload/XSS/filter/angka invalid; teks SQL literal; create/reproject/delete pemilik; pipeline katalog nyata selesai dengan 6 proyeksi, cap500 keyword dan biaya DataForSEO0; CSV aman; rate limit dan kuota cookie cycling lulus.
- Browser Chrome: landing publik; alur form empat langkah sampai hasil nyata tanpa login; owner bisa recalculasi; cookie Secure/HttpOnly/__Host diterima. Browser baru bisa membuka dashboard/daftar hasil pada mobile; tombol perubahan non-owner disabled; tidak ada tombol logout atau error JavaScript tak tertangani.
- Restart container nyata mempertahankan proyek, owner cookie dan counter kuota; owner masih dapat menghapus setelah restart.
- Semua memakai DB/container sementara. Tes HTTP terisolasi pada Docker internal network tanpa gateway eksternal; tes browser memblokir request eksternal dan host FX container diarahkan ke loopback. Tidak ada credential production dipakai, tidak ada request provider berbayar, tidak ada perubahan VPS.

Bukti lokal: scratch/security-remediation-2026-10-17/appraisal-public-{http,browser,restart}.json, screenshot dan appraisal-public-build.log. Konfirmasi akhir di production tetap diperlukan setelah pengguna commit/push/redeploy perubahan publik ini.
