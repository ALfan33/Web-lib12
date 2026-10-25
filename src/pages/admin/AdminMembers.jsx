// src/pages/admin/AdminMembers.jsx
// Member management — view, toggle active status.

import { useState } from 'react';
import { ConfirmDialog } from '../../components/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getUsers, toggleUserActive } from '../../services/authService.js';
import { getLoansByUser } from '../../services/loanService.js';
import { formatDate } from '../../utils/dateHelper.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import '../../styles/Admin.css';
import '../../styles/components.css';

export default function AdminMembers() {
  const { user: adminUser } = useAuth();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [memberTypeFilter, setMemberTypeFilter] = useState('all');

  const debouncedSearch = useDebounce(search, 300);

  const allMembers = getUsers().filter(m => {
    if (memberTypeFilter !== 'all' && m.memberType !== memberTypeFilter) return false;
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const handleToggleActive = async () => {
    if (!confirmTarget) return;
    setLoading(true);
    try {
      toggleUserActive(confirmTarget.id, adminUser.id);
      addToast(`Akun ${confirmTarget.name} telah ${confirmTarget.isActive ? 'dinonaktifkan' : 'diaktifkan'}.`, 'success');
      setConfirmTarget(null);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h1 className="admin-page-title">Manajemen Member</h1>
          <p className="admin-page-sub">{getUsers().length} member terdaftar</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        {[
          { id: 'all',             label: 'Semua' },
          { id: 'mahasiswa',       label: 'Mahasiswa' },
          { id: 'bukan_mahasiswa', label: 'Non-Mahasiswa' },
        ].map(f => (
          <button key={f.id} className={`filter-chip${memberTypeFilter === f.id ? ' active' : ''}`} onClick={() => setMemberTypeFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <span className="admin-table-title">Daftar Member</span>
          <div className="form-input-wrap" style={{ maxWidth: 300, width: '100%' }}>
            <span className="material-symbols-outlined form-input-icon">search</span>
            <input type="search" className="form-input" placeholder="Cari nama atau email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Tipe</th>
                <th>Detail</th>
                <th>Telepon</th>
                <th>Pinjaman</th>
                <th>Bergabung</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {allMembers.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>Tidak ada member ditemukan.</td></tr>
              ) : allMembers.map(member => {
                const loans = getLoansByUser(member.id);
                const activeLoans = loans.filter(l => l.status === 'borrowed').length;
                return (
                  <tr key={member.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 'var(--font-bold)', flexShrink: 0 }}>
                          {member.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-xs)', color: 'var(--color-gray-900)' }}>{member.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${member.memberType === 'mahasiswa' ? 'badge-info' : 'badge-success'}`}>
                        {member.memberType === 'mahasiswa' ? 'Mahasiswa' : 'Non-Mahasiswa'}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)' }}>
                      {member.memberType === 'mahasiswa' ? (
                        <div>
                          <div>NIM: {member.nim}</div>
                          <div>{member.studyProgram}</div>
                          <div style={{ color: 'var(--color-text-muted)' }}>{member.university}</div>
                        </div>
                      ) : (
                        <div>
                          <div>NIK: {member.nik}</div>
                          <div>{member.occupation}</div>
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{member.phone}</td>
                    <td>
                      <div style={{ fontSize: 'var(--text-xs)' }}>
                        <span style={{ fontWeight: 'var(--font-semibold)' }}>{activeLoans}</span> aktif
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{loans.length} total</div>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{formatDate(member.createdAt)}</td>
                    <td>
                      <span className={`badge ${member.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {member.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn ${member.isActive ? 'btn-danger' : 'btn-success'} btn-sm`}
                        style={{ fontSize: 11, padding: '4px 10px' }}
                        onClick={() => setConfirmTarget(member)}
                      >
                        {member.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleToggleActive}
        title={confirmTarget?.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
        message={`Apakah kamu yakin ingin ${confirmTarget?.isActive ? 'menonaktifkan' : 'mengaktifkan'} akun "${confirmTarget?.name}"?`}
        confirmLabel={confirmTarget?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
        confirmVariant={confirmTarget?.isActive ? 'btn-danger' : 'btn-success'}
        loading={loading}
      />
    </div>
  );
}
