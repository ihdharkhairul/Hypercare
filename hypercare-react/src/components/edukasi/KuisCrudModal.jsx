import { useState, useEffect } from 'react';
import { showToast } from '../Toast';
import api from '../../api/axios';

const emptyForm = { pertanyaan: '', pilihan_a: '', pilihan_b: '', pilihan_c: '', pilihan_d: '', jawaban_benar: 'a' };

export default function KuisCrudModal({ edukasi, onClose }) {
  const [tab, setTab] = useState('pre');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async (tipe) => {
    setLoading(true);
    try {
      const res = await api.get(`/edukasi-kuis/index.php?edukasi_id=${edukasi.id}&tipe=${tipe}&admin=1`);
      setList(res.data.data || []);
    } catch { showToast('Gagal memuat soal.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(tab); setForm(emptyForm); setEditId(null); }, [tab]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleEdit = (q) => {
    setEditId(q.id);
    setForm({
      pertanyaan: q.pertanyaan, pilihan_a: q.pilihan_a, pilihan_b: q.pilihan_b,
      pilihan_c: q.pilihan_c, pilihan_d: q.pilihan_d, jawaban_benar: q.jawaban_benar,
    });
  };

  const handleCancelEdit = () => { setEditId(null); setForm(emptyForm); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/edukasi-kuis/index.php?id=${editId}`, form);
        showToast('Soal diperbarui.', 'success');
      } else {
        await api.post('/edukasi-kuis/index.php', { ...form, edukasi_id: edukasi.id, tipe: tab, urutan: list.length + 1 });
        showToast('Soal ditambahkan.', 'success');
      }
      setForm(emptyForm); setEditId(null);
      load(tab);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan.', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus soal ini?')) return;
    try {
      await api.delete(`/edukasi-kuis/index.php?id=${id}`);
      showToast('Soal dihapus.', 'success');
      load(tab);
    } catch { showToast('Gagal menghapus.', 'error'); }
  };

  const pilihanLabel = { a: 'A', b: 'B', c: 'C', d: 'D' };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-lg">Kelola Kuis</h3>
            <button onClick={onClose} className="text-[#94A3B8] hover:text-[#475569]"><i className="fa-solid fa-xmark text-lg" /></button>
          </div>
          <p className="text-sm text-[#94A3B8] mb-4 line-clamp-1">{edukasi.judul}</p>

          {/* Tab Pre/Post */}
          <div className="flex gap-2 mb-5">
            <button onClick={() => setTab('pre')}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'pre' ? 'bg-primary text-white' : 'bg-secondary text-[#64748B]'}`}>
              Pre-Test
            </button>
            <button onClick={() => setTab('post')}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'post' ? 'bg-primary text-white' : 'bg-secondary text-[#64748B]'}`}>
              Post-Test
            </button>
          </div>

          {/* Daftar Soal */}
          <div className="space-y-3 mb-6">
            {loading ? (
              <p className="text-sm text-[#94A3B8] text-center py-6">Memuat...</p>
            ) : list.length ? list.map((q, i) => (
              <div key={q.id} className="border border-[#F1EDE3] rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-sm flex-1">{i + 1}. {q.pertanyaan}</p>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => handleEdit(q)} className="text-xs btn-outline px-2 py-1"><i className="fa-solid fa-pen" /></button>
                    <button onClick={() => handleDelete(q.id)} className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"><i className="fa-solid fa-trash" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  {['a', 'b', 'c', 'd'].map(k => (
                    <div key={k} className={`px-2 py-1 rounded-lg ${q.jawaban_benar === k ? 'bg-green-50 text-green-700 font-medium' : 'text-[#64748B]'}`}>
                      {pilihanLabel[k]}. {q[`pilihan_${k}`]} {q.jawaban_benar === k && <i className="fa-solid fa-check ml-1" />}
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <p className="text-sm text-[#94A3B8] text-center py-6">Belum ada soal {tab === 'pre' ? 'Pre-Test' : 'Post-Test'}. Tambahkan lewat form di bawah.</p>
            )}
          </div>

          {/* Form Tambah/Edit Soal */}
          <div className="border-t border-[#F1EDE3] pt-4">
            <h4 className="font-semibold text-sm mb-3">{editId ? 'Edit Soal' : `Tambah Soal ${tab === 'pre' ? 'Pre-Test' : 'Post-Test'}`}</h4>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Pertanyaan</label>
                <textarea className="input-soft" rows="2" value={form.pertanyaan} onChange={set('pertanyaan')} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['a', 'b', 'c', 'd'].map(k => (
                  <div key={k}>
                    <label className="text-sm font-medium block mb-1">Pilihan {pilihanLabel[k]}</label>
                    <input className="input-soft" value={form[`pilihan_${k}`]} onChange={set(`pilihan_${k}`)} required />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Jawaban Benar</label>
                <select className="input-soft" value={form.jawaban_benar} onChange={set('jawaban_benar')}>
                  <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                  {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Soal'}
                </button>
                {editId && <button type="button" onClick={handleCancelEdit} className="btn-outline px-4">Batal Edit</button>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}