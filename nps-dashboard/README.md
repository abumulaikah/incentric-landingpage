# Dashboard NPS Incentric

Dashboard privat untuk laporan NPS dan kepuasan layanan pasien. Data diambil langsung dari **Tally**,
dihitung di server, lalu ditampilkan per client di subdomain seperti `nps.incentric.co.id/rsananda`.

```
incentric-landingpage/          → landing page Astro (project Vercel #1, incentric.co.id)
└── nps-dashboard/              → dashboard NPS (project Vercel #2, nps.incentric.co.id)
```

## Fitur

- **Total responden**, **skor NPS**, dan **persentase promoter / passive / detractor**.
- **Skor rata-rata per tahap layanan**: kedatangan, pendaftaran & administrasi, pemeriksaan medis,
  kasir & farmasi, fasilitas umum, plus kamar rawat inap (muncul otomatis bila ada jawaban).
- **Korelasi Pearson** antara skor tiap tahap dan skor rekomendasi, lengkap dengan kategori kekuatan
  dan rekomendasi prioritas.
- Distribusi skor, tren harian, segmentasi jenis layanan, daftar komentar.
- Filter tanggal dan jenis layanan, **export CSV** (sudah termasuk BOM agar rapi di Excel).
- **Login password per client** + **halaman admin Incentric** yang bisa melihat semua dashboard.
- Cache data 5 menit (bisa diatur) agar Tally API tidak dipanggil terus-menerus.

## Struktur penting

| File | Fungsi |
| --- | --- |
| `src/lib/config.ts` | Daftar client, Form ID Tally, pemetaan pertanyaan → tahap layanan |
| `src/lib/tally.ts` | Pengambilan data dari Tally API |
| `src/lib/normalize.ts` | Mengubah submission Tally menjadi skor per pertanyaan |
| `src/lib/stats.ts` | NPS, rata-rata tahap, distribusi, korelasi |
| `src/lib/auth.ts` | Cookie sesi bertanda tangan (HMAC) + rate limit login |

## Menjalankan secara lokal

```bash
cd nps-dashboard
npm install
cp .env.example .env      # lalu isi nilainya
npm run dev               # http://localhost:4321
```

Untuk melihat dashboard dengan data contoh (tanpa memanggil Tally), set `NPS_DEMO=1` di `.env`.
Data contoh ada di `src/fixtures/rsananda.json` dan sudah dibersihkan dari nama petugas serta komentar bebas.

## Menambah client baru

1. Tambahkan entri di array `CLIENTS` pada `src/lib/config.ts`:

   ```ts
   {
     slug: 'rsabc',
     name: 'RS ABC',
     shortName: 'RS ABC',
     formId: '',                       // boleh dikosongkan bila memakai env var
     npsScale: '1-5',                  // atau '0-10'
     npsTitle: 'Kemungkinan merekomendasikan RS ABC',
     stageOrder: ['kedatangan', 'pendaftaran', 'pemeriksaan', 'kasirFarmasi', 'fasilitasUmum'],
     showInpatientRoom: true,
   }
   ```

2. Di Vercel tambahkan `NPS_FORM_RSABC` (Form ID Tally) dan `NPS_PASSWORD_RSABC`.
3. Deploy ulang. Dashboard baru tersedia di `/rsabc`.

Pertanyaan baru cukup dikenali lewat kata kunci pada `QUESTIONS` di file yang sama.
Kata kunci dicocokkan tanpa membedakan huruf besar/kecil, jadi judul pertanyaan boleh berubah sedikit.

## Environment variables

| Key | Wajib | Keterangan |
| --- | --- | --- |
| `TALLY_API_KEY` | Ya | API key Tally (Settings → API). Hanya dipakai server-side. |
| `AUTH_SECRET` | Ya | Kunci acak untuk cookie sesi, mis. `openssl rand -hex 32`. |
| `ADMIN_PASSWORD` | Ya | Password halaman `/admin`. Bisa beberapa nilai dipisah koma. |
| `NPS_PASSWORD_<SLUG>` | Ya | Password client, mis. `NPS_PASSWORD_RSANANDA`. Bisa dipisah koma. |
| `NPS_FORM_<SLUG>` | Opsional | Menimpa Form ID di `config.ts`. |
| `NPS_DEMO` | Opsional | `1` untuk memakai data contoh. |
| `NPS_CACHE_TTL_SECONDS` | Opsional | Lama cache data Tally, default `300`. |

## Menentukan skor NPS

Skala mengikuti `npsScale` tiap client:

- `1-5`: **5 = Promoter**, **4 = Passive**, **1–3 = Detractor**.
- `0-10`: 9–10 = Promoter, 7–8 = Passive, 0–6 = Detractor.

`NPS = (%Promoter − %Detractor) × 100`.

Korelasi memakai Pearson r pada level responden (hanya responden yang punya skor NPS).
Minimal 5 responden; di bawah itu nilai r tidak ditampilkan. Untuk sampel kecil, interpretasi korelasi
harus hati-hati — angka ini indikasi arah, bukan bukti statistik.

## Deploy ke Vercel

Lihat `DEPLOY.md` di folder ini.

## Catatan privasi

- Halaman dashboard memakai `noindex, nofollow`.
- Komentar yang tampil adalah komentar yang diisi pasien; selama pengisian, pastikan petugas CX
  mengingatkan pasien agar tidak menuliskan data pribadi (nama, nomor rekam medis, dll.).
- Fixture demo (`npm run fixture`) hanya menyimpan kolom skor, NPS, jenis responden, dan jenis layanan.
