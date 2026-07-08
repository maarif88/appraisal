# YPYM Appraisal - Keyword-Level SEO Investment Calculator

Sistem untuk menghitung proyeksi ROI, traffic (leads), konversi, revenue, serta rekomendasi biaya jasa SEO di tingkat kata kunci spesifik (keyword targeting).

---

## 1. Persyaratan Sistem (Prerequisites)

- **Node.js**: Gunakan versi **v20.20.0 (LTS)** (sesuai dengan standard ekosistem YPYM).
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

Backend berjalan dalam **Mock Mode** secara default jika API key pihak ketiga dikosongkan. Ini sangat memudahkan pengujian lokal tanpa biaya API.

File konfigurasi berada di `backend/.env`:
- **GOOGLE_ADS_***: Kosongkan untuk menggunakan simulasi pencarian volume kata kunci dengan algoritma volume dinamis. Isi dengan Developer Token + Client Credentials untuk real Google Ads API.
- **DATAFORSEO_***: Kosongkan untuk menggunakan tren visual demand 5 tahun ter-simulasi. Isi dengan akun DataForSEO Anda untuk penarikan live trends.
- **PORT**: Default `3100`.
- **CORS_ORIGIN**: Diarahkan ke URL frontend dev `http://localhost:5173`.

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
