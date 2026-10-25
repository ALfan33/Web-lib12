// src/components/Modal.jsx

import { useEffect } from 'react';
import '../styles/components.css';

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthMap = { sm: '400px', md: '520px', lg: '720px', xl: '900px' };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal" style={{ maxWidth: maxWidthMap[size] || maxWidthMap.md }}>
        <div className="modal__header">
          <h2 className="modal__title" id="modal-title">{title}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Tutup modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

/** Confirm dialog variant */
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Hapus', confirmVariant = 'btn-danger', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className="confirm-dialog__icon danger">
          <span className="material-symbols-outlined">warning</span>
        </div>
        <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>{message}</p>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-5)' }}>
        <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={loading}>Batal</button>
        <button className={`btn ${confirmVariant} btn-sm`} onClick={onConfirm} disabled={loading}>
          {loading ? 'Memproses...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
