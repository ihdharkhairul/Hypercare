import { useState, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function fmt(d) { return d ? new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '-'; }

const AVATAR_COLORS = ['#F4A300', '#22A559', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6'];
function initials(nama) { return nama ? nama.trim().charAt(0).toUpperCase() : '?'; }
function avatarColor(nama) { return AVATAR_COLORS[(nama?.charCodeAt(0) || 0) % AVATAR_COLORS.length]; }

function Avatar({ src, nama }) {
  if (src) {
    return <img src={src} className="w-20 h-20 rounded-full object-cover border-4 border-secondary" alt={nama} />;
  }
  return (
    <div className="w-20 h-20 rounded-full border-4 border-secondary flex items-center justify-center text-white font-display font-bold text-2xl"
      style={{ backgroundColor: avatarColor(nama) }}>
      {initials(nama)}
    </div>
  );
}

export default function ProfilPerawat() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const fileRef = useRef(null);

  const currentPhoto = removePhoto ? null : (preview || user?.foto || null);

  const startEdit = () => {
    setForm({ nama:user?.nama||'', spesialis:user?.spesialis||'', pengalaman:user?.pengalaman||'', jenis_kelamin:user?.jenis_kelamin||'', tanggal_lahir:user?.tanggal_lahir||'', alamat:user?.alamat||'' });
    setRemovePhoto(false);
    setPreview(null);
    setEditing(true);
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2*1024*1024) { showToast('Foto maks 2 MB.','error'); return; }
    setRemovePhoto(false);
    setPreview(URL.createObjectURL(file));
  };

  const handleHapusFoto = () => {
    setPreview(null);
    setRemovePhoto(true);
    if (fileRef.current) fileRef.current.value = '';
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      if (fileRef.current?.files[0]) fd.append('foto', fileRef.current.files[0]);
      else if (removePhoto) fd.append('hapus_foto', '1');
      const res = await api.post(`/perawat/index.php?id=${user.id}`, fd, { headers: {'Content-Type':'multipart/form-data'} });
      const updated = res.data.data;
      const storage = localStorage.getItem('hc_token') ? localStorage : sessionStorage;
      storage.setItem('hc_user', JSON.stringify(updated));
      showToast('Profil berhasil diperbarui.','success');
      setEditing(false); setPreview(null); setRemovePhoto(false);
      window.location.reload();
    } catch (err) { showToast(err.response?.data?.message||'Gagal.','error'); }
    finally { setSaving(false); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <DashboardLayout role="perawat" active="profil">
      <main className="p-5 md:p-8">
        <div className="card-soft p-6 max-w-2xl">
          {!editing ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <Avatar src={user?.foto} nama={user?.nama} />
                <div>
                  <h2 className="font-display font-bold text-lg">{user?.nama||'-'}</h2>
                  <p className="text-sm text-[#94A3B8]">{user?.spesialis || 'Perawat HyperCare'}</p>
                  <p className="text-xs text-[#94A3B8]">{user?.pengalaman}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div><p className="text-[#94A3B8] text-xs mb-1">Email</p><p className="font-medium">{user?.email||'-'}</p></div>
                <div><p className="text-[#94A3B8] text-xs mb-1">Tanggal Lahir</p><p className="font-medium">{fmt(user?.tanggal_lahir)}</p></div>
                <div><p className="text-[#94A3B8] text-xs mb-1">Jenis Kelamin</p><p className="font-medium">{user?.jenis_kelamin||'-'}</p></div>
                <div><p className="text-[#94A3B8] text-xs mb-1">Spesialis</p><p className="font-medium">{user?.spesialis||'-'}</p></div>
                <div className="sm:col-span-2"><p className="text-[#94A3B8] text-xs mb-1">Alamat</p><p className="font-medium">{user?.alamat||'-'}</p></div>
              </div>
              <button onClick={startEdit} className="btn-primary mt-6">Edit Profil</button>
            </>
          ) : (
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar src={currentPhoto} nama={form.nama || user?.nama} />
                <div>
                  <p className="text-sm font-medium mb-1">Foto Profil</p>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFoto} className="text-sm" />
                  <p className="text-xs text-[#94A3B8] mt-1">Maks 2 MB · JPG/PNG/WEBP</p>
                  {currentPhoto && (
                    <button type="button" onClick={handleHapusFoto} className="text-xs text-red-500 hover:underline mt-1.5">
                      <i className="fa-solid fa-trash mr-1"></i>Hapus foto (pakai inisial nama)
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><label className="text-sm font-medium block mb-1">Nama Lengkap</label>
                  <input className="input-soft" value={form.nama} onChange={set('nama')} required /></div>
                <div><label className="text-sm font-medium block mb-1">Spesialis</label>
                  <select className="input-soft" value={form.spesialis} onChange={set('spesialis')}>
                    <option>Spesialis Hipertensi</option><option>Spesialis Kardiovaskular</option><option>Perawat Umum</option></select></div>
                <div><label className="text-sm font-medium block mb-1">Pengalaman</label>
                  <input className="input-soft" value={form.pengalaman} onChange={set('pengalaman')} placeholder="cth: 5 Tahun Pengalaman" /></div>
                <div><label className="text-sm font-medium block mb-1">Jenis Kelamin</label>
                  <select className="input-soft" value={form.jenis_kelamin} onChange={set('jenis_kelamin')}>
                    <option value="">Pilih</option><option>Laki-laki</option><option>Perempuan</option></select></div>
                <div><label className="text-sm font-medium block mb-1">Tanggal Lahir</label>
                  <input type="date" className="input-soft" value={form.tanggal_lahir} onChange={set('tanggal_lahir')} /></div>
                <div className="sm:col-span-2"><label className="text-sm font-medium block mb-1">Alamat</label>
                  <textarea className="input-soft" rows="2" value={form.alamat} onChange={set('alamat')} /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                  {saving ? <span><i className="fa-solid fa-spinner fa-spin mr-1"/>Menyimpan...</span> : 'Simpan Perubahan'}
                </button>
                <button type="button" onClick={() => {setEditing(false); setPreview(null); setRemovePhoto(false);}} className="btn-outline">Batal</button>
              </div>
            </form>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}