// src/pages/admin/AdminLoans.jsx
// Loan management — approve, reject, verify returns, handle extensions.

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Modal from '../../components/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getLoans, approveBorrow, rejectBorrow,
  approveReturn, approveExtension, rejectExtension,
} from '../../services/loanService.js';
import { getBookById } from '../../services/bookService.js';
import { getAllUsers } from '../../services/authService.js';
import { formatDate, daysRemaining, getLoanStatus, calculateFine, formatCurrency } from '../../utils/dateHelper.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import '../../styles/Admin.css';
import '../../styles/components.css';

const STATUS_LABELS = {
  requested:        { label: 'Diminta',        badge: 'badge-warning' },
  borrowed:         { label: 'Dipinjam',       badge: 'badge-info' },
  return_requested: { label: 'Minta Kembali',  badge: 'badge-warning' },
  returned:         { label: 'Selesai',        badge: 'badge-success' },
  rejected:         { label: 'Ditolak',        badge: 'badge-danger' },
};

export default function AdminLoans() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [search, setSearch] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const debouncedSearch = useDebounce(search, 300);
  const users = getAllUsers();
  const getUserById = (id) => users.find(u => u.id === id);

  const allLoans = getLoans()
    .map(l => ({
      ...l,
      book: getBookById(l.bookId),
      member: getUserById(l.userId),
    }))
    .filter(l => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        return (
          l.book?.title?.toLowerCase().includes(q) ||
          l.member?.name?.toLowerCase().includes(q) ||
          l.member?.email?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  const pendingCount = getLoans().filter(l => ['requested', 'return_requested'].includes(l.status)).length;

  const doAction = async (action, loanId, extra = '') => {
    setActionLoading(loanId + action);
    try {
      if (action === 'approve_borrow')    approveBorrow(loanId, user.id);
      if (action === 'reject_borrow')     rejectBorrow(loanId, user.id, extra);
      if (action === 'approve_return')    approveReturn(loanId, user.id);
      if (action === 'approve_extension') approveExtension(loanId, user.id);
      if (action === 'reject_extension')  rejectExtension(loanId, user.id, extra);
      addToast('Tindakan berhasil.', 'success');
      setRejectModal(null);
      setRejectNote('');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading('');
    }
  };

  const STATUS_FILTER_TABS = [
    { id: 'all',              label: `Semua (${getLoans().length})` },
    { id: 'requested',        label: `Diminta (${getLoans().filter(l => l.status === 'requested').length})` },
    { id: 'borrowed',         label: 'Dipinjam' },
    { id: 'return_requested', label: `Minta Kembali (${getLoans().filter(l => l.status === 'return_requested').length})` },
    { id: 'returned',         label: 'Selesai' },
    { id: 'rejected',         label: 'Ditolak' },
  ];

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h1 className="admin-page-title">Manajemen Peminjaman</h1>
          <p className="admin-page-sub">{pendingCount > 0 ? `${pendingCount} item membutuhkan tindakan` : 'Semua sudah diproses'}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        {STATUS_FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            className={`filter-chip${statusFilter === tab.id ? ' active' : ''}`}
            onClick={() => setStatusFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <span className="admin-table-title">Daftar Peminjaman</span>
          <div className="form-input-wrap" style={{ maxWidth: 300, width: '100%' }}>
            <span className="material-symbols-outlined form-input-icon">search</span>
            <input type="search" className="form-input" placeholder="Cari member atau buku..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Buku</th>
                <th>Member</th>
                <th>Status</th>
                <th>Tanggal Minta</th>
                <th>Deadline</th>
                <th>Perpanjangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {allLoans.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>Tidak ada data peminjaman.</td></tr>
              ) : allLoans.map(loan => {
                const isOverdue = loan.status === 'borrowed' && getLoanStatus(loan.dueDate) === 'overdue';
                const fine = calculateFine(loan.dueDate);
                return (
                  <tr key={loan.id}>
                    <td>
                      <div style={{ fontWeight: 'var(--font-semibold)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-gray-900)', fontSize: 'var(--text-xs)' }}>
                        {loan.book?.title || '—'}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{loan.book?.author}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>{loan.member?.name || '—'}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{loan.member?.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_LABELS[loan.status]?.badge || 'badge-info'}`}>
                        {STATUS_LABELS[loan.status]?.label || loan.status}
                      </span>
                      {isOverdue && <div style={{ fontSize: 10, color: 'var(--color-red)', marginTop: 2 }}>Terlambat {Math.abs(daysRemaining(loan.dueDate))} hari</div>}
                      {fine > 0 && <div style={{ fontSize: 10, color: 'var(--color-red)' }}>Denda: {formatCurrency(fine)}</div>}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{formatDate(loan.requestedAt)}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{formatDate(loan.dueDate)}</td>
                    <td>
                      {loan.extensionStatus === 'pending' ? (
                        <div>
                          <span className="badge badge-warning" style={{ fontSize: 10 }}>Menunggu</span>
                          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                            <button className="btn btn-success btn-sm" style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4 }} onClick={() => doAction('approve_extension', loan.id)} disabled={!!actionLoading}>✓</button>
                            <button className="btn btn-danger btn-sm" style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4 }} onClick={() => { setRejectModal({ id: loan.id, action: 'reject_extension', label: 'Perpanjangan' }); setRejectNote(''); }} disabled={!!actionLoading}>✗</button>
                          </div>
                        </div>
                      ) : loan.extensionStatus === 'approved' ? (
                        <span className="badge badge-success" style={{ fontSize: 10 }}>Disetujui</span>
                      ) : loan.extensionStatus === 'rejected' ? (
                        <span className="badge badge-danger" style={{ fontSize: 10 }}>Ditolak</span>
                      ) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {loan.status === 'requested' && (
                          <>
                            <button className="btn btn-success btn-sm" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => doAction('approve_borrow', loan.id)} disabled={!!actionLoading}>
                              Setujui
                            </button>
                            <button className="btn btn-danger btn-sm" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => { setRejectModal({ id: loan.id, action: 'reject_borrow', label: 'Peminjaman' }); setRejectNote(''); }} disabled={!!actionLoading}>
                              Tolak
                            </button>
                          </>
                        )}
                        {loan.status === 'return_requested' && (
                          <button className="btn btn-primary btn-sm" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => doAction('approve_return', loan.id)} disabled={!!actionLoading}>
                            Verif. Kembali
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title={`Tolak ${rejectModal?.label}`}
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="reject-note">Catatan Penolakan</label>
            <textarea id="reject-note" className="form-textarea" rows={3} placeholder="Berikan alasan penolakan..." value={rejectNote} onChange={e => setRejectNote(e.target.value)} style={{ minHeight: 80 }} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setRejectModal(null)}>Batal</button>
            <button className="btn btn-danger btn-sm" onClick={() => doAction(rejectModal.action, rejectModal.id, rejectNote)} disabled={!!actionLoading}>
              Konfirmasi Tolak
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
