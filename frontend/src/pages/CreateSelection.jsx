import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, PenTool, ArrowRight } from 'lucide-react';

export function CreateSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fcfbf9] flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="font-serif text-[40px] md:text-[56px] text-[#111] italic leading-tight tracking-tight mb-4">
          How would you like to create your invitation?
        </h1>
        <p className="text-[#666] text-[15px] md:text-[18px] max-w-2xl mx-auto mb-16">
          Choose between our simple manual builder or let our AI magically design a unique experience for you.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Card 1: Manual */}
          <div 
            onClick={() => navigate('/builder')}
            className="group cursor-pointer bg-white border border-[#eaeaea] rounded-[24px] p-10 relative overflow-hidden text-left"
          >
            <div className="w-14 h-14 rounded-full bg-[#f4f0ec] flex items-center justify-center mb-8">
              <PenTool className="w-6 h-6 text-[#876c57]" />
            </div>
            <h3 className="font-serif text-[28px] text-[#111] mb-3">Build Manually</h3>
            <p className="text-[#666] text-[15px] leading-relaxed mb-8">
              Use our simple step-by-step builder and customize every detail yourself.
            </p>
            <button className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-[#876c57]">
              Start Manual Builder <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: AI */}
          <div 
            onClick={() => navigate('/magic-designer')}
            className="group cursor-pointer bg-[#111] border border-[#222] rounded-[24px] p-10 relative overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4A76A]/20 to-transparent blur-3xl rounded-full" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-8">
                <Wand2 className="w-6 h-6 text-[#D4A76A]" />
              </div>
              <h3 className="font-serif text-[28px] text-white mb-3">Create with AI</h3>
              <p className="text-white/60 text-[15px] leading-relaxed mb-8">
                Describe your wedding, upload photos, and let AI design a beautiful invitation for you.
              </p>
              <button className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-[#D4A76A]">
                Start AI Magic Designer <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
