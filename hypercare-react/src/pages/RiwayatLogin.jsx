import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

function fmtWaktu(d) {
  if (!d) return '';
  const date = new Date(d.replace(' ', 'T'));
  return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function deviceIcon(device) {
  if (!device) return 'fa-display';
  const d = device.toLowerCase();
  if (d.includes('iphone') || d.includes('ios') || d.includes('android')) return 'fa-mobile-screen';
  return 'fa-display';
}

export default function RiwayatLogin() {
  const { role } = useAuth();
  const { data, loading, error, refetch } = useApi('/dashboard/index.php?action=login-history&limit=20', [], { initialData: [] });

  return (
    <DashboardLayout role={role || 'pasien'} active="riwayat-login">
      <main className="p-5 md:p-8">
        <div className="card-soft p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold">Riwayat Login</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Pantau aktivitas masuk ke akun Anda</p>
            </div>
            <button onClick={refetch} className="text-xs text-primary hover:underline"><i className="fa-solid fa-rotate-right mr-1"></i>Segarkan</button>
          </div>

          {loading ? <LoadingSpinner label="Memuat riwayat login..." /> :
           error   ? <ErrorState message={error} onRetry={refetch} /> :
           !data?.length ? <EmptyState icon="fa-right-to-bracket" title="Belum ada riwayat login" /> : (
            <div className="space-y-2">
              {data.map((l) => (
                <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <i className={`fa-solid ${deviceIcon(l.device)} text-[#475569]`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{l.device || 'Perangkat tidak dikenal'}</p>
                    <p className="text-xs text-[#94A3B8]">{l.ip_address || '-'} · {fmtWaktu(l.created_at)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${l.status === 'sukses' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {l.status === 'sukses' ? 'Berhasil' : 'Gagal'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
