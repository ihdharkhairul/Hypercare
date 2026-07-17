import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useFormValidation, rules } from '../hooks/useFormValidation';

export default function LoginAdmin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);

  const { loginAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const { errors, validate, clearError, setServerErrors } = useFormValidation({
    email:    rules.combine(rules.required('Email'), rules.email),
    password: rules.combine(rules.required('Password'), rules.minLength(6)),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate({ email, password })) return;
    const result = await loginAdmin(email, password);
    if (result.success) {
      showToast('Login admin berhasil!', 'success');
      setTimeout(() => navigate('/admin/edukasi', { replace: true }), 800);
    } else {
      if (result.errors) setServerErrors(result.errors);
      else showToast(result.message || 'Login gagal.', 'error');
    }
  };

  return (
    <div className="font-body bg-secondary min-h-screen flex items-center justify-center p-4">
      <div className="card-soft w-full max-w-md p-8">
        <div className="text-center mb-7">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-primary transition-colors">
              <i className="fa-solid fa-arrow-left text-xs"></i> Kembali
            </button>
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-display font-bold text-lg">H</div>
              <span className="font-display font-bold text-lg">HyperCare</span>
            </Link>
            <div className="w-16"></div>
          </div>
          <h1 className="font-display font-bold text-xl">Admin Panel</h1>
          <p className="text-sm text-[#64748B] mt-1">Kelola konten edukasi HyperCare</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input type="email" value={email}
              onChange={e => { setEmail(e.target.value); clearError('email'); }}
              className={`input-soft${errors.email ? ' border-red-400' : ''}`}
              placeholder="admin@hypercare.id" required />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); clearError('password'); }}
                className={`input-soft pr-10${errors.password ? ' border-red-400' : ''}`}
                placeholder="masukan password" required />
              <i className={`fa-regular ${showPw ? 'fa-eye-slash' : 'fa-eye'} absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] cursor-pointer`}
                onClick={() => setShowPw(!showPw)} />
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-spinner fa-spin" /> Memproses...</span> : 'Masuk sebagai Admin'}
          </button>
        </form>
        <p className="text-center text-xs text-[#94A3B8] mt-4 bg-secondary rounded-lg py-2">Demo: admin@hypercare.id / admin123</p>
      </div>
    </div>
  );
}
