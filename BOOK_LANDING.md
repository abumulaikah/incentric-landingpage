# Halaman penjualan Seni Merawat Pelanggan

Route produksi: `https://incentric.co.id/senimerawatpelanggan`

Halaman ini memakai cover asli, materi buku Ronald Satria, CSS khusus, dan
kontak WhatsApp yang sudah digunakan project: `6281249017400`.
Tidak ada dependensi baru.

Pembukaan menyebut buku, penulis, masalah pelanggan, harga, dan cara memesan.
Contoh isi dan empat pembahasan utama tampil langsung; daftar isi lengkap
tersedia di satu panel yang dapat dibuka. Tipografi memakai font sistem tanpa
unduhan font eksternal. Label dekoratif, judul serif miring, dan stempel harga
telah dihapus.

Hero memakai latar netral putih kehijauan, tipografi Segoe UI, cover asli dengan
efek ketebalan buku berbasis CSS, dan tombol oranye dengan teks gelap.
Tidak ada perubahan pada gambar cover atau ilustrasi sumber.

## Pratinjau untuk review internal

Buka `/senimerawatpelanggan` langsung untuk meninjau contoh ulasan, countdown
23 jam 17 menit, dan notifikasi melayang. Tidak perlu parameter URL.
`BOOK_PREVIEW.enabled` di `src/lib/book-preview.ts` sekarang bernilai `true`.
Banner dan label lokal menyebutkan
bahwa nama, teks ulasan, serta aktivitas pesanan adalah simulasi/rekaan.
Mode ini tidak mengklaim pembelian nyata atau tenggat promo sebenarnya.
Timer demo disimpan di sessionStorage agar tidak kembali ke awal saat refresh
di tab yang sama; habisnya timer demo tidak mengubah harga jual.

Data contoh ulasan, notifikasi, dan durasi timer dipisahkan di `book-preview.ts`.
Untuk beralih ke data nyata:

1. Isi `BOOK_TESTIMONIALS` dengan ulasan asli berizin di `src/lib/book-offer.ts`.
2. Isi `RECENT_BOOK_PURCHASES` dengan nama berizin dan waktu ISO pesanan nyata.
3. Isi `BOOK_OFFER.promotionEndsAt` dengan tenggat promo yang benar-benar berlaku.
4. Set `BOOK_PREVIEW.enabled: false`, lalu build/deploy ulang.

Saat preview dinonaktifkan, ulasan asli tampil tanpa label simulasi, countdown
mengikuti tenggat promo, dan notifikasi memakai waktu relatif pesanan nyata.
Data asli yang kosong tidak memunculkan klaim pengganti.
Jangan menghapus label untuk mengubah data contoh menjadi klaim penjualan.

Rujukan UX: [Baymard, product descriptions](https://baymard.com/blog/product-descriptions)
dan [Nielsen Norman Group, reading on the web](https://www.nngroup.com/articles/how-users-read-on-the-web/).
Rujukan dipakai untuk kejelasan informasi dan pemindaian, bukan sebagai bukti
bahwa halaman ini pasti menaikkan penjualan.

## File

- `src/pages/senimerawatpelanggan.astro`: halaman, metadata, dan interaksi.
- `src/styles/book-landing.css`: tampilan khusus halaman buku.
- `src/lib/book-offer.ts`: konfigurasi harga, tenggat, dan pesanan terbaru.
- `src/lib/book-preview.ts`: sakelar dan data contoh untuk review internal.
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
