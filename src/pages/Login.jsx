// src/pages/Login.jsx

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validateLogin } from '../utils/validator.js';
import '../styles/Auth.css';
import '../styles/components.css';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: errs } = validateLogin(form);
    if (!isValid) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const session = await login(form.email, form.password);
      addToast(`Selamat datang, ${session.name}!`, 'success');
      navigate(session.role === 'admin' ? '/admin' : from, { replace: true });
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
            <span className="material-symbols-outlined" style={{ fontSize: 38, color: 'white' }}>local_library</span>
          </div>
          <h2 className="auth-panel-brand__title">Selamat Datang<br />Kembali!</h2>
          <p className="auth-panel-brand__sub">Masuk untuk mengakses koleksi buku dan riwayat peminjaman kamu.</p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
            {['24+', '6', '100%'].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-extrabold)', fontSize: 'var(--text-2xl)', color: 'white' }}>{stat}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.6)' }}>{['Buku', 'Kategori', 'Gratis'][i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-panel-form">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo__icon">
              <span className="material-symbols-outlined">local_library</span>
            </div>
            <span className="auth-logo__name">PustakaDigital</span>
          </div>

          <h1 className="auth-title">Masuk ke Akun</h1>
          <p className="auth-subtitle">Belum punya akun? <Link to="/register">Daftar sekarang</Link></p>

          {apiError && (
            <div className="alert alert-error" role="alert">
              <span className="material-symbols-outlined">error</span>
              {apiError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email <span className="required">*</span></label>
              <div className="form-input-wrap">
                <span className="material-symbols-outlined form-input-icon">email</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className={`form-input${errors.email ? ' error' : ''}`}
                  placeholder="email@contoh.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <span id="email-error" className="form-error"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Kata Sandi <span className="required">*</span></label>
              <div className="form-input-wrap">
                <span className="material-symbols-outlined form-input-icon">lock</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input${errors.password ? ' error' : ''}`}
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={!!errors.password}
                />
                <button type="button" className="form-input-toggle" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Sembunyikan' : 'Tampilkan'}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <span id="password-error" className="form-error"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }} disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Memproses...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="auth-divider">Info Akun Demo</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', background: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            {[
              { role: 'Admin',    email: 'admin@libr.id',      pass: 'Admin@1234', color: 'var(--color-indigo)' },
              { role: 'Member',   email: 'mahasiswa@libr.id',  pass: 'Member@1234', color: 'var(--color-green)' },
              { role: 'Umum',     email: 'umum@libr.id',       pass: 'Member@1234', color: 'var(--color-blue)' },
            ].map(a => (
              <div key={a.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge" style={{ background: `${a.color}22`, color: a.color }}>{a.role}</span>
                <code style={{ color: 'var(--color-gray-600)' }}>{a.email}</code>
                <button
                  type="button"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-indigo)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => setForm({ email: a.email, password: a.pass })}
                >
                  Gunakan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
