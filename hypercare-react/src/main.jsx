import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Cegah halaman "beku" (stale) saat pengguna pakai tombol Back/Forward
// browser. Browser kadang menyajikan snapshot DOM lama dari cache
// (bfcache) yang tidak sinkron dengan URL/route React Router saat ini —
// paksa reload penuh supaya SPA selalu render ulang sesuai rute terbaru.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)