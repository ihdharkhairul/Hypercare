import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { showToast } from '../components/Toast';
import api from '../api/axios';

export default function RiwayatPemeriksaan() {
  const [rows, setRows]   = useState([]);
  const [stat, setStat]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tekanan/index.php'),
      api.get('/tekanan/index.php?action=stat'),
    ]).then(([r1, r2]) => {
      setRows(r1.data.data || []);
      setStat(r2.data.data || {});
    }).catch(() => showToast('Gagal memuat data.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const badgeCls = (status) => {
    if (!status) return 'badge-normal';
    if (status.includes('Tingkat 2')) return 'badge-tk2';
    if (status.includes('Tingkat 1')) return 'badge-tk1';
    if (status.includes('Pra'))       return 'badge-pra';
    return 'badge-normal';
  };

  return (
    <DashboardLayout role="pasien" active="riwayat">
      <main className="p-5 md:p-8 space-y-5">
        {/* Statistik ringkas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Pemeriksaan', value: stat.total || 0, icon: 'fa-clipboard-list', color: 'text-primary' },
            { label: 'Rata-rata Sistolik', value: stat.avg_sistol ? stat.avg_sistol + ' mmHg' : '-', icon: 'fa-arrow-up', color: 'text-[#F97316]' },
            { label: 'Rata-rata Diastolik', value: stat.avg_diastol ? stat.avg_diastol + ' mmHg' : '-', icon: 'fa-arrow-down', color: 'text-[#94A3B8]' },
            { label: 'Status Terakhir', value: stat.status_terakhir || '-', icon: 'fa-heart-pulse', color: 'text-[#22A559]' },
          ].map((s, i) => (
            <div key={i} className="card-soft p-4">
              <p className="text-xs text-[#94A3B8] mb-1">{s.label}</p>
              <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="card-soft p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Riwayat Pemeriksaan</h3>
            <span className="text-xs text-[#94A3B8]">Total {rows.length} pemeriksaan</span>
          </div>
          {loading ? <p className="text-sm text-[#94A3B8]">Memuat...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#94A3B8] border-b border-[#F1EDE3]">
                  <th className="py-2">Tanggal</th><th>Tekanan Darah</th><th>Nadi</th><th>Berat</th><th>Catatan</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id} className="border-b border-[#F8F5EC]">
                    <td className="py-3">{d.tanggal}</td>
                    <td>{d.sistolik}/{d.diastolik} mmHg</td>
                    <td>{d.denyut_nadi || '-'}</td>
                    <td>{d.berat_badan ? d.berat_badan + ' kg' : '-'}</td>
                    <td className="max-w-[160px] truncate text-[#64748B]">{d.catatan || '-'}</td>
                    <td><span className={`badge-status ${badgeCls(d.status)}`}>{d.status || 'Normal'}</span></td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan="6" className="py-8 text-center text-[#94A3B8]">Belum ada riwayat pemeriksaan.</td></tr>}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
