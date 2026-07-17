import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HC_NURSES, HC_FAQ } from '../data/data';
import { FALLBACK_THUMB } from '../utils/fallbackImage';
import api from '../api/axios';

function fmtTanggal(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const [edukasi, setEdukasi] = useState([]);
  const [loadingEdukasi, setLoadingEdukasi] = useState(true);

  useEffect(() => {
    api.get('/edukasi/index.php')
      .then(res => setEdukasi((res.data.data?.list || []).slice(0, 5)))
      .catch(err => console.error('Gagal memuat edukasi di Home:', err))
      .finally(() => setLoadingEdukasi(false));
  }, []);

  return (
    <div className="font-body bg-white" data-nav-active="home">
      <Navbar />

      {/* HERO */}
      <section className="bg-secondary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-white text-hover text-primary text-xs font-semibold px-4 py-2 rounded-full shadow-sm mb-5">
              <i className="fa-solid fa-shield-heart mr-1"></i> Layanan Telemonitoring Hipertensi Terpercaya
            </span>
            <h1 className="font-display font-extrabold text-3xl md:text-5xl leading-tight text-[var(--text)] mb-4">
              Pantau Tekanan Darah Anda <span className="text-primary">Kapan Saja</span> dan Di Mana Saja
            </h1>
            <p className="text-[#475569] text-base md:text-lg mb-7 max-w-xl">
              Platform digital yang membantu pasien hipertensi melakukan monitoring tekanan darah, mendapatkan edukasi kesehatan, berkonsultasi dengan perawat profesional, serta memperoleh bantuan AI Health Assistant secara mudah dan cepat.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register-pasien" className="btn-primary">Mulai Sekarang <i className="fa-solid fa-arrow-right ml-1"></i></Link>
              <a href="#tentang" className="btn-outline">Pelajari Lebih Lanjut</a>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="absolute w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
            <img src="/images/tele.png" alt="Ilustrasi monitoring hipertensi" className="relative w-full max-w-md drop-shadow-xl" />
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-2xl md:text-3xl">Cara Kerja</h2>
          <p className="text-[#64748B] mt-2">4 langkah mudah untuk kesehatan Anda</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: 'fa-user-plus', title: 'Registrasi Akun', desc: 'Daftar sebagai pasien untuk mendapatkan layanan terbaik kami.' },
            { icon: 'fa-clipboard-list', title: 'Isi Data Kesehatan', desc: 'Lengkapi data diri dan riwayat kesehatan untuk pemantauan optimal.' },
            { icon: 'fa-heart-pulse', title: 'Monitoring Tekanan Darah', desc: 'Catat tekanan darah secara rutin dan pantau perkembangannya.' },
            { icon: 'fa-comment-medical', title: 'Konsultasi dengan Perawat atau AI', desc: 'Dapatkan saran dan tanya jawab langsung dari perawat profesional.' },
          ].map((item, i) => (
            <div key={i} className="card-soft p-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary text-primary text-2xl flex items-center justify-center mb-4">
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-[#64748B]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      
      {/* TENTANG */}
      <section id="tentang" className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        <img src="https://illustrations.popsy.co/amber/woman-with-a-laptop.svg" alt="Tentang HyperCare" className="w-full max-w-md mx-auto" />
        <div>
          <span className="text-primary font-semibold text-sm">TENTANG HYPERCARE</span>
          <h2 className="font-display font-bold text-2xl md:text-3xl mt-2 mb-4">Mitra Digital Anda untuk Hidup Bebas dari Risiko Hipertensi</h2>
          <p className="text-[#475569] leading-relaxed mb-4">HyperCare adalah sistem monitoring dan konsultasi hipertensi berbasis web yang dirancang untuk membantu pasien dalam memantau kondisi tekanan darah secara berkala, memperoleh edukasi kesehatan, dan melakukan konsultasi secara digital.</p>
          <p className="text-[#475569] leading-relaxed">Dikembangkan sebagai proyek akademik Universitas Mandala Waluya Kendari, HyperCare menghadirkan pengalaman yang sederhana namun tetap profesional, cocok digunakan oleh seluruh kalangan termasuk lansia.</p>
        </div>
      </section>
        
      {/* LAYANAN */}
      <section id="layanan" className="bg-secondary/40 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-2xl md:text-3xl">Layanan Kami</h2>
            <p className="text-[#64748B] mt-2">Semua yang Anda butuhkan untuk mengelola hipertensi dalam satu platform</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: 'fa-heart-pulse', title: 'Monitoring Tekanan Darah', desc: 'Catat dan pantau tekanan darah harian Anda.' },
              { icon: 'fa-table-list', title: 'Riwayat Pemeriksaan', desc: 'Lihat riwayat lengkap hasil pemeriksaan Anda.' },
              { icon: 'fa-user-nurse', title: 'Konsultasi Perawat', desc: 'Diskusi langsung dengan perawat berpengalaman.' },
              { icon: 'fa-robot', title: 'AI Chat Hipertensi', desc: 'Tanya jawab cepat seputar hipertensi dengan AI Assistant.' },
              { icon: 'fa-book-open', title: 'Edukasi Kesehatan', desc: 'Artikel edukatif seputar hipertensi dan gaya hidup sehat.' },
              { icon: 'fa-gauge-high', title: 'Dashboard Kesehatan', desc: 'Statistik dan grafik kesehatan Anda dalam satu tampilan.' },
            ].map((s, i) => (
              <div key={i} className="card-soft p-6">
                <i className={`fa-solid ${s.icon} text-primary text-2xl mb-3`}></i>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-[#64748B]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERAWAT */}
      <section id="perawat" className="bg-secondary/40 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-2xl md:text-3xl">Tim Perawat Profesional</h2>
            <p className="text-[#64748B] mt-2">Tim perawat kami siap membantu Anda</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {HC_NURSES.map((n, i) => (
              <div key={i} className="card-soft p-5 text-center">
                <img src={n.photo} className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-secondary mb-3" alt={n.name} />
                <h4 className="font-semibold text-sm">{n.name}</h4>
                <p className="text-xs text-[#64748B] mb-1">{n.spec}</p>
                <p className="text-xs text-[#94A3B8] mb-2">{n.exp}</p>
                <span className={`badge-status ${n.online ? 'badge-normal' : 'bg-slate-100 text-slate-500'}`}>
                  <i className="fa-solid fa-circle text-[8px]"></i> {n.online ? 'Online' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDUKASI */}
      <section id="edukasi" className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-2xl md:text-3xl">Edukasi Hipertensi</h2>
          <p className="text-[#64748B] mt-2">Artikel dan informasi terkini seputar hipertensi</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {loadingEdukasi ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card-soft overflow-hidden animate-pulse">
                <div className="h-32 w-full bg-secondary"></div>
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-secondary rounded w-3/4"></div>
                  <div className="h-3 bg-secondary rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : edukasi.length ? edukasi.map((e) => (
            <div key={e.id} className="card-soft overflow-hidden flex flex-col">
              <img src={e.thumbnail || FALLBACK_THUMB} className="h-32 w-full object-cover" alt={e.judul}
                onError={(ev) => { ev.target.onerror = null; ev.target.src = FALLBACK_THUMB; }} />
              <div className="p-4 flex flex-col flex-1">
                {e.kategori && (
                  <span className="inline-block text-[10px] font-semibold text-primary bg-secondary px-2 py-0.5 rounded-full mb-2 w-fit">{e.kategori}</span>
                )}
                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{e.judul}</h4>
                <p className="text-xs text-[#64748B] line-clamp-2 mb-2">{e.ringkasan}</p>
                <div className="flex items-center gap-2 text-[10px] text-[#94A3B8] mb-3">
                  <span className="truncate">{e.penulis}</span>
                  <span>·</span>
                  <span className="whitespace-nowrap">{fmtTanggal(e.created_at)}</span>
                  <span>·</span>
                  <span className="whitespace-nowrap"><i className="fa-regular fa-clock"></i> {e.waktu_baca} mnt</span>
                </div>
                <div className="mt-auto flex flex-col gap-1.5">
                  {e.url_artikel && (
                    <a href={e.url_artikel} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-medium text-center py-1.5 rounded-lg bg-primary text-white text-hover">
                      <i className="fa-regular fa-file-lines mr-1"></i>Baca Artikel
                    </a>
                  )}
                  {e.url_video && (
                    <a href={e.url_video} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-medium text-center py-1.5 rounded-lg border border-[#F1EDE3] text-[#475569] hover:bg-secondary">
                      <i className="fa-brands fa-youtube mr-1 text-red-500"></i>Tonton Video
                    </a>
                  )}
                  {e.url_reel && (
                    <a href={e.url_reel} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-medium text-center py-1.5 rounded-lg border border-[#F1EDE3] text-[#475569] hover:bg-secondary">
                      <i className="fa-brands fa-instagram mr-1 text-pink-500"></i>Lihat Reel
                    </a>
                  )}
                  {e.url_tiktok && (
                    <a href={e.url_tiktok} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-medium text-center py-1.5 rounded-lg border border-[#F1EDE3] text-[#475569] hover:bg-secondary">
                      <i className="fa-brands fa-tiktok mr-1 text-[#111827]"></i>Lihat TikTok
                    </a>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <p className="col-span-full text-center text-sm text-[#94A3B8] py-8">Belum ada konten edukasi.</p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-secondary/40 py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-2xl md:text-3xl">Pertanyaan yang Sering Diajukan</h2>
          </div>
          <div className="space-y-3">
            {HC_FAQ.map((f, i) => (
              <div key={i} className="card-soft p-0 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-5 text-left font-medium"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {f.q}
                  <i className={`fa-solid fa-chevron-down text-primary transition-transform${openFaq === i ? ' rotate-180' : ''}`}></i>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-[#64748B]">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-16">
        <div className="bg-primary rounded-3xl px-8 py-12 text-center text-white">
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-3">Mulai Jaga Kesehatan Anda Hari Ini</h2>
          <p className="mb-6 text-white/90">Jaga kesehatan Anda dengan mudah bersama HyperCare</p>
          <Link to="/register-pasien" className="inline-block bg-white text-hover text-primary font-semibold px-7 py-3 rounded-xl shadow hover:bg-secondary transition">Daftar Sekarang</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}