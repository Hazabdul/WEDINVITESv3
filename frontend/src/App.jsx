import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { Builder } from './pages/Builder';
import { Templates } from './pages/Templates';
import { Pricing } from './pages/Pricing';
import { LivePreview } from './pages/LivePreview';
import { InvitationView } from './pages/InvitationView';
import { InvitationProvider } from './hooks/useInvitationState';
import { Heart, Globe, Mail } from 'lucide-react';
import { cn } from './utils/cn';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-50 transition-all overflow-hidden duration-500",
       isScrolled 
         ? "bg-white/60 backdrop-blur-xl border-b border-rose-200 shadow-md py-1 drop-shadow-[0_4px_10px_rgba(225,29,72,0.15)]" 
         : "bg-white/95 border-b border-rose-100 py-4 shadow-sm"
    )}>
      {/* Festive Noticeable Wedding Animations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none flex items-center justify-around opacity-50 md:opacity-70 z-0">
         <span className="text-2xl animate-bounce">🌸</span>
         <span className="text-xl animate-float">💍</span>
         <span className="text-base animate-pulse">✨</span>
         <span className="text-2xl animate-float animation-delay-2000">🍰</span>
         <span className="text-xl animate-bounce">🥂</span>
         <span className="text-2xl animate-float animation-delay-4000">🕊️</span>
         <span className="text-base animate-pulse">💖</span>
         <span className="text-2xl animate-float">🌺</span>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10 transition-all duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center hover:opacity-80 transition">
              <div className="relative flex items-center justify-center shrink-0 rounded-full h-12 w-12 overflow-hidden border-2 shadow-lg animate-pulse border-rose-400 bg-white">
                 <img src="/logo.png" alt="Ethereal Vows Logo" className="h-10 w-10 object-cover" />
              </div>
            </Link>
            <div>
              <Link to="/" className="block font-display font-bold text-xl tracking-tight transition hover:text-rose-400 text-rose-600 drop-shadow-sm">
                 Ethereal Vows
              </Link>
              <a href="https://triredglobal.com/" target="_blank" rel="noopener noreferrer" className="block text-[10px] uppercase tracking-[0.2em] font-semibold mt-0.5 text-rose-400/80 hover:text-rose-600 transition-colors">
                 Powered by triredglobal
              </a>
            </div>
          </div>
          
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8 font-medium text-sm">
            <Link to="/" className="hover:text-rose-400 transition-colors text-rose-600 drop-shadow-sm">Home</Link>
            <Link to="/templates" className="hover:text-rose-400 transition-colors text-rose-600 drop-shadow-sm">Themes</Link>
            <Link to="/builder" className="hover:text-rose-400 transition-colors text-rose-600 drop-shadow-sm">Builder</Link>
            <Link to="/pricing" className="hover:text-rose-400 transition-colors text-rose-600 drop-shadow-sm">Pricing</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <InvitationProvider>
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/live-preview" element={<LivePreview />} />
            <Route path="/invitation/:slug" element={<InvitationView />} />
            <Route path="/invite/:slug" element={<InvitationView />} />
            <Route path="/v/:slug" element={<InvitationView />} />
          </Routes>
        </main>
        
        <footer className="py-16 bg-slate-950 border-t border-rose-900/30 text-center mt-auto relative overflow-hidden">
          {/* Subtle rose gradient background for footer */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent,var(--tw-gradient-stops))] from-rose-900/20 via-slate-950 to-slate-950 opacity-80" aria-hidden="true" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="mb-10 flex flex-col md:flex-row items-center justify-center gap-12 text-slate-300">
               <div className="flex flex-col items-center gap-3">
                 <h4 className="text-white font-bold tracking-widest text-xl uppercase mb-1 drop-shadow-md">
                   <a href="https://triredglobal.com/" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors cursor-pointer">Trired Global</a>
                 </h4>
                 <p className="text-sm text-slate-400 max-w-xs text-center border-b border-slate-800 pb-4 mb-2">Empowering digital transformation and SaaS development worldwide.</p>
                 <a href="https://triredglobal.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-rose-400 transition-colors font-medium">
                    <Globe className="w-4 h-4" /> triredglobal.com
                 </a>
                 <span className="flex items-center gap-2 hover:text-rose-400 transition-colors cursor-pointer font-medium">
                    <Mail className="w-4 h-4" /> support@triredglobal.com
                 </span>
               </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 mb-10">
               <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Trired Global Instagram" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500 hover:border-rose-500 text-white transition-all hover:-translate-y-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_20px_rgba(225,29,72,0.4)]">
                 <svg viewBox="0 0 24 24" className="w-6 h-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
               </a>
               <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="Trired Global LinkedIn" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 text-white transition-all hover:-translate-y-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_20px_rgba(37,99,235,0.4)]">
                 <svg viewBox="0 0 24 24" className="w-6 h-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
               </a>
            </div>

            <p className="text-sm text-slate-500 font-semibold tracking-wider uppercase">
              &copy; {new Date().getFullYear()} All rights reserved to <a href="https://triredglobal.com/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors cursor-pointer">Trired Global</a>.
            </p>
          </div>
        </footer>
      </div>
    </InvitationProvider>
  );
}

export default App;
