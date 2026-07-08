# SEO Data Crawling Guidelines

Dokumen ini menjelaskan panduan lengkap cara menjalankan skrip otomatisasi pengumpulan data SEO (`collect_seo_data.py`) menggunakan berbagai kombinasi parameter seperti kata kunci, target negara (wilayah), bahasa, rentang waktu (*timeframe*), dan kategori pencarian (*search properties*).

---

## 📋 Persyaratan Awal (Prerequisites)

Skrip ini terhubung langsung ke browser Google Chrome yang sedang aktif di komputer Anda melalui remote debugging port `9222`. Hal ini memungkinkan skrip menggunakan sesi login Google Ads/Trends Anda secara aman tanpa memerlukan API Key berbayar.

### Cara Menjalankan Chrome dalam Debugging Mode:
1. Tutup semua jendela browser Google Chrome terlebih dahulu.
2. Buka **Command Prompt (CMD)** atau **PowerShell** dan jalankan perintah berikut:
   ```powershell
   # Windows Command Prompt
   start chrome --remote-debugging-port=9222

   # Windows PowerShell
   Start-Process "chrome.exe" -ArgumentList "--remote-debugging-port=9222"
   ```
3. Buka tab baru di Chrome tersebut, masuk ke akun Google Anda, dan biarkan tetap terbuka selama proses crawling berjalan.

---

## 🛠️ Parameter CLI (Command Line Interface)

Skrip menerima parameter berikut saat dijalankan:

| Argumen | Singkatan | Nilai Default | Deskripsi / Contoh Nilai |
| :--- | :--- | :--- | :--- |
| `keywords` | *(Posisional)* | `DEFAULT_KEYWORDS` | Kata kunci yang dicari (pisahkan dengan koma `,` jika lebih dari satu). |
| `--geo` | `-g` | `ID` | Kode negara atau wilayah. Contoh: `ID`, `US`, `SG`, `global` (untuk seluruh dunia). |
| `--lang` | `-l` | `Indonesian` | Target bahasa data. Contoh: `Indonesian`, `English`, `Japanese`. |
| `--timeframe`| `-t` | `today 5-y` | Rentang waktu Google Trends. Contoh: `today 5-y` (5 tahun), `today 12-m` (12 bulan), `now 7-d` (7 hari). |
| `--gprop` | `-p` | `web` | Kategori pencarian Google Trends. Pilihan: `web`, `images`, `news`, `youtube`, `shopping`. |

---

## 💡 Ragam Contoh Skenario Penggunaan

Jalankan perintah-perintah di bawah ini melalui terminal/PowerShell Anda pada folder root project `ypym-sandbox`.

### 1. Riset SEO Lokal (Default Target: Indonesia)
Skenario ini digunakan untuk mencari kata kunci lokal berbahasa Indonesia dengan target demografis wilayah Indonesia.
* **Kata Kunci**: `jasa seo jakarta`, `pakar seo indonesia`
* **Negara**: Indonesia (`ID`)
* **Bahasa**: Indonesia (`Indonesian`)
* **Perintah**:
  ```powershell
  python ypym-appraisal/scripts/collect_seo_data.py "jasa seo jakarta, pakar seo indonesia" --geo ID --lang Indonesian
  ```

### 2. Riset SEO Global (Target: Worldwide/Seluruh Dunia)
Skenario ini digunakan untuk produk/layanan B2B internasional seperti outsourcing, EOR, atau software global.
* **Kata Kunci**: `employer of record`, `payroll outsourcing`
* **Negara**: Worldwide/Global (`global`)
* **Bahasa**: Inggris (`English`)
* **Perintah**:
  ```powershell
  python ypym-appraisal/scripts/collect_seo_data.py "employer of record, payroll outsourcing" --geo global --lang English
  ```

### 3. Riset Kueri Video (Target: YouTube Search)
Skenario ini berguna bagi kreator konten atau brand video untuk menganalisis tren pencarian video di YouTube selama 12 bulan terakhir.
* **Kata Kunci**: `belajar pemrograman python`
* **Negara**: Indonesia (`ID`)
* **Bahasa**: Indonesia (`Indonesian`)
* **Rentang Waktu**: 12 Bulan Terakhir (`today 12-m`)
* **Kategori**: YouTube Search (`youtube`)
* **Perintah**:
  ```powershell
  python ypym-appraisal/scripts/collect_seo_data.py "belajar pemrograman python" --geo ID --lang Indonesian --timeframe "today 12-m" --gprop youtube
  ```

### 4. Riset E-Commerce & Google Shopping
Skenario ini digunakan untuk riset produk fisik e-commerce guna mengetahui kueri produk terlaris dalam 3 bulan terakhir.
* **Kata Kunci**: `gaming laptop`
* **Negara**: Amerika Serikat (`US`)
* **Bahasa**: Inggris (`English`)
* **Rentang Waktu**: 90 Hari Terakhir (`today 3-m`)
* **Kategori**: Google Shopping/Froogle (`shopping`)
* **Perintah**:
  ```powershell
  python ypym-appraisal/scripts/collect_seo_data.py "gaming laptop" --geo US --lang English --timeframe "today 3-m" --gprop shopping
  ```

### 5. Riset Tren Berita Terkini (Target: Google News)
Skenario ini digunakan untuk riset topik hangat atau berita viral skala dunia yang terjadi dalam 7 hari terakhir.
* **Kata Kunci**: `bitcoin halving`
* **Negara**: Worldwide/Global (`global`)
* **Bahasa**: Inggris (`English`)
* **Rentang Waktu**: 7 Hari Terakhir (`now 7-d`)
* **Kategori**: News Search (`news`)
* **Perintah**:
  ```powershell
  python ypym-appraisal/scripts/collect_seo_data.py "bitcoin halving" --geo global --lang English --timeframe "now 7-d" --gprop news
  ```

---

## 📊 Hasil Output Spreadsheet Excel

File hasil kompilasi akan tersimpan di dalam folder `ypym-appraisal/scripts` dengan format penamaan dinamis: `SEO_Appraisal_Dataset_[TANGGAL]_[WAKTU].xlsx`.

Dataset tersebut berisi 4 sheet/tab dengan struktur kolom sebagai berikut:

1. **`google ads - keyword ideas`**
   * Menyimpan data volume pencarian bulanan, tingkat persaingan, dan nilai bid.
   * *Kolom*: `Data, Start-End`, `Date Request`, `Seed/Main Keyword`, `Keyword`, `Currency`, `Avg. monthly searches`, `Three month change`, `YoY change`, `Competition`, `Competition (indexed value)`, `Top of page bid (low range)`, `Top of page bid (high range)`, `Language`, `Location`.
2. **`google trends - top keyword`**
   * Menyimpan daftar kueri paling populer yang dicari secara akumulatif.
   * *Kolom*: `query`, `search interest index`, `% increase`, `Date Request`, `Data Timeframe`, `Location`, `Category`.
3. **`google trends - raising keyword`**
   * Menyimpan daftar kueri pencarian yang pertumbuhannya paling pesat (*Rising / Breakout*).
   * *Kolom*: `Query`, `search interest`, `increase percent`, `Date Request`, `Data Timeframe`, `Location`, `Category`.
4. **`google suggestion`**
   * Menyimpan daftar saran kueri langsung yang didapat dari kotak pencarian Google.
   * *Kolom*: `Date Request`, `Seed/Main Keyword`, `Suggestion`, `Position`, `Language`, `Location`.
