# Screenshot & Demo Mapping untuk Dokumentasi Logging & Error Handling

## 📸 Screenshot yang Diperlukan untuk Presentasi Logging

Berdasarkan `docs/LOGGING.md`, berikut screenshot/demo yang harus ditampilkan saat presentasi:

---

## 1. **Console Output (Server Startup)**
**Tujuan:** Menunjukkan startup logs dan DB connection success message

**Screenshot:**
- Terminal/console menampilkan:
  ```
  Server is running on port 3000
  [DB] ✅ Connected to MySQL successfully (localhost:3306/fairy_garden_db).
  ```

**Deskripsi slide:** "Saat server startup, kita lihat DB berhasil terkoneksi dan Winston/Morgan siap mencatat logs."

---

## 2. **HTTP Request Log (Morgan) - access.log**
**Tujuan:** Menunjukkan format Morgan access log

**Screenshot:**
- File explorer: buka `logs/access.log`
- Tampilkan beberapa baris terakhir (tail):
  ```
  127.0.0.1 - 5 [11/Nov/2025:00:50:24 +0000] "POST /api/orders HTTP/1.1" 201 53 "-" "PostmanRuntime/7.50.0"
  127.0.0.1 - 5 [11/Nov/2025:00:50:25 +0000] "POST /api/payments/orders/4/pay HTTP/1.1" 200 150 "-" "PostmanRuntime/7.50.0"
  ```

**Deskripsi slide:** "Morgan mencatat setiap HTTP request: method, URL, status code, response time (ms), user ID."

---

## 3. **Error Log (Winston) - error.log**
**Tujuan:** Menunjukkan format Winston error log dengan JSON terstruktur

**Screenshot:**
- File explorer: buka `logs/error.log`
- Tampilkan 1–2 error entries (JSON format):
  ```json
  {"level":"error","message":"Midtrans API is returning API error. HTTP status code: 401...","stack":"MidtransError: ...","timestamp":"2025-11-10 23:31:18","url":"/api/payments/orders/4/pay","user":5}
  ```

**Deskripsi slide:** "Error log terstruktur (JSON) berisi: level, message, stack trace, timestamp, URL, user ID — semua yang kita butuh untuk debug."

---

## 4. **Combined Log (Winston) - combined.log**
**Tujuan:** Menunjukkan bahwa combined.log mencatat info + warning + error

**Screenshot:**
- File explorer: buka `logs/combined.log`
- Tampilkan beberapa baris berbeda level:
  ```
  {"level":"info","message":"[DB] ✅ Connected to MySQL successfully...","timestamp":"..."}
  {"level":"error","message":"Payment initiation error","stack":"...","timestamp":"..."}
  {"level":"warn","message":"Low stock detected","timestamp":"..."}
  ```

**Deskripsi slide:** "Combined log menyimpan semua level (info, warn, error). Gunakan ini untuk analisis trend aplikasi."

---

## 5. **Error Response in Postman (4xx Error)**
**Ini sebenernya sudah ada di CLICKUP_SCREENSHOT_GUIDE.md:**
- Screenshot 3: Create Order dengan empty cart (400 error)
- Screenshot 7: Invalid token (401 error)

**Deskripsi slide:** "Saat error terjadi, response selalu dalam format JSON konsisten: {status, message}. HTTP status code menunjukkan jenis error (4xx = client, 5xx = server)."

---

## 6. **Terminal Command: Tail Error Log (Live)**
**Tujuan:** Menunjukkan cara membaca log real-time saat development

**Screenshot:**
- PowerShell/terminal menjalankan command:
  ```powershell
  Get-Content logs/error.log -Tail 20 -Wait
  ```
- Atau di Linux/Mac:
  ```bash
  tail -f logs/error.log
  ```
- Tampilkan beberapa error masuk secara real-time

**Deskripsi slide:** "Developer bisa tail log file untuk debugging live — lihat error masuk saat terjadi tanpa perlu restart server."

---

## 7. **VS Code: Open & Search Log File**
**Tujuan:** Menunjukkan cara search log di editor

**Screenshot:**
- VS Code terbuka dengan `logs/error.log`
- Gunakan Ctrl+F untuk search (misal: search "401" atau "MidtransError")
- Tampilkan hasil search highlight

**Deskripsi slide:** "Gunakan VS Code built-in search untuk cari specific error, timestamp, atau user ID dalam log — lebih mudah daripada terminal grep."

---

## 8. **Database State (Query Result)**
**Tujuan:** Menunjukkan hasil dari script `check-order-payment.js` — status orders dan payments dalam DB

**Screenshot:**
- Terminal menjalankan:
  ```cmd
  node scripts/check-order-payment.js
  ```
- Output menampilkan tabel:
  ```
  ORDERS:
  | id | order_number | status | payment_status | total_amount |
  | 4  | ORD1762790876430339 | diproses | paid | 498000.00 |
  
  PAYMENTS:
  | id | order_id | amount | status | transaction_id |
  | 2  | 4 | 498000.00 | completed | TRX-123456 |
  ```

**Deskripsi slide:** "Database mencerminkan status terbaru: order 4 sudah 'paid' dan payment 'completed' — ini hasil dari simulation endpoint."

---

## 9. **Postman: Simulate Notification**
**Ini sudah ada di CLICKUP_SCREENSHOT_GUIDE.md:**
- Screenshot 5: POST /api/payments/simulate-notification

**Deskripsi slide:** "Kami mengirim simulated webhook notification ke backend → backend update DB → order status berubah jadi 'paid'."

---

## 10. **(Bonus) Code Example: ErrorHandler Middleware**
**Tujuan:** Menunjukkan flow bagaimana error ditangkap dan dijawab

**Screenshot:**
- Buka file `src/middleware/errorHandler.js` di VS Code
- Highlight section global error handler (try/catch)
- Tampilkan response format yang konsisten

**Deskripsi slide:** "Semua error ditangkap oleh global middleware ini — log penuh ke file, response user-friendly ke client."

---

## 📋 Ringkasan Screenshot untuk Slide Presentasi

| Slide | Screenshot / Demo | Durasi | Catatan |
|-------|-------------------|--------|---------|
| Startup | Console output DB connection | 10s | Tunjukkan logs siap |
| Morgan Logs | `logs/access.log` content | 15s | Terangkan format |
| Error Logs | `logs/error.log` JSON entries | 15s | Tunjukkan struktur |
| Combined Logs | `logs/combined.log` all levels | 10s | Jelaskan perbedaan level |
| Error Response (4xx) | Postman Screenshot 3 & 7 | 20s | Tunjukkan JSON konsisten |
| Live Tailing | Terminal tail command | 15s | Terangkan real-time debugging |
| Search Logs | VS Code search in error.log | 15s | Praktis untuk troubleshooting |
| DB State | Script `check-order-payment.js` | 15s | Lihat hasil di DB |
| Simulate Webhook | Postman Screenshot 5 | 15s | Update DB via simulation |
| Code | `errorHandler.js` middleware | 10s | Flow penanganan error |
| **Total** | | ~2 menit | Logging deep-dive |

---

## 🎯 Rekomendasi untuk Presentasi

1. **Jika waktu terbatas (5 menit):** Show screenshots 1, 3, 5, 8 saja (DB + logs + error response).
2. **Jika waktu cukup (10 menit):** Include semua kecuali screenshot 10 (code detail).
3. **Jika ada sesi hands-on workshop:** Live demo tail, search, simulate notification — jalankan command langsung.

---

**Catatan:** Semua ini untuk mengilustrasikan bagian "Logging: Strategi & Lokasi" + "Contoh Output Log & Database" di naskah presentasi slide 8 & 11.
