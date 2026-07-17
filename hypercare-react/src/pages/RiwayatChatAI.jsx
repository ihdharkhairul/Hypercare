import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { useApi } from '../hooks/useApi';

function fmtWaktu(d) {
  if (!d) return '';
  return new Date(d.replace(' ', 'T')).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function RiwayatChatAI() {
  const { data, loading, error, refetch } = useApi('/dashboard/index.php?action=chat-ai-history');

  return (
    <DashboardLayout role="pasien" active="riwayat-chat-ai">
      <main className="p-5 md:p-8">
        <div className="card-soft p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold">Riwayat Chat AI</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Ringkasan percakapan terakhir dengan AI Health Assistant</p>
            </div>
            <Link to="/ai-chat" className="btn-primary text-xs px-3 py-1.5">
              <i className="fa-solid fa-robot mr-1"></i>Buka Chat
            </Link>
          </div>

          {loading ? <LoadingSpinner label="Memuat riwayat..." /> :
           error   ? <ErrorState message={error} onRetry={refetch} /> :
           !data?.pesan_terakhir?.length ? (
            <EmptyState
              icon="fa-robot"
              title="Belum ada percakapan dengan AI"
              desc="Mulai bertanya seputar hipertensi ke AI Health Assistant."
              action={<Link to="/ai-chat" className="btn-primary text-xs px-4 py-2 inline-block">Mulai Chat</Link>}
            />
           ) : (
            <>
              <div className="bg-secondary/50 rounded-xl p-3 mb-4 text-sm text-[#64748B]">
                Total <strong className="text-[#1E293B]">{data.total_pesan}</strong> pesan tercatat dalam riwayat percakapan Anda.
              </div>
              <div className="space-y-3">
                {data.pesan_terakhir.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${m.role === 'user' ? 'chat-bubble-me' : 'chat-bubble-other'} px-4 py-2 text-sm`}>
                      {m.message}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
