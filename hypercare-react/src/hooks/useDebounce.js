import { useState, useEffect } from 'react';

/**
 * useDebounce — menunda update value sampai tidak ada perubahan
 * selama `delay` ms. Dipakai untuk search input agar tidak
 * memicu request API di setiap ketikan (optimasi REST API).
 */
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
