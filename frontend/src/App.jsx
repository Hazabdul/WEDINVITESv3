import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Globe, Mail, Menu, X } from 'lucide-react';
import { Home } from './pages/Home';
import { Builder } from './pages/Builder';
import { Templates } from './pages/Templates';
import { Pricing } from './pages/Pricing';
import { InvitationView } from './pages/InvitationView';
import { InvitationProvider } from './hooks/useInvitationState';
import { cn } from './utils/cn';

const InvitationAnalyzer = lazy(() => import('./pages/InvitationAnalyzer'));
const ImageToWebsite = lazy(() => import('./pages/ImageToWebsite'));

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Templates', to: '/templates' },
  { label: 'Analyzer', to: '/invitation-analyzer' },
  { label: 'Image To Web', to: '/image-to-website' },
  { label: 'Pricing', to: '/pricing' },
];

function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 120);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-[700ms] ease-[cubic-bezier(0.23,1,0.32,1)]',
        isScrolled
          ? 'bg-transparent'
          : 'bg-transparent'
      )}
    >
      <div className={cn(
        "mx-auto transition-all duration-[700ms] ease-[cubic-bezier(0.23,1,0.32,1)] px-4 sm:px-6",
        isScrolled ? "max-w-[1100px]" : "w-[94%] max-w-[1600px] lg:px-10"
      )}>
        <div className="py-4">
          <div className={cn(
            "rounded-full transition-all duration-[700ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
            isScrolled || location.pathname !== '/'
              ? "bg-[#111111]/85 pl-8 pr-4 py-3 backdrop-blur-3xl border border-white/10 shadow-none"
              : "bg-transparent px-6 py-3 border border-transparent shadow-none"
          )}>
            <div className="flex items-center justify-between gap-6">
              <Link to="/" className="min-w-0 shrink-0">
                <img
                  src="/logo.png"
                  alt="Wedding Invites Logo"
                  className="h-8 w-auto transition-all duration-[700ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
                />
              </Link>

              <nav aria-label="Main navigation" className="hidden items-center gap-2 md:flex">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.22em] transition-all',
                      isActive(item.to)
                        ? (isScrolled || location.pathname !== '/' ? 'bg-white/10 text-white' : 'bg-white text-black')
                        : (isScrolled || location.pathname !== '/' ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-white/80 hover:bg-white/10 hover:text-white')
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <Link
                to="/builder"
                className="hidden rounded-full bg-gradient-to-r from-[#D4A76A] to-[#B68D40] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.25em] text-white shadow-[0_10px_30px_-10px_rgba(182,141,64,0.4)] transition-all hover:scale-[1.05] hover:shadow-[0_12px_40px_-10px_rgba(182,141,64,0.6)] md:inline-flex"
              >
                Start Building
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111111]/50 text-white transition hover:bg-[#111111]/80 md:hidden"
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen ? (
          <div className="pb-4 md:hidden">
            <div className="rounded-[28px] border border-[#ece1d4] bg-white/96 p-3 shadow-[0_18px_50px_-28px_rgba(61,46,33,0.3)] backdrop-blur-xl">
              <nav aria-label="Mobile navigation" className="grid gap-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'rounded-2xl px-4 py-3 text-sm font-semibold transition',
                      isActive(item.to) ? 'bg-[#2f2925] text-white' : 'text-[#5f5348] hover:bg-[#faf5ef]'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/builder"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-2xl bg-gradient-to-r from-[#D4A76A] to-[#B68D40] px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
                >
                  Start Building
                </Link>
              </nav>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function AppShell() {
  const location = useLocation();
  const isInvitation = location.pathname.startsWith('/invitation/') ||
    location.pathname.startsWith('/invite/') ||
    location.pathname.startsWith('/v/');

  return (
    <div className="min-h-screen bg-silk font-sans antialiased text-slate-900 flex flex-col">
      {!isInvitation && <Navbar />}
      <main className={cn(
        "flex-grow",
        !isInvitation && location.pathname !== '/' && "pt-[104px] sm:pt-[112px] md:pt-[120px]"
      )}>
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center px-4">
              <div className="rounded-full border border-[#eadfd2] bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6e6258] shadow-[0_18px_50px_-28px_rgba(61,46,33,0.3)]">
                Loading page
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/invitation-analyzer" element={<InvitationAnalyzer />} />
            <Route path="/image-to-website" element={<ImageToWebsite />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/invitation/:slug" element={<InvitationView />} />
            <Route path="/invite/:slug" element={<InvitationView />} />
            <Route path="/v/:slug" element={<InvitationView />} />
          </Routes>
        </Suspense>
      </main>

      {!isInvitation && (
        <footer className="bg-white pt-24 pb-12 text-[#003d4d]">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
              {/* Branding & Social Column */}
              <div className="lg:col-span-4 flex flex-col items-start gap-8">
                <img src="/logo_black.png" alt="Weddinginvites Logo" className="h-10 w-auto" />

                <div className="flex items-center gap-6 mt-6">
                  <div className="text-[#E4405F] hover:scale-110 transition-all duration-300 cursor-pointer flex items-center justify-center">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div className="text-[#FF0000] hover:scale-110 transition-all duration-300 cursor-pointer flex items-center justify-center">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-6">
                  <div className="text-[13px] font-medium text-[#003d4d]/60">
                    &copy; {new Date().getFullYear()} Weddinginvites. All rights reserved.
                  </div>
                </div>
              </div>

              {/* Links Columns */}
              <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="flex flex-col gap-4">
                  <h4 className="font-serif text-[18px] italic font-normal tracking-tight">Collection</h4>
                  <nav className="flex flex-col gap-3 text-[14px] text-[#003d4d]/70">
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">Immersive Series</span>
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">Editorial Noir</span>
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">Minimalist Suite</span>
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">Seasonal Editions</span>
                  </nav>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="font-serif text-[18px] italic font-normal tracking-tight">Experience</h4>
                  <nav className="flex flex-col gap-3 text-[14px] text-[#003d4d]/70">
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">AI Suite</span>
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">RSVP Engine</span>
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">Live Preview</span>
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">Guest List</span>
                  </nav>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="font-serif text-[18px] italic font-normal tracking-tight">Journal</h4>
                  <nav className="flex flex-col gap-3 text-[14px] text-[#003d4d]/70">
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">Case Studies</span>
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">Wedding Trends</span>
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">Design Guide</span>
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">FAQ</span>
                  </nav>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="font-serif text-[18px] italic font-normal tracking-tight">Studio</h4>
                  <nav className="flex flex-col gap-3 text-[14px] text-[#003d4d]/70">
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">Our Vision</span>
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">Careers</span>
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">Contact</span>
                    <span className="hover:text-[#003d4d] cursor-pointer transition-colors">Privacy Policy</span>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <InvitationProvider>
      <AppShell />
    </InvitationProvider>
  );
}

export default App;
