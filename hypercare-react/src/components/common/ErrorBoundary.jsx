import { Component } from 'react';

// Error Boundary — menangkap crash render di komponen anak agar
// tidak mem-blank-kan seluruh aplikasi. Tampilan tetap konsisten
// dengan desain card-soft yang ada.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Bisa diarahkan ke layanan logging eksternal di sini jika diperlukan
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-5 md:p-8">
          <div className="card-soft p-8 text-center max-w-lg mx-auto">
            <i className="fa-solid fa-triangle-exclamation text-4xl text-red-300 mb-3"></i>
            <h3 className="font-semibold mb-1">Terjadi kesalahan</h3>
            <p className="text-sm text-[#64748B] mb-4">Halaman ini mengalami masalah saat ditampilkan. Silakan coba muat ulang.</p>
            <button onClick={this.handleReset} className="btn-primary text-sm px-5">
              <i className="fa-solid fa-rotate-right mr-1.5"></i>Muat Ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
