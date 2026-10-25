// src/pages/BookDetail.jsx
// Book detail page with borrow functionality.

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Modal from '../components/Modal.jsx';
import ScrollProgress from '../components/ScrollProgress.jsx';
import { Loader } from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getBookById } from '../services/bookService.js';
import { requestBorrow, getActiveLoansByUser } from '../services/loanService.js';
import { formatDate, toInputDate, addDays } from '../utils/dateHelper.js';
import '../styles/components.css';

const CATEGORY_LABELS = {
  fiksi: 'Fiksi', sains: 'Sains', teknologi: 'Teknologi',
  sejarah: 'Sejarah', bisnis: 'Bisnis', anak: 'Anak-anak',
};

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowModal, setBorrowModal] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [borrowing, setBorrowing] = useState(false);
  const [alreadyBorrowing, setAlreadyBorrowing] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [imgError, setImgError] = useState(false);

  const minDate = toInputDate(addDays(new Date(), 1));
  const maxDate = toInputDate(addDays(new Date(), 7));

  useEffect(() => {
    const b = getBookById(id);
    setBook(b);
    setLoading(false);
    if (!b) return;

    if (user) {
      const activeLoans = getActiveLoansByUser(user.id);
      setActiveCount(activeLoans.length);
      setAlreadyBorrowing(activeLoans.some(l => l.bookId === b.id));
    }
  }, [id, user]);

  const handleBorrow = async () => {
    if (!user) { navigate('/login'); return; }
    if (!dueDate) { addToast('Pilih tanggal pengembalian.', 'warning'); return; }

    setBorrowing(true);
    try {
      await requestBorrow(user.id, book.id, dueDate);
      addToast('Permintaan peminjaman berhasil dikirim!', 'success');
      setBorrowModal(false);
      // Refresh state
      const activeLoans = getActiveLoansByUser(user.id);
      setActiveCount(activeLoans.length);
      setAlreadyBorrowing(true);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) return <Loader text="Memuat detail buku..." />;

  if (!book) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--color-gray-300)' }}>menu_book</span>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gray-700)' }}>Buku tidak ditemukan</h2>
        <Link to="/catalog" className="btn btn-primary">Kembali ke Katalog</Link>
      </div>
    );
  }

  const canBorrow = user?.role === 'member' && book.stock > 0 && !alreadyBorrowing && activeCount < 3;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-gray-50)' }}>
      <ScrollProgress />
      <Navbar variant="light" />

      <div className="container" style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-8))', paddingBottom: 'var(--space-16)' }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--color-indigo)' }}>Beranda</Link>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
          <Link to="/catalog" style={{ color: 'var(--color-indigo)' }}>Katalog</Link>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
          <span style={{ color: 'var(--color-gray-500)' }}>{book.title}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-8)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-8)' }}>
            <style>{`@media(min-width:768px){.book-detail-grid{grid-template-columns:280px 1fr!important}}`}</style>
            <div className="book-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-8)' }}>
              {/* Cover */}
              <div style={{ maxWidth: 280, marginInline: 'auto' }}>
                <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', aspectRatio: '5/7' }}>
                  {imgError || !book.cover ? (
                    <div style={{ width: '100%', height: '100%', background: 'var(--gradient-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: 'var(--space-3)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 56 }}>menu_book</span>
                      <span style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', padding: 'var(--space-3)' }}>{book.title}</span>
                    </div>
                  ) : (
                    <img src={book.cover} alt={`Sampul ${book.title}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
                  )}
                </div>

                {/* Borrow button */}
                <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {alreadyBorrowing ? (
                    <div className="badge badge-warning" style={{ justifyContent: 'center', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
                      Kamu sedang meminjam buku ini
                    </div>
                  ) : book.stock === 0 ? (
                    <div className="badge badge-danger" style={{ justifyContent: 'center', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>block</span>
                      Stok habis
                    </div>
                  ) : activeCount >= 3 ? (
                    <div className="badge badge-warning" style={{ justifyContent: 'center', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                      Batas peminjaman tercapai (3 buku)
                    </div>
                  ) : user?.role === 'admin' ? null : user?.role === 'member' ? (
                    <button className="btn btn-primary w-full" onClick={() => setBorrowModal(true)} style={{ width: '100%', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined">book</span>
                      Pinjam Buku
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}>
                      <span className="material-symbols-outlined">login</span>
                      Masuk untuk Meminjam
                    </Link>
                  )}
                </div>
              </div>

              {/* Info */}
              <div>
                <span className="badge badge-info" style={{ marginBottom: 'var(--space-2)' }}>
                  {CATEGORY_LABELS[book.category] || book.category}
                </span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(var(--text-2xl),4vw,var(--text-4xl))', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-900)', lineHeight: 1.2, marginBottom: 'var(--space-2)' }}>
                  {book.title}
                </h1>
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
                  oleh <strong style={{ color: 'var(--color-indigo)' }}>{book.author}</strong>
                </p>

                {/* Rating & Stats */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-yellow)', fontVariationSettings: "'FILL' 1" }}>star</span>
                    <strong>{book.rating?.toFixed(1) ?? '—'}</strong>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>/ 5.0</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                    {book.borrowCount} kali dipinjam
                  </div>
                  <span className={`badge ${book.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {book.stock > 0 ? `${book.stock} stok tersedia` : 'Stok habis'}
                  </span>
                </div>

                {/* Book details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', border: '1px solid var(--color-border)' }}>
                  {[
                    { icon: 'business_center', label: 'Penerbit', value: book.publisher },
                    { icon: 'calendar_today', label: 'Tahun', value: book.year },
                    { icon: 'numbers', label: 'ISBN', value: book.isbn || '—' },
                    { icon: 'book_2', label: 'Halaman', value: `${book.pages || '—'} hlm` },
                    { icon: 'translate', label: 'Bahasa', value: book.language || 'Indonesia' },
                    { icon: 'date_range', label: 'Ditambahkan', value: formatDate(book.addedAt) },
                  ].map(d => (
                    <div key={d.label}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{d.icon}</span>
                        {d.label}
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>{d.value}</div>
                    </div>
                  ))}
                </div>

                {/* Synopsis */}
                {book.synopsis && (
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-3)', color: 'var(--color-gray-800)' }}>Sinopsis</h2>
                    <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.8, color: 'var(--color-gray-600)' }}>{book.synopsis}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Borrow Modal */}
      <Modal
        isOpen={borrowModal}
        onClose={() => setBorrowModal(false)}
        title="Pinjam Buku"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--color-indigo)' }}>menu_book</span>
            <div>
              <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-900)' }}>{book.title}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{book.author}</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="due-date">
              Tanggal Pengembalian <span className="required">*</span>
            </label>
            <input
              id="due-date"
              type="date"
              className="form-input"
              value={dueDate}
              min={minDate}
              max={maxDate}
              onChange={e => setDueDate(e.target.value)}
            />
            <span className="form-hint">Maksimal 7 hari dari hari ini ({formatDate(maxDate)})</span>
          </div>

          <div className="badge badge-info" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
            Permintaan akan diproses oleh admin.
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setBorrowModal(false)}>Batal</button>
            <button className="btn btn-primary btn-sm" onClick={handleBorrow} disabled={borrowing || !dueDate}>
              {borrowing ? 'Memproses...' : 'Kirim Permintaan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
