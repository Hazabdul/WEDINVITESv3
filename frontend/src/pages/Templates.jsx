import React from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { useInvitationState } from '../hooks/useInvitationState';
import { templatesList } from '../data/mockData';
import { Link, useNavigate } from 'react-router-dom';

import { TemplateCard } from './Home';

export function Templates() {
  const navigate = useNavigate();
  const { setTemplate } = useInvitationState();

  const handleUseTemplate = (id) => {
    setTemplate(id);
    navigate('/builder');
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbf7f2_0%,#f6efe7_100%)]">
      {/* Custom Template Header */}
      <header className="sticky top-0 z-[60] border-b border-gray-100 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="shrink-0">
              <img src="/logo_black.png" alt="Logo" className="h-7 w-auto" />
            </Link>

            <div className="h-7 w-[1px] bg-[#eadfd2]" />

            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#9b8876] transition-colors hover:text-black"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-20 pb-24">
        <header className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#eadfd2] bg-[#faf5ef] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.4em] text-[#9b8876] mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#b08968]" />
            Luxury Collection
          </div>
          <h1 className="font-serif text-[48px] sm:text-[64px] italic leading-tight text-slate-900 font-normal tracking-tight">
            Choose your template
          </h1>
          <p className="mt-6 text-[15px] font-medium text-slate-500/70 max-w-2xl mx-auto leading-relaxed">
            Pick from our curated selection of premium digital invitation suites, designed for cinematic impact and sophisticated storytelling.
          </p>
        </header>

        <div className="grid gap-y-6 md:gap-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {templatesList.map((tmplt) => (
            <div key={tmplt.id} className="h-full">
              <TemplateCard
                template={tmplt}
                onSelect={handleUseTemplate}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
