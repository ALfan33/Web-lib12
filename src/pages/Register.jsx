// src/pages/Register.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validateRegister } from '../utils/validator.js';
import '../styles/Auth.css';
import '../styles/components.css';

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: '', color: '' },
    { label: 'Lemah',   color: 'var(--color-red)' },
    { label: 'Cukup',   color: 'var(--color-orange)' },
    { label: 'Kuat',    color: 'var(--color-yellow)' },
    { label: 'Sangat Kuat', color: 'var(--color-green)' },
  ];
  return { score, ...levels[score] };
}

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', memberType: '',
    nim: '', studyProgram: '', university: '',
    nik: '', occupation: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwStrength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: errs } = validateRegister(form);
    if (!isValid) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      await register(form);
      addToast('Pendaftaran berhasil! Silakan masuk.', 'success');
      navigate('/login');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Brand panel */}
      <div className="auth-panel-brand">
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.4) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-xl)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginInline: 'auto', marginBottom: 'var(--space-6)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 38, color: 'white' }}>person_add</span>
          </div>
          <h2 className="auth-panel-brand__title">Bergabung<br />Bersama Kami!</h2>
          <p className="auth-panel-brand__sub">Daftar gratis dan nikmati akses ke ribuan koleksi buku berkualitas.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'flex-start', textAlign: 'left' }}>
            {[
              { icon: 'check_circle', text: 'Gratis mendaftar dan meminjam' },
              { icon: 'check_circle', text: 'Batas peminjaman 3 buku sekaligus' },
              { icon: 'check_circle', text: 'Perpanjangan mudah via aplikasi' },
            ].map(b => (
              <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'rgba(255,255,255,0.9)', fontSize: 'var(--text-sm)' }}>
                <span className="material-symbols-outlined" style={{ color: '#4ade80', fontSize: 18 }}>{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-panel-form" style={{ padding: 'var(--space-8) var(--space-4)', justifyContent: 'flex-start', overflowY: 'auto' }}>
        <div className="auth-card" style={{ marginBlock: 'var(--space-6)' }}>
          <div className="auth-logo">
            <div className="auth-logo__icon">
              <span className="material-symbols-outlined">local_library</span>
            </div>
            <span className="auth-logo__name">PustakaDigital</span>
          </div>

          <h1 className="auth-title">Buat Akun Baru</h1>
          <p className="auth-subtitle">Sudah punya akun? <Link to="/login">Masuk di sini</Link></p>

          {apiError && (
            <div className="alert alert-error" role="alert">
              <span className="material-symbols-outlined">error</span>
              {apiError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">Nama Lengkap <span className="required">*</span></label>
              <div className="form-input-wrap">
                <span className="material-symbols-outlined form-input-icon">person</span>
                <input id="name" type="text" name="name" className={`form-input${errors.name ? ' error' : ''}`} placeholder="Nama lengkap kamu" value={form.name} onChange={handleChange} autoComplete="name" />
              </div>
              {errors.name && <span className="form-error"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email <span className="required">*</span></label>
              <div className="form-input-wrap">
                <span className="material-symbols-outlined form-input-icon">email</span>
                <input id="reg-email" type="email" name="email" className={`form-input${errors.email ? ' error' : ''}`} placeholder="email@contoh.com" value={form.email} onChange={handleChange} autoComplete="email" />
              </div>
              {errors.email && <span className="form-error"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{errors.email}</span>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Nomor Telepon <span className="required">*</span></label>
              <div className="form-input-wrap">
                <span className="material-symbols-outlined form-input-icon">call</span>
                <input id="phone" type="tel" name="phone" className={`form-input${errors.phone ? ' error' : ''}`} placeholder="08xxxxxxxxxx" value={form.phone} onChange={handleChange} autoComplete="tel" />
              </div>
              {errors.phone && <span className="form-error"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{errors.phone}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Kata Sandi <span className="required">*</span></label>
              <div className="form-input-wrap">
                <span className="material-symbols-outlined form-input-icon">lock</span>
                <input id="reg-password" type={showPassword ? 'text' : 'password'} name="password" className={`form-input${errors.password ? ' error' : ''}`} placeholder="Min. 8 karakter, huruf besar, angka" value={form.password} onChange={handleChange} autoComplete="new-password" />
                <button type="button" className="form-input-toggle" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Sembunyikan' : 'Tampilkan'}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {form.password && (
                <>
                  <div className="password-strength">
                    <div className="password-strength__bar" style={{ width: `${(pwStrength.score / 4) * 100}%`, background: pwStrength.color }} />
                  </div>
                  <span className="form-hint" style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                </>
              )}
              {errors.password && <span className="form-error"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Konfirmasi Kata Sandi <span className="required">*</span></label>
              <div className="form-input-wrap">
                <span className="material-symbols-outlined form-input-icon">lock_clock</span>
                <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} name="confirmPassword" className={`form-input${errors.confirmPassword ? ' error' : ''}`} placeholder="Ulangi kata sandi" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
                <button type="button" className="form-input-toggle" onClick={() => setShowConfirm(s => !s)} aria-label={showConfirm ? 'Sembunyikan' : 'Tampilkan'}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{showConfirm ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.confirmPassword && <span className="form-error"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{errors.confirmPassword}</span>}
            </div>

            {/* Member type */}
            <div className="form-group">
              <label className="form-label">Tipe Keanggotaan <span className="required">*</span></label>
              <div className="radio-group">
                <label className="radio-option">
                  <input type="radio" name="memberType" value="mahasiswa" checked={form.memberType === 'mahasiswa'} onChange={handleChange} />
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-indigo)' }}>school</span>
                  Mahasiswa
                </label>
                <label className="radio-option">
                  <input type="radio" name="memberType" value="bukan_mahasiswa" checked={form.memberType === 'bukan_mahasiswa'} onChange={handleChange} />
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-indigo)' }}>person</span>
                  Bukan Mahasiswa
                </label>
              </div>
              {errors.memberType && <span className="form-error"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{errors.memberType}</span>}
            </div>

            {/* Mahasiswa fields */}
            {form.memberType === 'mahasiswa' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="nim">NIM <span className="required">*</span></label>
                  <input id="nim" type="text" name="nim" className={`form-input${errors.nim ? ' error' : ''}`} placeholder="Nomor Induk Mahasiswa" value={form.nim} onChange={handleChange} />
                  {errors.nim && <span className="form-error"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{errors.nim}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="studyProgram">Program Studi <span className="required">*</span></label>
                  <input id="studyProgram" type="text" name="studyProgram" className={`form-input${errors.studyProgram ? ' error' : ''}`} placeholder="Contoh: Teknik Informatika" value={form.studyProgram} onChange={handleChange} />
                  {errors.studyProgram && <span className="form-error"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{errors.studyProgram}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="university">Nama Kampus <span className="required">*</span></label>
                  <input id="university" type="text" name="university" className={`form-input${errors.university ? ' error' : ''}`} placeholder="Nama universitas/perguruan tinggi" value={form.university} onChange={handleChange} />
                  {errors.university && <span className="form-error"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{errors.university}</span>}
                </div>
              </>
            )}

            {/* Bukan Mahasiswa fields */}
            {form.memberType === 'bukan_mahasiswa' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="nik">NIK <span className="required">*</span></label>
                  <input id="nik" type="text" name="nik" className={`form-input${errors.nik ? ' error' : ''}`} placeholder="16 digit Nomor Induk Kependudukan" value={form.nik} onChange={handleChange} maxLength={16} />
                  {errors.nik && <span className="form-error"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{errors.nik}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="occupation">Pekerjaan <span className="required">*</span></label>
                  <input id="occupation" type="text" name="occupation" className={`form-input${errors.occupation ? ' error' : ''}`} placeholder="Contoh: Guru, Karyawan, Wirausaha" value={form.occupation} onChange={handleChange} />
                  {errors.occupation && <span className="form-error"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{errors.occupation}</span>}
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }} disabled={loading}>
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Memproses...</>
              ) : (
                <><span className="material-symbols-outlined">person_add</span>Daftar Sekarang</>
              )}
            </button>
          </form>

          <div className="auth-switch">
            Sudah punya akun? <Link to="/login">Masuk sekarang</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
