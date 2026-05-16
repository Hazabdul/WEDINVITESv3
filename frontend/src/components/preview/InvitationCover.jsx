import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { cn } from '../../utils/cn';

export function InvitationCover({ bride, groom, theme = {}, eventDate, onOpen }) {
  const [isExiting, setIsExiting] = useState(false);

  // Theme-driven colors — fall back to original hardcoded values
  const accent = theme.primaryColor || '#c9a87c';
  const heading = theme.headingColor || '#1a3529';
  const secondary = theme.secondaryColor || '#f5ede0';

  const handleOpen = () => {
    setIsExiting(true);
    setTimeout(onOpen, 1100);
  };

  // Format the event date nicely
  const displayDate = (() => {
    if (!eventDate) return '';
    const d = new Date(eventDate);
    if (isNaN(d.getTime())) return eventDate;
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  })();

  return (
    <div className={cn(
      "absolute inset-0 z-[100] flex h-full w-full flex-col items-center justify-center overflow-hidden transition-transform duration-[1200ms] cubic-bezier(0.7,0,0.3,1)",
      isExiting ? "-translate-y-full" : "translate-y-0"
    )} style={{ backgroundColor: heading }}>
      {/* Minimalist Background with Deep Color */}
      <div className="absolute inset-0 z-0" style={{ backgroundColor: heading }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${accent}0D 0%, transparent 70%)` }} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        .invitation-cover-emerald { font-family: 'Montserrat', sans-serif; }
        .invitation-cover-emerald h1, .invitation-cover-emerald .font-serif { font-family: 'Cormorant Garamond', serif; }
      `}</style>

      {/* Content Area */}
      <div className="invitation-cover-emerald relative z-10 flex w-full flex-1 flex-col items-center justify-center px-8 text-center" style={{ color: secondary }}>
        <div className="mb-6 text-[9px] font-bold uppercase tracking-[8px]" style={{ color: `${accent}E6` }}>
          You are invited to the wedding of
        </div>

        <h1 className="flex items-center justify-center gap-4 text-[clamp(32px,8vw,72px)] font-light leading-none">
          <span className="inline-block">{bride}</span>
          <span className="font-serif italic" style={{ color: `${accent}99` }}>&amp;</span>
          <span className="inline-block">{groom}</span>
        </h1>

        <div className="mt-8 flex flex-col items-center gap-6">
          {displayDate && (
            <p className="mt-4 text-[10px] font-light tracking-[3px] opacity-50">
              {displayDate}
            </p>
          )}
        </div>

        <button
          onClick={handleOpen}
          className="group relative mt-16 flex min-w-[280px] items-center justify-center overflow-hidden rounded-full px-10 py-4.5 text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all hover:scale-[1.05] active:scale-[0.98]"
          style={{ backgroundColor: accent, color: heading }}
        >
          <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
          Open Invitation
        </button>
      </div>

      {/* Decorative Bottom Indicator */}
      <div className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <Sparkles className="h-5 w-5" style={{ color: `${accent}66` }} />
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
