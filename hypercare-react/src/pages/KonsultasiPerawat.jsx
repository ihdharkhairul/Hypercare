import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { usePolling } from '../hooks/usePolling';
import api from '../api/axios';

export default function KonsultasiPerawat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [nurses, setNurses]         = useState([]);
  const [activeIdx, setActiveIdx]   = useState(0);
  const [messages, setMessages]     = useState({});
  const [msg, setMsg]               = useState('');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const chatBodyRef = useRef(null);

  // Muat daftar perawat
  useEffect(() => {
    api.get('/perawat/index.php').then(res => {
      setNurses(res.data.data || []);
    }).catch(() => showToast('Gagal memuat perawat.','error'))
      .finally(() => setLoading(false));
  }, []);

  // Kalau datang dari notifikasi (?perawat_id=..), langsung buka chat itu
  useEffect(() => {
    const targetId = searchParams.get('perawat_id');
    if (!targetId || !nurses.length) return;
    const idx = nurses.findIndex(n => String(n.id) === String(targetId));
    if (idx !== -1) setActiveIdx(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nurses, searchParams]);

  const activeNurse = nurses[activeIdx];

  // Muat pesan saat ganti tab perawat aktif
  useEffect(() => {
    if (!activeNurse || !user) return;
    loadMessages(activeNurse.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, activeNurse?.id]);

  // Polling setiap 5 detik — otomatis berhenti saat komponen unmount (custom hook)
  usePolling(
    useCallback(() => { if (activeNurse) loadMessages(activeNurse.id); }, [activeNurse?.id]),
    5000,
    !!activeNurse
  );

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, activeIdx]);

  const loadMessages = async (perawatId) => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/chat/index.php?action=messages&pasien_id=${user.id}&perawat_id=${perawatId}`);
      setMessages(prev => ({ ...prev, [perawatId]: res.data.data || [] }));
      // Tandai dibaca
      api.put('/chat/index.php?action=read', { pasien_id: user.id, perawat_id: perawatId }).catch(() => {});
    } catch {}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msg.trim() || !activeNurse) return;
    const text = msg;
    setMsg('');
    try {
      await api.post('/chat/index.php?action=send', {
        pasien_id: user.id,
        perawat_id: activeNurse.id,
        pesan: text,
      });
      loadMessages(activeNurse.id);
    } catch { showToast('Gagal mengirim pesan.','error'); setMsg(text); }
  };

  const filteredNurses = nurses.filter(n => n.nama.toLowerCase().includes(search.toLowerCase()));
  const currentMsgs   = activeNurse ? (messages[activeNurse.id] || []) : [];

  return (
    <DashboardLayout role="pasien" active="konsultasi">
      <main className="p-5 md:p-8">
        <div className="card-soft flex h-[calc(100vh-150px)] overflow-hidden">
          {/* Nurse List */}
          <div className="w-[280px] border-r border-[#F1EDE3] flex-col hidden md:flex">
            <div className="p-4 border-b border-[#F1EDE3]">
              <input className="input-soft text-sm" placeholder="Cari perawat..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="overflow-y-auto scrollbar-thin flex-1">
              {loading ? <p className="text-sm text-[#94A3B8] p-4">Memuat...</p> :
                filteredNurses.map((n, i) => (
                <button key={n.id}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-secondary text-left${activeIdx === nurses.indexOf(n) ? ' bg-secondary' : ''}`}
                  onClick={() => setActiveIdx(nurses.indexOf(n))}>
                  <div className="relative">
                    <img src={n.foto || `https://i.pravatar.cc/150?u=${n.id}`} className="w-11 h-11 rounded-full object-cover" alt={n.nama} />
                    {n.is_online ? <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22A559] rounded-full border-2 border-white"></span> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{n.nama}</p>
                    <p className="text-xs text-[#94A3B8] truncate">{n.is_online ? 'Online' : 'Offline'} · {n.spesialis}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          {activeNurse ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-3 p-4 border-b border-[#F1EDE3]">
              <img src={activeNurse.foto || `https://i.pravatar.cc/150?u=${activeNurse.id}`} className="w-10 h-10 rounded-full object-cover" alt="" />
              <div>
                <p className="font-medium text-sm">{activeNurse.nama}</p>
                <p className={`text-xs ${activeNurse.is_online ? 'text-[#22A559]' : 'text-[#94A3B8]'}`}>
                  <i className="fa-solid fa-circle text-[8px]"></i> {activeNurse.is_online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div ref={chatBodyRef} className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4 bg-[#FFFDF8]">
              {currentMsgs.length === 0 && (
                <p className="text-center text-sm text-[#94A3B8] mt-8">Belum ada percakapan. Mulai kirim pesan!</p>
              )}
              {currentMsgs.map((m) => (
                <div key={m.id} className={`flex ${m.pengirim === 'pasien' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${m.pengirim === 'pasien' ? 'chat-bubble-me' : 'chat-bubble-other'} px-4 py-2 text-sm`}>
                    {m.pesan}
                    <div className="text-[10px] opacity-70 mt-1 text-right">{m.created_at?.slice(11,16)}</div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-[#F1EDE3] flex gap-2">
              <input value={msg} onChange={e => setMsg(e.target.value)} className="input-soft flex-1" placeholder="Tulis pesan..." />
              <button type="submit" className="btn-primary px-4"><i className="fa-solid fa-paper-plane"></i></button>
            </form>
          </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#94A3B8] text-sm">
              {loading ? 'Memuat daftar perawat...' : 'Pilih perawat untuk memulai konsultasi.'}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}