import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const AKSI_ICON = {
  login:          { icon: 'fa-right-to-bracket', color: 'text-blue-500',   bg: 'bg-blue-50' },
  catat_tekanan:  { icon: 'fa-heart-pulse',       color: 'text-primary',   bg: 'bg-secondary' },
  edit_profil:    { icon: 'fa-user-pen',          color: 'text-purple-500',bg: 'bg-purple-50' },
  kirim_chat:     { icon: 'fa-comment-medical',   color: 'text-green-500', bg: 'bg-green-50' },
  default:        { icon: 'fa-circle-info',       color: 'text-[#94A3B8]',bg: 'bg-secondary' },
};

function fmtWaktu(d) {
  if (!d) return '';
  const date = new Date(d.replace(' ', 'T'));
  return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AktivitasTerbaru() {
  const { role } = useAuth();
  const { data, loading, error, refetch } = useApi('/dashboard/index.php?action=aktivitas&limit=30', [], { initialData: [] });

  return (
    <DashboardLayout role={role || 'pasien'} active="aktivitas">
      <main className="p-5 md:p-8">
        <div className="card-soft p-6 max-w-3xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Aktivitas Terbaru</h3>
            <button onClick={refetch} className="text-xs text-primary hover:underline"><i className="fa-solid fa-rotate-right mr-1"></i>Segarkan</button>
          </div>

          {loading ? <LoadingSpinner label="Memuat aktivitas..." /> :
           error   ? <ErrorState message={error} onRetry={refetch} /> :
           !data?.length ? <EmptyState icon="fa-clock-rotate-left" title="Belum ada aktivitas" desc="Aktivitas Anda akan muncul di sini." /> : (
            <div className="space-y-1">
              {data.map((a) => {
                const conf = AKSI_ICON[a.aksi] || AKSI_ICON.default;
                return (
                  <div key={a.id} className="flex items-start gap-3 py-3 border-b border-[#F8F5EC] last:border-0">
                    <div className={`w-9 h-9 rounded-full ${conf.bg} flex items-center justify-center flex-shrink-0`}>
                      <i className={`fa-solid ${conf.icon} ${conf.color} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {a.nama && <span className="text-[#64748B] font-normal">{a.nama} · </span>}
                          {a.deskripsi || a.aksi}
                        </p>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{fmtWaktu(a.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
