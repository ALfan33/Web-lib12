// src/pages/admin/AdminDashboard.jsx

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getBooks } from '../../services/bookService.js';
import { getUsers } from '../../services/authService.js';
import { getLoans, getLoanStats } from '../../services/loanService.js';
import { CATEGORIES } from '../../data/books.js';
import { timeAgo } from '../../utils/dateHelper.js';
import { getActivityLogs } from '../../services/activityService.js';
import '../../styles/Admin.css';

export default function AdminDashboard() {
  const books  = getBooks();
  const users  = getUsers();
  const stats  = getLoanStats();
  const logs   = getActivityLogs(8);

  const categoryDistribution = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      count: books.filter(b => b.category === cat.id).length,
    }));
  }, [books]);

  const maxCat = Math.max(...categoryDistribution.map(c => c.count), 1);

  const topBooks = useMemo(() => {
    return [...books].sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0)).slice(0, 5);
  }, [books]);

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-sub">Ringkasan perpustakaan hari ini</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        {[
          { label: 'Total Buku',      value: books.length,    icon: 'menu_book',        color: '#EEF2FF', iconColor: 'var(--color-indigo)' },
          { label: 'Total Member',    value: users.length,    icon: 'people',           color: '#F0FDF4', iconColor: 'var(--color-green)' },
          { label: 'Pinjaman Aktif',  value: stats.active,    icon: 'book',             color: '#EFF6FF', iconColor: 'var(--color-blue)' },
          { label: 'Menunggu Aksi',   value: stats.requested + stats.returnRequested + stats.extensionPending, icon: 'pending_actions', color: '#FFFBEB', iconColor: 'var(--color-orange)' },
          { label: 'Terlambat',       value: stats.overdue,   icon: 'warning',          color: '#FEF2F2', iconColor: 'var(--color-red)' },
          { label: 'Total Pinjaman',  value: stats.total,     icon: 'swap_horiz',       color: '#F5F3FF', iconColor: 'var(--color-indigo)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__icon" style={{ background: s.color }}>
              <span className="material-symbols-outlined" style={{ color: s.iconColor }}>{s.icon}</span>
            </div>
            <div>
              <div className="stat-card__value">{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Category distribution */}
        <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)' }}>
            Distribusi Kategori
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {categoryDistribution.map(cat => (
              <div key={cat.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-gray-700)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--color-indigo)' }}>{cat.icon}</span>
                    {cat.label}
                  </div>
                  <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-900)' }}>{cat.count}</span>
                </div>
                <div style={{ height: 6, background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(cat.count / maxCat) * 100}%`, background: 'var(--gradient-primary)', borderRadius: 'var(--radius-full)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top books */}
        <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>Buku Terpopuler</h2>
            <Link to="/admin/books" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-indigo)' }}>Lihat semua</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {topBooks.map((book, i) => (
              <div key={book.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? 'var(--color-yellow)' : 'var(--color-gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'var(--font-bold)', color: i === 0 ? '#7C2D12' : 'var(--color-gray-500)', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-gray-800)' }}>{book.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{book.borrowCount} kali dipinjam</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-sm)', gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>Log Aktivitas Terbaru</h2>
            <Link to="/admin/activity" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-indigo)' }}>Lihat semua</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {logs.length === 0 ? (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Belum ada aktivitas.</p>
            ) : logs.map(log => (
              <div key={log.id} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--color-indigo)' }}>history</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-700)', lineHeight: 1.4 }}>{log.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{timeAgo(log.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      {(stats.requested > 0 || stats.returnRequested > 0) && (
        <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-orange)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-orange)' }}>notifications_active</span>
            <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
              Membutuhkan Tindakan Segera
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {stats.requested > 0 && (
              <Link to="/admin/loans?status=requested" className="btn btn-secondary btn-sm">
                {stats.requested} permintaan pinjam menunggu
              </Link>
            )}
            {stats.returnRequested > 0 && (
              <Link to="/admin/loans?status=return_requested" className="btn btn-secondary btn-sm">
                {stats.returnRequested} pengembalian menunggu verifikasi
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
