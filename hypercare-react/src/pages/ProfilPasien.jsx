import { useState, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function fmt(d) { return d ? new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '-'; }

export default function ProfilPasien() {
  const { user, role } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  // Tab riwayat kesehatan
  const [tab, setTab] = useState('profil');
  const [riwayat, setRiwayat] = useState([]);
  const [rwForm, setRwForm] = useState({ judul:'', deskripsi:'', tanggal:'', jenis:'lainnya' });
  const [rwEdit, setRwEdit] = useState(null);
  const [loadingRw, setLoadingRw] = useState(false);

  const photo = preview || user?.foto || `https://i.pravatar.cc/150?u=${user?.id}`;

  const startEdit = () => {
    setForm({ nama: user?.nama||'', no_hp: user?.no_hp||'', jenis_kelamin: user?.jenis_kelamin||'', tanggal_lahir: user?.tanggal_lahir||'', agama: user?.agama||'', alamat: user?.alamat||'' });
    setEditing(true);
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2*1024*1024) { showToast('Foto maks 2 MB.', 'error'); return; }
    setPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      if (fileRef.current?.files[0]) fd.append('foto', fileRef.current.files[0]);
      const res = await api.post(`/pasien/index.php?id=${user.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      // Update localStorage
      const updated = res.data.data;
      const storage = localStorage.getItem('hc_token') ? localStorage : sessionStorage;
      storage.setItem('hc_user', JSON.stringify(updated));
      showToast('Profil berhasil diperbarui.', 'success');
      setEditing(false);
      setPreview(null);
      window.location.reload(); // reload agar context refresh
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan.', 'error');
    } finally { setSaving(false); }
  };

  const loadRiwayat = async () => {
    setLoadingRw(true);
    try {
      const res = await api.get('/riwayat-kesehatan/index.php');
      setRiwayat(res.data.data || []);
    } catch { showToast('Gagal memuat riwayat.','error'); }
    finally { setLoadingRw(false); }
  };

  const handleTabChange = (t) => {
    setTab(t);
    if (t === 'riwayat' && !riwayat.length) loadRiwayat();
  };

  const saveRiwayat = async (e) => {
    e.preventDefault();
    try {
      if (rwEdit) {
        await api.put(`/riwayat-kesehatan/index.php?id=${rwEdit}`, rwForm);
        showToast('Riwayat diperbarui.','success');
        setRwEdit(null);
      } else {
        await api.post('/riwayat-kesehatan/index.php', rwForm);
        showToast('Riwayat ditambahkan.','success');
      }
      setRwForm({ judul:'',deskripsi:'',tanggal:'',jenis:'lainnya' });
      loadRiwayat();
    } catch (err) { showToast(err.response?.data?.message||'Gagal.','error'); }
  };

  const deleteRiwayat = async (id) => {
    if (!confirm('Hapus riwayat ini?')) return;
    try {
      await api.delete(`/riwayat-kesehatan/index.php?id=${id}`);
      showToast('Dihapus.','success');
      loadRiwayat();
    } catch { showToast('Gagal hapus.','error'); }
  };

  const jisCls = { penyakit:'bg-red-100 text-red-600', alergi:'bg-orange-100 text-orange-600', operasi:'bg-purple-100 text-purple-600', obat:'bg-blue-100 text-blue-600', lainnya:'bg-gray-100 text-gray-600' };

  return (
    <DashboardLayout role="pasien" active="profil">
      <main className="p-5 md:p-8">
        {/* Tab */}
        <div className="flex gap-2 mb-5">
          {[['profil','Profil Saya'],['riwayat','Riwayat Kesehatan']].map(([k,l]) => (
            <button key={k} onClick={() => handleTabChange(k)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab===k ? 'bg-primary text-white' : 'bg-white border border-[#F1EDE3] text-[#64748B] hover:bg-secondary'}`}>{l}</button>
          ))}
        </div>

        {tab === 'profil' && (
        <div className="card-soft p-6 max-w-2xl">
          {!editing ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <img src={photo} className="w-20 h-20 rounded-full object-cover border-4 border-secondary" alt={user?.nama} />
                <div>
                  <h2 className="font-display font-bold text-lg">{user?.nama||'-'}</h2>
                  <p className="text-sm text-[#94A3B8]">Pasien HyperCare</p>
                  <p className="text-xs text-[#94A3B8]">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div><p className="text-[#94A3B8] text-xs mb-1">Nama Lengkap</p><p className="font-medium">{user?.nama||'-'}</p></div>
                <div><p className="text-[#94A3B8] text-xs mb-1">Nomor HP</p><p className="font-medium">{user?.no_hp||'-'}</p></div>
                <div><p className="text-[#94A3B8] text-xs mb-1">Email</p><p className="font-medium">{user?.email||'-'}</p></div>
                <div><p className="text-[#94A3B8] text-xs mb-1">Jenis Kelamin</p><p className="font-medium">{user?.jenis_kelamin||'-'}</p></div>
                <div><p className="text-[#94A3B8] text-xs mb-1">Tanggal Lahir</p><p className="font-medium">{fmt(user?.tanggal_lahir)}</p></div>
                <div><p className="text-[#94A3B8] text-xs mb-1">Agama</p><p className="font-medium">{user?.agama||'-'}</p></div>
                <div className="sm:col-span-2"><p className="text-[#94A3B8] text-xs mb-1">Alamat</p><p className="font-medium">{user?.alamat||'-'}</p></div>
              </div>
              <button className="btn-primary mt-6" onClick={startEdit}>Edit Profil</button>
            </>
          ) : (
            <form onSubmit={saveProfile} className="space-y-4">
              {/* Foto */}
              <div className="flex items-center gap-4">
                <img src={photo} className="w-20 h-20 rounded-full object-cover border-4 border-secondary" alt="" />
                <div>
                  <p className="text-sm font-medium mb-1">Foto Profil</p>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFoto} className="text-sm" />
                  <p className="text-xs text-[#94A3B8] mt-1">Maks 2 MB · JPG/PNG/WEBP</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><label className="text-sm font-medium block mb-1">Nama Lengkap</label>
                  <input className="input-soft" value={form.nama||''} onChange={e=>setForm(p=>({...p,nama:e.target.value}))} required /></div>
                <div><label className="text-sm font-medium block mb-1">Nomor HP</label>
                  <input className="input-soft" value={form.no_hp||''} onChange={e=>setForm(p=>({...p,no_hp:e.target.value}))} /></div>
                <div><label className="text-sm font-medium block mb-1">Jenis Kelamin</label>
                  <select className="input-soft" value={form.jenis_kelamin||''} onChange={e=>setForm(p=>({...p,jenis_kelamin:e.target.value}))}>
                    <option value="">Pilih</option><option>Laki-laki</option><option>Perempuan</option></select></div>
                <div><label className="text-sm font-medium block mb-1">Tanggal Lahir</label>
                  <input type="date" className="input-soft" value={form.tanggal_lahir||''} onChange={e=>setForm(p=>({...p,tanggal_lahir:e.target.value}))} /></div>
                <div><label className="text-sm font-medium block mb-1">Agama</label>
                  <select className="input-soft" value={form.agama||''} onChange={e=>setForm(p=>({...p,agama:e.target.value}))}>
                    <option value="">Pilih</option><option>Islam</option><option>Kristen</option><option>Katolik</option><option>Hindu</option><option>Buddha</option><option>Konghucu</option></select></div>
                <div className="sm:col-span-2"><label className="text-sm font-medium block mb-1">Alamat</label>
                  <textarea className="input-soft" rows="2" value={form.alamat||''} onChange={e=>setForm(p=>({...p,alamat:e.target.value}))} /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                  {saving ? <span><i className="fa-solid fa-spinner fa-spin mr-1"/>Menyimpan...</span> : 'Simpan Perubahan'}
                </button>
                <button type="button" onClick={() => { setEditing(false); setPreview(null); }} className="btn-outline">Batal</button>
              </div>
            </form>
          )}
        </div>
        )}

        {tab === 'riwayat' && (
        <div className="grid lg:grid-cols-3 gap-5">
          <form onSubmit={saveRiwayat} className="card-soft p-5 space-y-3 h-fit">
            <h3 className="font-semibold">{rwEdit ? 'Edit Riwayat' : 'Tambah Riwayat Kesehatan'}</h3>
            <div><label className="text-sm font-medium block mb-1">Judul</label>
              <input className="input-soft" value={rwForm.judul} onChange={e=>setRwForm(p=>({...p,judul:e.target.value}))} placeholder="cth: Diabetes Tipe 2" required /></div>
            <div><label className="text-sm font-medium block mb-1">Jenis</label>
              <select className="input-soft" value={rwForm.jenis} onChange={e=>setRwForm(p=>({...p,jenis:e.target.value}))}>
                <option value="penyakit">Penyakit</option><option value="alergi">Alergi</option>
                <option value="operasi">Operasi</option><option value="obat">Obat Rutin</option><option value="lainnya">Lainnya</option>
              </select></div>
            <div><label className="text-sm font-medium block mb-1">Tanggal</label>
              <input type="date" className="input-soft" value={rwForm.tanggal} onChange={e=>setRwForm(p=>({...p,tanggal:e.target.value}))} required /></div>
            <div><label className="text-sm font-medium block mb-1">Deskripsi</label>
              <textarea className="input-soft" rows="3" value={rwForm.deskripsi} onChange={e=>setRwForm(p=>({...p,deskripsi:e.target.value}))} placeholder="Keterangan tambahan..." /></div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">{rwEdit ? 'Perbarui' : 'Tambah'}</button>
              {rwEdit && <button type="button" onClick={() => { setRwEdit(null); setRwForm({judul:'',deskripsi:'',tanggal:'',jenis:'lainnya'}); }} className="btn-outline px-3">Batal</button>}
            </div>
          </form>

          <div className="card-soft p-5 lg:col-span-2">
            <h3 className="font-semibold mb-4">Daftar Riwayat Kesehatan</h3>
            {loadingRw ? <p className="text-sm text-[#94A3B8]">Memuat...</p> : (
              <div className="space-y-3">
                {riwayat.map(r => (
                  <div key={r.id} className="flex items-start justify-between p-3 rounded-xl bg-secondary/50 gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${jisCls[r.jenis]||jisCls.lainnya}`}>{r.jenis}</span>
                        <span className="text-xs text-[#94A3B8]">{r.tanggal}</span>
                      </div>
                      <p className="font-medium text-sm">{r.judul}</p>
                      {r.deskripsi && <p className="text-xs text-[#64748B] mt-0.5">{r.deskripsi}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => { setRwEdit(r.id); setRwForm({judul:r.judul,deskripsi:r.deskripsi||'',tanggal:r.tanggal,jenis:r.jenis}); }} className="text-xs btn-outline px-2 py-1"><i className="fa-solid fa-pen"/></button>
                      <button onClick={() => deleteRiwayat(r.id)} className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"><i className="fa-solid fa-trash"/></button>
                    </div>
                  </div>
                ))}
                {!riwayat.length && <p className="text-sm text-[#94A3B8] py-4 text-center">Belum ada riwayat kesehatan.</p>}
              </div>
            )}
          </div>
        </div>
        )}
      </main>
    </DashboardLayout>
  );
}
