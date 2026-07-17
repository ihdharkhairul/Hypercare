import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import StatCard from '../components/common/StatCard';
import { useApi } from '../hooks/useApi';
import { useChartJs } from '../hooks/useChartJs';

export default function DashboardStatistik() {
  const { data, loading, error, refetch } = useApi('/statistik/index.php');

  const donutConfig = data && data.total_pemeriksaan > 0 ? {
    type: 'doughnut',
    data: {
      labels: ['Normal', 'Pra Hipertensi', 'Hipertensi Tk.1', 'Hipertensi Tk.2'],
      datasets: [{
        data: [data.normal || 0, data.pra_hipertensi || 0, data.hipertensi_1 || 0, data.hipertensi_2 || 0],
        backgroundColor: ['#22A559', '#F4A300', '#F97316', '#E53E3E'],
        borderWidth: 0,
      }],
    },
    options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }, cutout: '68%' },
  } : null;
  const donutRef = useChartJs(donutConfig, [data?.total_pemeriksaan]);

  const barConfig = data && data.total_pemeriksaan > 0 ? {
    type: 'bar',
    data: {
      labels: ['Normal', 'Pra Hipertensi', 'Hipertensi Tk.1', 'Hipertensi Tk.2'],
      datasets: [{
        data: [data.normal || 0, data.pra_hipertensi || 0, data.hipertensi_1 || 0, data.hipertensi_2 || 0],
        backgroundColor: ['#22A559', '#F4A300', '#F97316', '#E53E3E'],
        borderRadius: 8, maxBarThickness: 50,
      }],
    },
    options: { plugins: { legend: { display: false } } },
  } : null;
  const barRef = useChartJs(barConfig, [data?.total_pemeriksaan]);

  return (
    <DashboardLayout role="perawat" active="statistik">
      <main className="p-5 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-[#64748B] text-sm">Ringkasan statistik kesehatan seluruh pasien HyperCare.</p>
          <button onClick={refetch} className="text-xs text-primary hover:underline"><i className="fa-solid fa-rotate-right mr-1"></i>Segarkan</button>
        </div>

        {error ? <ErrorState message={error} onRetry={refetch} /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Total Pasien Terdaftar" value={data?.total_pasien_terdaftar ?? 0} sub="Pasien" loading={loading} />
            <StatCard label="Total Pemeriksaan" value={data?.total_pemeriksaan ?? 0} sub="Rekaman tekanan darah" loading={loading} />
            <StatCard label="Status Normal" value={data?.normal ?? 0} valueColor="text-[#22A559]" sub="Pasien terkontrol baik" loading={loading} />
            <StatCard label="Berisiko Tinggi" value={data?.hipertensi_2 ?? 0} valueColor="text-[#C53030]" sub="Hipertensi Tingkat 2" subIcon="fa-triangle-exclamation" loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card-soft p-5">
              <h3 className="font-semibold mb-4">Distribusi Status Risiko</h3>
              {loading ? <LoadingSpinner fullHeight /> :
               data?.total_pemeriksaan > 0 ? <canvas ref={donutRef} height="220"></canvas> :
               <p className="text-sm text-[#94A3B8] text-center py-10">Belum ada data pemeriksaan.</p>}
            </div>
            <div className="card-soft p-5">
              <h3 className="font-semibold mb-4">Perbandingan Jumlah per Status</h3>
              {loading ? <LoadingSpinner fullHeight /> :
               data?.total_pemeriksaan > 0 ? <canvas ref={barRef} height="220"></canvas> :
               <p className="text-sm text-[#94A3B8] text-center py-10">Belum ada data pemeriksaan.</p>}
            </div>
          </div>
        </>
        )}
      </main>
    </DashboardLayout>
  );
}
