> Function (EN): Appraisal private API, analysis limits, container security and QC.
> Fungsi (ID): API privat Appraisal, batas analisis, keamanan container dan QC.
> Created: 2026-10-17
> Last Modified / Replaced: 2026-10-17T13:05:48+07:00

# Appraisal — laporan perbaikan

Semua perubahan berada di workspace lokal. Saya tidak menjalankan commit, push, deploy VPS, rotasi credential akun eksternal, atau crawl DataForSEO berbayar selama remediasi. Commit baru oleh proses lain terdeteksi selama pekerjaan; saya mempertahankannya dan melanjutkan di atas HEAD tersebut. Status production lama tidak berubah hanya karena laporan ini dibuat.

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
## Perbaikan kegagalan deployment Coolify

Log deployment 17 Oktober 2026 menunjukkan commit `6eec49a09f28e3a429a97654717125a9843a645a` gagal saat `npm run build`: `sh: 1: vite: not found` (exit 127). Coolify memasukkan NODE_ENV=production saat build; npm ci default melewati devDependencies, padahal Vite ada di sana. QC image sebelumnya belum mencakup injeksi konfigurasi build ini. Purge cache Cloudflare tidak memperbaiki kegagalan build image.

Dockerfile kini memakai `npm ci --include=dev` pada frontend-builder dan backend-builder agar Vite/TypeScript tersedia walaupun platform menyetel NODE_ENV=production atau npm omit=dev. Backend tetap menjalankan `npm prune --omit=dev` sebelum dependency disalin ke runner. [Dokumentasi npm](https://docs.npmjs.com/cli/v11/commands/npm-ci/#include).

Regresi diuji dengan Dockerfile sementara yang menyimulasikan ARG NODE_ENV=production dan NPM_CONFIG_OMIT=dev pada tiap stage: Dockerfile lama menghasilkan error Vite yang sama; Dockerfile baru berhasil membangun image lengkap. Smoke test image pada Node24.22.0 lulus: health production, HTML/JS frontend, private API 401, login/cookie Secure HttpOnly Strict, create/list/delete SQLite, Origin asing 403 dan revokasi logout. PID1 UID1000; Vite, TypeScript, Vitest, tsx, compiler dan source/env tidak ada di runner. Container uji memakai network none dan telah dihapus; tidak ada provider berbayar yang dipanggil. Bukti lokal: `scratch/security-remediation-2026-10-17/appraisal-coolify-build/`.

Di Coolify Appraisal, hapus DATAFORSEO_LOGIN dan DATAFORSEO_PASSWORD karena tidak dipakai aplikasi. AUTH_PASSWORD, AUTH_SESSION_SECRET dan credential provider lain yang dipakai backend harus runtime only (Build time: Not available during build; Runtime: Available in the container). NODE_ENV=production dapat dibuat runtime only; Dockerfile baru juga telah diuji ketika nilainya tersedia saat build. Peringatan SecretsUsedInArgOrEnv di log berasal dari argumen yang diinjeksi platform, bukan deklarasi credential di Dockerfile repo. [Dokumentasi scope Coolify](https://coolify.io/docs/applications/configuration/environment-variables#build-and-runtime-scope).

Perbaikan build ini masih di workspace dan memerlukan commit/push serta redeploy Appraisal. Keberhasilan deployment DBX dan Query Mapping mengikuti laporan pengguna/screenshot; bukan hasil smoke test production baru oleh agen.
