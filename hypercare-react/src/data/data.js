// ============================================================
//  src/data/data.js
//  Berisi konten statis non-database yang tidak berubah-ubah
//  (FAQ landing page & quick-question AI Chat).
//  Seluruh data transaksional (pasien, tekanan darah, riwayat,
//  edukasi, chat, dsb) SUDAH 100% berasal dari REST API/MySQL —
//  tidak ada lagi dummy data di file ini.
// ============================================================

export const HC_NURSES = [
  { name:"Ns. Siti Aisyah, S.Kep", spec:"Spesialis Hipertensi", exp:"5 Tahun Pengalaman", online:true, photo:"https://i.pravatar.cc/150?img=47" },
  { name:"Ns. Rina Amelia, S.Kep", spec:"Spesialis Hipertensi", exp:"4 Tahun Pengalaman", online:true, photo:"https://i.pravatar.cc/150?img=44" },
  { name:"Ns. Andi Pratama, S.Kep", spec:"Spesialis Hipertensi", exp:"3 Tahun Pengalaman", online:false, photo:"https://i.pravatar.cc/150?img=12" },
  { name:"Ns. Dewi Lestari, S.Kep", spec:"Spesialis Kardiovaskular", exp:"6 Tahun Pengalaman", online:true, photo:"https://i.pravatar.cc/150?img=32" },
];

export const HC_FAQ = [
  { q:"Apa itu hipertensi?", a:"Hipertensi atau tekanan darah tinggi adalah kondisi ketika tekanan darah pada dinding arteri terus berada di atas batas normal, yaitu di atas 130/80 mmHg." },
  { q:"Berapa tekanan darah normal?", a:"Tekanan darah normal pada umumnya berada pada kisaran 90/60 mmHg hingga 120/80 mmHg." },
  { q:"Apakah konsultasi dapat dilakukan secara online?", a:"Ya, HyperCare menyediakan layanan konsultasi online dengan perawat profesional maupun AI Health Assistant kapan saja Anda butuhkan." },
  { q:"Apakah data saya aman?", a:"Seluruh data kesehatan Anda dijaga kerahasiaannya dan hanya digunakan untuk keperluan monitoring serta konsultasi kesehatan." },
  { q:"Kapan saya harus berkonsultasi dengan tenaga kesehatan?", a:"Segera konsultasikan ke tenaga kesehatan apabila tekanan darah Anda secara konsisten di atas 140/90 mmHg atau muncul gejala seperti pusing berat, nyeri dada, dan pandangan kabur." },
];

// Tombol pertanyaan cepat di halaman AI Chat — jawabannya
// SELALU dari OpenAI lewat backend PHP, bukan dari file ini.
export const HC_AI_QUICK = [
  "Apa itu hipertensi?",
  "Berapa tekanan darah normal?",
  "Makanan yang harus dihindari?",
  "Cara menurunkan tekanan darah?",
  "Kapan harus ke dokter?",
];
