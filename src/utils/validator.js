// src/utils/validator.js
// Client-side form validation helpers

/**
 * Validate email format.
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password strength: min 8 chars, 1 uppercase, 1 digit.
 */
export function isStrongPassword(password) {
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

/**
 * Validate Indonesian phone number.
 */
export function isValidPhone(phone) {
  return /^08[0-9]{8,11}$/.test(phone);
}

/**
 * Validate NIK (16 digits).
 */
export function isValidNIK(nik) {
  return /^\d{16}$/.test(nik);
}

/**
 * Validate NIM (alphanumeric, 5–20 chars).
 */
export function isValidNIM(nim) {
  return /^[a-zA-Z0-9]{5,20}$/.test(nim);
}

/**
 * Validate registration form.
 * @param {Object} data
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateRegister(data) {
  const errors = {};

  if (!data.name || data.name.trim().length < 3)
    errors.name = 'Nama lengkap minimal 3 karakter.';

  if (!isValidEmail(data.email))
    errors.email = 'Format email tidak valid.';

  if (!isStrongPassword(data.password))
    errors.password = 'Kata sandi minimal 8 karakter, mengandung huruf besar dan angka.';

  if (data.password !== data.confirmPassword)
    errors.confirmPassword = 'Konfirmasi kata sandi tidak cocok.';

  if (!isValidPhone(data.phone))
    errors.phone = 'Nomor telepon tidak valid (contoh: 08123456789).';

  if (!data.memberType)
    errors.memberType = 'Pilih tipe keanggotaan.';

  if (data.memberType === 'mahasiswa') {
    if (!isValidNIM(data.nim))
      errors.nim = 'NIM tidak valid (alfanumerik, 5–20 karakter).';
    if (!data.studyProgram || data.studyProgram.trim().length < 3)
      errors.studyProgram = 'Program studi wajib diisi.';
    if (!data.university || data.university.trim().length < 3)
      errors.university = 'Nama kampus wajib diisi.';
  }

  if (data.memberType === 'bukan_mahasiswa') {
    if (!isValidNIK(data.nik))
      errors.nik = 'NIK harus 16 digit angka.';
    if (!data.occupation || data.occupation.trim().length < 2)
      errors.occupation = 'Pekerjaan wajib diisi.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate login form.
 */
export function validateLogin(data) {
  const errors = {};
  if (!isValidEmail(data.email))
    errors.email = 'Format email tidak valid.';
  if (!data.password || data.password.length < 1)
    errors.password = 'Kata sandi wajib diisi.';
  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate book form (admin).
 */
export function validateBook(data) {
  const errors = {};
  if (!data.title || data.title.trim().length < 2)
    errors.title = 'Judul buku wajib diisi.';
  if (!data.author || data.author.trim().length < 2)
    errors.author = 'Nama penulis wajib diisi.';
  if (!data.publisher || data.publisher.trim().length < 2)
    errors.publisher = 'Penerbit wajib diisi.';
  if (!data.year || isNaN(data.year) || data.year < 1000 || data.year > new Date().getFullYear())
    errors.year = 'Tahun terbit tidak valid.';
  if (!data.category)
    errors.category = 'Kategori wajib dipilih.';
  if (!data.stock || isNaN(data.stock) || Number(data.stock) < 0)
    errors.stock = 'Stok tidak valid.';
  return { isValid: Object.keys(errors).length === 0, errors };
}
