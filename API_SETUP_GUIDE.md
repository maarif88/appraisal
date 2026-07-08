# Panduan Mendapatkan API Key & Credentials

Panduan langkah demi langkah ini akan membantu Anda mendapatkan API Key dan Credentials untuk **Google Ads API** dan **DataForSEO** guna mengaktifkan data riil pada sistem YPYM Appraisal.

---

## Bagian 1: Mendapatkan Google Ads API Credentials

Google Ads API membutuhkan 5 parameter di `.env`:
1. `GOOGLE_ADS_DEVELOPER_TOKEN`
2. `GOOGLE_ADS_CLIENT_ID`
3. `GOOGLE_ADS_CLIENT_SECRET`
4. `GOOGLE_ADS_REFRESH_TOKEN`
5. `GOOGLE_ADS_LOGIN_CUSTOMER_ID`

Berikut adalah langkah-langkah untuk mendapatkannya:

### Langkah 1.1: Buat Akun Google Ads Manager (MCC)
*Catatan: Akun Google Ads biasa tidak memiliki opsi API Center. Anda wajib membuat akun tipe Manager (MCC).*
1. Buka halaman [Google Ads Manager Accounts](https://ads.google.com/home/tools/manager-accounts/).
2. Klik **Buat Akun Pengelola** (Create a manager account).
3. Isi informasi bisnis Anda, pilih zona waktu, lalu kirim.
4. Catat **10-Digit Customer ID** akun pengelola Anda di kanan atas (Format: `XXX-XXX-XXXX`). Ini adalah nilai untuk `GOOGLE_ADS_LOGIN_CUSTOMER_ID`.

### Langkah 1.2: Dapatkan Developer Token
1. Di dalam dashboard Google Ads Manager Account Anda, klik menu **Alat dan Setelan** (Tools and Settings) -> **Pusat API** (API Center).
2. Isi formulir permohonan token. Pilih akses tipe **Test/Basic Access**.
3. Setelah disetujui (biasanya instan untuk akses Test), Anda akan mendapatkan string token panjang. Copy token ini untuk `GOOGLE_ADS_DEVELOPER_TOKEN`.
   *Catatan: Test token dapat digunakan untuk menarik data dari akun riil mana pun selama akun MCC Anda bertindak sebagai manager/owner.*

### Langkah 1.3: Konfigurasi Google Cloud Project & OAuth Credentials
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat project baru bernama `ypym-appraisal`.
3. Cari **Google Ads API** di bilah pencarian marketplace Cloud, klik **Enable**.
4. Buka menu **APIs & Services** -> **OAuth Consent Screen**:
   - Pilih User Type: **External** (atau Internal jika Anda menggunakan Google Workspace).
   - Isi App Name (misal: `YPYM Appraisal`) dan email support Anda.
   - Pada bagian Scopes, klik Add Scope dan cari `https://www.googleapis.com/auth/adwords`.
   - Pada Test Users, masukkan email Google yang terhubung dengan akun Google Ads MCC Anda.
5. Buka menu **APIs & Services** -> **Credentials**:
   - Klik **Create Credentials** -> **OAuth Client ID**.
   - Pilih Application Type: **Web Application**.
   - Di bagian **Authorized redirect URIs**, tambahkan: `https://developers.google.com/oauthplayground` (ini akan digunakan di langkah berikutnya).
   - Klik **Create**. Catat **Client ID** (`GOOGLE_ADS_CLIENT_ID`) dan **Client Secret** (`GOOGLE_ADS_CLIENT_SECRET`).

### Langkah 1.4: Dapatkan Refresh Token
1. Buka [Google OAuth Playground](https://developers.google.com/oauthplayground).
2. Klik ikon gerigi (Settings) di pojok kanan atas:
   - Centang **Use own OAuth credentials**.
   - Masukkan **OAuth Client ID** dan **OAuth Client Secret** yang Anda dapatkan dari Langkah 1.3.
3. Di kolom kiri (Step 1 - Select & authorize APIs):
   - Cari dan masukkan scope ini: `https://www.googleapis.com/auth/adwords`
   - Klik **Authorize APIs**. Login menggunakan akun Google Ads MCC Anda dan setujui aksesnya.
4. Pada Step 2 (Exchange authorization code for tokens):
   - Klik tombol **Exchange authorization code for tokens**.
   - Anda akan mendapatkan **Refresh Token**. Copy token ini untuk `GOOGLE_ADS_REFRESH_TOKEN`.

---

## Bagian 2: Mendapatkan DataForSEO API Credentials

DataForSEO digunakan untuk menarik data dari Google Trends secara aman dan cepat.
Anda membutuhkan 2 parameter di `.env`:
1. `DATAFORSEO_LOGIN`
2. `DATAFORSEO_PASSWORD`

Langkah mendapatkannya sangat mudah:

### Langkah 2.1: Registrasi Akun
1. Buka halaman registrasi [DataForSEO](https://dataforseo.com/).
2. Buat akun baru (gratis).

### Langkah 2.2: Dapatkan Credentials
1. Buka dashboard DataForSEO Anda.
2. Cari bagian **API Dashboard** -> **API Keys**.
3. Di sana Anda akan melihat:
   - **Login**: (Biasanya alamat email terdaftar Anda). Gunakan ini untuk `DATAFORSEO_LOGIN`.
   - **Password (API Key)**: Token karakter panjang. Gunakan ini untuk `DATAFORSEO_PASSWORD`.

### Langkah 2.3: Top Up Dana
*Catatan: Setiap penarikan data Google Trends memakan biaya sebesar ~$0.00225.*
1. Anda perlu melakukan top up saldo minimal $10 - $20 di menu Billing DataForSEO agar API call dapat berjalan dan mengembalikan data rill.
