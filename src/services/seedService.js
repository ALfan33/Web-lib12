// src/services/seedService.js
// Initialize localStorage with seed data on first run.

import { BOOKS_SEED } from '../data/books.js';
import { USERS_SEED } from '../data/users.js';
import { storage } from './storageService.js';
import { hashPassword } from '../utils/crypto.js';

export async function initSeed() {
  // Only seed once
  if (storage.get('seeded') === true) return;

  // Hash passwords for seed users
  const users = await Promise.all(
    USERS_SEED.map(async (u) => {
      const hash = await hashPassword(u.plainPasswordForSeed);
      const { plainPasswordForSeed: _, ...rest } = u;
      return { ...rest, passwordHash: hash };
    })
  );

  storage.set('books', BOOKS_SEED);
  storage.set('users', users);
  storage.set('loans', []);
  storage.set('activityLogs', []);
  storage.set('seeded', true);
}
