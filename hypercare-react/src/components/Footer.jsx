import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#1E1709] text-[#F3E6C8] mt-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-display font-bold">H</div>
            <span className="font-display font-bold text-white">HyperCare</span>
          </div>
          <p className="text-sm text-[#C9B889] leading-relaxed">Layanan telemonitoring hipertensi terpercaya untuk membantu Anda menjaga tekanan darah setiap hari.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Menu</h4>
          <ul className="space-y-2 text-sm text-[#C9B889]">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><a href="/#tentang" className="hover:text-primary">Tentang</a></li>
            <li><a href="/#layanan" className="hover:text-primary">Layanan</a></li>
            <li><a href="/#edukasi" className="hover:text-primary">Edukasi</a></li>
            <li><a href="/#faq" className="hover:text-primary">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Informasi</h4>
          <ul className="space-y-2 text-sm text-[#C9B889]">
            <li><a href="/#tentang" className="hover:text-primary">Tentang Kami</a></li>
            <li><a href="#" className="hover:text-primary">Kebijakan Privasi</a></li>
            <li><a href="#" className="hover:text-primary">Syarat &amp; Ketentuan</a></li>
            <li><a href="#" className="hover:text-primary">Kontak</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Kontak</h4>
          <ul className="space-y-2 text-sm text-[#C9B889]">
            <li><i className="fa-solid fa-phone mr-2"></i>0852-4636-0541</li>
            <li><i className="fa-solid fa-envelope mr-2"></i>info@hypercare.id</li>
            <li><i className="fa-solid fa-location-dot mr-2"></i>Buton Tengah, Sulawesi Tenggara</li>
          </ul>
          <div className="flex gap-3 mt-4 text-lg">
            <a href="#" className="hover:text-primary"><i className="fa-brands fa-facebook"></i></a>
            <a href="#" className="hover:text-primary"><i className="fa-brands fa-instagram"></i></a>
            <a href="#" className="hover:text-primary"><i className="fa-brands fa-youtube"></i></a>
            <a href="#" className="hover:text-primary"><i className="fa-brands fa-whatsapp"></i></a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#3A2E12] text-center py-4 text-xs text-[#9C8A5C]">
        &copy; 2026 HyperCare. All rights reserved.
      </div>
    </footer>
  );
}
