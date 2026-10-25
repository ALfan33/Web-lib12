// src/services/loanService.js
// Loan management service — borrow, return, extend, approve.

import { storage } from './storageService.js';
import { adjustStock, incrementBorrowCount } from './bookService.js';
import { logActivity } from './activityService.js';

const MAX_LOANS_PER_MEMBER = 3;
const MAX_LOAN_DAYS = 7;

export function getLoans() {
  return storage.get('loans') || [];
}

export function getLoanById(id) {
  return getLoans().find(l => l.id === id) || null;
}

export function getLoansByUser(userId) {
  return getLoans().filter(l => l.userId === userId);
}

export function getActiveLoansByUser(userId) {
  return getLoans().filter(
    l =>
      l.userId === userId &&
      !['returned', 'rejected'].includes(l.status)
  );
}

// ---- Borrow Request ----

export function requestBorrow(userId, bookId, dueDate) {
  const loans = getLoans();

  // Check: max active loans
  const activeLoans = loans.filter(
    l => l.userId === userId && !['returned', 'rejected'].includes(l.status)
  );
  if (activeLoans.length >= MAX_LOANS_PER_MEMBER) {
    throw new Error(`Batas maksimal peminjaman adalah ${MAX_LOANS_PER_MEMBER} buku.`);
  }

  // Check: already borrowing same book
  const alreadyBorrowing = loans.some(
    l =>
      l.userId === userId &&
      l.bookId === bookId &&
      !['returned', 'rejected'].includes(l.status)
  );
  if (alreadyBorrowing) {
    throw new Error('Kamu sedang meminjam buku ini.');
  }

  // Validate due date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 1 || diffDays > MAX_LOAN_DAYS) {
    throw new Error(`Durasi peminjaman maksimal ${MAX_LOAN_DAYS} hari.`);
  }

  const newLoan = {
    id: `loan-${Date.now()}`,
    userId,
    bookId,
    status: 'requested',          // requested → borrowed → return_requested → returned
    requestedAt: new Date().toISOString(),
    borrowedAt: null,
    dueDate: new Date(dueDate).toISOString(),
    returnedAt: null,
    adminNote: null,
    extensionStatus: null,         // pending | approved | rejected
    extensionDueDate: null,
  };

  loans.push(newLoan);
  storage.set('loans', loans);
  return newLoan;
}

// ---- Admin: Approve Borrow ----

export function approveBorrow(loanId, adminId) {
  const loans = getLoans();
  const idx = loans.findIndex(l => l.id === loanId);
  if (idx === -1) throw new Error('Data peminjaman tidak ditemukan.');
  if (loans[idx].status !== 'requested') throw new Error('Status tidak valid untuk disetujui.');

  loans[idx].status = 'borrowed';
  loans[idx].borrowedAt = new Date().toISOString();
  storage.set('loans', loans);

  // Decrease stock
  adjustStock(loans[idx].bookId, -1);
  incrementBorrowCount(loans[idx].bookId);

  logActivity(adminId, 'approve_borrow', `Menyetujui peminjaman ID: ${loanId}`);
  return loans[idx];
}

// ---- Admin: Reject Borrow ----

export function rejectBorrow(loanId, adminId, note = '') {
  const loans = getLoans();
  const idx = loans.findIndex(l => l.id === loanId);
  if (idx === -1) throw new Error('Data peminjaman tidak ditemukan.');
  if (loans[idx].status !== 'requested') throw new Error('Status tidak valid untuk ditolak.');

  loans[idx].status = 'rejected';
  loans[idx].adminNote = note;
  storage.set('loans', loans);

  logActivity(adminId, 'reject_borrow', `Menolak peminjaman ID: ${loanId}. Catatan: ${note}`);
  return loans[idx];
}

// ---- Member: Request Return ----

export function requestReturn(loanId, userId) {
  const loans = getLoans();
  const idx = loans.findIndex(l => l.id === loanId);
  if (idx === -1) throw new Error('Data peminjaman tidak ditemukan.');
  if (loans[idx].userId !== userId) throw new Error('Akses ditolak.');
  if (loans[idx].status !== 'borrowed') throw new Error('Buku harus dalam status dipinjam untuk dikembalikan.');

  loans[idx].status = 'return_requested';
  storage.set('loans', loans);
  return loans[idx];
}

// ---- Admin: Approve Return ----

export function approveReturn(loanId, adminId) {
  const loans = getLoans();
  const idx = loans.findIndex(l => l.id === loanId);
  if (idx === -1) throw new Error('Data peminjaman tidak ditemukan.');
  if (loans[idx].status !== 'return_requested') throw new Error('Status tidak valid.');

  loans[idx].status = 'returned';
  loans[idx].returnedAt = new Date().toISOString();
  storage.set('loans', loans);

  // Restore stock
  adjustStock(loans[idx].bookId, 1);

  logActivity(adminId, 'approve_return', `Menyetujui pengembalian ID: ${loanId}`);
  return loans[idx];
}

// ---- Member: Request Extension ----

export function requestExtension(loanId, userId, newDueDate) {
  const loans = getLoans();
  const idx = loans.findIndex(l => l.id === loanId);
  if (idx === -1) throw new Error('Data peminjaman tidak ditemukan.');
  if (loans[idx].userId !== userId) throw new Error('Akses ditolak.');
  if (loans[idx].status !== 'borrowed') throw new Error('Hanya buku yang sedang dipinjam yang dapat diperpanjang.');
  if (loans[idx].extensionStatus === 'pending') throw new Error('Permohonan perpanjangan sedang menunggu persetujuan.');

  loans[idx].extensionStatus = 'pending';
  loans[idx].extensionDueDate = new Date(newDueDate).toISOString();
  storage.set('loans', loans);
  return loans[idx];
}

// ---- Admin: Approve/Reject Extension ----

export function approveExtension(loanId, adminId) {
  const loans = getLoans();
  const idx = loans.findIndex(l => l.id === loanId);
  if (idx === -1) throw new Error('Data peminjaman tidak ditemukan.');
  if (loans[idx].extensionStatus !== 'pending') throw new Error('Tidak ada permintaan perpanjangan.');

  loans[idx].dueDate = loans[idx].extensionDueDate;
  loans[idx].extensionStatus = 'approved';
  loans[idx].extensionDueDate = null;
  storage.set('loans', loans);

  logActivity(adminId, 'approve_extension', `Menyetujui perpanjangan ID: ${loanId}`);
  return loans[idx];
}

export function rejectExtension(loanId, adminId, note = '') {
  const loans = getLoans();
  const idx = loans.findIndex(l => l.id === loanId);
  if (idx === -1) throw new Error('Data peminjaman tidak ditemukan.');

  loans[idx].extensionStatus = 'rejected';
  loans[idx].adminNote = note;
  storage.set('loans', loans);

  logActivity(adminId, 'reject_extension', `Menolak perpanjangan ID: ${loanId}`);
  return loans[idx];
}

// ---- Stats for Admin Dashboard ----

export function getLoanStats() {
  const loans = getLoans();
  const now = new Date();

  return {
    total: loans.length,
    active: loans.filter(l => l.status === 'borrowed').length,
    requested: loans.filter(l => l.status === 'requested').length,
    returnRequested: loans.filter(l => l.status === 'return_requested').length,
    returned: loans.filter(l => l.status === 'returned').length,
    overdue: loans.filter(l => l.status === 'borrowed' && new Date(l.dueDate) < now).length,
    extensionPending: loans.filter(l => l.extensionStatus === 'pending').length,
  };
}
