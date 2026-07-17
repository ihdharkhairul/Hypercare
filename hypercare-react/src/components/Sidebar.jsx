import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from './Toast';

const pasienMenu = [
  { to:'/dashboard-pasien',     icon:'fa-gauge-high',      label:'Dashboard',           key:'dashboard' },
  { to:'/profil-pasien',        icon:'fa-user',            label:'Profil Saya',         key:'profil' },
  { to:'/catat-tekanan',        icon:'fa-heart-pulse',     label:'Catat Tekanan Darah', key:'catat' },
  { to:'/riwayat-pemeriksaan',  icon:'fa-table-list',      label:'Riwayat Pemeriksaan', key:'riwayat' },
  { to:'/konsultasi-perawat',   icon:'fa-comment-medical', label:'Konsultasi Perawat',  key:'konsultasi' },
  { to:'/ai-chat',              icon:'fa-robot',           label:'AI Chat Hipertensi',  key:'aichat' },
  { to:'/riwayat-chat-ai',      icon:'fa-clock-rotate-left', label:'Riwayat Chat AI',   key:'riwayat-chat-ai' },
  { to:'/edukasi-pasien',       icon:'fa-book-open',       label:'Edukasi Hipertensi',  key:'edukasi' },
  { to:'/notifikasi',           icon:'fa-bell',            label:'Notifikasi',          key:'notifikasi' },
  { to:'/aktivitas',            icon:'fa-list-check',      label:'Aktivitas Terbaru',   key:'aktivitas' },
  { to:'/riwayat-login',        icon:'fa-right-to-bracket',label:'Riwayat Login',       key:'riwayat-login' },
];

const perawatMenu = [
  { to:'/dashboard-perawat',    icon:'fa-gauge-high',      label:'Dashboard',           key:'dashboard' },
  { to:'/data-pasien',          icon:'fa-users',           label:'Data Pasien',         key:'datapasien' },
  { to:'/monitoring-pasien',    icon:'fa-chart-line',      label:'Monitoring Pasien',   key:'monitoring' },
  { to:'/statistik',            icon:'fa-chart-pie',       label:'Dashboard Statistik', key:'statistik' },
  { to:'/chat-perawat',         icon:'fa-comments',        label:'Konsultasi',          key:'chatperawat' },
  { to:'/perawat/edukasi',      icon:'fa-book-medical',    label:'Kelola Edukasi',      key:'edukasi' },
  { to:'/profil-perawat',       icon:'fa-user-nurse',      label:'Profil',              key:'profil' },
  { to:'/notifikasi',           icon:'fa-bell',            label:'Notifikasi',          key:'notifikasi' },
  { to:'/aktivitas',            icon:'fa-list-check',      label:'Aktivitas Terbaru',   key:'aktivitas' },
  { to:'/riwayat-login',        icon:'fa-right-to-bracket',label:'Riwayat Login',       key:'riwayat-login' },
];

function Sidebar({ role, active, open, setOpen }) {
  const menu     = role === 'perawat' ? perawatMenu : pasienMenu;
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    showToast('Logout berhasil.', 'success');
    navigate(role === 'perawat' ? '/login-perawat' : '/login-pasien', { replace: true });
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 lg:hidden bg-black/20" onClick={() => setOpen(false)} />}
      <aside className={`sidebar-mobile w-[260px] bg-white border-r border-[#F1EDE3] min-h-screen px-4 py-6 flex flex-col${open ? ' open' : ''}`}>
        <Link to="/" className="flex items-center gap-2 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-display font-bold text-lg">H</div>
          <span className="font-display font-bold text-lg">HyperCare</span>
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          {menu.map(m => (
            <Link key={m.key} to={m.to}
              className={`sidebar-link${active === m.key ? ' active' : ''}`}
              onClick={() => setOpen(false)}>
              <i className={`fa-solid ${m.icon} w-5 text-center`}></i>
              <span>{m.label}</span>
            </Link>
          ))}
        </nav>
        <button onClick={handleLogout} className="sidebar-link text-[#C53030] mt-4 w-full text-left">
          <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center"></i>
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}

export default memo(Sidebar);
