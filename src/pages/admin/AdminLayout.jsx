// src/pages/admin/AdminLayout.jsx
// Sidebar + topbar shell for all admin pages.

import { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getLoanStats } from '../../services/loanService.js';
import '../../styles/Admin.css';
import '../../styles/components.css';

const NAV_ITEMS = [
  { to: '/admin',          label: 'Dashboard',    icon: 'dashboard',           end: true },
  { to: '/admin/books',    label: 'Manajemen Buku', icon: 'menu_book' },
  { to: '/admin/loans',    label: 'Peminjaman',   icon: 'swap_horiz',          badge: 'pending' },
  { to: '/admin/members',  label: 'Member',       icon: 'people' },
  { to: '/admin/activity', label: 'Log Aktivitas', icon: 'history' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = getLoanStats();
  const pendingCount = stats.requested + stats.returnRequested + stats.extensionPending;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <div className="admin-layout">
      {/* Mobile backdrop */}
      <div
        className={`admin-sidebar-backdrop${sidebarOpen ? ' show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`} aria-label="Navigasi admin">
        <div className="admin-sidebar__header">
          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 18 }}>local_library</span>
          </div>
          <Link to="/admin" className="admin-sidebar__brand" onClick={() => setSidebarOpen(false)}>
            Pustaka<span style={{ color: 'var(--color-blue-light)' }}>Admin</span>
          </Link>
          <button
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4, display: 'block' }}
            onClick={() => setSidebarOpen(false)}
            className="hide-desktop"
            aria-label="Tutup sidebar"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          <div className="admin-sidebar__section">Menu</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
              {item.badge === 'pending' && pendingCount > 0 && (
                <span className="admin-nav-item__badge">{pendingCount}</span>
              )}
            </NavLink>
          ))}

          <div className="admin-sidebar__section" style={{ marginTop: 'var(--space-4)' }}>Akun</div>
          <Link to="/" className="admin-nav-item" onClick={() => setSidebarOpen(false)}>
            <span className="material-symbols-outlined">home</span>
            Lihat Situs
          </Link>
          <button className="admin-nav-item" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Keluar
          </button>
        </nav>

        <div className="admin-sidebar__footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'white' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <button
            className="btn-icon hide-desktop"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka sidebar"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="admin-topbar__title hide-mobile">Panel Admin</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {pendingCount > 0 && (
              <Link to="/admin/loans" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-red-light)', color: 'var(--color-red)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>notifications</span>
                {pendingCount} perlu tindakan
              </Link>
            )}
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)' }}>
              {user?.name?.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
