import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { showToast } from '../components/Toast';
import { useDebounce } from '../hooks/useDebounce';
import api from '../api/axios';

const badgeCls = (s) => {
  if (!s) return 'badge-normal';
  if (s.includes('Tingkat 2')) return 'badge-tk2';
  if (s.includes('Tingkat 1')) return 'badge-tk1';
  if (s.includes('Pra'))       return 'badge-pra';
  return 'badge-normal';
};

const emptyForm = { nama:'', email:'', password:'', no_hp:'', jenis_kelamin:'Laki-laki', tanggal_lahir:'', agama:'Islam', alamat:'' };

export default function DataPasien() {
  const [pasienList, setPasienList] = useState([]);
  const [search, setSearch]         = useState('');
  const debouncedSearch              = useDebounce(search, 350); // optimasi: tunda request sampai user berhenti mengetik
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);   // 'add' | 'edit' | 'detail' | false
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);

  const load = async (q) => {
    setLoading(true);
    try {
      const url = '/pasien/index.php' + (q ? `?search=${encodeURIComponent(q)}` : '');
      const res = await api.get(url);
      setPasienList(res.data.data || []);
    } catch { showToast('Gagal memuat data.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(debouncedSearch); }, [debouncedSearch]);

  const openAdd = () => { setForm(emptyForm); setSelected(null); setModal('add'); };
  const openEdit = (p) => {
    setSelected(p);
    setForm({ nama: p.nama||'', email: p.email||'', password: '', no_hp: p.no_hp||'', jenis_kelamin: p.jenis_kelamin||'Laki-laki', tanggal_lahir: p.tanggal_lahir||'', agama: p.agama||'Islam', alamat: p.alamat||'' });
    setModal('edit');
  };
  const openDetail = (p) => { setSelected(p); setModal('detail'); };
  const closeModal = () => { setModal(false); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'add') {
        // Daftarkan pasien baru via register
        await api.post('/auth/register-pasien.php', form);
        showToast('Pasien berhasil ditambahkan.', 'success');
      } else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v && k !== 'password') fd.append(k, v); });
        await api.post(`/pasien/index.php?id=${selected.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Data pasien diperbarui.', 'success');
      }
      closeModal();
      load(search);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan.', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus pasien "${nama}"? Semua data terkait akan ikut terhapus.`)) return;
    try {
      await api.delete(`/pasien/index.php?id=${id}`);
      showToast('Pasien dihapus.', 'success');
      load(search);
    } catch { showToast('Gagal menghapus.', 'error'); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <DashboardLayout role="perawat" active="datapasien">
      <main className="p-5 md:p-8">
        <div className="card-soft p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h3 className="font-semibold">Data Pasien <span className="text-[#94A3B8] font-normal text-sm">({pasienList.length})</span></h3>
            <div className="flex gap-3 flex-wrap">
              <input className="input-soft max-w-xs text-sm" placeholder="Cari nama / email..." value={search} onChange={e => setSearch(e.target.value)} />
              <button onClick={openAdd} className="btn-primary text-sm"><i className="fa-solid fa-plus mr-1"></i>Tambah Pasien</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#94A3B8] border-b border-[#F1EDE3]">
                  <th className="py-2">Nama</th><th>Umur</th><th>Jenis Kelamin</th><th>Nomor HP</th><th>Status Terakhir</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="py-8 text-center text-[#94A3B8]">Memuat data...</td></tr>
                ) : pasienList.length ? pasienList.map(p => (
                  <tr key={p.id} className="border-b border-[#F8F5EC]">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <img src={p.foto || `https://i.pravatar.cc/150?u=${p.id}`} className="w-8 h-8 rounded-full object-cover" alt={p.nama} />
                        <span className="font-medium">{p.nama}</span>
                      </div>
                    </td>
                    <td>{p.umur ? p.umur + ' th' : '-'}</td>
                    <td>{p.jenis_kelamin || '-'}</td>
                    <td>{p.no_hp || '-'}</td>
                    <td><span className={`badge-status ${badgeCls(p.status_terakhir)}`}>{p.status_terakhir || 'Belum ada data'}</span></td>
                    <td>
                      <div className="flex gap-1.5 py-1 flex-wrap">
                        <button onClick={() => openDetail(p)} className="text-xs btn-outline px-2 py-1">Detail</button>
                        <button onClick={() => openEdit(p)} className="text-xs btn-outline px-2 py-1"><i className="fa-solid fa-pen"/></button>
                        <Link to={`/monitoring-pasien?id=${p.id}`} className="text-xs btn-primary px-2 py-1">Monitor</Link>
                        <button onClick={() => handleDelete(p.id, p.nama)} className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"><i className="fa-solid fa-trash"/></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="py-8 text-center text-[#94A3B8]">Tidak ada data pasien.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Add/Edit */}
        {(modal === 'add' || modal === 'edit') && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{modal === 'add' ? 'Tambah Pasien Baru' : 'Edit Data Pasien'}</h3>
                  <button onClick={closeModal} className="text-[#94A3B8] hover:text-[#475569]"><i className="fa-solid fa-xmark text-lg"/></button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                  <div><label className="text-sm font-medium block mb-1">Nama Lengkap</label>
                    <input className="input-soft" value={form.nama} onChange={set('nama')} required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium block mb-1">Email</label>
                      <input type="email" className="input-soft" value={form.email} onChange={set('email')} required /></div>
                    {modal === 'add' && <div><label className="text-sm font-medium block mb-1">Password</label>
                      <input type="password" className="input-soft" value={form.password} onChange={set('password')} required minLength={6} /></div>}
                    <div><label className="text-sm font-medium block mb-1">Nomor HP</label>
                      <input className="input-soft" value={form.no_hp} onChange={set('no_hp')} /></div>
                    <div><label className="text-sm font-medium block mb-1">Jenis Kelamin</label>
                      <select className="input-soft" value={form.jenis_kelamin} onChange={set('jenis_kelamin')}>
                        <option>Laki-laki</option><option>Perempuan</option></select></div>
                    <div><label className="text-sm font-medium block mb-1">Tanggal Lahir</label>
                      <input type="date" className="input-soft" value={form.tanggal_lahir} onChange={set('tanggal_lahir')} /></div>
                    <div><label className="text-sm font-medium block mb-1">Agama</label>
                      <select className="input-soft" value={form.agama} onChange={set('agama')}>
                        <option>Islam</option><option>Kristen</option><option>Katolik</option><option>Hindu</option><option>Buddha</option><option>Konghucu</option>
                      </select></div>
                  </div>
                  <div><label className="text-sm font-medium block mb-1">Alamat</label>
                    <textarea className="input-soft" rows="2" value={form.alamat} onChange={set('alamat')} /></div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                      {saving ? <span><i className="fa-solid fa-spinner fa-spin mr-1"/>Menyimpan...</span> : 'Simpan'}
                    </button>
                    <button type="button" onClick={closeModal} className="btn-outline px-4">Batal</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detail */}
        {modal === 'detail' && selected && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Detail Pasien</h3>
                  <button onClick={closeModal}><i className="fa-solid fa-xmark text-lg text-[#94A3B8]"/></button>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <img src={selected.foto || `https://i.pravatar.cc/150?u=${selected.id}`} className="w-16 h-16 rounded-full object-cover" alt={selected.nama} />
                  <div>
                    <p className="font-semibold">{selected.nama}</p>
                    <p className="text-xs text-[#94A3B8]">{selected.email}</p>
                    <span className={`badge-status ${badgeCls(selected.status_terakhir)} mt-1`}>{selected.status_terakhir || 'Belum ada data'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-[#94A3B8] text-xs">Umur</p><p className="font-medium">{selected.umur ? selected.umur + ' tahun' : '-'}</p></div>
                  <div><p className="text-[#94A3B8] text-xs">Jenis Kelamin</p><p className="font-medium">{selected.jenis_kelamin || '-'}</p></div>
                  <div><p className="text-[#94A3B8] text-xs">No. HP</p><p className="font-medium">{selected.no_hp || '-'}</p></div>
                  <div><p className="text-[#94A3B8] text-xs">TD Terakhir</p><p className="font-medium">{selected.td_terakhir ? selected.td_terakhir + ' mmHg' : '-'}</p></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link to={`/monitoring-pasien?id=${selected.id}`} onClick={closeModal} className="btn-primary flex-1 text-center text-sm">Monitoring</Link>
                  <button onClick={() => { closeModal(); openEdit(selected); }} className="btn-outline text-sm px-4">Edit</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
