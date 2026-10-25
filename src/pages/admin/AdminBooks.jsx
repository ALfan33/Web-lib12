// src/pages/admin/AdminBooks.jsx
// Book management: list, create, edit, delete.

import { useState, useCallback } from 'react';
import Modal, { ConfirmDialog } from '../../components/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getBooks, createBook, updateBook, deleteBook } from '../../services/bookService.js';
import { validateBook } from '../../utils/validator.js';
import { CATEGORIES } from '../../data/books.js';
import { formatDate } from '../../utils/dateHelper.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import '../../styles/Admin.css';
import '../../styles/components.css';

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

const EMPTY_FORM = {
  title: '', author: '', publisher: '', year: new Date().getFullYear(),
  isbn: '', category: '', stock: 1, synopsis: '', cover: '',
  pages: '', language: 'Indonesia',
};

export default function AdminBooks() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [formModal, setFormModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  // Re-read books on every render (since localStorage is synchronous)
  const allBooks = getBooks();
  const filteredBooks = allBooks.filter(b =>
    !debouncedSearch ||
    b.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    b.author.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const openCreate = () => {
    setEditingBook(null);
    setForm(EMPTY_FORM);
    setCoverPreview('');
    setErrors({});
    setFormModal(true);
  };

  const openEdit = (book) => {
    setEditingBook(book);
    setForm({
      title: book.title, author: book.author, publisher: book.publisher,
      year: book.year, isbn: book.isbn || '', category: book.category,
      stock: book.stock, synopsis: book.synopsis || '', cover: book.cover || '',
      pages: book.pages || '', language: book.language || 'Indonesia',
    });
    setCoverPreview(book.cover || '');
    setErrors({});
    setFormModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      addToast('Format gambar harus JPG, PNG, atau WebP.', 'error');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      addToast('Ukuran gambar maksimal 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setCoverPreview(dataUrl);
      setForm(f => ({ ...f, cover: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const { isValid, errors: errs } = validateBook(form);
    if (!isValid) { setErrors(errs); return; }

    setSaving(true);
    try {
      if (editingBook) {
        updateBook(editingBook.id, form, user.id);
        addToast('Buku berhasil diperbarui.', 'success');
      } else {
        createBook(form, user.id);
        addToast('Buku berhasil ditambahkan.', 'success');
      }
      setFormModal(false);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      deleteBook(deleteTarget.id, user.id);
      addToast(`"${deleteTarget.title}" telah dihapus.`, 'success');
      setDeleteTarget(null);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h1 className="admin-page-title">Manajemen Buku</h1>
          <p className="admin-page-sub">{allBooks.length} buku terdaftar</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <span className="material-symbols-outlined">add</span>
          Tambah Buku
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <span className="admin-table-title">Daftar Buku</span>
          <div className="form-input-wrap" style={{ maxWidth: 300, width: '100%' }}>
            <span className="material-symbols-outlined form-input-icon">search</span>
            <input
              type="search"
              className="form-input"
              placeholder="Cari judul atau penulis..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sampul</th>
                <th>Judul & Penulis</th>
                <th>Kategori</th>
                <th>Stok</th>
                <th>Dipinjam</th>
                <th>Ditambahkan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                  Tidak ada buku ditemukan.
                </td></tr>
              ) : filteredBooks.map(book => (
                <tr key={book.id}>
                  <td>
                    <div style={{ width: 40, height: 56, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--color-gray-100)' }}>
                      {book.cover ? (
                        <img src={book.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 16 }}>menu_book</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-900)', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{book.author} · {book.year}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{CATEGORIES.find(c => c.id === book.category)?.label || book.category}</span>
                  </td>
                  <td>
                    <span className={`badge ${book.stock > 0 ? 'badge-success' : 'badge-danger'}`}>{book.stock}</span>
                  </td>
                  <td>{book.borrowCount || 0}x</td>
                  <td style={{ fontSize: 'var(--text-xs)' }}>{formatDate(book.addedAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <button className="btn-icon" onClick={() => openEdit(book)} title="Edit buku" aria-label="Edit">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                      </button>
                      <button className="btn-icon" style={{ color: 'var(--color-red)' }} onClick={() => setDeleteTarget(book)} title="Hapus buku" aria-label="Hapus">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book form modal */}
      <Modal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={editingBook ? 'Edit Buku' : 'Tambah Buku Baru'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => setFormModal(false)}>Batal</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan...' : editingBook ? 'Perbarui' : 'Simpan'}
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
          <style>{`@media(min-width:640px){.book-form-grid{grid-template-columns:1fr 1fr!important}}`}</style>

          {/* Cover upload */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>
            <div>
              <div style={{ width: 120, height: 168, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--color-gray-100)', border: '2px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {coverPreview ? (
                  <img src={coverPreview} alt="Preview sampul" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', padding: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--color-gray-300)' }}>image</span>
                    <div style={{ fontSize: 10, color: 'var(--color-gray-400)' }}>Sampul</div>
                  </div>
                )}
              </div>
              <label style={{ display: 'block', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', textAlign: 'center', color: 'var(--color-indigo)', cursor: 'pointer', textDecoration: 'underline' }}>
                Upload Gambar
                <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleCoverUpload} />
              </label>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cover-url">URL Sampul</label>
              <input id="cover-url" type="url" name="cover" className="form-input" placeholder="https://..." value={form.cover} onChange={handleFormChange} />
              <span className="form-hint">Isi URL atau upload gambar di kiri. JPG/PNG/WebP, maks. 2MB.</span>
            </div>
          </div>

          <div className="book-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="b-title">Judul <span className="required">*</span></label>
              <input id="b-title" name="title" type="text" className={`form-input${errors.title ? ' error' : ''}`} value={form.title} onChange={handleFormChange} />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="b-author">Penulis <span className="required">*</span></label>
              <input id="b-author" name="author" type="text" className={`form-input${errors.author ? ' error' : ''}`} value={form.author} onChange={handleFormChange} />
              {errors.author && <span className="form-error">{errors.author}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="b-publisher">Penerbit <span className="required">*</span></label>
              <input id="b-publisher" name="publisher" type="text" className={`form-input${errors.publisher ? ' error' : ''}`} value={form.publisher} onChange={handleFormChange} />
              {errors.publisher && <span className="form-error">{errors.publisher}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="b-year">Tahun Terbit <span className="required">*</span></label>
              <input id="b-year" name="year" type="number" className={`form-input${errors.year ? ' error' : ''}`} value={form.year} onChange={handleFormChange} min="1000" max={new Date().getFullYear()} />
              {errors.year && <span className="form-error">{errors.year}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="b-isbn">ISBN</label>
              <input id="b-isbn" name="isbn" type="text" className="form-input" value={form.isbn} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="b-category">Kategori <span className="required">*</span></label>
              <select id="b-category" name="category" className={`form-select${errors.category ? ' error' : ''}`} value={form.category} onChange={handleFormChange}>
                <option value="">-- Pilih Kategori --</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="b-stock">Stok <span className="required">*</span></label>
              <input id="b-stock" name="stock" type="number" className={`form-input${errors.stock ? ' error' : ''}`} value={form.stock} onChange={handleFormChange} min="0" />
              {errors.stock && <span className="form-error">{errors.stock}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="b-pages">Jumlah Halaman</label>
              <input id="b-pages" name="pages" type="number" className="form-input" value={form.pages} onChange={handleFormChange} min="1" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="b-synopsis">Sinopsis</label>
            <textarea id="b-synopsis" name="synopsis" className="form-textarea" rows={4} value={form.synopsis} onChange={handleFormChange} style={{ minHeight: 100 }} />
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Buku"
        message={`Apakah kamu yakin ingin menghapus "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        loading={deleting}
      />
    </div>
  );
}
