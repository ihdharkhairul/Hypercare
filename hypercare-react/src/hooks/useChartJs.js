import { useEffect, useRef } from 'react';

let chartJsLoadPromise = null;

// Loader CDN Chart.js singleton — dipanggil sekali untuk seluruh app,
// menghindari duplikasi <script> tag di setiap halaman yang pakai grafik.
function loadChartJs() {
  if (window.Chart) return Promise.resolve();
  if (chartJsLoadPromise) return chartJsLoadPromise;
  chartJsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return chartJsLoadPromise;
}

/**
 * useChartJs — custom hook untuk membuat & membersihkan instance Chart.js
 * secara otomatis. Menggantikan pola useEffect+useRef yang diulang di
 * setiap halaman dashboard (DashboardPasien, DashboardPerawat, MonitoringPasien).
 *
 * @param {object} config  Chart.js config (type, data, options) — null = skip render
 * @param {array}  deps    dependency tambahan untuk re-render chart
 */
export function useChartJs(config, deps = []) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    let cancelled = false;
    if (!config) return;

    loadChartJs().then(() => {
      if (cancelled || !canvasRef.current || !window.Chart) return;
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new window.Chart(canvasRef.current, config);
    });

    return () => {
      cancelled = true;
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return canvasRef;
}
