> Function (EN): Appraisal private API, analysis limits, container security and QC.
> Fungsi (ID): API privat Appraisal, batas analisis, keamanan container dan QC.
> Created: 2026-10-17
> Last Modified / Replaced: 2026-10-17T12:33:09.018+07:00

# Appraisal — laporan perbaikan

Semua perubahan berada di workspace lokal. Tidak ada commit, push, deploy VPS, rotasi credential akun eksternal, atau crawl DataForSEO berbayar selama remediasi. Status production lama tidak berubah hanya karena laporan ini dibuat.

Login admin untuk satu workspace privat; fitur multi-user/role per organisasi belum ditambahkan pada tiga aplikasi selain DBX. Endpoint health, pemeriksaan status sesi, login, dan logout merupakan pengecualian yang memang diperlukan sebelum autentikasi. Data dashboard dan API operasional memerlukan sesi server.

Gunakan password admin unik minimal 12 karakter dan AUTH_SESSION_SECRET acak minimal 43 karakter (disarankan 32 byte acak atau lebih). Buat nilai berbeda untuk setiap aplikasi. Nama AUTH_* adalah akses dashboard, berbeda dari credential DataForSEO. Masukkan nilainya hanya pada runtime env; jangan gunakan VITE_* untuk secret.

## Perbaikan

API list/detail/create/delete/export/analyze/reproject proyek sekarang memerlukan sesi backend. Sesi acak disimpan sebagai hash HMAC di SQLite dengan expiry 8 jam dan pemeriksaan versi credential. Password/kunci env baru mencabut sesi lama. Login dibatasi dan memakai cookie Secure/HttpOnly/SameSite=Strict serta validasi Origin.

Pipeline analisis dibatasi satu proses aktif per instance, satu percobaan per proyek per hari UTC, dan maksimal 10 percobaan workspace per hari secara default. Klaim harian tersimpan di SQLite dan tidak hilang setelah restart; kegagalan tetap menghabiskan satu klaim. Per-instance concurrency tidak berarti satu proses global pada beberapa replika—gunakan satu replika worker/API untuk batas concurrency tersebut.

Endpoint email-report lama hanya menyimpan file lalu mengaku mengirim email. Endpoint tersebut sekarang mengembalikan 501, dan tombol UI dinonaktifkan dengan arahan download PDF. Tidak ada email keluar yang dikirim selama pengujian.

DataForSEO tetap tidak dipakai: credential env diabaikan dan tren lokal/mock bernilai USD0. Google Ads/FX merupakan integrasi terpisah; jangan mengartikan mock trends sebagai data tren live.

## Container/dependency

.dockerignore mengecualikan env, SQLite, node_modules, hasil build dan data email. Docker memakai Node24, builder C++/Python untuk SQLite13, lalu menyalin hanya dependency runtime, dist dan aset yang diperlukan ke runner. Compiler dan source backend tidak ikut runner. Entrypoint menyesuaikan kepemilikan volume data lama, lalu menjalankan Node sebagai UID1000. Axios, React Router, DOMPurify turunan, Express/transitive dependency dan Vitest diperbarui. Audit npm runtime maupun seluruh dependency terbaru: 0 advisory.

## Env runtime sebelum deploy

AUTH_USERNAME, AUTH_PASSWORD (unik minimal 12), AUTH_SESSION_SECRET (acak minimal 43), NODE_ENV=production, CORS_ORIGIN=https://appraisal.ypym.app, PORT=3100, DATABASE_PATH=./data/ypym-appraisal.db, ANALYSIS_MAX_PER_DAY=10. Mount volume pada /app/backend/data. Sesuaikan CORS_ORIGIN jika domain production berbeda; jangan menggunakan wildcard. DATAFORSEO_LOGIN/PASSWORD tidak diperlukan dan tidak mengaktifkan fitur.

## QC

8 tes backend lulus pada Node24, termasuk persistensi sesi, rotasi password, expiry, logout, Origin, klaim analisis dan DFS nonaktif. Frontend build dan browser desktop/mobile lulus. Kegagalan native SQLite pada Docker pertama telah ditemukan dan diperbaiki dengan builder yang menyediakan compiler; runtime image berhasil start, membuka SQLite dan menjalankan create/list/delete proyek dengan autentikasi. Bukti pengujian HTTP/image terpusat akan menjadi acuan final.
