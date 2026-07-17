import { memo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePolling } from '../hooks/usePolling';
import api from '../api/axios';

function Topbar({ onBurger }) {
  const { user, role } = useAuth();
  const [unread, setUnread] = useState(0);

  const fetchUnread = useCallback(() => {
    api.get('/notifikasi/index.php')
      .then(res => setUnread(res.data.data?.unread || 0))
      .catch(() => {});
  }, []);

  // Jalankan sekali saat mount
  useEffect(() => { fetchUnread(); }, [fetchUnread]);

  // Poll setiap 30 detik — otomatis berhenti saat komponen unmount
  usePolling(fetchUnread, 30000, true);

  const nama  = user?.nama  || '—';
  const photo = user?.foto  || `https://i.pravatar.cc/150?u=${user?.id || 1}`;
  const label = role === 'perawat' ? 'Perawat' : 'Pasien';

  return (
    <header className="flex items-center justify-between bg-white border-b border-[#F1EDE3] px-5 md:px-8 h-[72px] sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-xl text-[var(--text)]" onClick={onBurger}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <div>
          <p className="text-xs text-[#94A3B8]">Selamat datang,</p>
          <p className="font-semibold leading-tight">{nama} <span className="ml-1">👋</span></p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/notifikasi" className="relative text-[#475569] text-lg">
          <i className="fa-regular fa-bell"></i>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-primary rounded-full text-white text-[9px] flex items-center justify-center px-0.5">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2">
          <img src={photo} className="w-9 h-9 rounded-full object-cover border-2 border-primary" alt={nama} />
          <div className="hidden md:block leading-tight">
            <p className="text-sm font-medium">{nama}</p>
            <p className="text-xs text-[#94A3B8]">{label}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default memo(Topbar);
