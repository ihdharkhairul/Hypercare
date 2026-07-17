// src/hooks/useFormValidation.js
import { useState } from 'react';

/**
 * Hook validasi form.
 * @param {object} rules — { fieldName: (value, allValues) => string|null }
 * @returns { errors, validate, clearError, clearAll }
 */
export function useFormValidation(rules = {}) {
  const [errors, setErrors] = useState({});

  const validate = (values) => {
    const newErrors = {};
    for (const [field, ruleFn] of Object.entries(rules)) {
      const msg = ruleFn(values[field] ?? '', values);
      if (msg) newErrors[field] = msg;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) =>
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  const clearAll = () => setErrors({});

  // Merge server-side errors
  const setServerErrors = (errs) =>
    setErrors((prev) => ({ ...prev, ...errs }));

  return { errors, validate, clearError, clearAll, setServerErrors };
}

// ── Aturan validasi umum yang bisa dipakai kembali ────────
export const rules = {
  required: (label) => (v) =>
    !v || !String(v).trim() ? `${label} wajib diisi.` : null,

  email: (v) =>
    v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? 'Format email tidak valid.'
      : null,

  minLength: (n, label = 'Password') => (v) =>
    v && v.length < n ? `${label} minimal ${n} karakter.` : null,

  noHp: (v) =>
    v && !/^08[0-9]{8,11}$/.test(v.replace(/[-\s]/g, ''))
      ? 'Nomor HP tidak valid (contoh: 08123456789).'
      : null,

  combine:
    (...fns) =>
    (v, all) => {
      for (const fn of fns) {
        const msg = fn(v, all);
        if (msg) return msg;
      }
      return null;
    },
};
