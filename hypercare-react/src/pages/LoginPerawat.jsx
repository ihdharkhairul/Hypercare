import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useFormValidation, rules } from '../hooks/useFormValidation';

export default function LoginPerawat() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);

  const { loginPerawat, loading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // PERBAIKAN: Abaikan 'from' jika nilainya '/' atau halaman auth lain
  const rawFrom = location.state?.from?.pathname;
  const authPages = ['/', '/login-pasien', '/login-perawat', '/register-pasien', '/register-perawat'];
  const from = rawFrom && !authPages.includes(rawFrom) ? rawFrom : '/dashboard-perawat';

  const { errors, validate, clearError, setServerErrors } = useFormValidation({
    email:    rules.combine(rules.required('Email'), rules.email),
    password: rules.combine(rules.required('Password'), rules.minLength(6)),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate({ email, password })) return;

    const result = await loginPerawat(email, password, remember);

    if (result.success) {
      showToast('Login berhasil!', 'success');
      navigate(from, { replace: true });
    } else {
      if (result.errors) setServerErrors(result.errors);
      else showToast(result.message || 'Email atau password salah.', 'error');
    }
  };

  return (
    <div className="font-body bg-secondary min-h-screen flex items-center justify-center p-4">
      <div className="card-soft w-full max-w-md p-8">
        <div className="text-center mb-7">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-primary transition-colors">
              <i className="fa-solid fa-arrow-left text-xs"></i> Kembali
            </button>
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-display font-bold text-lg">H</div>
              <span className="font-display font-bold text-lg">HyperCare</span>
            </Link>
            <div className="w-16"></div>
          </div>
          <h1 className="font-display font-bold text-xl">Masuk sebagai Perawat</h1>
          <p className="text-sm text-[#64748B] mt-1">Layani pasien Anda dengan lebih baik</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input type="email" value={email}
              onChange={e => { setEmail(e.target.value); clearError('email'); }}
              className={`input-soft${errors.email ? ' border-red-400' : ''}`}
              placeholder="masukan email Anda" autoComplete="email" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); clearError('password'); }}
                className={`input-soft pr-10${errors.password ? ' border-red-400' : ''}`}
                placeholder="masukan password" autoComplete="current-password" />
              <i className={`fa-regular ${showPw ? 'fa-eye-slash' : 'fa-eye'} absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] cursor-pointer`}
                onClick={() => setShowPw(!showPw)} />
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
          <div className="flex items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 accent-primary" />
              <span className="text-[#64748B]">Ingat saya</span>
            </label>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
            {loading
              ? <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-spinner fa-spin" /> Memproses...</span>
              : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm text-[#64748B] mt-5">
          Belum punya akun? <Link to="/register-perawat" className="text-primary font-semibold text-hover">Daftar</Link>
        </p>
        <p className="text-center text-xs text-[#94A3B8] mt-3">
          Login sebagai pasien? <Link to="/login-pasien" className="text-primary font-semibold text-hover">Klik di sini</Link>
        </p>
      </div>
    </div>
  );
}
