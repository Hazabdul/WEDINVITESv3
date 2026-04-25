import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, Share2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useInvitationState } from '../hooks/useInvitationState';
import { templatesList } from '../data/mockData';
import { TemplateRenderer } from '../components/preview/TemplateRenderer';

const featureHighlights = [
  {
    icon: Heart,
    title: 'No Login Required',
    text: 'Start crafting immediately. Frictionless flow for you and your guests.',
    eyebrow: 'Start in seconds',
    tags: ['No signup', 'Private flow'],
    accent: 'from-[#fff0f4] via-white to-[#fff9fb]',
    glow: 'bg-[#b45b6b]/14',
    tint: 'text-[#b45b6b]',
    badgeShadow: 'shadow-[0_18px_40px_-24px_rgba(180,91,107,0.55)]',
  },
  {
    icon: Share2,
    title: 'Instantly Shareable',
    text: 'One click to publish. A stunning, private link ready for WhatsApp and social sharing.',
    eyebrow: 'Publish once',
    tags: ['Private link', 'Mobile ready'],
    accent: 'from-[#fff7e8] via-white to-[#fffbf2]',
    glow: 'bg-[#d4c39c]/16',
    tint: 'text-[#d4c39c]',
    badgeShadow: 'shadow-[0_18px_40px_-24px_rgba(212,195,156,0.60)]',
  },
  {
    icon: Sparkles,
    title: 'Media Rich',
    text: 'Support for high-res galleries, ambient music, and cinematic video in one invitation.',
    eyebrow: 'Designed to feel alive',
    tags: ['Gallery', 'Music', 'Video'],
    accent: 'from-[#f3f6ff] via-white to-[#fbfcff]',
    glow: 'bg-[#1a2b5a]/10',
    tint: 'text-[#1a2b5a]',
    badgeShadow: 'shadow-[0_18px_40px_-24px_rgba(26,43,90,0.35)]',
  },
];

function TemplateCard({ template, onSelect, previewData }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[40px] border border-[#1a2b5a]/5 bg-white shadow-[0_20px_50px_-20px_rgba(26,43,90,0.12)] transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_50px_100px_-30px_rgba(26,43,90,0.22)]">
      {/* Premium Badge */}
      <div className="absolute left-6 top-6 z-20">
        <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3.5 py-1.5 backdrop-blur-xl shadow-lg transition-transform duration-500 group-hover:scale-110">
          <div className="h-1.5 w-1.5 rounded-full bg-[#ff2d55]" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1a2b5a]">
            {template.badge || 'Limited Edition'}
          </span>
        </div>
      </div>

      {/* Portrait Preview Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#fbf9f7] transition-all duration-700 group-hover:bg-[#f6f2ef]">
        {/* Render area with intentional padding for 'Physical Card' look */}
        <div className="flex h-full w-full items-center justify-center p-6 sm:p-8">
           <div className="h-full w-full overflow-hidden rounded-[24px] border border-white bg-white shadow-[0_25px_60px_-15px_rgba(47,41,37,0.15)] transition-transform duration-700 group-hover:scale-[1.04] group-hover:rotate-1">
              <div className="origin-top-left w-[250%] scale-[0.4]">
                 <TemplateRenderer type={template.id} data={{ ...previewData, theme: { ...previewData.theme, id: template.id } }} />
              </div>
           </div>
        </div>
        
        {/* Designer Overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-full items-center justify-center bg-gradient-to-t from-[#1a2b5a]/40 to-transparent p-10 backdrop-blur-[2px] transition-all duration-700 group-hover:translate-y-0">
           <button 
             onClick={() => onSelect(template.id)}
             className="flex items-center gap-3 rounded-full bg-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-[#1a2b5a] shadow-2xl transition-all hover:bg-[#ff2d55] hover:text-white active:scale-95"
           >
             Start Crafting
             <ArrowRight className="h-4 w-4" />
           </button>
        </div>
      </div>

      {/* Editorial Info Panel */}
      <div className="flex flex-1 flex-col justify-between bg-white px-8 py-8">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px flex-1 bg-[#1a2b5a]/10" />
            <div className="text-[9px] font-black uppercase tracking-[0.4em] text-[#ff2d55]/70">{template.mood}</div>
            <div className="h-px flex-1 bg-[#1a2b5a]/10" />
          </div>
          
          <h3 className="text-center font-serif text-[28px] italic leading-tight text-[#1a2b5a] tracking-tight">{template.name}</h3>
          
          <p className="mt-4 text-center text-[12px] font-medium leading-relaxed text-[#1a2b5a]/50 line-clamp-2 px-2">
            " {template.description} "
          </p>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-[#1a2b5a]/5 pt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a2b5a]/30">
          <span>Premium Flow</span>
          <div className="flex gap-1">
             {[1,2,3].map(i => <div key={i} className="h-1 w-1 rounded-full bg-[#1a2b5a]/20" />)}
          </div>
          <span>Ref: 0{template.id?.length || 9}</span>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { data, setTemplate } = useInvitationState();

  const handleUseTemplate = (id) => {
    setTemplate(id);
    navigate('/builder');
  };

  return (
    <main className="min-h-screen bg-white">
      {/* ARTEMIS HERO SECTION */}
      <section aria-labelledby="hero-heading" className="relative flex min-h-screen overflow-hidden pt-32 pb-24 items-center justify-center bg-white">
        
        {/* Background Accents — Minimalist */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-rose-50/20 blur-[130px]" />
           <div className="absolute bottom-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-indigo-50/20 blur-[110px]" />
        </div>

        {/* Floating Rotated Cards — Precise Artemis Physic */}
        <div className="absolute inset-0 h-full w-full pointer-events-none overflow-hidden">
           {/* Top Left */}
           <div className="absolute top-[15%] left-[8%] animate-artemis-card stagger-card-1" style={{ '--rot': '-12deg' } }>
              <div className="h-[240px] w-[170px] rounded-[16px] glass-card p-1.5 transition-transform hover:scale-105 pointer-events-auto rotate-[-12deg] group">
                 <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400" alt="Wedding Detail" className="h-full w-full object-cover rounded-[12px] grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
              </div>
           </div>

           {/* Top Right */}
           <div className="absolute top-[10%] right-[10%] animate-artemis-card stagger-card-2" style={{ '--rot': '15deg' }}>
              <div className="h-[300px] w-[210px] rounded-[16px] glass-card p-1.5 transition-transform hover:scale-105 pointer-events-auto rotate-[15deg] group">
                 <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400" alt="The Couple" className="h-full w-full object-cover rounded-[12px] grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
              </div>
           </div>

           {/* Bottom Left */}
           <div className="absolute bottom-[10%] left-[12%] animate-artemis-card stagger-card-4" style={{ '--rot': '8deg' }}>
              <div className="h-[180px] w-[240px] rounded-[16px] glass-card p-1.5 transition-transform hover:scale-105 pointer-events-auto rotate-[8deg] group">
                 <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400" alt="Wedding Vibe" className="h-full w-full object-cover rounded-[12px] grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
              </div>
           </div>

           {/* Bottom Right */}
           <div className="absolute bottom-[14%] right-[18%] animate-artemis-card stagger-card-3" style={{ '--rot': '-10deg' }}>
              <div className="h-[170px] w-[120px] rounded-[16px] glass-card p-1.5 transition-transform hover:scale-105 pointer-events-auto rotate-[-10deg] group">
                <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=400" alt="Floral" className="h-full w-full object-cover rounded-[12px] grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
              </div>
           </div>
        </div>

        <div className="container relative z-10 mx-auto px-6 text-center">
          <div className="animate-artemis-hero stagger-1 mb-6 inline-block">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff2d55]/70 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/40">
              Weddinginvites Luxury Edition
            </span>
          </div>

          <h1 id="hero-heading" className="animate-artemis-hero stagger-2 mx-auto max-w-4xl text-[38px] italic font-serif leading-[1.05] tracking-[-0.015em] text-[#1a2b5a] sm:text-[68px]">
            Digital & <br className="hidden sm:block" /> <span className="text-[#ff2d55]">High-End</span> Invites
          </h1>

          <p className="animate-artemis-hero stagger-3 mx-auto mt-6 max-w-lg text-[11px] font-black uppercase tracking-[0.3em] text-[#1a2b5a]/60 leading-relaxed">
            weddings can count on!
          </p>

          <div className="animate-artemis-hero stagger-5 mt-10 flex items-center justify-center">
            <button
              onClick={() => navigate('/builder')}
              className="group relative h-[54px] overflow-hidden rounded-full bg-brand-gradient px-10 text-[13px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_20px_40px_-10px_rgba(255,45,85,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-2.5">
                Get Started <span className="text-lg transition-transform group-hover:translate-x-1 duration-300">↗</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* TEMPLATES SECTION */}
      <section
        id="templates-section"
        aria-labelledby="templates-heading"
        className="relative overflow-hidden border-t border-[#1a2b5a]/5 bg-[linear-gradient(180deg,#ffffff_0%,#fdf9f7_50%,#faf5f0_100%)] py-24 sm:py-32"
      >
        {/* Subtle background glows */}
        <div className="pointer-events-none absolute top-[-80px] left-[-60px] h-[480px] w-[480px] rounded-full bg-rose-50/40 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-60px] right-[-40px] h-[360px] w-[360px] rounded-full bg-amber-50/50 blur-[100px]" />

        <div className="container relative mx-auto max-w-7xl px-6">
          {/* Section Header */}
          <header className="mb-20 text-center">
            <div className="animate-artemis-reveal stagger-1 mb-4 text-[10px] font-black uppercase tracking-[0.6em] text-[#ff2d55]/50">
              Curated Design System
            </div>
            <h2
              id="templates-heading"
              className="animate-artemis-reveal stagger-2 font-serif text-[42px] italic leading-tight text-[#1a2b5a] sm:text-[56px]"
            >
              Exquisite Templates
            </h2>
            <p className="animate-artemis-reveal stagger-3 mx-auto mt-5 max-w-xl text-[14px] font-medium leading-relaxed text-[#1a2b5a]/50">
              Select a foundation to start crafting your story. Each design is fully customizable to fit your unique celebration.
            </p>
          </header>

          {/* Templates Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {templatesList.slice(0, 3).map((tmplt) => (
              <TemplateCard 
                key={tmplt.id} 
                template={tmplt} 
                onSelect={handleUseTemplate} 
                previewData={data}
              />
            ))}
          </div>

          <div className="mt-20 flex justify-center">
            <button
               onClick={() => navigate('/templates')}
               className="group flex items-center gap-3 rounded-full border border-[#1a2b5a]/15 px-10 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-[#1a2b5a] transition-all hover:bg-[#1a2b5a] hover:text-white"
            >
               View All Template Options
               <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION — Luxury Layout */}
      <section
        aria-labelledby="features-heading"
        className="wedding-section overflow-hidden border-t border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,248,250,0.92)_55%,rgba(252,249,244,0.98)_100%)] py-24 backdrop-blur-3xl sm:py-32"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(180,91,107,0.12),transparent_62%)]" />
        <div className="pointer-events-none absolute left-[-7%] top-24 h-52 w-52 rounded-full bg-[#b45b6b]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-4%] top-10 h-64 w-64 rounded-full bg-[#d4c39c]/12 blur-3xl" />

        <div className="container relative mx-auto max-w-7xl px-6">
          <header className="mx-auto max-w-3xl text-center">
            <div className="animate-artemis-reveal stagger-1 text-[10px] font-black uppercase tracking-[0.56em] text-[#b45b6b]/55">
              Built for modern wedding sharing
            </div>
            <h2 id="features-heading" className="animate-artemis-reveal stagger-2 mt-5 text-[40px] leading-tight text-[#1a2b5a] sm:text-[58px]">
              Elegant for couples. Effortless for guests.
            </h2>
            <p className="animate-artemis-reveal stagger-3 mx-auto mt-6 max-w-2xl text-[14px] font-medium leading-8 text-[#1a2b5a]/58 sm:text-[15px]">
              Everything important is kept simple: build fast, publish once, and send a link that feels polished on every screen.
            </p>
          </header>

          <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8">
            {featureHighlights.map((feature, i) => (
              <article
                key={feature.title}
                className="animate-artemis-reveal group relative isolate overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-7 shadow-[0_28px_80px_-36px_rgba(26,43,90,0.24)] transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_40px_90px_-34px_rgba(26,43,90,0.24)] sm:p-8"
                style={{ animationDelay: `${0.16 + i * 0.12}s` }}
              >
                <div className={`absolute inset-0 bg-[linear-gradient(180deg,var(--tw-gradient-stops))] ${feature.accent} opacity-90`} />
                <div className={`absolute right-[-20px] top-[-18px] h-28 w-28 rounded-full blur-2xl ${feature.glow}`} />
                <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(26,43,90,0.18),transparent)]" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/70 bg-white/85 ${feature.tint} ${feature.badgeShadow} transition-transform duration-500 group-hover:scale-110`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4c39c]/40">
                      0{i + 1}
                    </div>
                  </div>

                  <div className={`mt-8 text-[10px] font-black uppercase tracking-[0.34em] ${feature.tint} opacity-70`}>
                    {feature.eyebrow}
                  </div>
                  <h3 className="mt-4 text-[31px] font-serif italic leading-[1.1] text-[#1a2b5a]">
                    {feature.title}
                  </h3>
                  <p className="mt-5 max-w-sm text-[14px] font-medium leading-7 text-[#1a2b5a]/62">
                    {feature.text}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-2">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#1a2b5a]/8 bg-white/72 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#1a2b5a]/52"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.32em] text-[#d4c39c]/55">
                    <span className="h-px flex-1 bg-[#d4c39c]/18" />
                    Invitation-ready
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
