// src/data/users.js
// Seed data — default accounts

// Passwords stored as SHA-256 hex (computed at runtime via initSeed)
// Plain passwords for demo:
//   admin@libr.id        → Admin@1234
//   mahasiswa@libr.id    → Member@1234
//   umum@libr.id         → Member@1234

export const USERS_SEED = [
  {
    id: 'user-001',
    name: 'Administrator',
    email: 'admin@libr.id',
    // SHA-256 of 'Admin@1234'
    passwordHash: '',   // filled at init
    plainPasswordForSeed: 'Admin@1234',
    phone: '08100000001',
    role: 'admin',
    memberType: null,
    nim: null,
    studyProgram: null,
    university: null,
    nik: null,
    occupation: null,
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: 'user-002',
    name: 'Budi Santoso',
    email: 'mahasiswa@libr.id',
    passwordHash: '',
    plainPasswordForSeed: 'Member@1234',
    phone: '08211234567',
    role: 'member',
    memberType: 'mahasiswa',
    nim: '2021050001',
    studyProgram: 'Teknik Informatika',
    university: 'Universitas Indonesia',
    nik: null,
    occupation: null,
    isActive: true,
    createdAt: '2023-02-01T00:00:00.000Z',
  },
  {
    id: 'user-003',
    name: 'Dewi Rahayu',
    email: 'umum@libr.id',
    passwordHash: '',
    plainPasswordForSeed: 'Member@1234',
    phone: '08577654321',
    role: 'member',
    memberType: 'bukan_mahasiswa',
    nim: null,
    studyProgram: null,
    university: null,
    nik: '3174056789012345',
    occupation: 'Guru',
    isActive: true,
    createdAt: '2023-02-15T00:00:00.000Z',
  },
];
