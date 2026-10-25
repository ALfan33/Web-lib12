// src/components/Navbar.jsx

import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Navbar.css';

export default function Navbar({ variant = 'dark' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navClass = [
    'navbar',
    variant === 'light'
      ? 'light-solid'
      : scrolled ? 'solid' : 'transparent',
  ].join(' ');

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <>
      <nav className={navClass} role="navigation" aria-label="Navigasi utama">
        <div className="navbar__inner">
          {/* Brand */}
          <Link to="/" className="navbar__brand" aria-label="Beranda Pustaka Digital">
            <div className="navbar__brand-icon" aria-hidden="true">
              <span className="material-symbols-outlined">local_library</span>
            </div>
            Pustaka<span style={{ color: 'var(--color-blue-light)' }}>Digital</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="navbar__nav" aria-label="Menu utama">
            <NavLink to="/" end className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Beranda</NavLink>
            <NavLink to="/catalog" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Katalog</NavLink>
            {user && (
              <NavLink to="/my-loans" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Pinjaman Saya</NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Admin</NavLink>
            )}
          </nav>

          {/* Actions */}
          <div className="navbar__actions">
            {user ? (
              <div className="navbar__user" ref={dropdownRef} onClick={() => setDropdownOpen(o => !o)} aria-haspopup="true" aria-expanded={dropdownOpen}>
                <div className="navbar__avatar" aria-hidden="true">{initials}</div>
                <span style={{ fontSize: 'var(--text-sm)' }} className="hide-mobile">{user.name.split(' ')[0]}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', opacity: 0.7 }}>expand_more</span>

                {dropdownOpen && (
                  <div className="navbar__dropdown" role="menu">
                    <div className="navbar__dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                      <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-900)' }}>{user.name}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{user.email}</span>
                    </div>
                    <div className="navbar__dropdown-divider" />
                    {user.role === 'member' && (
                      <Link to="/my-loans" className="navbar__dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                        <span className="material-symbols-outlined">book</span>
                        Pinjaman Saya
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin" className="navbar__dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                        Dashboard Admin
                      </Link>
                    )}
                    <div className="navbar__dropdown-divider" />
                    <button className="navbar__dropdown-item" role="menuitem" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'none', color: 'var(--color-red)' }}>
                      <span className="material-symbols-outlined">logout</span>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-outline-white hide-mobile" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.3)', color: variant === 'light' ? 'var(--color-indigo)' : 'white', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                  Masuk
                </Link>
                <Link to="/register" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'var(--gradient-primary)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', boxShadow: 'var(--shadow-colored)' }}>
                  Daftar
                </Link>
              </>
            )}

            {/* Mobile toggle */}
            <button className="navbar__toggle" onClick={() => setMobileOpen(true)} aria-label="Buka menu" aria-expanded={mobileOpen}>
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="navbar__mobile" role="dialog" aria-label="Menu navigasi">
          <div className="navbar__mobile-backdrop" onClick={() => setMobileOpen(false)} />
          <div className="navbar__mobile-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-bold)', color: 'var(--color-indigo)' }}>PustakaDigital</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Tutup menu">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <NavLink to="/" end className={({ isActive }) => `navbar__mobile-link${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
              <span className="material-symbols-outlined">home</span> Beranda
            </NavLink>
            <NavLink to="/catalog" className={({ isActive }) => `navbar__mobile-link${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
              <span className="material-symbols-outlined">menu_book</span> Katalog
            </NavLink>
            {user && (
              <NavLink to="/my-loans" className={({ isActive }) => `navbar__mobile-link${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
                <span className="material-symbols-outlined">book</span> Pinjaman Saya
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => `navbar__mobile-link${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
                <span className="material-symbols-outlined">admin_panel_settings</span> Admin
              </NavLink>
            )}
            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
              {user ? (
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--color-red-light)', color: 'var(--color-red)', fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined">logout</span> Keluar
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <Link to="/login" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center', fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }} onClick={() => setMobileOpen(false)}>Masuk</Link>
                  <Link to="/register" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: 'white', textAlign: 'center', fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }} onClick={() => setMobileOpen(false)}>Daftar</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
