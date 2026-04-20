import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Globe, Mail, Menu, X } from 'lucide-react';
import { Home } from './pages/Home';
import { Builder } from './pages/Builder';
import { Templates } from './pages/Templates';
import { Pricing } from './pages/Pricing';
import { InvitationView } from './pages/InvitationView';
import { InvitationProvider } from './hooks/useInvitationState';
import { cn } from './utils/cn';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Templates', to: '/templates' },
  { label: 'Pricing', to: '/pricing' },
];

function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'border-b border-[#eadfd2] bg-[#fffaf4]/92 shadow-[0_18px_50px_-28px_rgba(61,46,33,0.25)] backdrop-blur-2xl'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="rounded-full border border-white/70 bg-white/72 px-4 py-3 shadow-[0_14px_40px_-24px_rgba(61,46,33,0.35)] backdrop-blur-xl sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="min-w-0 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f7eadb_0%,#e2c6aa_100%)] text-[#6f5643] shadow-inner">
                    <span className="font-serif text-lg italic">W</span>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-serif text-xl tracking-[0.14em] text-[#2f2925] uppercase">Wedding Invites</div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#a58a72]">Elegant digital invitations</div>
                  </div>
                </div>
              </Link>

              <nav aria-label="Main navigation" className="hidden items-center gap-2 md:flex">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.22em] transition-all',
                      isActive(item.to)
                        ? 'bg-[#2f2925] text-white shadow-[0_12px_24px_-18px_rgba(47,41,37,0.8)]'
                        : 'text-[#6e6258] hover:bg-[#f7f1ea] hover:text-[#2f2925]'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <Link
                to="/builder"
                className="hidden rounded-full bg-[linear-gradient(135deg,#2f2925_0%,#4b3a2d_100%)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-transform hover:-translate-y-0.5 md:inline-flex"
              >
                Start Building
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e8ddd0] bg-white text-[#5e5247] transition hover:bg-[#faf5ef] md:hidden"
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
                  className="mt-2 rounded-2xl bg-[linear-gradient(135deg,#2f2925_0%,#4b3a2d_100%)] px-4 py-3 text-center text-sm font-semibold text-white"
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
  return (
    <div className="min-h-screen bg-silk font-sans antialiased text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-[104px] sm:pt-[112px] md:pt-[120px]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/invitation/:slug" element={<InvitationView />} />
          <Route path="/invite/:slug" element={<InvitationView />} />
          <Route path="/v/:slug" element={<InvitationView />} />
        </Routes>
      </main>

      <footer className="py-16 bg-slate-950 border-t border-rose-900/30 text-center mt-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent,#4c0519)] opacity-30" aria-hidden="true" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-10 flex flex-col md:flex-row items-center justify-center gap-12 text-slate-300">
            <div className="flex flex-col items-center gap-3">
              <h4 className="text-white font-serif italic text-2xl tracking-tight mb-1">
                <a href="https://triredglobal.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff2d55] transition-colors cursor-pointer">Trired Global</a>
              </h4>
              <p className="text-[12px] font-medium text-slate-400 tracking-wide uppercase opacity-60">Empowering digital transformation globally.</p>
              <div className="mt-4 flex items-center gap-8">
                <a href="https://triredglobal.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#ff2d55] transition-colors text-[11px] font-bold uppercase tracking-widest opacity-80">
                  <Globe className="w-3.5 h-3.5" /> Site
                </a>
                <span className="flex items-center gap-2 hover:text-[#ff2d55] transition-colors cursor-pointer text-[11px] font-bold uppercase tracking-widest opacity-80">
                  <Mail className="w-3.5 h-3.5" /> Support
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-10">
            {['instagram', 'linkedin'].map((social) => (
              <a key={social} href={`https://${social}.com`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center hover:bg-[#ff2d55] hover:border-[#ff2d55] text-white transition-all hover:-translate-y-1">
                <div className="w-5 h-5 opacity-80">
                  {social === 'instagram' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                  )}
                </div>
              </a>
            ))}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
            &copy; {new Date().getFullYear()} <span className="text-white/40">Powered by</span> <a href="https://triredglobal.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Trired Global</a>
          </p>
        </div>
      </footer>
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
