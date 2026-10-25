// src/utils/dateHelper.js
// Date utility functions

/**
 * Format a date string to Indonesian locale.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format a date to short form (DD/MM/YYYY).
 */
export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('id-ID');
}

/**
 * Calculate days remaining from now until a target date.
 * Negative means overdue.
 * @param {string|Date} dueDate
 * @returns {number}
 */
export function daysRemaining(dueDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - now) / (1000 * 60 * 60 * 24));
}

/**
 * Get loan deadline status.
 * @param {string|Date} dueDate
 * @returns {'safe'|'warning'|'overdue'}
 */
export function getLoanStatus(dueDate) {
  const days = daysRemaining(dueDate);
  if (days < 0) return 'overdue';
  if (days <= 2) return 'warning';
  return 'safe';
}

/**
 * Calculate fine for overdue books.
 * Fine: Rp 1.000/day.
 * @param {string|Date} dueDate
 * @returns {number} fine in IDR
 */
export function calculateFine(dueDate) {
  const days = daysRemaining(dueDate);
  if (days >= 0) return 0;
  return Math.abs(days) * 1000;
}

/**
 * Format currency in IDR.
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Add days to a date.
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get ISO date string for date picker (YYYY-MM-DD).
 * @param {Date} date
 * @returns {string}
 */
export function toInputDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Get relative time label.
 * @param {string|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return formatDate(date);
}
