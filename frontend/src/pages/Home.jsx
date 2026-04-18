import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { templatesList } from '../data/mockData';
import { Sparkles, ArrowRight, Heart, PlayCircle, Palette, Share2, Smartphone } from 'lucide-react';
import { cn } from '../utils/cn';
import { useInvitationState } from '../hooks/useInvitationState';
import { TemplateRenderer } from '../components/preview/TemplateRenderer';
import apiClient from '../utils/api';

export function Home() {
  const navigate = useNavigate();
  const { data } = useInvitationState();
  const [previewTheme, setPreviewTheme] = useState(templatesList[0].id);
  const [apiStatus, setApiStatus] = useState(null);

  const testAPIConnection = async () => {
    try {
      setApiStatus('Testing...');
      const response = await fetch('http://localhost:5000/health');
      if (response.ok) {
        const data = await response.json();
        setApiStatus('✅ Connected! Backend is responding.');
      } else {
        setApiStatus('❌ Backend responded with error.');
      }
    } catch (error) {
      setApiStatus('❌ Cannot connect to backend. Check if server is running.');
    }
  };

  return (
    <main className="pb-20 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-slate-900 pt-32 pb-48 text-center text-white lg:pt-48 lg:pb-64 rounded-b-[64px] shadow-2xl">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/swiss-wedding.png')] bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105" aria-hidden="true" />
        
        {/* Gradient Overlays for readable text */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" aria-hidden="true" />
        <div className="absolute inset-0 bg-emerald-900/10 mix-blend-multiply" aria-hidden="true" />
        
        <div className="container relative mx-auto px-4 z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-5 py-2.5 text-sm font-medium text-emerald-100 mb-8 backdrop-blur-md hover:bg-black/50 transition-all cursor-pointer shadow-lg">
            <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden="true" /> Welcome to the Future of Wedding Invites
          </div>
          
          <h1 id="hero-heading" className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl leading-[1.1] text-white drop-shadow-xl">
            Your dream invitation.<br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white drop-shadow-sm">
              Designed in minutes.
            </span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl text-slate-200 font-medium leading-relaxed drop-shadow-md">
            Create, customize, and share breathtaking digital wedding invitations. No coding, no downloads—just pure elegance delivered instantly to your guests.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button onClick={() => navigate('/builder')} className="group bg-white text-slate-950 hover:bg-emerald-50 px-8 py-6 text-lg rounded-full font-bold shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95 border-0" aria-label="Start designing your wedding invitation">
              Start Designing <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
            <Button onClick={() => navigate('/templates')} variant="outline" className="border-white/40 text-white glass-effect-dark hover:bg-white/20 hover:text-white px-8 py-6 text-lg rounded-full transition-all shadow-lg" aria-label="View invitation templates gallery">
              <PlayCircle className="h-5 w-5 mr-2" aria-hidden="true" /> View Gallery
            </Button>
            <Button onClick={testAPIConnection} variant="outline" className="border-white/40 text-white glass-effect-dark hover:bg-white/20 hover:text-white px-8 py-6 text-lg rounded-full transition-all shadow-lg" aria-label="Test API connection">
              🔗 Test API Connection
            </Button>
          </div>
          {apiStatus && (
            <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg text-white font-medium">
              {apiStatus}
            </div>
          )}
        </div>
      </section>

      {/* Floating Interactive Live Preview Container */}
      <section aria-labelledby="preview-heading" className="container mx-auto px-4 -mt-32 relative z-20">
         <article className="max-w-6xl mx-auto glass-effect rounded-[40px] p-6 sm:p-10 flex flex-col md:flex-row items-center gap-10 cursor-pointer group transition-all hover:bg-white/80 border border-transparent hover:border-emerald-200" onClick={() => navigate('/live-preview')}>
            
            <div className="w-full md:w-1/2 relative rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
               <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/5 transition-colors z-10" aria-hidden="true" />
               {/* Use the previously loaded image for preview teaser */}
               <img src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80" alt="Live preview teaser" className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-1000" loading="lazy" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-emerald-500 text-white rounded-full p-4 shadow-xl opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 backdrop-blur-md">
                  <PlayCircle className="w-12 h-12" aria-hidden="true" />
               </div>
               <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md rounded-full px-5 py-2.5 text-sm font-bold flex items-center gap-3 shadow-xl text-slate-800 border border-slate-100 group-hover:text-emerald-700 transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/30" aria-hidden="true" /> Click to Launch Live Preview
               </div>
            </div>

            {/* Header Content */}
            <div className="w-full md:w-1/2 space-y-6">
               <h2 id="preview-heading" className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">Experience real-time magic</h2>
               <p className="text-slate-600 text-xl leading-relaxed">
                 Watch your invitation come to life instantly in a dedicated preview studio. Switch between our handcrafted premium themes to see exactly what your guests will experience.
               </p>
               <div className="flex gap-4 pt-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100"><Palette className="w-5 h-5 text-emerald-600" aria-hidden="true" /> Live Theme Switching</div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100"><Smartphone className="w-5 h-5 text-indigo-600" aria-hidden="true" /> Full Screen Render</div>
               </div>
            </div>
         </article>
      </section>

      {/* Templates Teaser */}
      <section aria-labelledby="templates-heading" className="container mx-auto px-4 py-32">
        <header className="text-center mb-20">
          <h2 id="templates-heading" className="text-4xl font-extrabold text-slate-900 tracking-tight">Curated Premium Themes</h2>
          <p className="mt-4 text-xl text-slate-500 font-light max-w-2xl mx-auto">Start with a stunning foundation crafted by top designers, and make it uniquely yours.</p>
        </header>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {templatesList.slice(0, 3).map((tpl, i) => (
            <article key={tpl.id} className="group relative overflow-hidden rounded-[32px] bg-white shadow-sm border border-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className={cn("aspect-[4/3] bg-gradient-to-br w-full transition-transform duration-500 group-hover:scale-105", tpl.palette)} aria-hidden="true" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm z-10">
                {tpl.badge}
              </div>
              <div className="p-8 relative bg-white z-20">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{tpl.name}</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed h-10">{tpl.description}</p>
                <Button onClick={() => navigate('/builder')} variant="outline" className="w-full border-slate-200 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" aria-label={`Select ${tpl.name} theme`}>
                  Select Theme
                </Button>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-16 text-center">
             <Button variant="ghost" onClick={() => navigate('/templates')} className="group text-emerald-600 font-semibold hover:bg-emerald-50 px-6 py-3 rounded-xl transition-all" aria-label="View all wedding templates">
                View all templates <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
             </Button>
        </div>
      </section>

      {/* Features Showcase */}
      <section aria-labelledby="features-heading" className="py-24 mb-20 rounded-[64px] mx-4 lg:mx-8 bg-white relative overflow-hidden shadow-2xl border border-slate-100">
        {/* Full Elegant Floral Frame Background */}
        <div className="absolute inset-0 bg-[url('/floral-frame.png')] bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105" aria-hidden="true" />
        
        {/* Light blending overlay to ensure text remains readable on top of background details */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" aria-hidden="true" />
        
        <div className="container mx-auto max-w-6xl relative z-10 px-4">
          <header className="text-center mb-16 lg:mb-28">
             <h2 id="features-heading" className="text-5xl md:text-7xl font-serif mb-6 leading-[1.1] drop-shadow-sm text-slate-800">
                Flawless elegance. <br/>
                <span className="font-light italic bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500">
                   Effortlessly crafted.
                </span>
             </h2>
             <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto font-light">
                Discover the intuitive tools that transform your vision into a digital masterpiece.
             </p>
          </header>
          
          <div className="grid gap-8 md:gap-12 md:grid-cols-3 mt-auto">
             <article className="group text-center bg-white/70 backdrop-blur-md rounded-[32px] p-8 border border-white/50 hover:bg-white/90 hover:border-emerald-200 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                   <Heart className="w-8 h-8 text-emerald-600" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-4 text-slate-800 group-hover:text-emerald-700 transition-colors">No Login Required</h3>
                <p className="text-slate-600 leading-relaxed font-light text-sm">Frictionless flow ensures you or your clients can start building immediately without hurdles.</p>
             </article>
             <article className="group text-center bg-white/70 backdrop-blur-md rounded-[32px] p-8 border border-white/50 hover:bg-white/90 hover:border-blue-200 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                   <Share2 className="w-8 h-8 text-blue-600" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-4 text-slate-800 group-hover:text-blue-700 transition-colors">Instantly Shareable</h3>
                <p className="text-slate-600 leading-relaxed font-light text-sm">Publish your invitation with one click and share a beautiful link with all your guests.</p>
             </article>
             <article className="group text-center bg-white/70 backdrop-blur-md rounded-[32px] p-8 border border-white/50 hover:bg-white/90 hover:border-violet-200 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-violet-100 to-violet-50 border border-violet-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                   <Sparkles className="w-8 h-8 text-violet-600" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-4 text-slate-800 group-hover:text-violet-700 transition-colors">Media Rich Experience</h3>
                <p className="text-slate-600 leading-relaxed font-light text-sm">Support for stunning high-res galleries, ambient background music, and video messages.</p>
             </article>
          </div>
        </div>
      </section>
    </main>
  );
}
