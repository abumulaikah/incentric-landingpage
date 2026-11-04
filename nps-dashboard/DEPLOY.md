# Cara Deploy Dashboard NPS

Langkah ini menghasilkan dashboard privat di `https://nps.incentric.co.id/<slug>` **tanpa mengganggu**
landing page `incentric.co.id`.

## 1. Push kode ke GitHub

Folder `nps-dashboard/` sudah ada di dalam repo `abumulaikah/incentric-landingpage`.

```bash
git add nps-dashboard .gitignore
git commit -m "Add NPS dashboard"
git push
```

Landing page tetap ter-deploy seperti biasa karena file baru tidak mengubah halaman yang ada.
Pastikan file `.env` **tidak** ikut ter-commit (sudah masuk `.gitignore`).

## 2. Buat project Vercel kedua

1. Vercel → **Add New → Project** → pilih repo yang sama.
2. Pada **Root Directory**, pilih `nps-dashboard`.
3. Framework: **Astro** (terdeteksi otomatis). Build command `npm run build`, output otomatis.
4. **Environment Variables** (Production + Preview):

   | Key | Nilai |
   | --- | --- |
   | `TALLY_API_KEY` | API key dari Tally → Settings → API |
   | `AUTH_SECRET` | hasil `openssl rand -hex 32` |
   | `ADMIN_PASSWORD` | password tim Incentric untuk `/admin` |
   | `NPS_PASSWORD_RSANANDA` | password untuk RS Ananda |
   | `NPS_FORM_RSANANDA` | `yPW566` |
   | `NPS_DEMO` | `0` |

5. Deploy.

> `NPS_DEMO=1` menampilkan data contoh. Jangan dipakai di production.

## 3. Pasang domain `nps.incentric.co.id`

1. Project Vercel → **Settings → Domains** → add `nps.incentric.co.id`.
2. Di penyedia DNS `incentric.co.id`, tambahkan:

   - `CNAME` — Name `nps`, Value `cname.vercel-dns.com`

   (Jika DNS dikelola Vercel/Cloudflare, ikuti instruksi yang muncul di halaman Domains.)
3. Tunggu verifikasi hijau. Sertifikat SSL otomatis.

## 4. Uji

- `https://nps.incentric.co.id/` — daftar client.
- `https://nps.incentric.co.id/login/rsananda` — login klien.
- `https://nps.incentric.co.id/rsananda` — dashboard RS Ananda.
- `https://nps.incentric.co.id/admin` — daftar semua client (password admin).
- Tombol **Export CSV** di kanan atas dashboard.

## 5. Bagikan akses ke klien

Kirim ke RS Ananda:

```
Dashboard pengalaman pasien:
https://nps.incentric.co.id/login/rsananda
Kata sandi: <password yang diisi di NPS_PASSWORD_RSANANDA>
```

Hindari mengirim password lewat kanal publik. Ganti password cukup dengan mengubah environment
variable lalu redeploy.

## Kalau dashboard menampilkan "Belum ada data"

1. Pastikan form Tally sudah punya submission **completed**.
2. Cek `TALLY_API_KEY` benar dan Form ID `yPW566` milik workspace yang sama.
3. Cek Vercel → Deployments → Functions logs untuk pesan error.
4. Setelah data berubah, tunggu maksimal `NPS_CACHE_TTL_SECONDS` (default 5 menit) atau redeploy.
