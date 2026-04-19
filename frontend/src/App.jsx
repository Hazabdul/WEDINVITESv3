import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Builder } from './pages/Builder';
import { Templates } from './pages/Templates';
import { Pricing } from './pages/Pricing';
import { InvitationView } from './pages/InvitationView';
import { InvitationProvider } from './hooks/useInvitationState';
import { Globe, Mail } from 'lucide-react';
import { cn } from './utils/cn';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-700",
      isScrolled
        ? "py-3 bg-white/60 backdrop-blur-2xl border-b border-rose-100/20 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]"
        : "py-6 bg-transparent"
    )}>
      <div className="mx-auto max-w-7xl px-8">
        <div className="flex items-center justify-between">

          {/* LEFT — Nav links */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-12 flex-1">
            {['Home', 'Themes'].map((link) => (
              <Link 
                key={link}
                to={link === 'Home' ? '/' : `/${link.toLowerCase()}`}
                className="group relative text-[11px] font-black uppercase tracking-[0.2em] text-[#1a2b5a]/80 transition-colors hover:text-[#ff2d55]"
              >
                {link}
                <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#ff2d55] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* CENTER — Logo */}
          <div className="flex items-center justify-center flex-1">
            <Link to="/" className="group flex flex-col items-center hover:opacity-100 transition-all duration-700 hover:scale-105">
              <span className={cn(
                "font-serif font-medium tracking-[0.2em] transition-all duration-700 uppercase",
                isScrolled ? "text-[16px]" : "text-[22px]"
              )}>
                <span className="text-[#1a2b5a]">Wedding</span>
                <span className="mx-2 text-[#ff2d55]/30 font-light prose">|</span>
                <span className="text-[#ff2d55] italic">invites</span>
              </span>
            </Link>
          </div>

          {/* RIGHT — Nav links */}
          <nav aria-label="Secondary navigation" className="hidden md:flex items-center justify-end gap-12 flex-1">
            {['Pricing', 'Builder'].map((link) => (
              <Link 
                key={link}
                to={`/${link.toLowerCase()}`}
                className="group relative text-[11px] font-black uppercase tracking-[0.2em] text-[#1a2b5a]/80 transition-colors hover:text-[#ff2d55]"
              >
                {link}
                <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#ff2d55] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <InvitationProvider>
      <div className="min-h-screen bg-silk font-sans antialiased text-slate-900 flex flex-col">
        <Navbar />
        <main className="flex-grow">
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
          {/* Subtle rose gradient background for footer */}
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
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                     ) : (
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
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
    </InvitationProvider>
  );
}

export default App;
