// src/components/Loader.jsx

export function Loader({ text = 'Memuat...' }) {
  return (
    <div className="loader" role="status" aria-label={text}>
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
}

export function LoaderFullscreen({ text = 'Memuat...' }) {
  return (
    <div className="loader-fullscreen" role="status" aria-label={text}>
      <div className="spinner" style={{ width: 56, height: 56, borderWidth: 4 }} />
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{text}</span>
    </div>
  );
}

export function EmptyState({ icon = 'search_off', title = 'Tidak ada data', description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__desc">{description}</p>}
      {action}
    </div>
  );
}
