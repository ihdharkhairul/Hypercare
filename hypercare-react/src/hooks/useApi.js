import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

/**
 * useApi — custom hook generik untuk GET request dengan
 * loading / error / data / retry secara otomatis.
 * Mencegah duplikasi pola "useState x3 + useEffect" di setiap halaman.
 *
 * @param {string|null} url   endpoint relatif (null = jangan fetch otomatis)
 * @param {array} deps        dependency tambahan untuk re-fetch
 * @param {object} options    { initialData, transform, skip }
 */
export function useApi(url, deps = [], options = {}) {
  const { initialData = null, transform, skip = false } = options;
  const [data, setData]       = useState(initialData);
  const [loading, setLoading] = useState(!skip);
  const [error, setError]     = useState(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!url || skip) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url);
      if (!mountedRef.current) return;
      const result = transform ? transform(res.data.data) : res.data.data;
      setData(result);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.response?.data?.message || 'Gagal memuat data.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, skip]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, skip, ...deps]);

  return { data, setData, loading, error, refetch: fetchData };
}
