// Harga dan kontak penawaran buku. Gunakan tenggat bersama yang benar-benar
// diberlakukan; jangan membuat tenggat baru setiap kali halaman dibuka.
export const BOOK_OFFER = {
  title: "Seni Merawat Pelanggan",
  author: "Ronald Satria",
  regularPrice: 199_000,
  offerPrice: 99_000,
  promotionEndsAt: null as string | null, // Contoh: 2026-10-01T23:59:59+07:00
  canonical: "https://incentric.co.id/senimerawatpelanggan",
};

// Isi hanya dengan pesanan nyata yang diizinkan untuk ditampilkan.
// Timestamp harus ISO 8601. Daftar kosong tidak menampilkan notifikasi.
export const RECENT_BOOK_PURCHASES: { name: string; purchasedAt: string }[] =
  [];
