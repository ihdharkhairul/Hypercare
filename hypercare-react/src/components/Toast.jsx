import { useState, useEffect } from 'react';

let toastHandler = null;

export function showToast(message, type = 'success') {
  if (toastHandler) toastHandler(message, type);
}

export default function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    toastHandler = (message, type) => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    };
    return () => { toastHandler = null; };
  }, []);

  if (!toast) return null;

  const colors = { success: '#22A559', error: '#E53E3E', info: '#F4A300' };
  const icons = { success: 'fa-circle-check', error: 'fa-circle-info', info: 'fa-circle-info' };

  return (
    <div className="hc-toast" style={{ background: colors[toast.type] || colors.success }}>
      <i className={`fa-solid ${icons[toast.type] || icons.success}`}></i>
      {toast.message}
    </div>
  );
}
