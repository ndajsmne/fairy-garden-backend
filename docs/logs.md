## Logs: lokasi, format, dan cara membaca

Lokasi file log (root workspace):

- logs/access.log — request access log (morgan)
- logs/combined.log — semua level log yang dipakai oleh aplikasi (winston)
- logs/error.log — hanya error level (winston)

Format:
- access.log: plain text lines berformat morgan (IP, user, date, method, url, status, response-time)
- combined.log / error.log: JSON lines

Contoh entry `combined.log` (JSON):

{
  "level": "error",
  "message": "Some error message",
  "timestamp": "2025-11-10 12:34:56",
  "stack": "Error: ...",
  "url": "/api/orders/123/pay",
  "method": "POST"
}

Cara cepat membaca/log tail (Windows - PowerShell):

Get-Content .\logs\combined.log -Tail 50 -Wait

Filter error saja (PowerShell):

Get-Content .\logs\combined.log | ConvertFrom-Json | Where-Object { $_.level -eq 'error' }

Jika ingin grep-like (cmd):

findstr /I "error" logs\combined.log

Troubleshooting tips:
- Jika tidak ada file `logs/*.log`, buat folder `logs` secara manual atau jalankan server sekali — logger akan membuat folder secara otomatis.
- Pastikan aplikasi berjalan dengan `NODE_ENV=development` untuk melihat logs ke console.
- Untuk debugging transaksi pembayaran, cek `access.log` untuk request-notification dari payment gateway dan `combined.log` untuk detail error dari `payment` model/controller.
