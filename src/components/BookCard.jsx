// src/components/BookCard.jsx

import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/BookCard.css';

const CATEGORY_LABELS = {
  fiksi: 'Fiksi',
  sains: 'Sains',
  teknologi: 'Teknologi',
  sejarah: 'Sejarah',
  bisnis: 'Bisnis',
  anak: 'Anak-anak',
};

export default function BookCard({ book, variant = 'light', showBadges = true }) {
  const [imgError, setImgError] = useState(false);

  if (!book) return <BookCardSkeleton />;

  const isAvailable = book.stock > 0;

  return (
    <Link to={`/books/${book.id}`} className={`book-card${variant === 'dark' ? ' dark' : ''}`} aria-label={`${book.title} oleh ${book.author}`}>
      {/* Cover */}
      <div className="book-card__cover-wrap">
        {imgError || !book.cover ? (
          <div className="book-card__cover-placeholder">
            <span className="material-symbols-outlined" style={{ fontSize: 36 }}>menu_book</span>
            <span>{book.title}</span>
          </div>
        ) : (
          <img
            src={book.cover}
            alt={`Sampul buku ${book.title}`}
            className="book-card__cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}

        {/* Badges */}
        {showBadges && (
          <div className="book-card__badges">
            {book.isNew && <span className="badge badge-new">New</span>}
            {book.isPopular && <span className="badge badge-popular">Populer</span>}
          </div>
        )}

        {/* Availability */}
        <div className="book-card__status">
          <span className={`badge ${isAvailable ? 'badge-success' : 'badge-danger'}`}>
            {isAvailable ? `${book.stock} tersedia` : 'Habis'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="book-card__body">
        <span className="book-card__category">{CATEGORY_LABELS[book.category] || book.category}</span>
        <h3 className="book-card__title">{book.title}</h3>
        <p className="book-card__author">{book.author}</p>
        <div className="book-card__meta">
          <div className="book-card__rating">
            <span className="material-symbols-outlined">star</span>
            {book.rating?.toFixed(1) ?? '—'}
          </div>
          <span className="book-card__stock">{book.year}</span>
        </div>
      </div>
    </Link>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="book-card book-card-skeleton">
      <div className="book-card__cover-wrap skeleton" />
      <div className="book-card__body" style={{ gap: 'var(--space-2)' }}>
        <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 16, width: '90%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 4 }} />
      </div>
    </div>
  );
}
