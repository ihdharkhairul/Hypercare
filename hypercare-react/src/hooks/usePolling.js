import { useEffect, useRef } from 'react';

/**
 * usePolling — menjalankan callback secara berkala (mis. polling chat).
 * Otomatis berhenti saat unmount untuk mencegah memory leak / request sia-sia.
 */
export function usePolling(callback, intervalMs, enabled = true) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);

  useEffect(() => {
    if (!enabled || !intervalMs) return;
    const id = setInterval(() => savedCallback.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
