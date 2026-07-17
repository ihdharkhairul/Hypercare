import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { showToast } from '../components/Toast';
import { FALLBACK_THUMB } from '../utils/fallbackImage';
import KuisCrudModal from '../components/edukasi/KuisCrudModal';
import api from '../api/axios';

const TRUSTED_SOURCES = ['WHO', 'Kemenkes RI', 'SATUSEHAT', 'Mayo Clinic', 'Cleveland Clinic', 'CDC', 'NHS', 'Halodoc', 'Alodokter'];
const KATEGORI_OPTIONS = ['Pengertian', 'Pengobatan', 'Nutrisi', 'Gaya Hidup', 'Risiko', 'Pemantauan', 'Khusus'];

const emptyForm = {
  judul: '', ringkasan: '', isi: '', thumbnail: '', kategori: KATEGORI_OPTIONS[0],
  penulis: '', sumber: TRUSTED_SOURCES[0], waktu_baca: 5,
  url_artikel: '', url_video: '', url_reel: '', url_tiktok: '', is_published: 1,
};

export default function PerawatEdukasi() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [kuisModal, setKuisModal] = useState(null); // menyimpan objek edukasi yang lagi dikelola kuisnya
  const [editId, setEditId]   = useState(null);
  const [form, setForm]       = useState(emptyForm);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');

  const load = async () => {
    setLoading(true);
    try {
      // ?admin=1 supaya draft (belum diterbitkan) juga ikut tampil di sini
      const res = await api.get('/edukasi/index.php?admin=1');
      setList(res.data.data?.list || []);
    } catch { showToast('Gagal memuat data.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (e) => {
    setEditId(e.id);
    setForm({
      judul: e.judul, ringkasan: e.ringkasan || '', isi: e.isi || '',
      thumbnail: e.thumbnail || '', kategori: e.kategori || KATEGORI_OPTIONS[0],
      penulis: e.penulis, sumber: e.sumber || TRUSTED_SOURCES[0],
      waktu_baca: e.waktu_baca || 5,
      url_artikel: e.url_artikel || '', url_video: e.url_video || '', url_reel: e.url_reel || '', url_tiktok: e.url_tiktok || '',
      is_published: e.is_published,
    });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/edukasi/index.php?id=${editId}`, form);
        showToast('Konten diperbarui.', 'success');
      } else {
        await api.post('/edukasi/index.php', form);
        showToast('Konten edukasi dikirim & tampil ke pasien.', 'success');
      }
      closeModal();
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan.', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, judul) => {
    if (!confirm(`Hapus konten "${judul}"?`)) return;
    try {
      await api.delete(`/edukasi/index.php?id=${id}`);
      showToast('Konten dihapus.', 'success');
      load();
    } catch { showToast('Gagal menghapus.', 'error'); }
  };

  const handleToggle = async (id) => {
    try {
      await api.put(`/edukasi/index.php?id=${id}&action=toggle`);
      load();
    } catch { showToast('Gagal mengubah status.', 'error'); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const filtered = list.filter(e => e.judul.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout role="perawat" active="edukasi">
      <main className="p-5 md:p-8">
        <div className="mb-6">
          <h1 className="font-display font-bold text-xl md:text-2xl">Kelola Edukasi</h1>
          <p className="text-[#64748B] text-sm mt-1">Konten yang kamu terbitkan di sini akan langsung muncul di halaman Edukasi dan Dashboard pasien.</p>
        </div>

        <div className="card-soft p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="font-display font-bold text-lg">Daftar Konten <span className="text-[#94A3B8] font-normal text-sm">({list.length})</span></h2>
            <div className="flex gap-3 flex-wrap">
              <input className="input-soft max-w-xs text-sm" placeholder="Cari judul..." value={search} onChange={e => setSearch(e.target.value)} />
              <button onClick={openAdd} className="btn-primary text-sm"><i className="fa-solid fa-plus mr-1"></i>Tambah Konten</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#94A3B8] border-b border-[#F1EDE3]">
                  <th className="py-2">Thumbnail</th><th>Judul</th><th>Kategori</th><th>Sumber</th><th>Status</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="py-8 text-center text-[#94A3B8]">Memuat...</td></tr>
                ) : filtered.length ? filtered.map(e => (
                  <tr key={e.id} className="border-b border-[#F8F5EC]">
                    <td className="py-3"><img src={e.thumbnail || FALLBACK_THUMB} className="w-14 h-10 rounded-lg object-cover" alt=""
                      onError={(ev) => { ev.target.onerror = null; ev.target.src = FALLBACK_THUMB; }} /></td>
                    <td className="max-w-[220px]"><p className="font-medium truncate">{e.judul}</p><p className="text-xs text-[#94A3B8] truncate">{e.penulis}</p></td>
                    <td>{e.kategori || '-'}</td>
                    <td>{e.sumber || '-'}</td>
                    <td>
                      <button onClick={() => handleToggle(e.id)}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${e.is_published ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {e.is_published ? 'Terbit' : 'Draft'}
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-1.5 py-1">
                        <button onClick={() => setKuisModal(e)} className="text-xs px-2 py-1 rounded-lg border border-primary/30 text-primary hover:bg-secondary" title="Kelola Kuis">
                          <i className="fa-solid fa-clipboard-question" />
                        </button>
                        <button onClick={() => openEdit(e)} className="text-xs btn-outline px-2 py-1"><i className="fa-solid fa-pen"/></button>
                        <button onClick={() => handleDelete(e.id, e.judul)} className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"><i className="fa-solid fa-trash"/></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="py-8 text-center text-[#94A3B8]">Belum ada konten edukasi. Klik "Tambah Konten" untuk mulai.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Form */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{editId ? 'Edit Konten Edukasi' : 'Tambah Konten Edukasi'}</h3>
                <button onClick={closeModal} className="text-[#94A3B8] hover:text-[#475569]"><i className="fa-solid fa-xmark text-lg"/></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div><label className="text-sm font-medium block mb-1">Judul</label>
                  <input className="input-soft" value={form.judul} onChange={set('judul')} required /></div>

                <div><label className="text-sm font-medium block mb-1">Ringkasan</label>
                  <textarea className="input-soft" rows="2" value={form.ringkasan} onChange={set('ringkasan')} placeholder="Ringkasan singkat untuk card..." /></div>

                <div><label className="text-sm font-medium block mb-1">Isi Lengkap (opsional)</label>
                  <textarea className="input-soft" rows="3" value={form.isi} onChange={set('isi')} placeholder="Konten lengkap jika ditampilkan di dalam aplikasi..." /></div>

                <div><label className="text-sm font-medium block mb-1">URL Thumbnail</label>
                  <input className="input-soft" value={form.thumbnail} onChange={set('thumbnail')} placeholder="https://..." /></div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium block mb-1">Kategori</label>
                    <select className="input-soft" value={form.kategori} onChange={set('kategori')}>
                      {KATEGORI_OPTIONS.map(k => <option key={k}>{k}</option>)}
                    </select></div>
                  <div><label className="text-sm font-medium block mb-1">Waktu Baca (menit)</label>
                    <input type="number" min="1" max="60" className="input-soft" value={form.waktu_baca} onChange={set('waktu_baca')} /></div>
                  <div><label className="text-sm font-medium block mb-1">Penulis</label>
                    <input className="input-soft" value={form.penulis} onChange={set('penulis')} required /></div>
                  <div><label className="text-sm font-medium block mb-1">Sumber Terpercaya</label>
                    <select className="input-soft" value={form.sumber} onChange={set('sumber')}>
                      {TRUSTED_SOURCES.map(s => <option key={s}>{s}</option>)}
                    </select></div>
                </div>

                <hr className="border-[#F1EDE3]" />
                <p className="text-xs text-[#94A3B8]">Tautan harus berasal dari sumber resmi: WHO, Kemenkes, SATUSEHAT, Mayo Clinic, Cleveland Clinic, CDC, NHS, Halodoc, atau Alodokter (artikel) — YouTube (video) — Instagram (reel) — TikTok.</p>

                <div><label className="text-sm font-medium block mb-1">URL Artikel</label>
                  <input className="input-soft" value={form.url_artikel} onChange={set('url_artikel')} placeholder="https://www.who.int/..." /></div>
                <div><label className="text-sm font-medium block mb-1">URL Video YouTube</label>
                  <input className="input-soft" value={form.url_video} onChange={set('url_video')} placeholder="https://www.youtube.com/watch?v=..." /></div>
                <div><label className="text-sm font-medium block mb-1">URL Instagram Reel</label>
                  <input className="input-soft" value={form.url_reel} onChange={set('url_reel')} placeholder="https://www.instagram.com/reel/..." /></div>
                <div><label className="text-sm font-medium block mb-1">URL TikTok</label>
                  <input className="input-soft" value={form.url_tiktok} onChange={set('url_tiktok')} placeholder="https://www.tiktok.com/@akun/video/..." /></div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_published" checked={!!form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked ? 1 : 0 }))} className="w-4 h-4 accent-primary" />
                  <label htmlFor="is_published" className="text-sm">Terbitkan sekarang (langsung tampil ke pasien)</label>
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                    {saving ? <span><i className="fa-solid fa-spinner fa-spin mr-1"/>Menyimpan...</span> : 'Simpan & Kirim'}
                  </button>
                  <button type="button" onClick={closeModal} className="btn-outline px-4">Batal</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {kuisModal && <KuisCrudModal edukasi={kuisModal} onClose={() => setKuisModal(null)} />}
    </DashboardLayout>
  );
}