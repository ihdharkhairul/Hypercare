// src/components/common/PageTransition.jsx
//
// Wrapper animasi antar halaman — TIDAK mengubah visual apapun.
//
// Cara kerja:
//   Parent (AnimatedRoutes di App.jsx) mengoper location.pathname
//   sebagai React `key`. Setiap kali key berubah (ganti halaman),
//   React unmount div lama dan mount div baru — CSS animation
//   @keyframes pageEnter di index.css otomatis berjalan kembali.
//
// Dua varian animasi:
//   fade=false (default): fade + slide up 12px — untuk halaman dashboard
//   fade=true           : fade saja — untuk halaman panjang (Home)

export default function PageTransition({ children, fade = false, className = '' }) {
  return (
    <div className={`${fade ? 'page-transition-fade' : 'page-transition'} ${className}`.trim()}>
      {children}
    </div>
  );
}
