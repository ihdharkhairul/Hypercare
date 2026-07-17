import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { useApi } from '../hooks/useApi';
import { useChartJs } from '../hooks/useChartJs';
import { useAuth } from '../context/AuthContext';
import { FALLBACK_THUMB } from '../utils/fallbackImage';

export default function DashboardPasien() {
  const { user } = useAuth();
  // Satu endpoint agregat — menggantikan 3 request terpisah (optimasi REST API)
  const { data, loading, error, refetch } = useApi('/dashboard/index.php?action=pasien');

  const rows = data?.tekanan_terbaru || [];
  const stat = data?.statistik || {};
  const notif = data?.notifikasi || [];
  const aktivitas = data?.aktivitas || [];
  const edukasi = data?.edukasi_terbaru || [];

  const lineConfig = rows.length ? {
    type: 'line',
    data: {
      labels: [...rows].reverse().map(d => d.tanggal),
      datasets: [
        { label: 'Sistolik',  data: [...rows].reverse().map(d => d.sistolik),  borderColor: '#F4A300', backgroundColor: '#F4A30022', tension: .4, fill: true, pointBackgroundColor: '#F4A300' },
        { label: 'Diastolik', data: [...rows].reverse().map(d => d.diastolik), borderColor: '#94A3B8', backgroundColor: '#94A3B822', tension: .4, fill: true, pointBackgroundColor: '#94A3B8' },
      ],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { suggestedMin: 40, suggestedMax: 180 } } },
  } : null;
  const lineRef = useChartJs(lineConfig, [rows.length]);

  const barConfig = rows.length ? (() => {
    const byMonth = {};
    rows.forEach(r => { const m = r.tanggal?.slice(0, 7); if (m) byMonth[m] = (byMonth[m] || 0) + 1; });
    const months = Object.keys(byMonth).sort().slice(-6);
    return {
      type: 'bar',
      data: { labels: months, datasets: [{ data: months.map(m => byMonth[m]), backgroundColor: '#F4A300', borderRadius: 8, maxBarThickness: 34 }] },
      options: { plugins: { legend: { display: false } } },
    };
  })() : null;
  const barRef = useChartJs(barConfig, [rows.length]);

  const stObj = stat.status_terakhir;

  return (
    <DashboardLayout role="pasien" active="dashboard">
      <main className="p-5 md:p-8 space-y-6">
        <p className="text-[#64748B] text-sm">Selamat datang kembali, <strong>{user?.nama}</strong>. Jaga kesehatan Anda setiap hari.</p>

        {error ? <ErrorState message={error} onRetry={refetch} /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Tekanan Darah Terakhir" value={stat.td_terakhir || '—'} suffix="mmHg" loading={loading}
              sub={!loading && <StatusBadge status={stObj} />} />
            <StatCard label="Total Pemeriksaan" value={stat.total ?? 0} sub="Pemeriksaan tercatat" loading={loading} />
            <StatCard label="Sistolik Tertinggi" value={stat.max_sistol || '—'} suffix="mmHg" sub="Dari seluruh riwayat" loading={loading} />
            <StatCard label="Status Risiko" loading={loading}
              value={stObj?.includes('Hipertensi') ? 'Tinggi' : 'Rendah'}
              valueColor={stObj?.includes('2') ? 'text-[#C53030]' : stObj?.includes('1') ? 'text-[#F97316]' : stObj?.includes('Pra') ? 'text-[#F4A300]' : 'text-[#22A559]'}
              sub={stObj || 'Normal'} subIcon="fa-shield-heart" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="card-soft p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Grafik Tekanan Darah</h3>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>Sistolik</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>Diastolik</span>
                </div>
              </div>
              {loading ? <LoadingSpinner fullHeight label="Memuat grafik..." />
                : rows.length ? <canvas ref={lineRef} height="130"></canvas>
                : <p className="text-sm text-[#94A3B8] py-8 text-center">Belum ada data. <Link to="/catat-tekanan" className="text-primary">Catat sekarang →</Link></p>}
            </div>

            <div className="card-soft p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Notifikasi</h3>
                <Link to="/notifikasi" className="text-xs text-primary hover:underline">Lihat semua</Link>
              </div>
              {loading ? <LoadingSpinner /> : notif.length ? (
                <div className="space-y-3">
                  {notif.slice(0, 3).map(n => (
                    <div key={n.id} className={`p-3 rounded-xl text-sm ${n.dibaca ? 'opacity-60' : ''} ${n.tipe === 'bahaya' ? 'bg-red-50' : n.tipe === 'peringatan' ? 'bg-orange-50' : n.tipe === 'sukses' ? 'bg-green-50' : 'bg-blue-50'}`}>
                      <p className="font-medium text-xs">{n.judul}</p>
                      <p className="text-[#64748B] text-xs mt-0.5 line-clamp-2">{n.pesan}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-[#94A3B8] text-center py-4">Tidak ada notifikasi.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card-soft p-5">
              <h3 className="font-semibold mb-4">Statistik Bulanan</h3>
              {loading ? <LoadingSpinner /> : rows.length ? <canvas ref={barRef} height="100"></canvas>
                : <p className="text-sm text-[#94A3B8] text-center py-4">Belum ada data statistik.</p>}
            </div>

            <div className="card-soft p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Aktivitas Terbaru</h3>
                <Link to="/aktivitas" className="text-xs text-primary hover:underline">Lihat semua</Link>
              </div>
              {loading ? <LoadingSpinner /> : aktivitas.length ? (
                <div className="space-y-2.5">
                  {aktivitas.slice(0, 4).map(a => (
                    <div key={a.id} className="flex items-center gap-2.5 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                      <span className="text-[#64748B] truncate">{a.deskripsi || a.aksi}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-[#94A3B8] text-center py-4">Belum ada aktivitas.</p>}
            </div>
          </div>

          <div className="card-soft p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Edukasi Terbaru</h3>
              <Link to="/edukasi-pasien" className="text-xs text-primary hover:underline">Lihat semua</Link>
            </div>
            {loading ? <LoadingSpinner /> : edukasi.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {edukasi.map(e => (
                  <div key={e.id} className="rounded-xl border border-[#F1EDE3] overflow-hidden flex flex-col">
                    <img src={e.thumbnail || FALLBACK_THUMB} className="h-24 w-full object-cover" alt={e.judul}
                      onError={(ev) => { ev.target.onerror = null; ev.target.src = FALLBACK_THUMB; }} />
                    <div className="p-3 flex-1 flex flex-col">
                      {e.kategori && <span className="text-[10px] font-semibold text-primary bg-secondary px-2 py-0.5 rounded-full w-fit mb-1.5">{e.kategori}</span>}
                      <p className="font-medium text-sm line-clamp-2">{e.judul}</p>
                      <Link to="/edukasi-pasien" className="text-xs text-primary mt-auto pt-2 hover:underline">Baca selengkapnya →</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-[#94A3B8] text-center py-4">Belum ada konten edukasi baru.</p>}
          </div>
        </>
        )}
      </main>
    </DashboardLayout>
  );
}