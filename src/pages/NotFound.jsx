// src/pages/NotFound.jsx

import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-gray-50)', textAlign: 'center', padding: 'var(--space-4)' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(80px,15vw,160px)', fontWeight: 'var(--font-extrabold)', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(var(--text-xl),3vw,var(--text-3xl))', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-800)', marginBottom: 'var(--space-3)' }}>
        Halaman Tidak Ditemukan
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)', maxWidth: 400 }}>
        Oops! Halaman yang kamu cari tidak ada atau mungkin sudah dipindahkan.
      </p>
      <Link to="/" className="btn btn-primary">
        <span className="material-symbols-outlined">home</span>
        Kembali ke Beranda
      </Link>
    </div>
  );
}

export function Forbidden() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-gray-50)', textAlign: 'center', padding: 'var(--space-4)' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(80px,15vw,160px)', fontWeight: 'var(--font-extrabold)', background: 'linear-gradient(135deg, #EF4444, #B91C1C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>
        403
      </div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(var(--text-xl),3vw,var(--text-3xl))', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-800)', marginBottom: 'var(--space-3)' }}>
        Akses Ditolak
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)', maxWidth: 420 }}>
        Kamu tidak memiliki izin untuk mengakses halaman ini. Halaman admin hanya bisa diakses oleh Administrator.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-primary">
          <span className="material-symbols-outlined">home</span>
          Beranda
        </Link>
        <Link to="/login" className="btn btn-secondary">
          <span className="material-symbols-outlined">login</span>
          Masuk sebagai Admin
        </Link>
      </div>
    </div>
  );
}
