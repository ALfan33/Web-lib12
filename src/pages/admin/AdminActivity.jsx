// src/pages/admin/AdminActivity.jsx
// Admin activity log viewer.

import { getActivityLogs } from '../../services/activityService.js';
import { getAllUsers } from '../../services/authService.js';
import { formatDate, timeAgo } from '../../utils/dateHelper.js';
import '../../styles/Admin.css';

const ACTION_ICONS = {
  create_book:       { icon: 'add_circle',      color: 'var(--color-green)' },
  update_book:       { icon: 'edit',            color: 'var(--color-blue)' },
  delete_book:       { icon: 'delete',          color: 'var(--color-red)' },
  approve_borrow:    { icon: 'check_circle',    color: 'var(--color-green)' },
  reject_borrow:     { icon: 'cancel',          color: 'var(--color-red)' },
  approve_return:    { icon: 'assignment_return', color: 'var(--color-indigo)' },
  approve_extension: { icon: 'schedule',        color: 'var(--color-blue)' },
  reject_extension:  { icon: 'block',           color: 'var(--color-orange)' },
};

export default function AdminActivity() {
  const logs = getActivityLogs(100);
  const users = getAllUsers();
  const getUserName = (id) => users.find(u => u.id === id)?.name || 'Unknown';

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h1 className="admin-page-title">Log Aktivitas Admin</h1>
          <p className="admin-page-sub">{logs.length} aktivitas tercatat</p>
        </div>
      </div>

      <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {logs.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-3)', opacity: 0.3 }}>history</span>
            Belum ada aktivitas tercatat.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {logs.map((log, i) => {
              const { icon, color } = ACTION_ICONS[log.action] || { icon: 'info', color: 'var(--color-gray-400)' };
              return (
                <div key={log.id} style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)', borderBottom: i < logs.length - 1 ? '1px solid var(--color-border)' : 'none', alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color }}>{icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-800)', lineHeight: 1.5 }}>
                      <strong style={{ color: 'var(--color-gray-900)' }}>{getUserName(log.userId)}</strong>
                      {' — '}
                      {log.description}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2, display: 'flex', gap: 'var(--space-3)' }}>
                      <span title={formatDate(log.timestamp)}>{timeAgo(log.timestamp)}</span>
                      <span style={{ color: 'var(--color-gray-300)' }}>·</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{log.action}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
