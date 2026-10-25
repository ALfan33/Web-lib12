// src/pages/Landing.jsx
// Landing page — 5 screen sections with GSAP animations.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import BookCard from '../components/BookCard.jsx';
import ScrollProgress from '../components/ScrollProgress.jsx';
import { getPopularBooks, getNewReleases, getBooks } from '../services/bookService.js';
import { useFadeInUp, useStaggerIn } from '../hooks/useScrollAnimation.js';
import '../styles/Landing.css';
import '../styles/components.css';

gsap.registerPlugin(ScrollTrigger);

// Floating books data for hero
const HERO_BOOKS = [
  { id: 1, top: '5%',  left: '55%', rotate: -12, scale: 1.1, color: '#4F46E5', delay: 0 },
  { id: 2, top: '30%', left: '80%', rotate: 8,   scale: 0.9, color: '#2563EB', delay: 0.3 },
  { id: 3, top: '60%', left: '62%', rotate: -6,  scale: 1.0, color: '#0369A1', delay: 0.6 },
  { id: 4, top: '15%', left: '70%', rotate: 15,  scale: 0.85, color: '#7C3AED', delay: 0.2 },
  { id: 5, top: '50%', left: '85%', rotate: -10, scale: 0.95, color: '#0F172A', delay: 0.5 },
];

export default function Landing() {
  const heroRef = useRef(null);
  const bookRefs = useRef([]);
  const [activeTab, setActiveTab] = useState('popular');
  const [popularBooks, setPopularBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [catalogBooks, setCatalogBooks] = useState([]);

  const vmRef = useFadeInUp({ y: 50, duration: 0.8 });
  const ctaRef = useFadeInUp({ y: 40 });
  const featuredHeaderRef = useFadeInUp({ y: 30 });
  const catalogRef = useStaggerIn({ stagger: 0.07 });

  useEffect(() => {
    setPopularBooks(getPopularBooks(4).map(b => ({ ...b, isPopular: true })));
    setNewBooks(getNewReleases(4).map(b => ({ ...b, isNew: true })));
    setCatalogBooks(getBooks().slice(0, 12));
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo(
        '.hero__eyebrow',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.hero__title',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.hero__tagline',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.7, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.hero__actions',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.9, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.hero__stat',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 1.1, stagger: 0.1, ease: 'power2.out' }
      );

      // Floating book entrance
      bookRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.5, rotation: 0 },
          {
            opacity: 1,
            scale: 1,
            rotation: HERO_BOOKS[i]?.rotate ?? 0,
            duration: 0.8,
            delay: 0.5 + i * 0.15,
            ease: 'back.out(1.3)',
          }
        );

        // Gentle floating animation
        gsap.to(el, {
          y: '-=15',
          duration: 2 + i * 0.4,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          delay: i * 0.3,
        });
      });

      // Parallax on scroll — books drift down as user scrolls
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          bookRefs.current.forEach((el, i) => {
            if (!el) return;
            gsap.set(el, {
              y: self.progress * (100 + i * 60),
              opacity: 1 - self.progress * 0.8,
            });
          });
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const displayedBooks = activeTab === 'popular' ? popularBooks : newBooks;

  return (
    <div className="landing">
      <ScrollProgress />
      <Navbar />

      {/* ===== Screen 1: Hero ===== */}
      <section className="hero" ref={heroRef} aria-label="Hero">
        <div className="hero__bg" aria-hidden="true" />

        {/* Particle dots */}
        <div className="hero__particles" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="hero__particle"
              style={{
                width: `${6 + (i % 4) * 4}px`,
                height: `${6 + (i % 4) * 4}px`,
                left: `${(i * 8.3) % 100}%`,
                background: i % 2 === 0 ? 'var(--color-blue-light)' : 'var(--color-yellow)',
                animationDuration: `${8 + i * 1.5}s`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}
        </div>

        <div className="hero__inner container">
          {/* Content */}
          <div className="hero__content">
            <div className="hero__eyebrow">
              <span className="material-symbols-outlined">auto_stories</span>
              Perpustakaan Digital Indonesia
            </div>

            <h1 className="hero__title">
              Ribuan Buku,<br />
              Satu <span className="highlight">Tujuan</span><br />
              Mencerdaskan Bangsa
            </h1>

            <p className="hero__tagline">
              Jelajahi koleksi buku pilihan — fiksi, sains, teknologi, dan lebih banyak lagi.
              Pinjam kapan saja, baca di mana saja.
            </p>

            <div className="hero__actions">
              <Link to="/catalog" className="btn btn-primary btn-lg">
                <span className="material-symbols-outlined">search</span>
                Jelajahi Koleksi
              </Link>
              <Link to="/register" className="btn btn-ghost btn-lg">
                <span className="material-symbols-outlined">person_add</span>
                Daftar Sekarang
              </Link>
            </div>

            <div className="hero__stats">
              {[
                { number: '24+', label: 'Koleksi Buku' },
                { number: '6', label: 'Kategori' },
                { number: '100%', label: 'Gratis' },
              ].map(s => (
                <div key={s.label} className="hero__stat">
                  <div className="hero__stat-number">{s.number}</div>
                  <div className="hero__stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Books */}
          <div className="hero__books" aria-hidden="true">
            {HERO_BOOKS.map((b, i) => (
              <div
                key={b.id}
                className="hero__book"
                ref={el => (bookRefs.current[i] = el)}
                style={{
                  top: b.top,
                  left: b.left,
                  transform: `rotate(${b.rotate}deg) scale(${b.scale})`,
                  opacity: 0,
                }}
              >
                <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${b.color}, #38BDF8)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 28 }}>menu_book</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 'var(--space-8)', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, animation: 'bounce 2s ease-in-out infinite' }}>
          <span style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
          <span className="material-symbols-outlined">expand_more</span>
        </div>

        <style>{`@keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-8px)} }`}</style>
      </section>

      {/* ===== Screen 2: Vision & Mission ===== */}
      <section className="vision-section" aria-label="Visi dan Misi">
        <div className="vision-section__bg-art" aria-hidden="true" />
        <div className="container vision-section__inner" ref={vmRef}>
          <div className="text-center" style={{ maxWidth: 600, marginInline: 'auto' }}>
            <span className="section-eyebrow">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>stars</span>
              Tentang Kami
            </span>
            <h2 className="section-title">Kami Ada untuk<br />Mencerdaskan Generasi</h2>
            <p className="section-subtitle" style={{ marginInline: 'auto' }}>
              PustakaDigital didirikan atas dasar keyakinan bahwa akses ke pengetahuan adalah hak semua orang.
            </p>
          </div>

          <div className="vm-grid">
            {/* Vision Card */}
            <div className="vm-card">
              <div className="vm-card__icon">
                <span className="material-symbols-outlined">visibility</span>
              </div>
              <div className="vm-card__label">Visi</div>
              <p className="vm-card__text">
                Menjadi perpustakaan digital terdepan yang menghubungkan masyarakat Indonesia
                dengan ilmu pengetahuan tanpa batas.
              </p>
            </div>

            {/* Mission Card */}
            <div className="vm-card">
              <div className="vm-card__icon">
                <span className="material-symbols-outlined">flag</span>
              </div>
              <div className="vm-card__label">Misi</div>
              <ul className="vm-mission-list">
                {[
                  { icon: 'menu_book',     text: 'Menyediakan koleksi buku berkualitas di berbagai bidang ilmu.' },
                  { icon: 'people',        text: 'Memudahkan akses perpustakaan bagi pelajar, mahasiswa, dan masyarakat umum.' },
                  { icon: 'trending_up',   text: 'Mendorong budaya membaca sebagai fondasi kemajuan bangsa.' },
                  { icon: 'devices',       text: 'Memanfaatkan teknologi untuk pengalaman peminjaman yang mudah.' },
                  { icon: 'favorite',      text: 'Membangun komunitas pembaca yang saling menginspirasi.' },
                ].map((m, i) => (
                  <li key={i} className="vm-mission-item">
                    <span className="material-symbols-outlined">{m.icon}</span>
                    {m.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Screen 3: CTA Reading ===== */}
      <section className="cta-section" aria-label="Ajakan membaca">
        {/* Book collage grid */}
        <div className="cta-section__collage" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="cta-section__collage-item" />
          ))}
        </div>
        <div className="cta-section__overlay" aria-hidden="true" />

        {/* Floating icons */}
        <div className="cta-section__icons" aria-hidden="true">
          {[
            { icon: 'menu_book',    top: '10%', left: '8%',  delay: '0s' },
            { icon: 'auto_stories', top: '70%', left: '5%',  delay: '2s' },
            { icon: 'local_library',top: '20%', right: '8%', delay: '1s' },
            { icon: 'bookmark',     top: '75%', right: '6%', delay: '3s' },
          ].map((f, i) => (
            <div key={i} className="cta-section__icon-float" style={{ top: f.top, left: f.left, right: f.right, animationDelay: f.delay }}>
              <span className="material-symbols-outlined">{f.icon}</span>
            </div>
          ))}
        </div>

        <div className="cta-section__inner container" ref={ctaRef}>
          <span className="hero__eyebrow" style={{ marginInline: 'auto', display: 'inline-flex' }}>
            <span className="material-symbols-outlined">library_books</span>
            Mulai Membaca Hari Ini
          </span>
          <h2 className="cta-section__title">
            Satu Halaman Bisa<br />
            <span style={{ color: 'var(--color-blue-light)' }}>Mengubah Harimu</span>
          </h2>
          <p className="cta-section__sub">
            Bergabunglah dengan ribuan pembaca yang telah menemukan dunia baru melalui
            halaman-halaman buku. Mulailah perjalananmu sekarang.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/catalog" className="btn btn-primary btn-lg">
              <span className="material-symbols-outlined">search</span>
              Lihat Katalog
            </Link>
            <Link to="/register" className="btn btn-ghost btn-lg">
              <span className="material-symbols-outlined">person_add</span>
              Daftar Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Screen 4: Featured Books ===== */}
      <section className="featured-section" aria-label="Buku unggulan">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--space-8)' }} ref={featuredHeaderRef}>
            <span className="section-eyebrow">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>star</span>
              Buku Pilihan
            </span>
            <h2 className="section-title">Buku Primadona & New Release</h2>
            <p className="section-subtitle" style={{ marginInline: 'auto' }}>
              Temukan buku-buku yang paling banyak dipinjam dan koleksi terbaru kami.
            </p>
          </div>

          <div className="featured-tabs">
            <button
              className={`featured-tab${activeTab === 'popular' ? ' active' : ''}`}
              onClick={() => setActiveTab('popular')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>trending_up</span>
              Terpopuler
            </button>
            <button
              className={`featured-tab${activeTab === 'new' ? ' active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>fiber_new</span>
              New Release
            </button>
          </div>

          <div className="featured-grid">
            {displayedBooks.map(book => (
              <BookCard key={book.id} book={book} showBadges />
            ))}
          </div>
        </div>
      </section>

      {/* ===== Screen 5: Catalog Preview ===== */}
      <section className="catalog-preview" aria-label="Koleksi buku lainnya">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>grid_view</span>
                Koleksi Lengkap
              </span>
              <h2 className="section-title">Jelajahi Semua Buku</h2>
            </div>
            <Link to="/catalog" className="btn btn-secondary">
              <span className="material-symbols-outlined">arrow_forward</span>
              Lihat Semua Buku
            </Link>
          </div>

          <div className="books-grid" ref={catalogRef}>
            {catalogBooks.map(book => (
              <BookCard key={book.id} book={book} showBadges={false} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
