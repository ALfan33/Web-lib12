// src/pages/Catalog.jsx
// Book catalog with search, filter, and pagination.

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import BookCard, { BookCardSkeleton } from '../components/BookCard.jsx';
import { EmptyState } from '../components/Loader.jsx';
import ScrollProgress from '../components/ScrollProgress.jsx';
import { searchBooks } from '../services/bookService.js';
import { CATEGORIES } from '../data/books.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useStaggerIn } from '../hooks/useScrollAnimation.js';
import '../styles/Catalog.css';
import '../styles/components.css';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Terbaru' },
  { value: 'popular', label: 'Terpopuler' },
  { value: 'az',      label: 'A → Z' },
  { value: 'za',      label: 'Z → A' },
];

const AVAILABILITY_OPTIONS = [
  { value: '',            label: 'Semua' },
  { value: 'available',   label: 'Tersedia' },
  { value: 'unavailable', label: 'Tidak Tersedia' },
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('cat') || '');
  const [availability, setAvailability] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const debouncedQuery = useDebounce(query, 300);
  const gridRef = useStaggerIn({ stagger: 0.05 });

  // Search whenever filters change
  const doSearch = useCallback(() => {
    setLoading(true);
    // Simulate async (swap with API call here)
    setTimeout(() => {
      const results = searchBooks({ query: debouncedQuery, category, availability, sort });
      setTotalCount(results.length);
      setBooks(results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
      setLoading(false);
    }, 150);
  }, [debouncedQuery, category, availability, sort, page]);

  useEffect(() => {
    doSearch();
    // Sync URL params
    const params = {};
    if (debouncedQuery) params.q = debouncedQuery;
    if (category) params.cat = category;
    setSearchParams(params, { replace: true });
  }, [doSearch]);

  // Reset page when filters change (not pagination)
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, category, availability, sort]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleCategoryClick = (cat) => {
    setCategory(prev => prev === cat ? '' : cat);
  };

  return (
    <div className="catalog-page">
      <ScrollProgress />
      <Navbar variant="light" />

      {/* Hero + Search */}
      <div className="catalog-hero">
        <div className="container">
          <h1 className="catalog-hero__title">Katalog Buku</h1>
          <p className="catalog-hero__sub">Temukan buku yang ingin kamu baca dari koleksi kami</p>
          <div className="search-bar">
            <span className="material-symbols-outlined" style={{ color: 'var(--color-gray-400)' }}>search</span>
            <input
              type="search"
              className="search-bar__input"
              placeholder="Cari judul, penulis, atau kategori..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Pencarian buku"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Hapus pencarian" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-400)', padding: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <div className="catalog-filters">
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-700)' }}>Kategori:</span>
          <button
            className={`filter-chip${!category ? ' active' : ''}`}
            onClick={() => setCategory('')}
          >
            Semua
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`filter-chip${category === c.id ? ' active' : ''}`}
              onClick={() => handleCategoryClick(c.id)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{c.icon}</span>
              {c.label}
            </button>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <select
              className="filter-select"
              value={availability}
              onChange={e => setAvailability(e.target.value)}
              aria-label="Filter ketersediaan"
            >
              {AVAILABILITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
              aria-label="Urutkan buku"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="catalog-results">
          <div className="catalog-meta">
            <span>{loading ? 'Memuat...' : `Menampilkan ${books.length} dari ${totalCount} buku`}</span>
            {(debouncedQuery || category) && (
              <button
                style={{ color: 'var(--color-indigo)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => { setQuery(''); setCategory(''); setAvailability(''); }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_alt_off</span>
                Reset filter
              </button>
            )}
          </div>

          {loading ? (
            <div className="catalog-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <BookCardSkeleton key={i} />)}
            </div>
          ) : books.length === 0 ? (
            <EmptyState
              icon="search_off"
              title="Buku tidak ditemukan"
              description={`Tidak ada buku yang cocok dengan "${debouncedQuery || category}". Coba kata kunci lain.`}
              action={<button className="btn btn-secondary" onClick={() => { setQuery(''); setCategory(''); }}>Reset Pencarian</button>}
            />
          ) : (
            <>
              <div className="catalog-grid" ref={gridRef}>
                {books.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="pagination" aria-label="Navigasi halaman">
                  <button
                    className="pagination__btn"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Halaman sebelumnya"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && arr[i - 1] !== p - 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`e-${i}`} style={{ padding: '0 4px', color: 'var(--color-gray-400)' }}>…</span>
                      ) : (
                        <button
                          key={p}
                          className={`pagination__btn${page === p ? ' active' : ''}`}
                          onClick={() => setPage(p)}
                          aria-label={`Halaman ${p}`}
                          aria-current={page === p ? 'page' : undefined}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    className="pagination__btn"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    aria-label="Halaman berikutnya"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
