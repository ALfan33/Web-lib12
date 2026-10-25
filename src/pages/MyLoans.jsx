// src/pages/MyLoans.jsx
// Member's loan history and active loans page.

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Modal from '../components/Modal.jsx';
import ScrollProgress from '../components/ScrollProgress.jsx';
import { EmptyState } from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  getLoansByUser,
  requestReturn,
  requestExtension,
} from '../services/loanService.js';
import { getBookById } from '../services/bookService.js';
import {
  formatDate, formatDateShort, daysRemaining,
  getLoanStatus, calculateFine, formatCurrency,
  toInputDate, addDays,
} from '../utils/dateHelper.js';
import '../styles/components.css';

const STATUS_LABELS = {
  requested:        { label: 'Menunggu Persetujuan', badge: 'badge-warning', icon: 'pending' },
  borrowed:         { label: 'Dipinjam',             badge: 'badge-info',    icon: 'book' },
  return_requested: { label: 'Menunggu Verif. Kembali', badge: 'badge-warning', icon: 'schedule_send' },
  returned:         { label: 'Dikembalikan',         badge: 'badge-success', icon: 'check_circle' },
  rejected:         { label: 'Ditolak',              badge: 'badge-danger',  icon: 'cancel' },
};

function LoanStatusBadge({ status }) {
  const s = STATUS_LABELS[status] || { label: status, badge: 'badge-info', icon: 'info' };
  return (
    <span className={`badge ${s.badge}`} style={{ gap: 4 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{s.icon}</span>
      {s.label}
    </span>
  );
}

function DeadlineIndicator({ dueDate, status }) {
  if (!['borrowed'].includes(status)) return null;
  const days = daysRemaining(dueDate);
  const loanStatus = getLoanStatus(dueDate);
  const fine = calculateFine(dueDate);

  const colors = {
    safe:    { bg: '#DCFCE7', color: '#15803D', text: `${days} hari lagi` },
    warning: { bg: '#FEF3C7', color: '#B45309', text: `H-${days}` },
    overdue: { bg: '#FEE2E2', color: '#B91C1C', text: `Terlambat ${Math.abs(days)} hari` },
  };

  const c = colors[loanStatus];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 'var(--radius-full)', background: c.bg, color: c.color, fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          {loanStatus === 'overdue' ? 'warning' : loanStatus === 'warning' ? 'alarm' : 'schedule'}
        </span>
        {c.text}
      </div>
      {fine > 0 && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-red)' }}>
          Est. denda: {formatCurrency(fine)}
        </span>
      )}
    </div>
  );
}

export default function MyLoans() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [loans, setLoans] = useState([]);
  const [filter, setFilter] = useState('all');
  const [extModal, setExtModal] = useState(null); // loan object
  const [extDate, setExtDate] = useState('');
  const [returnModal, setReturnModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadLoans = useCallback(() => {
    if (!user) return;
    const raw = getLoansByUser(user.id);
    // Enrich with book data
    const enriched = raw.map(l => ({
      ...l,
      book: getBookById(l.bookId),
    })).sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    setLoans(enriched);
  }, [user]);

  useEffect(() => { loadLoans(); }, [loadLoans]);

  const filteredLoans = loans.filter(l => {
    if (filter === 'active') return ['requested', 'borrowed', 'return_requested'].includes(l.status);
    if (filter === 'returned') return l.status === 'returned';
    if (filter === 'overdue') return l.status === 'borrowed' && getLoanStatus(l.dueDate) === 'overdue';
    return true;
  });

  const handleReturn = async () => {
    if (!returnModal) return;
    setActionLoading(true);
    try {
      requestReturn(returnModal.id, user.id);
      addToast('Permintaan pengembalian terkirim.', 'success');
      setReturnModal(null);
      loadLoans();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtension = async () => {
    if (!extModal || !extDate) { addToast('Pilih tanggal perpanjangan.', 'warning'); return; }
    setActionLoading(true);
    try {
      requestExtension(extModal.id, user.id, extDate);
      addToast('Permintaan perpanjangan terkirim.', 'success');
      setExtModal(null);
      setExtDate('');
      loadLoans();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const stats = {
    active: loans.filter(l => l.status === 'borrowed').length,
    requested: loans.filter(l => l.status === 'requested').length,
    returned: loans.filter(l => l.status === 'returned').length,
    overdue: loans.filter(l => l.status === 'borrowed' && getLoanStatus(l.dueDate) === 'overdue').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-gray-50)' }}>
      <ScrollProgress />
      <Navbar variant="light" />

      <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-8))', paddingBottom: 'var(--space-16)' }}>
        {/* Header */}
        <div style={{ background: 'var(--gradient-hero)', padding: 'var(--space-8) 0', marginBottom: 'var(--space-6)' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(var(--text-2xl),3vw,var(--text-3xl))', fontWeight: 'var(--font-bold)', color: 'white', marginBottom: 'var(--space-2)' }}>
              Pinjaman Saya
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-sm)' }}>
              Halo, {user?.name}. Kelola buku-buku yang sedang kamu pinjam.
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-6)', maxWidth: 600 }}>
              {[
                { label: 'Dipinjam',  value: stats.active,    icon: 'book' },
                { label: 'Menunggu', value: stats.requested, icon: 'pending' },
                { label: 'Terlambat',value: stats.overdue,   icon: 'warning', danger: true },
                { label: 'Selesai',  value: stats.returned,  icon: 'check_circle' },
              ].map(s => (
                <div key={s.label} style={{ background: s.danger && s.value > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', border: `1px solid ${s.danger && s.value > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.15)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: s.danger && s.value > 0 ? '#FCA5A5' : 'rgba(255,255,255,0.6)' }}>{s.icon}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: s.danger && s.value > 0 ? '#FCA5A5' : 'rgba(255,255,255,0.6)' }}>{s.label}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'white' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container">
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
            {[
              { id: 'all',      label: `Semua (${loans.length})` },
              { id: 'active',   label: `Aktif (${stats.active + stats.requested})` },
              { id: 'overdue',  label: `Terlambat (${stats.overdue})` },
              { id: 'returned', label: `Selesai (${stats.returned})` },
            ].map(tab => (
              <button
                key={tab.id}
                className={`filter-chip${filter === tab.id ? ' active' : ''}`}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredLoans.length === 0 ? (
            <EmptyState
              icon="book"
              title="Belum ada pinjaman"
              description="Kunjungi katalog untuk menemukan buku yang ingin kamu pinjam."
              action={<Link to="/catalog" className="btn btn-primary">Lihat Katalog</Link>}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {filteredLoans.map(loan => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onReturn={() => setReturnModal(loan)}
                  onExtend={() => {
                    setExtModal(loan);
                    setExtDate(toInputDate(addDays(new Date(loan.dueDate), 3)));
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Return modal */}
      <Modal
        isOpen={!!returnModal}
        onClose={() => setReturnModal(null)}
        title="Ajukan Pengembalian"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
            <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>{returnModal?.book?.title}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Deadline: {formatDate(returnModal?.dueDate)}</div>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)' }}>
            Konfirmasi bahwa kamu ingin mengajukan pengembalian buku ini. Admin akan memverifikasi fisik buku.
          </p>
          {returnModal && getLoanStatus(returnModal.dueDate) === 'overdue' && (
            <div className="badge badge-danger" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>warning</span>
              Buku sudah terlambat. Estimasi denda: {formatCurrency(calculateFine(returnModal?.dueDate))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setReturnModal(null)}>Batal</button>
            <button className="btn btn-primary btn-sm" onClick={handleReturn} disabled={actionLoading}>
              {actionLoading ? 'Memproses...' : 'Konfirmasi Pengembalian'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Extension modal */}
      <Modal
        isOpen={!!extModal}
        onClose={() => setExtModal(null)}
        title="Ajukan Perpanjangan"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
            <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>{extModal?.book?.title}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Deadline saat ini: {formatDate(extModal?.dueDate)}</div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ext-date">Tanggal Baru <span className="required">*</span></label>
            <input
              id="ext-date"
              type="date"
              className="form-input"
              value={extDate}
              min={extModal ? toInputDate(addDays(new Date(extModal.dueDate), 1)) : ''}
              max={extModal ? toInputDate(addDays(new Date(extModal.dueDate), 7)) : ''}
              onChange={e => setExtDate(e.target.value)}
            />
            <span className="form-hint">Maksimal perpanjangan 7 hari dari deadline saat ini.</span>
          </div>
          <div className="badge badge-info" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
            Perpanjangan baru berlaku setelah disetujui admin.
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setExtModal(null)}>Batal</button>
            <button className="btn btn-primary btn-sm" onClick={handleExtension} disabled={actionLoading || !extDate}>
              {actionLoading ? 'Memproses...' : 'Kirim Permohonan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function LoanCard({ loan, onReturn, onExtend }) {
  const { book, status, requestedAt, borrowedAt, dueDate, returnedAt, adminNote, extensionStatus } = loan;

  return (
    <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
        {/* Cover */}
        <Link to={`/books/${loan.bookId}`}>
          <div style={{ width: 80, height: 112, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--color-gray-100)', flexShrink: 0 }}>
            {book?.cover ? (
              <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 28 }}>menu_book</span>
              </div>
            )}
          </div>
        </Link>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
            <div>
              <Link to={`/books/${loan.bookId}`} style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-900)', display: 'block', marginBottom: 2 }}>
                {book?.title || 'Buku tidak ditemukan'}
              </Link>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{book?.author}</span>
            </div>
            <LoanStatusBadge status={status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            <div><span style={{ display: 'block', color: 'var(--color-gray-500)' }}>Dipinjam</span>{borrowedAt ? formatDateShort(borrowedAt) : '—'}</div>
            <div><span style={{ display: 'block', color: 'var(--color-gray-500)' }}>Deadline</span>{formatDateShort(dueDate)}</div>
            {returnedAt && <div><span style={{ display: 'block', color: 'var(--color-gray-500)' }}>Dikembalikan</span>{formatDateShort(returnedAt)}</div>}
          </div>

          {status === 'borrowed' && <DeadlineIndicator dueDate={dueDate} status={status} />}

          {extensionStatus === 'pending' && (
            <div className="badge badge-warning" style={{ width: 'fit-content' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>pending</span>
              Perpanjangan menunggu persetujuan
            </div>
          )}

          {adminNote && status === 'rejected' && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-red)', background: 'var(--color-red-light)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
              Catatan admin: {adminNote}
            </div>
          )}

          {/* Actions */}
          {status === 'borrowed' && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-1)' }}>
              <button className="btn btn-primary btn-sm" onClick={onReturn}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assignment_return</span>
                Kembalikan
              </button>
              {extensionStatus !== 'pending' && (
                <button className="btn btn-secondary btn-sm" onClick={onExtend}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
                  Perpanjang
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
