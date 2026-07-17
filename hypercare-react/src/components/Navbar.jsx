import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen]   = useState(false);
  const location = useLocation();

  const isActive = (navKey) => {
    if (navKey === 'home' && location.pathname === '/') return true;
    return false;
  };

  const closeAll = () => { setMobileOpen(false); setLoginOpen(false); };

  return (
    <nav className="bg-white/90 backdrop-blur sticky top-0 z-40 border-b border-[#F1EDE3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-display font-bold text-lg">H</div>
          <span className="font-display font-bold text-lg text-[var(--text)]">HyperCare</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden lg:flex items-center gap-7">
          <Link to="/" className={`navbar-link${isActive('home') ? ' active' : ''}`}>Home</Link>
          <a href="/#tentang" className="navbar-link">Tentang</a>
          <a href="/#layanan" className="navbar-link">Layanan</a>
          <a href="/#perawat" className="navbar-link">Perawat</a>
          <a href="/#edukasi" className="navbar-link">Edukasi</a>
          <a href="/#faq" className="navbar-link">FAQ</a>

          {/* Dropdown Login */}
          <div className="relative">
            <button
              onClick={() => setLoginOpen(p => !p)}
              className="navbar-link flex items-center gap-1"
            >
              Login <i className={`fa-solid fa-chevron-down text-xs transition-transform ${loginOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {loginOpen && (
              <div className="absolute right-0 top-8 bg-white border border-[#F1EDE3] rounded-xl shadow-lg py-2 min-w-[160px] z-50">
                <Link to="/login-pasien"  onClick={closeAll} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                  <i className="fa-solid fa-user text-primary w-4"></i> Masuk sebagai Pasien
                </Link>
                <Link to="/login-perawat" onClick={closeAll} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                  <i className="fa-solid fa-user-nurse text-primary w-4"></i> Masuk sebagai Perawat
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Daftar button desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/register-pasien" className="btn-primary text-sm">Daftar Sekarang</Link>
        </div>

        {/* Mobile burger */}
        <button className="lg:hidden text-2xl text-[var(--text)]" onClick={() => setMobileOpen(!mobileOpen)}>
          <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden flex flex-col gap-1 px-4 pb-4 bg-white border-t border-[#F1EDE3]">
          <Link to="/"          className="sidebar-link" onClick={closeAll}>Home</Link>
          <a href="/#tentang"   className="sidebar-link" onClick={closeAll}>Tentang</a>
          <a href="/#layanan"   className="sidebar-link" onClick={closeAll}>Layanan</a>
          <a href="/#perawat"   className="sidebar-link" onClick={closeAll}>Perawat</a>
          <a href="/#edukasi"   className="sidebar-link" onClick={closeAll}>Edukasi</a>
          <a href="/#faq"       className="sidebar-link" onClick={closeAll}>FAQ</a>

          <div className="border-t border-[#F1EDE3] pt-2 mt-1 space-y-1">
            <p className="text-xs text-[#94A3B8] px-3 pt-1">Masuk sebagai:</p>
            <Link to="/login-pasien"  className="sidebar-link" onClick={closeAll}>
              <i className="fa-solid fa-user w-5 text-center"></i> Pasien
            </Link>
            <Link to="/login-perawat" className="sidebar-link" onClick={closeAll}>
              <i className="fa-solid fa-user-nurse w-5 text-center"></i> Perawat
            </Link>
          </div>

          <div className="pt-2 space-y-2">
            <Link to="/register-pasien"  className="btn-primary w-full text-center text-sm block" onClick={closeAll}>Daftar sebagai Pasien</Link>
            <Link to="/register-perawat" className="btn-outline w-full text-center text-sm block" onClick={closeAll}>Daftar sebagai Perawat</Link>
          </div>
        </div>
      )}

      {/* Overlay tutup dropdown login */}
      {loginOpen && <div className="fixed inset-0 z-40" onClick={() => setLoginOpen(false)} />}
    </nav>
  );
}
