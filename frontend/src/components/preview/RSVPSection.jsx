import React, { useState } from 'react';
import { CheckCircle2, PartyPopper } from 'lucide-react';
import { cn } from '../../utils/cn';

export function RSVPSection({ attendanceResponse: externalResponse, onResponse, isPreview = false }) {
  const [internalResponse, setInternalResponse] = useState(null);
  const [showCelebrate, setShowCelebrate] = useState(false);

  const response = externalResponse !== undefined ? externalResponse : internalResponse;

  const handleAccept = () => {
    if (onResponse) {
      onResponse('accepted');
    } else {
      setInternalResponse('accepted');
      setShowCelebrate(true);
      setTimeout(() => setShowCelebrate(false), 3000);
    }
  };

  const handleDecline = () => {
    if (onResponse) {
      onResponse('declined');
    } else {
      setInternalResponse('declined');
      setShowCelebrate(false);
    }
  };

  return (
    <div className={cn("mx-auto w-full px-4 mt-4 pb-12 sm:mt-6", isPreview ? "max-w-full" : "max-w-3xl")}>
      <div className={cn(
        "relative overflow-hidden bg-gradient-to-br from-[#1a3529] to-[#244a39] text-center transition-all duration-700",
        isPreview ? "rounded-[24px] py-8 px-8 sm:py-12 sm:px-16" : "rounded-[28px] py-12 px-10 sm:py-16 sm:px-24"
      )}>
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#c9a87c]/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-xl">
          <h2 className="mb-3 font-serif text-[clamp(28px,5vw,40px)] italic leading-tight tracking-tight text-[#f5ede0]">
            Will You Attend?
          </h2>
          <p className="mb-4 text-[10px] uppercase tracking-[4px] text-[#f5ede0]/60">
            Let the couple know whether you will be joining their celebration.
          </p>

          <div className="relative">
            {showCelebrate && (
              <div className="pointer-events-none absolute inset-x-0 -top-14 flex justify-center z-50">
                <div className="animate-[popIn_600ms_cubic-bezier(0.22,1,0.36,1)] rounded-full bg-[#1a3529] px-5 py-2 text-[10px] font-bold uppercase tracking-[2px] text-[#f5ede0] shadow-2xl">
                  <span className="inline-flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#c9a87c]" />
                    RSVP saved successfully
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={handleAccept}
              className={cn(
                "group relative min-w-[200px] overflow-hidden rounded-full px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500",
                response === 'accepted'
                  ? "scale-105 bg-white text-[#1a3529] shadow-2xl"
                  : "bg-[#d4af37] text-[#1a3529] hover:scale-[1.03] active:scale-[0.98]"
              )}
            >
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
              <span className="relative flex items-center justify-center gap-2">
                <PartyPopper className="h-3.5 w-3.5 opacity-70" />
                Yes, I'll be there
              </span>
            </button>

            <button
              onClick={handleDecline}
              className={cn(
                "min-w-[200px] rounded-full border border-white/10 bg-white/90 px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#1a3529] transition-all duration-500 hover:bg-white active:scale-[0.98]",
                response === 'declined' && "bg-[#1a3529] text-white opacity-100 border-none"
              )}
            >
              Sorry, I can't make it
            </button>
          </div>

          {response === 'accepted' && (
            <p className="mt-8 font-serif text-[17px] italic text-[#f5ede0]/80 animate-in fade-in slide-in-from-top-4 duration-700">
              "We cannot wait to celebrate this special moment with you."
            </p>
          )}

          {response === 'declined' && (
            <div className="mt-8 rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-xs italic leading-relaxed text-[#f5ede0]/70 animate-in fade-in slide-in-from-top-4 duration-700">
              We'll miss you. Thank you for your warm wishes and prayers.
            </div>
          )}
        </div>

        <style>{`
          @keyframes popIn {
            0% { opacity: 0; transform: translateY(20px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
