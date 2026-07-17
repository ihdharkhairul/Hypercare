import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FALLBACK_THUMB } from '../utils/fallbackImage';
import PembelajaranModal from '../components/edukasi/PembelajaranModal';
import api from '../api/axios';

function fmtTanggal(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Halaman Edukasi KHUSUS akun pasien — selalu tampil di dalam DashboardLayout
// (sidebar + topbar tetap ada), datanya sama persis dengan yang dikelola
// Perawat lewat halaman "Kelola Edukasi" (CRUD di /perawat/edukasi).
export default function EdukasiPasien() {
  const [list, setList]         = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [activeKategori, setActiveKategori] = useState('Semua');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [belajarModal, setBelajarModal] = useState(null); // konten edukasi yang lagi dipelajari

  const load = async (kategori) => {
    setLoading(true);
    setError(false);
    try {
      const url = '/edukasi/index.php' + (kategori && kategori !== 'Semua' ? `?kategori=${encodeURIComponent(kategori)}` : '');
      const res = await api.get(url);
      setList(res.data.data?.list || []);
      setKategoriList(res.data.data?.kategori || []);
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (k) => { setActiveKategori(k); load(k); };

  return (
    <DashboardLayout role="pasien" active="edukasi">
      <main className="p-5 md:p-8">
        <div className="mb-6">
          <h1 className="font-display font-bold text-xl md:text-2xl">Edukasi Hipertensi</h1>
          <p className="text-[#64748B] text-sm mt-1">Kumpulan artikel, video, dan konten edukatif dari sumber terpercaya, dikurasi oleh tim perawat HyperCare.</p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {['Semua', ...kategoriList].map((k) => (
            <button key={k} onClick={() => handleFilter(k)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${activeKategori === k ? 'bg-primary text-white' : 'bg-secondary text-[#64748B] hover:bg-secondary/70'}`}>
              {k}
            </button>
          ))}
        </div>

        {error ? (
          <div className="card-soft p-8 text-center max-w-lg mx-auto">
            <i className="fa-solid fa-triangle-exclamation text-4xl text-red-300 mb-3"></i>
            <h3 className="font-semibold mb-1">Gagal memuat konten edukasi</h3>
            <button onClick={() => load(activeKategori)} className="btn-primary text-sm px-5 mt-2">
              <i className="fa-solid fa-rotate-right mr-1.5"></i>Coba Lagi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card-soft overflow-hidden animate-pulse">
                  <div className="h-40 w-full bg-secondary"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-secondary rounded w-3/4"></div>
                    <div className="h-3 bg-secondary rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : list.length ? list.map((e) => (
              <div key={e.id} className="card-soft overflow-hidden flex flex-col">
                <img src={e.thumbnail || FALLBACK_THUMB} className="h-40 w-full object-cover" alt={e.judul}
                  onError={(ev) => { ev.target.onerror = null; ev.target.src = FALLBACK_THUMB; }} />
                <div className="p-4 flex flex-col flex-1">
                  {e.kategori && (
                    <span className="inline-block text-[10px] font-semibold text-primary bg-secondary px-2 py-0.5 rounded-full mb-2 w-fit">{e.kategori}</span>
                  )}
                  <h4 className="font-semibold text-sm mb-1.5 line-clamp-2">{e.judul}</h4>
                  <p className="text-xs text-[#64748B] line-clamp-3 mb-3">{e.ringkasan}</p>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] mb-3 flex-wrap">
                    <i className="fa-regular fa-user"></i><span>{e.penulis}</span>
                    <span>·</span>
                    <span>{fmtTanggal(e.created_at)}</span>
                    <span>·</span>
                    <i className="fa-regular fa-clock"></i><span>{e.waktu_baca} mnt baca</span>
                  </div>

                  {e.sumber && (
                    <p className="text-[10px] text-[#94A3B8] mb-3">Sumber: <span className="font-medium text-[#64748B]">{e.sumber}</span></p>
                  )}

                  <div className="mt-auto flex flex-col gap-1.5">
                    <button onClick={() => setBelajarModal(e)}
                      className="text-xs font-semibold text-center py-2 rounded-lg bg-primary text-white hover:opacity-90">
                      <i className="fa-solid fa-graduation-cap mr-1"></i>Mulai Belajar (Pre-Test → Materi → Post-Test)
                    </button>
                    {e.url_artikel && (
                      <a href={e.url_artikel} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-medium text-center py-2 rounded-lg bg-primary text-white text-hover">
                        <i className="fa-regular fa-file-lines mr-1"></i>Baca Artikel
                      </a>
                    )}
                    {e.url_video && (
                      <a href={e.url_video} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-medium text-center py-2 rounded-lg border border-[#F1EDE3] text-[#475569] hover:bg-secondary">
                        <i className="fa-brands fa-youtube mr-1 text-red-500"></i>Tonton Video
                      </a>
                    )}
                    {e.url_reel && (
                      <a href={e.url_reel} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-medium text-center py-2 rounded-lg border border-[#F1EDE3] text-[#475569] hover:bg-secondary">
                        <i className="fa-brands fa-instagram mr-1 text-pink-500"></i>Lihat Reel
                      </a>
                    )}
                    {e.url_tiktok && (
                      <a href={e.url_tiktok} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-medium text-center py-2 rounded-lg border border-[#F1EDE3] text-[#475569] hover:bg-secondary">
                        <i className="fa-brands fa-tiktok mr-1 text-[#111827]"></i>Lihat TikTok
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <p className="col-span-full text-center text-sm text-[#94A3B8] py-12">Belum ada konten edukasi untuk kategori ini.</p>
            )}
          </div>
        )}
      </main>
      {belajarModal && <PembelajaranModal edukasi={belajarModal} onClose={() => setBelajarModal(null)} />}
    </DashboardLayout>
  );
}