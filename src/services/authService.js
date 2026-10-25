// src/services/authService.js
// Authentication service — login, logout, register, session management.

import { storage } from './storageService.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { sanitizeObject } from '../utils/sanitizer.js';

const SESSION_KEY = 'session';
const LOCKOUT_KEY = 'loginLockout';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 1 minute

// ---- Session ----

export function getSession() {
  return storage.get(SESSION_KEY);
}

export function isLoggedIn() {
  return !!getSession();
}

export function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  const users = storage.get('users') || [];
  return users.find(u => u.id === session.userId) || null;
}

export function hasRole(role) {
  const user = getCurrentUser();
  return user?.role === role;
}

// ---- Login ----

export async function login(email, password) {
  // Lockout check
  const lockout = storage.get(LOCKOUT_KEY);
  if (lockout && lockout.email === email.toLowerCase()) {
    const elapsed = Date.now() - lockout.lockedAt;
    if (elapsed < LOCKOUT_DURATION_MS) {
      const remaining = Math.ceil((LOCKOUT_DURATION_MS - elapsed) / 1000);
      throw new Error(`Terlalu banyak percobaan. Coba lagi dalam ${remaining} detik.`);
    } else {
      storage.remove(LOCKOUT_KEY);
    }
  }

  const users = storage.get('users') || [];
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    _recordFailedAttempt(email);
    throw new Error('Email atau kata sandi salah.');
  }

  if (!user.isActive) {
    throw new Error('Akun Anda telah dinonaktifkan. Hubungi admin.');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    _recordFailedAttempt(email);
    throw new Error('Email atau kata sandi salah.');
  }

  // Clear lockout on success
  storage.remove(LOCKOUT_KEY);

  // Create session
  const session = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    createdAt: new Date().toISOString(),
  };
  storage.set(SESSION_KEY, session);
  return session;
}

function _recordFailedAttempt(email) {
  const lockout = storage.get(LOCKOUT_KEY) || { email: email.toLowerCase(), attempts: 0 };
  lockout.attempts += 1;
  if (lockout.attempts >= MAX_ATTEMPTS) {
    lockout.lockedAt = Date.now();
  }
  storage.set(LOCKOUT_KEY, lockout);
  if (lockout.attempts < MAX_ATTEMPTS) {
    const left = MAX_ATTEMPTS - lockout.attempts;
    throw new Error(`Email atau kata sandi salah. Sisa ${left} percobaan.`);
  }
  throw new Error(`Terlalu banyak percobaan. Akun dikunci selama 1 menit.`);
}

// ---- Logout ----

export function logout() {
  storage.remove(SESSION_KEY);
}

// ---- Register ----

export async function register(formData) {
  const data = sanitizeObject(formData);
  const users = storage.get('users') || [];

  // Check duplicate email
  const exists = users.some(u => u.email.toLowerCase() === data.email.toLowerCase());
  if (exists) throw new Error('Email sudah terdaftar.');

  const passwordHash = await hashPassword(data.password);

  const newUser = {
    id: `user-${Date.now()}`,
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash,
    phone: data.phone,
    role: 'member',
    memberType: data.memberType,
    nim: data.memberType === 'mahasiswa' ? data.nim : null,
    studyProgram: data.memberType === 'mahasiswa' ? data.studyProgram : null,
    university: data.memberType === 'mahasiswa' ? data.university : null,
    nik: data.memberType === 'bukan_mahasiswa' ? data.nik : null,
    occupation: data.memberType === 'bukan_mahasiswa' ? data.occupation : null,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  storage.set('users', users);
  return newUser;
}

// ---- User Management (admin) ----

export function getUsers() {
  return (storage.get('users') || []).filter(u => u.role !== 'admin');
}

export function getAllUsers() {
  return storage.get('users') || [];
}

export function toggleUserActive(userId, currentAdminId) {
  if (userId === currentAdminId) throw new Error('Tidak dapat menonaktifkan akun sendiri.');
  const users = storage.get('users') || [];
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User tidak ditemukan.');
  users[idx].isActive = !users[idx].isActive;
  storage.set('users', users);
  return users[idx];
}

export function updateUserPassword(userId, newPassword) {
  const users = storage.get('users') || [];
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User tidak ditemukan.');
  return hashPassword(newPassword).then(hash => {
    users[idx].passwordHash = hash;
    storage.set('users', users);
  });
}
