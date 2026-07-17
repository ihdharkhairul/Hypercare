import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { usePolling } from '../hooks/usePolling';
import api from '../api/axios';

export default function ChatPerawat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [chatList, setChatList]   = useState([]);
  const [activePasien, setActivePasien] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [msg, setMsg]             = useState('');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const chatBodyRef = useRef(null);

  const loadList = async () => {
    try {
      const res = await api.get('/chat/index.php?action=list');
      setChatList(res.data.data || []);
    } catch { showToast('Gagal memuat daftar konsultasi.','error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadList(); }, []);

  // Kalau datang dari notifikasi (?pasien_id=..), langsung buka chat itu
  useEffect(() => {
    const targetId = searchParams.get('pasien_id');
    if (!targetId || !chatList.length) return;
    const found = chatList.find(c => String(c.pasien_id) === String(targetId));
    if (found) setActivePasien(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatList, searchParams]);

  const loadMessages = async (pasienId) => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/chat/index.php?action=messages&pasien_id=${pasienId}&perawat_id=${user.id}`);
      setMessages(res.data.data || []);
      api.put('/chat/index.php?action=read', { pasien_id: pasienId, perawat_id: user.id }).catch(()=>{});
    } catch {}
  };

  useEffect(() => {
    if (!activePasien) return;
    loadMessages(activePasien.pasien_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePasien?.pasien_id]);

  // Polling setiap 5 detik — otomatis berhenti saat komponen unmount (custom hook)
  usePolling(
    useCallback(() => { if (activePasien) loadMessages(activePasien.pasien_id); }, [activePasien?.pasien_id]),
    5000,
    !!activePasien
  );

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msg.trim() || !activePasien) return;
    const text = msg; setMsg('');
    try {
      await api.post('/chat/index.php?action=send', { pasien_id: activePasien.pasien_id, perawat_id: user.id, pesan: text });
      loadMessages(activePasien.pasien_id);
      loadList();
    } catch { showToast('Gagal kirim.','error'); setMsg(text); }
  };

  const filtered = chatList.filter(c => c.pasien_nama?.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout role="perawat" active="chatperawat">
      <main className="p-5 md:p-8">
        <div className="card-soft flex h-[calc(100vh-150px)] overflow-hidden">
          {/* Pasien List */}
          <div className="w-[280px] border-r border-[#F1EDE3] flex-col hidden md:flex">
            <div className="p-4 border-b border-[#F1EDE3]">
              <input className="input-soft text-sm" placeholder="Cari pasien..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <div className="overflow-y-auto scrollbar-thin flex-1">
              {loading ? <p className="text-sm text-[#94A3B8] p-4">Memuat...</p>
              : filtered.length ? filtered.map(c => (
                <button key={c.pasien_id}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-secondary text-left${activePasien?.pasien_id === c.pasien_id ? ' bg-secondary' : ''}`}
                  onClick={() => setActivePasien(c)}>
                  <img src={c.foto || `https://i.pravatar.cc/150?u=${c.pasien_id}`} className="w-11 h-11 rounded-full object-cover" alt={c.pasien_nama} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.pasien_nama}</p>
                    <p className="text-xs text-[#94A3B8] truncate">{c.pesan_terakhir || 'Belum ada pesan'}</p>
                  </div>
                  {c.belum_dibaca > 0 && <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{c.belum_dibaca}</span>}
                </button>
              )) : <p className="text-sm text-[#94A3B8] p-4 text-center">Belum ada konsultasi.</p>}
            </div>
          </div>

          {/* Chat Window */}
          {activePasien ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-3 p-4 border-b border-[#F1EDE3]">
              <img src={activePasien.foto || `https://i.pravatar.cc/150?u=${activePasien.pasien_id}`} className="w-10 h-10 rounded-full object-cover" alt="" />
              <div><p className="font-medium text-sm">{activePasien.pasien_nama}</p><p className="text-xs text-[#94A3B8]">Pasien</p></div>
            </div>
            <div ref={chatBodyRef} className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4 bg-[#FFFDF8]">
              {messages.length === 0 && <p className="text-center text-sm text-[#94A3B8] mt-8">Belum ada percakapan.</p>}
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.pengirim==='perawat' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${m.pengirim==='perawat' ? 'chat-bubble-me' : 'chat-bubble-other'} px-4 py-2 text-sm`}>
                    {m.pesan}
                    <div className="text-[10px] opacity-70 mt-1 text-right">{m.created_at?.slice(11,16)}</div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-[#F1EDE3] flex gap-2">
              <input value={msg} onChange={e=>setMsg(e.target.value)} className="input-soft flex-1" placeholder="Tulis pesan..." />
              <button type="submit" className="btn-primary px-4"><i className="fa-solid fa-paper-plane"></i></button>
            </form>
          </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#94A3B8] text-sm">
              Pilih pasien untuk membuka percakapan.
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}