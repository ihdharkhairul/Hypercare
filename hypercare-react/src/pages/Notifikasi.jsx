import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const tipeStyle = {
  bahaya:     { icon: 'fa-triangle-exclamation', bg: 'bg-red-50',    icon_cls: 'text-red-500'   },
  peringatan: { icon: 'fa-bell',                 bg: 'bg-orange-50', icon_cls: 'text-orange-500' },
  sukses:     { icon: 'fa-check-circle',         bg: 'bg-green-50',  icon_cls: 'text-green-500'  },
  info:       { icon: 'fa-circle-info',          bg: 'bg-blue-50',   icon_cls: 'text-blue-500'   },
  chat:       { icon: 'fa-comment-dots',         bg: 'bg-primary/10', icon_cls: 'text-primary'   },
};

export default function Notifikasi() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [list, setList]     = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/notifikasi/index.php');
      setList(res.data.data?.list || []);
      setUnread(res.data.data?.unread || 0);
    } catch { showToast('Gagal memuat notifikasi.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.put(`/notifikasi/index.php?id=${id}&action=read`).catch(() => {});
    load();
  };

  const handleClick = (n) => {
    if (!n.dibaca) markRead(n.id);
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    await api.put('/notifikasi/index.php?action=read-all').catch(() => {});
    showToast('Semua notifikasi ditandai dibaca.', 'success');
    load();
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifikasi/index.php?id=${id}`);
      load();
    } catch { showToast('Gagal hapus.', 'error'); }
  };

  const layout_role = role || 'pasien';

  return (
    <DashboardLayout role={layout_role} active="notifikasi">
      <main className="p-5 md:p-8">
        <div className="card-soft p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold">Notifikasi</h3>
              {unread > 0 && <p className="text-xs text-[#94A3B8] mt-0.5">{unread} belum dibaca</p>}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline">Tandai semua dibaca</button>
            )}
          </div>

          {loading ? <p className="text-sm text-[#94A3B8]">Memuat...</p> : (
            <div className="space-y-3">
              {list.map(n => {
                const style = tipeStyle[n.tipe] || tipeStyle.info;
                return (
                  <div key={n.id}
                    className={`flex items-start gap-3 p-4 rounded-xl ${style.bg} ${!n.dibaca ? 'ring-1 ring-inset ring-primary/20' : 'opacity-70'} ${n.link ? 'cursor-pointer hover:opacity-100' : ''}`}
                    onClick={() => handleClick(n)}>
                    <i className={`fa-solid ${style.icon} ${style.icon_cls} mt-0.5 text-lg flex-shrink-0`}></i>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{n.judul}</p>
                        {!n.dibaca && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>}
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">{n.pesan}</p>
                      <p className="text-[10px] text-[#94A3B8] mt-1">{n.created_at}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }}
                      className="text-[#94A3B8] hover:text-red-500 flex-shrink-0 ml-1">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                );
              })}
              {!list.length && (
                <div className="text-center py-12 text-[#94A3B8]">
                  <i className="fa-regular fa-bell text-4xl mb-3 block opacity-40"></i>
                  <p className="text-sm">Tidak ada notifikasi.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}