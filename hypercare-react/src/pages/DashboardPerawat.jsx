import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { useApi } from '../hooks/useApi';
import { useChartJs } from '../hooks/useChartJs';
import { useAuth } from '../context/AuthContext';

export default function DashboardPerawat() {
  const { user } = useAuth();
  // Satu endpoint agregat — menggantikan 2 request terpisah (optimasi REST API)
  const { data, loading, error, refetch } = useApi('/dashboard/index.php?action=perawat');

  const stat       = data?.statistik || {};
  const chatList   = data?.konsultasi_terbaru || [];
  const aktivitas  = data?.aktivitas || [];

  const donutConfig = stat.total_pemeriksaan > 0 ? {
    type: 'doughnut',
    data: {
      labels: ['Normal','Pra Hipertensi','Hipertensi Tk.1','Hipertensi Tk.2'],
      datasets: [{
        data: [stat.normal||0, stat.pra_hipertensi||0, stat.hipertensi_1||0, stat.hipertensi_2||0],
        backgroundColor: ['#22A559','#F4A300','#F97316','#E53E3E'],
        borderWidth: 0
      }],
    },
    options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }, cutout: '68%' },
  } : null;
  const donutRef = useChartJs(donutConfig, [stat.total_pemeriksaan]);

  return (
    <DashboardLayout role="perawat" active="dashboard">
      <main className="p-5 md:p-8 space-y-6">
        <p className="text-[#64748B] text-sm">Selamat datang, <strong>{user?.nama}</strong>. Pantau dan layani pasien Anda.</p>

        {error ? <ErrorState message={error} onRetry={refetch} /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Total Pasien" value={stat.total_pasien_terdaftar ?? 0} sub="Pasien terdaftar" loading={loading} />
            <StatCard label="Total Pemeriksaan" value={stat.total_pemeriksaan ?? 0} sub="Rekaman tekanan darah" loading={loading} />
            <StatCard label="Konsultasi Aktif" value={chatList.length} sub="Percakapan berjalan" loading={loading} />
            <StatCard label="Pasien Berisiko Tinggi" value={stat.hipertensi_2 ?? 0} valueColor="text-[#C53030]" sub="Hipertensi Tk.2" subIcon="fa-triangle-exclamation" loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="card-soft p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Distribusi Status Risiko</h3>
                <Link to="/statistik" className="text-xs text-primary hover:underline">Detail</Link>
              </div>
              {loading ? <LoadingSpinner fullHeight /> :
                stat.total_pemeriksaan > 0 ? <canvas ref={donutRef} height="220"></canvas>
                : <p className="text-sm text-[#94A3B8] py-8 text-center">Belum ada data pemeriksaan.</p>}
            </div>

            <div className="card-soft p-5 lg:col-span-2">
              <h3 className="font-semibold mb-4">Konsultasi Terbaru</h3>
              {loading ? <LoadingSpinner /> : chatList.length ? (
                <div className="space-y-3">
                  {chatList.map((k) => (
                    <div key={k.pasien_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/60">
                      <div className="flex items-center gap-3">
                        <img src={k.foto || `https://i.pravatar.cc/150?u=${k.pasien_id}`} className="w-10 h-10 rounded-full object-cover" alt={k.pasien_nama} />
                        <div>
                          <p className="text-sm font-medium">{k.pasien_nama}</p>
                          <p className="text-xs text-[#94A3B8] truncate max-w-[200px]">{k.pesan_terakhir || 'Belum ada pesan'}</p>
                        </div>
                      </div>
                      {k.belum_dibaca > 0 && (
                        <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{k.belum_dibaca}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-[#94A3B8] py-4 text-center">Belum ada konsultasi.</p>}
              <Link to="/chat-perawat" className="block text-center btn-outline mt-4 text-sm">Lihat Semua Konsultasi</Link>
            </div>
          </div>

          <div className="card-soft p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Aktivitas Terbaru</h3>
              <Link to="/aktivitas" className="text-xs text-primary hover:underline">Lihat semua</Link>
            </div>
            {loading ? <LoadingSpinner /> : aktivitas.length ? (
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {aktivitas.slice(0, 6).map(a => (
                  <div key={a.id} className="flex items-center gap-2.5 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                    <span className="text-[#64748B] truncate">
                      {a.nama && <strong className="text-[#1E293B] font-medium">{a.nama}</strong>} {a.deskripsi || a.aksi}
                    </span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-[#94A3B8] text-center py-4">Belum ada aktivitas.</p>}
          </div>
        </>
        )}
      </main>
    </DashboardLayout>
  );
}
