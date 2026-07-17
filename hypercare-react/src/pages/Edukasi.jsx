import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FALLBACK_THUMB } from '../utils/fallbackImage';
import api from '../api/axios';

function fmtTanggal(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Halaman Edukasi PUBLIK — untuk pengunjung yang belum login (tampil di Navbar utama).
// Untuk pasien yang sudah login, gunakan EdukasiPasien.jsx (route /edukasi-pasien).
export default function Edukasi() {
  const [list, setList]         = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [activeKategori, setActiveKategori] = useState('Semua');
  const [loading, setLoading]   = useState(true);

  const load = async (kategori) => {
    setLoading(true);
    try {
      const url = '/edukasi/index.php' + (kategori && kategori !== 'Semua' ? `?kategori=${encodeURIComponent(kategori)}` : '');
      const res = await api.get(url);
      setList(res.data.data?.list || []);
      setKategoriList(res.data.data?.kategori || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (k) => { setActiveKategori(k); load(k); };

  return (
    <div className="font-body bg-white">
      <Navbar />

      <section className="bg-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h1 className="font-display font-bold text-2xl md:text-3xl">Edukasi Hipertensi</h1>
          <p className="text-[#64748B] mt-2">Kumpulan artikel, video, dan konten edukatif dari sumber terpercaya untuk membantu Anda memahami dan mengelola hipertensi.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {['Semua', ...kategoriList].map((k) => (
            <button key={k} onClick={() => handleFilter(k)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${activeKategori === k ? 'bg-primary text-white' : 'bg-secondary text-[#64748B] hover:bg-secondary/70'}`}>
              {k}
            </button>
          ))}
        </div>

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
      </section>

      <Footer />
    </div>
  );
}