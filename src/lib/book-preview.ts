// Pratinjau untuk review internal: tampil langsung di URL biasa, dengan label simulasi.
// Setelah data asli siap, set enabled: false dan isi data di book-offer.ts.
export const BOOK_PREVIEW = {
  enabled: true,
  countdownSeconds: 23 * 3600 + 17 * 60 + 42,
  reviews: [
    { name: 'Dina · contoh pembaca', role: 'Contoh untuk pemilik usaha', text: 'Saya ingin tahu cara menanggapi komplain tanpa membuat pelanggan merasa disalahkan. Pembahasan pilihan bahasa paling menarik buat saya.' },
    { name: 'Heru · contoh pembaca', role: 'Contoh untuk pemimpin tim', text: 'Kalau semua keputusan harus menunggu saya, pelayanan ikut terhambat. Saya tertarik dengan bagian SOP dan kewenangan tim.' },
    { name: 'Irwan · contoh pembaca', role: 'Contoh untuk tim layanan', text: 'Biasanya yang dicatat hanya komplain. Bagian tentang pelanggan yang diam membuat saya ingin memeriksa lagi cara kami meminta masukan.' },
  ],
  purchases: [
    { name: 'Irwan · nama contoh', age: '30 menit lalu · data rekaan' },
    { name: 'Heru · nama contoh', age: '2 jam lalu · data rekaan' },
  ],
};
