import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { showToast } from '../components/Toast';
import api from '../api/axios';

const badgeCls = (s) => {
  if (!s) return 'badge-normal';
  if (s.includes('Tingkat 2')) return 'badge-tk2';
  if (s.includes('Tingkat 1')) return 'badge-tk1';
  if (s.includes('Pra'))       return 'badge-pra';
  return 'badge-normal';
};

const emptyForm = { tanggal:'', sistolik:'', diastolik:'', denyut_nadi:'', berat_badan:'', catatan:'' };

export default function MonitoringPasien() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const pasienId   = params.get('id');

  const chartRef   = useRef(null);
  const chartInst  = useRef(null);

  const [pasien, setPasien]   = useState(null);
  const [rows, setRows]       = useState([]);
  const [stat, setStat]       = useState({});
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(emptyForm);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    if (!pasienId) return;
    setLoading(true);
    try {
      const [r1, r2, r3] = await Promise.all([
        api.get(`/pasien/index.php?id=${pasienId}`),
        api.get(`/tekanan/index.php?pasien_id=${pasienId}`),
        api.get(`/tekanan/index.php?action=stat&pasien_id=${pasienId}`),
      ]);
      setPasien(r1.data.data);
      setRows(r2.data.data || []);
      setStat(r3.data.data || {});
    } catch { showToast('Gagal memuat data pasien.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (pasienId) loadData(); }, [pasienId]);

  useEffect(() => {
    if (loading || !rows.length) return;
    const load = () => {
      if (!window.Chart) return;
      if (chartInst.current) chartInst.current.destroy();
      const rev = [...rows].reverse().slice(-10);
      chartInst.current = new window.Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: rev.map(d => d.tanggal),
          datasets: [
            { label: 'Sistolik',  data: rev.map(d => d.sistolik),  borderColor:'#F4A300', backgroundColor:'#F4A30022', tension:.4, fill:true },
            { label: 'Diastolik', data: rev.map(d => d.diastolik), borderColor:'#94A3B8', backgroundColor:'#94A3B822', tension:.4, fill:true },
          ],
        },
        options: { scales: { y: { suggestedMin:60, suggestedMax:180 } } },
      });
    };
    if (window.Chart) load();
    else { const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'; s.onload=load; document.head.appendChild(s); }
    return () => { chartInst.current?.destroy(); };
  }, [loading, rows]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, pasien_id: pasienId };
    try {
      if (editId) {
        await api.put(`/tekanan/index.php?id=${editId}`, payload);
        showToast('Data diperbarui.', 'success'); setEditId(null);
      } else {
        await api.post('/tekanan/index.php', payload);
        showToast('Pemeriksaan berhasil dicatat.', 'success');
      }
      setForm(emptyForm); setShowForm(false); loadData();
    } catch (err) { showToast(err.response?.data?.message||'Gagal.','error'); }
    finally { setSaving(false); }
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({ tanggal:row.tanggal||'', sistolik:row.sistolik||'', diastolik:row.diastolik||'', denyut_nadi:row.denyut_nadi||'', berat_badan:row.berat_badan||'', catatan:row.catatan||'' });
    setShowForm(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus data pemeriksaan ini?')) return;
    try { await api.delete(`/tekanan/index.php?id=${id}`); showToast('Dihapus.','success'); loadData(); }
    catch { showToast('Gagal hapus.','error'); }
  };

  if (!pasienId) return (
    <DashboardLayout role="perawat" active="monitoring">
      <main className="p-5 md:p-8">
        <div className="card-soft p-8 text-center">
          <p className="text-[#94A3B8] mb-4">Pilih pasien dari halaman Data Pasien untuk melihat monitoring.</p>
          <button onClick={() => navigate('/data-pasien')} className="btn-primary">Ke Data Pasien</button>
        </div>
      </main>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="perawat" active="monitoring">
      <main className="p-5 md:p-8 space-y-6">
        {/* Header pasien */}
        {pasien && (
        <div className="card-soft p-5 flex items-center gap-4 flex-wrap">
          <img src={pasien.foto || `https://i.pravatar.cc/150?u=${pasien.id}`} className="w-16 h-16 rounded-full object-cover border-4 border-secondary" alt={pasien.nama} />
          <div className="flex-1">
            <h3 className="font-semibold">{pasien.nama}</h3>
            <p className="text-xs text-[#94A3B8]">{pasien.tanggal_lahir ? new Date().getFullYear() - new Date(pasien.tanggal_lahir).getFullYear() + ' Tahun' : ''} · {pasien.jenis_kelamin || '-'} · {pasien.no_hp || '-'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge-status ${badgeCls(stat.status_terakhir)}`}>Status: {stat.status_terakhir || 'Belum ada data'}</span>
            <button onClick={() => { setShowForm(p=>!p); setEditId(null); setForm(emptyForm); }} className="btn-primary text-sm">
              <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'} mr-1`}/>{showForm ? 'Tutup' : 'Tambah Pemeriksaan'}
            </button>
          </div>
        </div>
        )}

        {/* Form tambah/edit */}
        {showForm && (
        <form onSubmit={handleSave} className="card-soft p-5 grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Tanggal</label>
            <input type="date" value={form.tanggal} onChange={e=>setForm(p=>({...p,tanggal:e.target.value}))} className="input-soft" required />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Sistolik</label>
            <input type="number" value={form.sistolik} onChange={e=>setForm(p=>({...p,sistolik:e.target.value}))} className="input-soft" placeholder="120" required />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Diastolik</label>
            <input type="number" value={form.diastolik} onChange={e=>setForm(p=>({...p,diastolik:e.target.value}))} className="input-soft" placeholder="80" required />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Denyut Nadi</label>
            <input type="number" value={form.denyut_nadi} onChange={e=>setForm(p=>({...p,denyut_nadi:e.target.value}))} className="input-soft" placeholder="72" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Berat Badan (kg)</label>
            <input type="number" step="0.1" value={form.berat_badan} onChange={e=>setForm(p=>({...p,berat_badan:e.target.value}))} className="input-soft" placeholder="65" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Catatan</label>
            <input value={form.catatan} onChange={e=>setForm(p=>({...p,catatan:e.target.value}))} className="input-soft" placeholder="Keterangan..." />
          </div>
          <div className="sm:col-span-3 flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? <span><i className="fa-solid fa-spinner fa-spin mr-1"/>Menyimpan...</span> : editId ? 'Perbarui' : 'Simpan Pemeriksaan'}
            </button>
            {editId && <button type="button" onClick={()=>{setEditId(null);setForm(emptyForm);}} className="btn-outline px-4">Batal</button>}
          </div>
        </form>
        )}

        {/* Grafik + Kategori */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card-soft p-5 lg:col-span-2">
            <h3 className="font-semibold mb-4">Grafik Tekanan Darah</h3>
            {loading ? <p className="text-sm text-[#94A3B8] text-center py-8">Memuat...</p>
              : rows.length ? <canvas ref={chartRef} height="140"></canvas>
              : <p className="text-sm text-[#94A3B8] text-center py-8">Belum ada data pemeriksaan.</p>}
          </div>
          <div className="card-soft p-5">
            <h3 className="font-semibold mb-4">Ringkasan Statistik</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#94A3B8]">Total Pemeriksaan</span><span className="font-semibold">{stat.total || 0}</span></div>
              <div className="flex justify-between"><span className="text-[#94A3B8]">Rata-rata Sistolik</span><span className="font-semibold">{stat.avg_sistol || '—'} mmHg</span></div>
              <div className="flex justify-between"><span className="text-[#94A3B8]">Rata-rata Diastolik</span><span className="font-semibold">{stat.avg_diastol || '—'} mmHg</span></div>
              <div className="flex justify-between"><span className="text-[#94A3B8]">Tertinggi</span><span className="font-semibold">{stat.max_sistol || '—'} mmHg</span></div>
              <hr className="border-[#F1EDE3]" />
              <div className="space-y-2">
                {[['Normal','< 130/85','badge-normal'],['Pra Hipertensi','130-139/85-89','badge-pra'],['Hipertensi Tk.1','140-159/90-99','badge-tk1'],['Hipertensi Tk.2','≥ 160/100','badge-tk2']].map(([l,r,c]) => (
                  <div key={l} className="flex items-center justify-between"><span className={`badge-status ${c}`}>{l}</span><span className="text-[#94A3B8] text-xs">{r}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabel riwayat */}
        <div className="card-soft p-5">
          <h3 className="font-semibold mb-4">Riwayat Pemeriksaan</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#94A3B8] border-b border-[#F1EDE3]">
                  <th className="py-2">Tanggal</th><th>Tekanan Darah</th><th>Nadi</th><th>Berat</th><th>Catatan</th><th>Status</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="7" className="py-8 text-center text-[#94A3B8]">Memuat...</td></tr>
                : rows.map(d => (
                  <tr key={d.id} className="border-b border-[#F8F5EC]">
                    <td className="py-3">{d.tanggal}</td>
                    <td>{d.sistolik}/{d.diastolik} mmHg</td>
                    <td>{d.denyut_nadi || '-'}</td>
                    <td>{d.berat_badan ? d.berat_badan + ' kg' : '-'}</td>
                    <td className="max-w-[120px] truncate text-[#64748B]">{d.catatan || '-'}</td>
                    <td><span className={`badge-status ${badgeCls(d.status)}`}>{d.status || 'Normal'}</span></td>
                    <td>
                      <div className="flex gap-1 py-1">
                        <button onClick={() => handleEdit(d)} className="text-xs btn-outline px-2 py-1"><i className="fa-solid fa-pen"/></button>
                        <button onClick={() => handleDelete(d.id)} className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"><i className="fa-solid fa-trash"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && !rows.length && <tr><td colSpan="7" className="py-8 text-center text-[#94A3B8]">Belum ada data pemeriksaan.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
