// src/utils/crypto.js
// Password hashing via Web Crypto API (SHA-256)

/**
 * Hash a plain-text password using SHA-256.
 * @param {string} password
 * @returns {Promise<string>} hex string
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compare a plain-text password against a stored hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, hash) {
  const hashed = await hashPassword(password);
  return hashed === hash;
}
