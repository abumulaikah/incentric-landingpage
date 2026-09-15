# Halaman penjualan Seni Merawat Pelanggan

Route produksi: `https://incentric.co.id/senimerawatpelanggan`

Halaman ini memakai cover asli, materi buku Ronald Satria, CSS khusus, dan
kontak WhatsApp yang sudah digunakan project: `6281249017400`.
Tidak ada dependensi baru.

## File

- `src/pages/senimerawatpelanggan.astro`: halaman, metadata, dan interaksi.
- `src/styles/book-landing.css`: tampilan khusus halaman buku.
- `src/lib/book-offer.ts`: konfigurasi harga, tenggat, dan pesanan terbaru.
- `public/media/seni-merawat-pelanggan-cover.jpeg`: cover dari pemilik project.

## Penawaran

Harga pembanding Rp199.000 dan harga penawaran Rp99.000 mengikuti brief.
Sebelum publikasi, pastikan harga pembanding adalah harga yang memang berlaku.
Format buku dan biaya pengiriman belum ditentukan; halaman meminta pembeli
mengonfirmasi format, ketersediaan, dan total biaya melalui WhatsApp.

Countdown disiapkan tetapi tidak tampil ketika `promotionEndsAt` bernilai
`null`. Untuk promo dengan tenggat sungguhan, isi waktu ISO 8601 di
`src/lib/book-offer.ts`, lalu build/deploy ulang. Gunakan satu tenggat untuk
semua pengunjung. Setelah tenggat lewat, browser mengganti seluruh harga dan
pesan WhatsApp ke Rp199.000 serta menyembunyikan harga coret. Build/deploy
ulang setelah promo berakhir agar HTML awal juga memakai harga normal.

Notifikasi pembelian hanya muncul jika `RECENT_BOOK_PURCHASES` berisi pesanan
nyata dengan nama yang diizinkan untuk ditampilkan dan waktu ISO 8601.
Waktu relatif dihitung dari timestamp pesanan, bukan angka acak.
Perubahan data perlu build/deploy ulang karena situs bersifat statis.

## Pemeriksaan dan publikasi

```sh
npm ci
npm run lint
npm run build
npm run dev
```

Buka `http://localhost:3000/senimerawatpelanggan`.

Untuk menayangkan halaman pada domain yang sudah terhubung ke project ini,
gabungkan perubahan ke branch produksi yang dipantau Vercel. Tidak perlu
menambahkan domain atau mengubah konfigurasi Astro. Draft PR tidak otomatis
mengubah situs produksi.

PDF sumber lengkap tidak disertakan atau dibuka sebagai unduhan publik.
Contoh percakapan ditandai sebagai penerapan materi, bukan testimoni pembeli.
