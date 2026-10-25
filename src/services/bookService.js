// src/services/bookService.js
// Book CRUD service.

import { storage } from './storageService.js';
import { sanitizeObject } from '../utils/sanitizer.js';
import { logActivity } from './activityService.js';

// ---- Read ----

export function getBooks() {
  return storage.get('books') || [];
}

export function getBookById(id) {
  return getBooks().find(b => b.id === id) || null;
}

/**
 * Search and filter books.
 * @param {{ query, category, availability, sort }} options
 */
export function searchBooks({ query = '', category = '', availability = '', sort = 'newest' } = {}) {
  let books = getBooks();

  if (query.trim()) {
    const q = query.toLowerCase();
    books = books.filter(
      b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    );
  }

  if (category) {
    books = books.filter(b => b.category === category);
  }

  if (availability === 'available') {
    books = books.filter(b => b.stock > 0);
  } else if (availability === 'unavailable') {
    books = books.filter(b => b.stock === 0);
  }

  switch (sort) {
    case 'popular':
      books.sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0));
      break;
    case 'az':
      books.sort((a, b) => a.title.localeCompare(b.title, 'id'));
      break;
    case 'za':
      books.sort((a, b) => b.title.localeCompare(a.title, 'id'));
      break;
    case 'newest':
    default:
      books.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
      break;
  }

  return books;
}

export function getPopularBooks(limit = 4) {
  return getBooks()
    .sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0))
    .slice(0, limit);
}

export function getNewReleases(limit = 4) {
  return getBooks()
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, limit);
}

// ---- Create ----

export function createBook(data, adminId) {
  const books = getBooks();
  const clean = sanitizeObject(data);

  const newBook = {
    id: `book-${Date.now()}`,
    title: clean.title,
    author: clean.author,
    publisher: clean.publisher,
    year: Number(clean.year),
    isbn: clean.isbn || '',
    category: clean.category,
    stock: Number(clean.stock),
    synopsis: clean.synopsis || '',
    cover: clean.cover || `https://placehold.co/300x420/4F46E5/FFFFFF?text=${encodeURIComponent(clean.title)}`,
    rating: 0,
    borrowCount: 0,
    addedAt: new Date().toISOString(),
    pages: Number(clean.pages) || 0,
    language: clean.language || 'Indonesia',
  };

  books.push(newBook);
  storage.set('books', books);
  logActivity(adminId, 'create_book', `Menambahkan buku: "${newBook.title}"`);
  return newBook;
}

// ---- Update ----

export function updateBook(id, data, adminId) {
  const books = getBooks();
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) throw new Error('Buku tidak ditemukan.');

  const clean = sanitizeObject(data);
  books[idx] = {
    ...books[idx],
    ...clean,
    year: Number(clean.year),
    stock: Number(clean.stock),
    pages: Number(clean.pages) || books[idx].pages,
    updatedAt: new Date().toISOString(),
  };

  storage.set('books', books);
  logActivity(adminId, 'update_book', `Memperbarui buku: "${books[idx].title}"`);
  return books[idx];
}

// ---- Delete ----

export function deleteBook(id, adminId) {
  const books = getBooks();
  const book = books.find(b => b.id === id);
  if (!book) throw new Error('Buku tidak ditemukan.');

  const updated = books.filter(b => b.id !== id);
  storage.set('books', updated);
  logActivity(adminId, 'delete_book', `Menghapus buku: "${book.title}"`);
}

// ---- Internal: adjust stock ----

export function adjustStock(bookId, delta) {
  const books = getBooks();
  const idx = books.findIndex(b => b.id === bookId);
  if (idx === -1) return;
  books[idx].stock = Math.max(0, books[idx].stock + delta);
  storage.set('books', books);
}

export function incrementBorrowCount(bookId) {
  const books = getBooks();
  const idx = books.findIndex(b => b.id === bookId);
  if (idx === -1) return;
  books[idx].borrowCount = (books[idx].borrowCount || 0) + 1;
  storage.set('books', books);
}
