import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import PageTransition from './components/common/PageTransition';
import Toast from './components/Toast';

// ── Lazy load semua halaman ────────────────────────────────
const Home               = lazy(() => import('./pages/Home'));
const LoginPasien        = lazy(() => import('./pages/LoginPasien'));
const LoginPerawat       = lazy(() => import('./pages/LoginPerawat'));
const RegisterPasien     = lazy(() => import('./pages/RegisterPasien'));
const RegisterPerawat    = lazy(() => import('./pages/RegisterPerawat'));
const DashboardPasien    = lazy(() => import('./pages/DashboardPasien'));
const DashboardPerawat   = lazy(() => import('./pages/DashboardPerawat'));
const ProfilPasien       = lazy(() => import('./pages/ProfilPasien'));
const ProfilPerawat      = lazy(() => import('./pages/ProfilPerawat'));
const CatatTekanan       = lazy(() => import('./pages/CatatTekanan'));
const RiwayatPemeriksaan = lazy(() => import('./pages/RiwayatPemeriksaan'));
const KonsultasiPerawat  = lazy(() => import('./pages/KonsultasiPerawat'));
const AIChat             = lazy(() => import('./pages/AIChat'));
const ChatPerawat        = lazy(() => import('./pages/ChatPerawat'));
const PerawatEdukasi     = lazy(() => import('./pages/PerawatEdukasi'));
const MonitoringPasien   = lazy(() => import('./pages/MonitoringPasien'));
const DataPasien         = lazy(() => import('./pages/DataPasien'));
const Notifikasi         = lazy(() => import('./pages/Notifikasi'));
const Edukasi            = lazy(() => import('./pages/Edukasi'));
const EdukasiPasien      = lazy(() => import('./pages/EdukasiPasien'));
const AktivitasTerbaru   = lazy(() => import('./pages/AktivitasTerbaru'));
const RiwayatLogin       = lazy(() => import('./pages/RiwayatLogin'));
const RiwayatChatAI      = lazy(() => import('./pages/RiwayatChatAI'));
const DashboardStatistik = lazy(() => import('./pages/DashboardStatistik'));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <LoadingSpinner size="lg" label="Memuat halaman..." />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <PageTransition key={location.pathname}>
      <Routes>
        {/* Public */}
        <Route path="/"        element={<Home />} />
        <Route path="/edukasi" element={<Edukasi />} />

        {/* Guest only — redirect ke dashboard jika sudah login */}
        <Route path="/login-pasien"     element={<GuestRoute><LoginPasien /></GuestRoute>} />
        <Route path="/login-perawat"    element={<GuestRoute><LoginPerawat /></GuestRoute>} />
        <Route path="/register-pasien"  element={<GuestRoute><RegisterPasien /></GuestRoute>} />
        <Route path="/register-perawat" element={<GuestRoute><RegisterPerawat /></GuestRoute>} />

        {/* Protected — Pasien */}
        <Route path="/dashboard-pasien"    element={<ProtectedRoute role="pasien"><DashboardPasien /></ProtectedRoute>} />
        <Route path="/profil-pasien"       element={<ProtectedRoute role="pasien"><ProfilPasien /></ProtectedRoute>} />
        <Route path="/catat-tekanan"       element={<ProtectedRoute role="pasien"><CatatTekanan /></ProtectedRoute>} />
        <Route path="/riwayat-pemeriksaan" element={<ProtectedRoute role="pasien"><RiwayatPemeriksaan /></ProtectedRoute>} />
        <Route path="/konsultasi-perawat"  element={<ProtectedRoute role="pasien"><KonsultasiPerawat /></ProtectedRoute>} />
        <Route path="/ai-chat"             element={<ProtectedRoute role="pasien"><AIChat /></ProtectedRoute>} />
        <Route path="/riwayat-chat-ai"     element={<ProtectedRoute role="pasien"><RiwayatChatAI /></ProtectedRoute>} />
        <Route path="/edukasi-pasien"      element={<ProtectedRoute role="pasien"><EdukasiPasien /></ProtectedRoute>} />

        {/* Protected — Perawat */}
        <Route path="/dashboard-perawat"  element={<ProtectedRoute role="perawat"><DashboardPerawat /></ProtectedRoute>} />
        <Route path="/profil-perawat"     element={<ProtectedRoute role="perawat"><ProfilPerawat /></ProtectedRoute>} />
        <Route path="/chat-perawat"       element={<ProtectedRoute role="perawat"><ChatPerawat /></ProtectedRoute>} />
        <Route path="/monitoring-pasien"  element={<ProtectedRoute role="perawat"><MonitoringPasien /></ProtectedRoute>} />
        <Route path="/data-pasien"        element={<ProtectedRoute role="perawat"><DataPasien /></ProtectedRoute>} />
        <Route path="/statistik"          element={<ProtectedRoute role="perawat"><DashboardStatistik /></ProtectedRoute>} />
        <Route path="/perawat/edukasi"    element={<ProtectedRoute role="perawat"><PerawatEdukasi /></ProtectedRoute>} />

        {/* Shared — Pasien & Perawat */}
        <Route path="/notifikasi"     element={<ProtectedRoute><Notifikasi /></ProtectedRoute>} />
        <Route path="/aktivitas"      element={<ProtectedRoute><AktivitasTerbaru /></ProtectedRoute>} />
        <Route path="/riwayat-login"  element={<ProtectedRoute><RiwayatLogin /></ProtectedRoute>} />
      </Routes>
    </PageTransition>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toast />
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <AnimatedRoutes />
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
