import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useFormValidation, rules } from '../hooks/useFormValidation';

export default function RegisterPerawat() {
  const [form, setForm] = useState({
    nama: '', email: '', password: '',
    spesialis: 'Spesialis Hipertensi',
    tanggal_lahir: '', jenis_kelamin: 'Laki-laki', alamat: '',
  });

  const { registerPerawat, loading } = useAuth();
  const navigate = useNavigate();

  const { errors, validate, clearError, setServerErrors } = useFormValidation({
    nama:     rules.required('Nama Lengkap'),
    email:    rules.combine(rules.required('Email'), rules.email),
    password: rules.combine(rules.required('Password'), rules.minLength(6)),
  });

  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); clearError(k); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    const result = await registerPerawat(form);
    if (result.success) {
      showToast('Registrasi Perawat berhasil! Silakan login.', 'success');
      navigate('/login-perawat');
    } else {
      if (result.errors) setServerErrors(result.errors);
      else showToast(result.message || 'Registrasi gagal.', 'error');
    }
  };

  const err = (k) => errors[k] ? <p className="text-xs text-red-500 mt-1">{errors[k]}</p> : null;
  const cls = (k) => `input-soft${errors[k] ? ' border-red-400' : ''}`;

  return (
    <div className="font-body bg-secondary min-h-screen flex items-center justify-center p-4">
      <div className="card-soft w-full max-w-lg p-8 my-8">
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
          <h1 className="font-display font-bold text-xl">Daftar Sebagai Perawat</h1>
          <p className="text-sm text-[#64748B] mt-1">Bergabung menjadi tenaga ahli HyperCare</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="text-sm font-medium block mb-1">Nama Lengkap</label>
            <input className={cls('nama')} value={form.nama} onChange={set('nama')} placeholder="masukan nama lengkap" />
            {err('nama')}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input type="email" className={cls('email')} value={form.email} onChange={set('email')} placeholder="masukan email" autoComplete="email" />
            {err('email')}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Password</label>
            <input type="password" className={cls('password')} value={form.password} onChange={set('password')} placeholder="minimal 6 karakter" autoComplete="new-password" />
            {err('password')}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Spesialis</label>
            <select className="input-soft" value={form.spesialis} onChange={set('spesialis')}>
              <option>Spesialis Hipertensi</option>
              <option>Spesialis Kardiovaskular</option>
              <option>Perawat Umum</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Tanggal Lahir</label>
              <input type="date" className="input-soft" value={form.tanggal_lahir} onChange={set('tanggal_lahir')} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Jenis Kelamin</label>
              <select className="input-soft" value={form.jenis_kelamin} onChange={set('jenis_kelamin')}>
                <option>Laki-laki</option><option>Perempuan</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Alamat</label>
            <textarea className="input-soft" rows="2" value={form.alamat} onChange={set('alamat')} placeholder="masukan alamat lengkap" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
            {loading
              ? <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-spinner fa-spin" /> Mendaftarkan...</span>
              : 'Daftar Sebagai Perawat'}
          </button>
        </form>
        <p className="text-center text-sm text-[#64748B] mt-5">
          Sudah punya akun? <Link to="/login-perawat" className="text-primary font-semibold text-hover">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
