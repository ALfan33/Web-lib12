// src/components/Footer.jsx

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-gray-900)',
      color: 'rgba(255,255,255,0.7)',
      padding: 'var(--space-16) 0 var(--space-8)',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-8)', marginBottom: 'var(--space-10)' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 20 }}>local_library</span>
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)', color: 'white' }}>PustakaDigital</span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7, maxWidth: 280 }}>
              Perpustakaan digital yang menyediakan koleksi buku berkualitas untuk mendukung budaya literasi Indonesia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tautan Cepat</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {[
                { to: '/', label: 'Beranda' },
                { to: '/catalog', label: 'Katalog Buku' },
                { to: '/login', label: 'Masuk' },
                { to: '/register', label: 'Daftar Member' },
              ].map(item => (
                <li key={item.to}>
                  <Link to={item.to} style={{ fontSize: 'var(--text-sm)', transition: 'color 200ms' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = ''}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jam Operasional</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
              <li>Senin – Jumat: 08.00 – 20.00 WIB</li>
              <li>Sabtu: 09.00 – 17.00 WIB</li>
              <li>Minggu: 10.00 – 15.00 WIB</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kontak</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
              <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, marginTop: 2 }}>location_on</span>
                Jl. Literasi No. 1, Jakarta
              </li>
              <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, marginTop: 2 }}>email</span>
                info@pustakadigital.id
              </li>
              <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, marginTop: 2 }}>call</span>
                (021) 1234-5678
              </li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 'var(--space-6)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--text-sm)' }}>
            © {new Date().getFullYear()} PustakaDigital. Seluruh hak cipta dilindungi.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            {[
              { icon: 'facebook', label: 'Facebook' },
              { icon: 'alternate_email', label: 'Twitter/X' },
              { icon: 'photo_camera', label: 'Instagram' },
            ].map(s => (
              <button key={s.icon} aria-label={s.icon} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', transition: 'background 200ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{s.icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
