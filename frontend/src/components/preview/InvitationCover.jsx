import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { cn } from '../../utils/cn';

export function InvitationCover({ bride, groom, onOpen }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleOpen = () => {
    setIsExiting(true);
    setTimeout(onOpen, 1100);
  };

  return (
    <div className={cn(
      "absolute inset-0 z-[100] flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#1a3529] transition-transform duration-[1200ms] cubic-bezier(0.7,0,0.3,1)",
      isExiting ? "-translate-y-full" : "translate-y-0"
    )}>
      {/* Minimalist Background with Deep Color */}
      <div className="absolute inset-0 z-0 bg-[#1a3529]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,124,0.05)_0%,transparent_70%)]" />
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-8 text-center text-[#f5ede0]">
        <div className="mb-10 text-[11px] font-bold uppercase tracking-[0.6em] text-[#c9a87c]/80">
          You are invited to the wedding of
        </div>

        <h1 className="flex items-center gap-6 font-serif text-[clamp(2.5rem,8vw,5.5rem)] font-light leading-none tracking-tight">
          <span className="italic">{bride}</span>
          <span className="text-[0.6em] text-[#c9a87c] serif-ampersand italic">&</span>
          <span className="italic">{groom}</span>
        </h1>
 
        <div className="mt-10 flex flex-col items-center gap-6">
          <p className="font-serif text-[18px] italic tracking-wide text-[#c9a87c]/90">
            December 18, 2026
          </p>
        </div>

        <button
          onClick={handleOpen}
          className="group relative mt-16 flex min-w-[300px] items-center justify-center overflow-hidden rounded-full bg-[#c9a87c] px-10 py-5 text-[12px] font-black uppercase tracking-[0.4em] text-[#1a3529] shadow-2xl transition-all hover:bg-[#d8bd9c] hover:scale-[1.05] active:scale-[0.98]"
        >
          <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
          Open Invitation
        </button>
      </div>

      {/* Decorative Bottom Indicator */}
      <div className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <Sparkles className="h-5 w-5 text-[#c9a87c]/40" />
      </div>

      <style>{`
        @keyframes ken-burns {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
