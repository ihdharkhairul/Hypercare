import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function statusOf(sis, dia) {
  if (sis >= 160 || dia >= 100) return { label: 'Hipertensi Tingkat 2', cls: 'badge-tk2' };
  if (sis >= 140 || dia >= 90)  return { label: 'Hipertensi Tingkat 1', cls: 'badge-tk1' };
  if (sis >= 130 || dia >= 85)  return { label: 'Pra Hipertensi',       cls: 'badge-pra' };
  return { label: 'Normal', cls: 'badge-normal' };
}

const emptyForm = { tanggal: '', sistolik: '', diastolik: '', denyut_nadi: '', berat_badan: '', catatan: '' };

export default function CatatTekanan() {
  const { user } = useAuth();
  const [rows, setRows]       = useState([]);
  const [form, setForm]       = useState(emptyForm);
  const [editId, setEditId]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/tekanan/index.php');
      setRows(res.data.data || []);
    } catch { showToast('Gagal memuat data.', 'error'); }
    finally { setFetching(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/tekanan/index.php?id=${editId}`, form);
        showToast('Data berhasil diperbarui.', 'success');
        setEditId(null);
      } else {
        await api.post('/tekanan/index.php', form);
        showToast('Data tekanan darah berhasil disimpan.', 'success');
      }
      setForm(emptyForm);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan data.', 'error');
    } finally { setLoading(false); }
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({
      tanggal:     row.tanggal || '',
      sistolik:    row.sistolik || '',
      diastolik:   row.diastolik || '',
      denyut_nadi: row.denyut_nadi || '',
      berat_badan: row.berat_badan || '',
      catatan:     row.catatan || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      await api.delete(`/tekanan/index.php?id=${id}`);
      showToast('Data dihapus.', 'success');
      load();
    } catch { showToast('Gagal menghapus.', 'error'); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <DashboardLayout role="pasien" active="catat">
      <main className="p-5 md:p-8 grid lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="card-soft p-6 lg:col-span-1 space-y-4 h-fit">
          <h3 className="font-semibold mb-1">{editId ? 'Edit Data Pemeriksaan' : 'Catat Tekanan Darah'}</h3>
          <div>
            <label className="text-sm font-medium block mb-1">Tanggal Pemeriksaan</label>
            <input type="date" value={form.tanggal} onChange={set('tanggal')} className="input-soft" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">Sistolik</label>
              <input type="number" value={form.sistolik} onChange={set('sistolik')} className="input-soft" placeholder="120" required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Diastolik</label>
              <input type="number" value={form.diastolik} onChange={set('diastolik')} className="input-soft" placeholder="80" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Denyut Nadi</label>
            <input type="number" value={form.denyut_nadi} onChange={set('denyut_nadi')} className="input-soft" placeholder="78 bpm" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Berat Badan (kg)</label>
            <input type="number" step="0.1" value={form.berat_badan} onChange={set('berat_badan')} className="input-soft" placeholder="65" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Catatan</label>
            <textarea value={form.catatan} onChange={set('catatan')} className="input-soft" rows="2" placeholder="contoh: setelah berolahraga"></textarea>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
              {loading ? <span><i className="fa-solid fa-spinner fa-spin mr-1"/>Menyimpan...</span> : editId ? 'Perbarui' : 'Simpan Data'}
            </button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); }} className="btn-outline px-4">Batal</button>}
          </div>
        </form>

        <div className="card-soft p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Data Pemeriksaan</h3>
            <span className="text-xs text-[#94A3B8]">Total {rows.length} pemeriksaan</span>
          </div>
          {fetching ? <p className="text-sm text-[#94A3B8]">Memuat data...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#94A3B8] border-b border-[#F1EDE3]">
                  <th className="py-2">Tanggal</th><th>Tekanan Darah</th><th>Nadi</th><th>Berat</th><th>Status</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => {
                  const st = statusOf(d.sistolik, d.diastolik);
                  return (
                    <tr key={d.id} className="border-b border-[#F8F5EC]">
                      <td className="py-3">{d.tanggal}</td>
                      <td>{d.sistolik}/{d.diastolik} mmHg</td>
                      <td>{d.denyut_nadi || '-'}</td>
                      <td>{d.berat_badan ? d.berat_badan + ' kg' : '-'}</td>
                      <td><span className={`badge-status ${st.cls}`}>{d.status || st.label}</span></td>
                      <td>
                        <div className="flex gap-1 py-1">
                          <button onClick={() => handleEdit(d)} className="text-xs btn-outline px-2 py-1"><i className="fa-solid fa-pen"/></button>
                          <button onClick={() => handleDelete(d.id)} className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"><i className="fa-solid fa-trash"/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!rows.length && <tr><td colSpan="6" className="py-8 text-center text-[#94A3B8]">Belum ada data pemeriksaan.</td></tr>}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
