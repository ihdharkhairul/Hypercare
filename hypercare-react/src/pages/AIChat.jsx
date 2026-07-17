import { useState, useRef, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { showToast } from '../components/Toast';
import { HC_AI_QUICK } from '../data/data';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function nowTime(dateStr) {
  const d = dateStr ? new Date(dateStr.replace(' ', 'T')) : new Date();
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// Bubble kecil untuk rekomendasi konten edukasi dari AI
function RecommendCard({ items }) {
  if (!items || !items.length) return null;
  return (
    <div className="mt-2 space-y-2">
      {items.map((e) => (
        <div key={e.id} className="bg-white border border-[#F1EDE3] rounded-xl p-2.5 flex gap-2.5 items-start max-w-[280px]">
          <img
            src={e.thumbnail || 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=100'}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            alt={e.judul}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#1E293B] line-clamp-2 leading-snug">{e.judul}</p>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {e.url_artikel && (
                <a href={e.url_artikel} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-medium px-2 py-1 rounded-full bg-primary text-white text-hover">
                  <i className="fa-regular fa-file-lines mr-1"></i>Artikel
                </a>
              )}
              {e.url_video && (
                <a href={e.url_video} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-medium px-2 py-1 rounded-full border border-[#F1EDE3] text-[#475569] hover:bg-secondary">
                  <i className="fa-brands fa-youtube mr-1 text-red-500"></i>Video
                </a>
              )}
              {e.url_reel && (
                <a href={e.url_reel} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-medium px-2 py-1 rounded-full border border-[#F1EDE3] text-[#475569] hover:bg-secondary">
                  <i className="fa-brands fa-instagram mr-1 text-pink-500"></i>Reel
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [msg, setMsg]           = useState('');
  const [typing, setTyping]     = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [failedMsg, setFailedMsg]   = useState(null); // pesan terakhir yang gagal, untuk tombol Retry
  const bodyRef = useRef(null);

  // ── Muat riwayat percakapan dari database saat halaman dibuka ──
  useEffect(() => {
    let active = true;
    api.get('/ai-chat/index.php?action=history')
      .then(res => {
        if (!active) return;
        const history = (res.data.data || []).map(m => ({
          id: m.id,
          from: m.role === 'user' ? 'me' : 'them',
          text: m.message,
          time: nowTime(m.created_at),
          recommend: m.recommend || [],
        }));
        if (history.length) {
          setMessages(history);
        } else {
          // Sapaan default jika belum pernah chat sama sekali
          setMessages([{
            from: 'them',
            text: 'Halo 👋 Saya adalah AI Health Assistant HyperCare. Saya siap membantu menjawab pertanyaan seputar hipertensi, tekanan darah, pola makan sehat, olahraga, dan gaya hidup sehat.',
            time: nowTime(),
            recommend: [],
          }]);
        }
      })
      .catch(() => {
        showToast('Gagal memuat riwayat percakapan.', 'error');
        setMessages([{
          from: 'them',
          text: 'Halo 👋 Saya adalah AI Health Assistant HyperCare. Saya siap membantu menjawab pertanyaan seputar hipertensi, tekanan darah, pola makan sehat, olahraga, dan gaya hidup sehat.',
          time: nowTime(),
          recommend: [],
        }]);
      })
      .finally(() => { if (active) setLoadingHistory(false); });
    return () => { active = false; };
  }, []);

  // ── Auto scroll ke bawah setiap ada pesan baru / status typing berubah ──
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing]);

  // ── Kirim pesan ke backend PHP (yang lalu meneruskan ke OpenAI) ──
  const sendToServer = useCallback(async (text) => {
    setTyping(true);
    setFailedMsg(null);
    try {
      const res = await api.post('/ai-chat/index.php?action=send', { message: text });
      const data = res.data.data;
      setMessages(prev => [...prev, {
        id: data.id,
        from: 'them',
        text: data.message,
        time: nowTime(data.created_at),
        recommend: data.recommend || [],
      }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gagal menghubungi AI. Periksa koneksi Anda.';
      showToast(errMsg, 'error');
      setFailedMsg(text); // simpan supaya bisa di-retry
      setMessages(prev => [...prev, {
        from: 'them',
        text: '⚠️ Maaf, saya sedang mengalami gangguan. Silakan coba lagi.',
        time: nowTime(),
        recommend: [],
        isError: true,
      }]);
    } finally {
      setTyping(false);
    }
  }, []);

  const askAI = (text) => {
    setMessages(prev => [...prev, { from: 'me', text, time: nowTime() }]);
    sendToServer(text);
  };

  const handleRetry = () => {
    if (!failedMsg) return;
    // Hapus bubble error terakhir sebelum retry
    setMessages(prev => {
      const copy = [...prev];
      if (copy.length && copy[copy.length - 1].isError) copy.pop();
      return copy;
    });
    sendToServer(failedMsg);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!msg.trim() || typing) return;
    askAI(msg.trim());
    setMsg('');
  };

  return (
    <DashboardLayout role="pasien" active="aichat">
      <main className="p-5 md:p-8">
        <div className="card-soft flex flex-col h-[calc(100vh-150px)] overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-[#F1EDE3]">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div>
              <p className="font-medium text-sm">AI Health Assistant HyperCare</p>
              <p className="text-xs text-[#22A559]"><i className="fa-solid fa-circle text-[8px]"></i> Selalu Aktif</p>
            </div>
          </div>

          <div ref={bodyRef} className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4 bg-[#FFFDF8]">
            {loadingHistory ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-sm text-[#94A3B8]"><i className="fa-solid fa-spinner fa-spin mr-2"></i>Memuat percakapan...</p>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={m.id ?? i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[80%]">
                      <div className={`${m.from === 'me' ? 'chat-bubble-me' : 'chat-bubble-other'} px-4 py-2 text-sm ${m.isError ? 'border border-red-200' : ''}`}>
                        {m.text}
                        <div className="text-[10px] opacity-70 mt-1 text-right">{m.time}</div>
                      </div>
                      {m.from === 'them' && <RecommendCard items={m.recommend} />}
                      {m.isError && (
                        <button onClick={handleRetry} className="text-xs text-primary font-medium mt-1.5 flex items-center gap-1 hover:underline">
                          <i className="fa-solid fa-rotate-right"></i> Coba lagi
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="chat-bubble-other px-4 py-3 flex gap-1">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="px-5 pb-3 flex gap-2 flex-wrap">
            {HC_AI_QUICK.map((q, i) => (
              <button
                key={i}
                disabled={typing}
                className="text-xs bg-secondary text-[#8A6212] px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => askAI(q)}
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-[#F1EDE3] flex gap-2">
            <input
              value={msg}
              onChange={e => setMsg(e.target.value)}
              className="input-soft"
              placeholder="Tulis pertanyaan seputar hipertensi..."
              disabled={typing}
            />
            <button type="submit" disabled={typing || !msg.trim()} className="btn-primary px-4 disabled:opacity-60 disabled:cursor-not-allowed">
              {typing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
            </button>
          </form>
        </div>
      </main>
    </DashboardLayout>
  );
}
