import { useState, useEffect } from 'react';
import { showToast } from '../Toast';
import api from '../../api/axios';

// ── Sub-komponen: form kuis (dipakai ulang untuk pre & post) ──
function KuisForm({ soalList, onSubmit, submitting, judulTahap }) {
  const [jawaban, setJawaban] = useState({});

  const allAnswered = soalList.length > 0 && soalList.every(s => jawaban[s.id]);

  return (
    <div>
      <h4 className="font-display font-bold text-lg mb-1">{judulTahap}</h4>
      <p className="text-sm text-[#64748B] mb-5">Jawab semua pertanyaan berikut sebelum melanjutkan.</p>
      <div className="space-y-5">
        {soalList.map((s, i) => (
          <div key={s.id} className="border border-[#F1EDE3] rounded-xl p-4">
            <p className="font-medium text-sm mb-3">{i + 1}. {s.pertanyaan}</p>
            <div className="space-y-2">
              {['a', 'b', 'c', 'd'].map(k => (
                <label key={k}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition
                    ${jawaban[s.id] === k ? 'border-primary bg-secondary' : 'border-[#F1EDE3] hover:bg-secondary/50'}`}>
                  <input type="radio" name={`soal-${s.id}`} className="accent-primary"
                    checked={jawaban[s.id] === k}
                    onChange={() => setJawaban(p => ({ ...p, [s.id]: k }))} />
                  <span className="font-medium uppercase text-xs text-[#94A3B8]">{k}</span>
                  <span>{s[`pilihan_${k}`]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button disabled={!allAnswered || submitting} onClick={() => onSubmit(jawaban)}
        className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
        {submitting ? <span><i className="fa-solid fa-spinner fa-spin mr-1.5" />Mengirim...</span> : 'Kirim Jawaban'}
      </button>
      {!allAnswered && <p className="text-xs text-center text-[#94A3B8] mt-2">Jawab semua soal dulu ya, tinggal {soalList.length - Object.keys(jawaban).length} lagi.</p>}
    </div>
  );
}

// ── Sub-komponen: tampilan skor hasil kuis ──
function SkorResult({ hasil, onLanjut, labelLanjut }) {
  const warna = hasil.skor >= 80 ? 'text-green-600' : hasil.skor >= 60 ? 'text-orange-500' : 'text-red-500';
  return (
    <div className="text-center py-4">
      <div className={`text-5xl font-display font-bold ${warna} mb-2`}>{hasil.skor}</div>
      <p className="text-sm text-[#64748B] mb-6">{hasil.benar} dari {hasil.total} jawaban benar</p>
      <button onClick={onLanjut} className="btn-primary px-8">{labelLanjut}</button>
    </div>
  );
}

export default function PembelajaranModal({ edukasi, onClose }) {
  // step: loading -> pretest -> konten -> posttest -> hasil-pre -> hasil-post -> selesai
  const [step, setStep] = useState('loading');
  const [preSoal, setPreSoal] = useState([]);
  const [postSoal, setPostSoal] = useState([]);
  const [hasilPre, setHasilPre] = useState(null);
  const [hasilPost, setHasilPost] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [preRes, postRes] = await Promise.all([
          api.get(`/edukasi-kuis/index.php?edukasi_id=${edukasi.id}&tipe=pre`),
          api.get(`/edukasi-kuis/index.php?edukasi_id=${edukasi.id}&tipe=post`),
        ]);
        setPreSoal(preRes.data.data || []);
        setPostSoal(postRes.data.data || []);
        setStep((preRes.data.data || []).length > 0 ? 'pretest' : 'konten');
      } catch {
        showToast('Gagal memuat kuis.', 'error');
        setStep('konten'); // tetap izinkan baca konten walau kuis gagal dimuat
      }
    })();
  }, [edukasi.id]);

  const submitPre = async (jawaban) => {
    setSubmitting(true);
    try {
      const res = await api.post('/edukasi-kuis/index.php?action=submit', { edukasi_id: edukasi.id, tipe: 'pre', jawaban });
      setHasilPre(res.data.data);
      setStep('hasil-pre');
    } catch (err) { showToast(err.response?.data?.message || 'Gagal mengirim jawaban.', 'error'); }
    finally { setSubmitting(false); }
  };

  const submitPost = async (jawaban) => {
    setSubmitting(true);
    try {
      const res = await api.post('/edukasi-kuis/index.php?action=submit', { edukasi_id: edukasi.id, tipe: 'post', jawaban });
      setHasilPost(res.data.data);
      setStep('hasil-post');
    } catch (err) { showToast(err.response?.data?.message || 'Gagal mengirim jawaban.', 'error'); }
    finally { setSubmitting(false); }
  };

  const goToPostOrFinish = () => {
    setStep(postSoal.length > 0 ? 'posttest' : 'selesai');
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold">Belajar: {edukasi.judul}</h3>
            <button onClick={onClose} className="text-[#94A3B8] hover:text-[#475569]"><i className="fa-solid fa-xmark text-lg" /></button>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-1.5 mb-6 mt-3">
            {['Pre-Test', 'Materi', 'Post-Test'].map((label, i) => {
              const active =
                (i === 0 && ['pretest', 'hasil-pre'].includes(step)) ||
                (i === 1 && step === 'konten') ||
                (i === 2 && ['posttest', 'hasil-post'].includes(step));
              const done =
                (i === 0 && ['konten', 'posttest', 'hasil-post', 'selesai'].includes(step)) ||
                (i === 1 && ['posttest', 'hasil-post', 'selesai'].includes(step)) ||
                (i === 2 && step === 'selesai');
              return (
                <div key={label} className="flex-1">
                  <div className={`h-1.5 rounded-full ${done ? 'bg-green-400' : active ? 'bg-primary' : 'bg-secondary'}`} />
                  <p className={`text-[10px] mt-1 text-center ${active ? 'text-primary font-medium' : 'text-[#94A3B8]'}`}>{label}</p>
                </div>
              );
            })}
          </div>

          {step === 'loading' && (
            <p className="text-center text-sm text-[#94A3B8] py-10"><i className="fa-solid fa-spinner fa-spin mr-2" />Memuat kuis...</p>
          )}

          {step === 'pretest' && (
            <KuisForm soalList={preSoal} onSubmit={submitPre} submitting={submitting} judulTahap="Pre-Test" />
          )}

          {step === 'hasil-pre' && hasilPre && (
            <SkorResult hasil={hasilPre} onLanjut={() => setStep('konten')} labelLanjut="Lanjut ke Materi" />
          )}

          {step === 'konten' && (
            <div>
              <img src={edukasi.thumbnail} className="w-full h-40 object-cover rounded-xl mb-4" alt={edukasi.judul} />
              <p className="text-sm text-[#475569] mb-5 whitespace-pre-line">{edukasi.isi || edukasi.ringkasan}</p>
              <div className="flex flex-col gap-2 mb-6">
                {edukasi.url_artikel && (
                  <a href={edukasi.url_artikel} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-center py-2.5 rounded-lg bg-primary text-white">
                    <i className="fa-regular fa-file-lines mr-1.5" />Baca Artikel Lengkap
                  </a>
                )}
                {edukasi.url_video && (
                  <a href={edukasi.url_video} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-center py-2.5 rounded-lg border border-[#F1EDE3]">
                    <i className="fa-brands fa-youtube mr-1.5 text-red-500" />Tonton Video
                  </a>
                )}
                {edukasi.url_tiktok && (
                  <a href={edukasi.url_tiktok} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-center py-2.5 rounded-lg border border-[#F1EDE3]">
                    <i className="fa-brands fa-tiktok mr-1.5" />Lihat TikTok
                  </a>
                )}
              </div>
              <button onClick={goToPostOrFinish} className="btn-primary w-full">
                Saya Sudah Membaca/Menonton — Lanjut
              </button>
            </div>
          )}

          {step === 'posttest' && (
            <KuisForm soalList={postSoal} onSubmit={submitPost} submitting={submitting} judulTahap="Post-Test" />
          )}

          {step === 'hasil-post' && hasilPost && (
            <div>
              <SkorResult hasil={hasilPost} onLanjut={() => setStep('selesai')} labelLanjut="Selesai" />
              {hasilPre && (
                <div className="mt-4 p-4 rounded-xl bg-secondary text-center">
                  <p className="text-sm text-[#64748B]">
                    Skor Pre-Test: <span className="font-semibold">{hasilPre.skor}</span> → Skor Post-Test: <span className="font-semibold">{hasilPost.skor}</span>
                  </p>
                  <p className={`text-sm font-medium mt-1 ${hasilPost.skor >= hasilPre.skor ? 'text-green-600' : 'text-orange-500'}`}>
                    {hasilPost.skor >= hasilPre.skor
                      ? `Pemahaman kamu meningkat ${hasilPost.skor - hasilPre.skor} poin! 🎉`
                      : 'Yuk pelajari lagi materinya biar makin paham.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'selesai' && (
            <div className="text-center py-8">
              <i className="fa-solid fa-circle-check text-5xl text-green-500 mb-4" />
              <p className="font-semibold mb-1">Selesai!</p>
              <p className="text-sm text-[#64748B] mb-6">Terima kasih sudah mempelajari materi ini.</p>
              <button onClick={onClose} className="btn-primary px-8">Tutup</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}