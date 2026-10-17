> Function (EN): Public Appraisal setup, visitor ownership and runtime configuration.
> Fungsi (ID): Setup Appraisal publik, kepemilikan browser dan konfigurasi runtime.
> Created: 2026-07-08
> Last Modified / Replaced: 2026-10-17T13:34:17+07:00

# YPYM Appraisal - Keyword-Level SEO Investment Calculator

Sistem untuk menghitung proyeksi ROI, traffic (leads), konversi, revenue, serta rekomendasi biaya jasa SEO di tingkat kata kunci spesifik (keyword targeting).

---

## 1. Persyaratan Sistem (Prerequisites)

- **Node.js**: Gunakan **Node24** untuk menyamakan ABI SQLite dengan image production.
- **SQLite**: Otomatis dikonfigurasi melalui module `better-sqlite3` di Node.js (tidak perlu instalasi server database terpisah).

---

## 2. Panduan Menjalankan Project (Quick Start)

### Cara A: Menggunakan Master Script (Direkomendasikan)
1. Buka PowerShell dengan hak akses Administrator di root sandbox `C:\Users\rochm\Documents\ypym-sandbox\`.
2. Jalankan script master:
   ```powershell
   ./start-all.ps1
   ```
   Script ini secara otomatis akan membuka jendela terminal baru dan menjalankan:
   - **Backend API**: port `3100` (`npm run dev` di `/backend`)
   - **Frontend App**: port `5173` (`npm run dev` di `/frontend`)
   - Beserta layanan ekosistem YPYM lainnya.

### Cara B: Menjalankan Secara Manual

**Langkah 1: Jalankan Backend API**
1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Jalankan server dev:
   ```bash
   npm run dev
   ```
   *Catatan: Database SQLite `./data/ypym-appraisal.db` dan skema tabel akan dibuat secara otomatis pada startup pertama.*

**Langkah 2: Jalankan Frontend App**
1. Masuk ke folder frontend:
   ```bash
   cd ../frontend
   ```
2. Jalankan Vite server:
   ```bash
   npm run dev
   ```
3. Buka browser di alamat: [http://localhost:5173/](http://localhost:5173/)

---

## 3. Konfigurasi Lingkungan (`.env`)

Appraisal adalah aplikasi publik tanpa login. Halaman, dashboard, daftar analisis dan hasil/ekspor dapat dibuka publik. Hanya browser pembuat yang dapat menghapus, menganalisis ulang atau mengubah proyek, melalui cookie HttpOnly yang dibuat otomatis. Proyek lama tanpa owner tetap dapat dibaca, tetapi tidak dapat diubah dari API publik. Jika cookie hilang/kedaluwarsa, buat analisis baru. Jangan memasukkan informasi rahasia ke hasil publik.

File konfigurasi berada di `backend/.env`:
- **GOOGLE_ADS_***: Tidak diperlukan oleh pipeline HTTP publik yang membaca katalog tersimpan. Pengumpulan data terpisah bukan bagian dari submit form publik.
- **DATAFORSEO_*** dan **AUTH_***: Tidak diperlukan dan diabaikan. Submit publik tidak mengaktifkan DataForSEO. Login/logout Appraisal telah dihapus sesuai fungsi produk publik.
- **PORT**: Default `3100`.
- **CORS_ORIGIN**: URL frontend dev `http://localhost:5173`; production `https://appraisal.ypym.app`, tanpa wildcard.
- **Batas default**: 10 analisis total/hari UTC, 3 per IP/hari, 1 analisis aktif per instance; 200 proyek baru total/hari, 10 per IP/browser/hari, maksimal 5000 proyek tersimpan. Nilai lengkap ada di `backend/.env.example`. Gunakan satu replika backend.
- **Persistent storage**: Mount `/app/backend/data`; cookie kepemilikan berlaku 30 hari. Cadangkan SQLite sebelum deploy migrasi.
- **Reverse proxy**: `TRUST_PROXY` menerima daftar IP/CIDR proxy tepercaya. Batasi port origin ke proxy Coolify, dan pastikan forwarding IP sesuai topologi Cloudflare agar kuota per IP tidak mengelompokkan pengunjung berbeda.
- **Build**: Dockerfile memasang dependency build dengan `npm ci --include=dev`, lalu membuang devDependencies sebelum runner. Env production cukup runtime only.

---

## 4. Skenario Pengujian (Test Cases)

Untuk menguji keandalan sistem Fase 1 ini, lakukan pengujian pada fitur-fitur berikut:

### 🧪 Uji 1: Pipeline E2E & Long-Polling Status
1. Masuk ke [http://localhost:5173/](http://localhost:5173/) dan klik **Mulai Proyeksi Baru**.
2. Masukkan kata kunci target (misal: `"jasa seo jakarta"`), pilih bahasa & mata uang, lalu klik **Generate Proyeksi**.
3. **Verifikasi**: Sistem akan mengalihkan ke dashboard dan menampilkan halaman progress bar. Status step (*Autocomplete*, *Enriching SV*, *Trends*, *Clustering*, *Intent*, *Difficulty*, *Projection*) harus berganti secara real-time hingga status menjadi **Completed**.

### 🧪 Uji 2: Deduplikasi & Clustering (Token Similarity)
1. Setelah proyeksi selesai, gulir ke bagian **Keyword Ideas Breakdown**.
2. **Verifikasi**: Cari kata kunci dengan intent serupa.
   - Kata kunci harus dikelompokkan dalam `Cluster ID` yang sama jika memiliki kesamaan token (Jaccard similarity >= 0.6).
   - Kata kunci dengan volume pencarian (`Avg SV`) tertinggi dalam satu cluster ditandai sebagai **Cluster Primary** (dengan lencana biru).
   - Volume pencarian efektif pool (`Effective SV Pool` di card atas) harus lebih rendah dari `Raw SV Pool` karena deduplikasi telah aktif.

### 🧪 Uji 3: Intent & Difficulty Weighting
1. Periksa kolom **Intent** di tabel keyword.
   - Kata kunci mengandung kata "beli", "harga", "jasa" harus diklasifikasikan sebagai `transactional`.
   - Kata kunci mengandung kata "terbaik", "rekomendasi" harus diklasifikasikan sebagai `commercial`.
   - Kata kunci mengandung kata "cara", "panduan", "apa itu" harus diklasifikasikan sebagai `informational`.
2. Periksa kolom **Difficulty** dan **Capture Rate**:
   - Kata kunci yang lebih pendek dan memiliki intent komersial tinggi harus memiliki score `Difficulty` yang lebih besar.
   - Lencana capture rate efektif harus mengalami penalti (lebih kecil dari target capture rate baseline) sesuai dengan tingkat kesulitannya.

### 🧪 Uji 4: Simulasi "Recalculate ROI" Instan (Dapat Diaudit)
1. Pada panel sebelah kanan dashboard (**Audit & Uji Skenario**), ubah nilai asumsi (misal: ubah Target Capture Rate dari `10%` menjadi `15%`, atau ubah Service Fee dari `20%` menjadi `25%`).
2. Klik tombol **Recalculate ROI**.
3. **Verifikasi**:
   - Angka proyeksi pada card 1/12/24 Bulan dan nilai Service Fee/Margin di cost ledger harus langsung berubah seketika (<500ms).
   - Pengujian ini harus berhasil **tanpa reload halaman** dan tanpa melakukan request API eksternal ulang (menggunakan data cache lokal).

### 🧪 Uji 5: Dual Currency Presentation
1. Periksa baris estimasi Revenue dan Service Fee di dashboard.
2. **Verifikasi**: Semua nilai mata uang ditampilkan dalam format **USD** (di atas) dan **IDR** (di bawah dengan font mono abu-abu) secara konsisten menggunakan nilai tukar yang diambil saat setup project dijalankan.

### 🧪 Uji 6: Ekspor Hasil
1. Klik tombol **Export JSON** dan **Export CSV** di pojok kanan atas dashboard.
2. **Verifikasi**:
   - JSON yang diunduh harus berisi payload lengkap data proyek, keywords, tren, dan proyeksi.
   - CSV yang diunduh harus berisi daftar rapi kata kunci turunan beserta metrik volumetrik, intent, dan difficulty score.
