import React, { useState } from 'react';
import { CheckCircle2, PartyPopper } from 'lucide-react';
import { cn } from '../../utils/cn';

function withAlpha(color, alpha) {
  const hex = String(color || '').trim();
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;

  const alphaHex = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');

  return `${hex}${alphaHex}`;
}

export function RSVPSection({ attendanceResponse: externalResponse, onResponse, isPreview = false, theme = {}, themeId }) {
  const [internalResponse, setInternalResponse] = useState(null);
  const [showCelebrate, setShowCelebrate] = useState(false);

  const response = externalResponse !== undefined ? externalResponse : internalResponse;
  const accent = theme.primaryColor || '#c9a87c';
  const heading = theme.headingColor || '#1a3529';
  const subheading = theme.subheadingColor || '#244a39';
  const secondary = theme.secondaryColor || '#f5ede0';
  const meta = theme.metaColor || secondary;

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

  // ─── CUSTOM RSVP DESIGN FOR SKY LANTERNS THEME ───
  if (themeId === 'skylanterns') {
    return (
      <div 
        style={{ backgroundImage: 'url(/template2/bg1.avif)', backgroundRepeat: 'repeat', backgroundSize: '100% auto' }} 
        className="w-full pt-8 pb-20"
      >
        <div className={cn("mx-auto w-full px-4", isPreview ? "max-w-full" : "max-w-3xl")}>
          <div className="relative overflow-hidden bg-transparent text-center transition-all duration-700 py-10 px-8 sm:py-14 sm:px-16">
            {/* Ambient gold glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[10%] left-[50%] h-[150px] w-[80%] -translate-x-1/2 rounded-[100%] bg-[#d4af37]/10 blur-[60px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-xl">
              <h2 className="mb-4 font-serif text-[clamp(32px,6vw,46px)] italic leading-tight tracking-tight text-[#f5e6c8] drop-shadow-lg">
              Will You Attend?
            </h2>
            <p className="mb-10 text-[11px] uppercase tracking-[0.3em] text-[#d4af37]/80">
              Let the couple know whether you will be joining their celebration
            </p>

            <div className="relative">
              {showCelebrate && (
                <div className="pointer-events-none absolute inset-x-0 -top-16 flex justify-center z-50">
                  <div className="animate-[popIn_600ms_cubic-bezier(0.22,1,0.36,1)] rounded-full bg-[#d4af37] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[2px] text-black shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                    <span className="inline-flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-black" />
                      RSVP saved successfully
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!response && (
              <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
                <button
                  onClick={handleAccept}
                  className={cn(
                    "group relative min-w-[220px] overflow-hidden rounded-full px-8 py-4 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300",
                    response === 'accepted'
                      ? "scale-105 bg-[#d4af37] text-black shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                      : "bg-[#d4af37] text-black shadow-[0_4px_15px_rgba(0,0,0,0.3)] active:scale-[0.98] hover:brightness-110"
                  )}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    <PartyPopper className="h-4 w-4 opacity-80" />
                    Yes, I'll be there
                  </span>
                </button>

                <button
                  onClick={handleDecline}
                  className={cn(
                    "min-w-[220px] rounded-full px-8 py-4 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 active:scale-[0.98]",
                    response === 'declined' 
                      ? "bg-white/25 text-white backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.2)] border border-white/30"
                      : "bg-white/10 text-[#f5e6c8] backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.3)] border border-white/20 hover:bg-white/15"
                  )}
                >
                  Sorry, I can't make it
                </button>
              </div>
            )}

            {response === 'accepted' && (
              <p className="mt-8 font-serif text-[19px] italic text-[#d4af37] animate-in fade-in slide-in-from-top-4 duration-700">
                "We cannot wait to celebrate this special moment with you."
              </p>
            )}

            {response === 'declined' && (
              <div className="mt-8 rounded-2xl border border-white/5 bg-white/5 px-6 py-5 text-sm italic leading-relaxed text-[#f5ede0]/60 animate-in fade-in slide-in-from-top-4 duration-700">
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
      </div>
    );
  }

  // ─── STANDARD RSVP DESIGN (FOR TEMPLATE 1 / UNIVERSAL) ───
  return (
    <div className={cn("mx-auto w-full px-4 pb-12", isPreview ? "max-w-full" : "max-w-3xl")}>
      <div className={cn(
        "relative overflow-hidden text-center transition-all duration-700 border-none shadow-none",
        isPreview ? "rounded-[24px] py-8 px-8 sm:py-12 sm:px-16 !border-t-0" : "rounded-[28px] py-12 px-10 sm:py-16 sm:px-24"
      )} style={{ background: `linear-gradient(135deg, ${heading} 0%, ${subheading} 100%)` }}>
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: withAlpha(accent, 0.12) }} />

        <div className="relative z-10 mx-auto max-w-xl">
          <h2 className="mb-3 font-serif text-[clamp(28px,5vw,40px)] italic leading-tight tracking-tight" style={{ color: secondary }}>
            Will You Attend?
          </h2>
          <p className="mb-4 text-[10px] uppercase tracking-[4px]" style={{ color: withAlpha(meta, 0.68) }}>
            Let the couple know whether you will be joining their celebration.
          </p>

          <div className="relative">
            {showCelebrate && (
              <div className="pointer-events-none absolute inset-x-0 -top-14 flex justify-center z-50">
                <div className="animate-[popIn_600ms_cubic-bezier(0.22,1,0.36,1)] rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-[2px] shadow-2xl" style={{ backgroundColor: heading, color: secondary }}>
                  <span className="inline-flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4" style={{ color: accent }} />
                    RSVP saved successfully
                  </span>
                </div>
              </div>
            )}
          </div>

          {!response && (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={handleAccept}
                className={cn(
                  "group relative min-w-[200px] overflow-hidden rounded-full px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500",
                  response === 'accepted'
                    ? "scale-105 shadow-2xl"
                    : "hover:scale-[1.03] active:scale-[0.98]"
                )}
                style={{ backgroundColor: response === 'accepted' ? secondary : accent, color: heading }}
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
                  "min-w-[200px] rounded-full border px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500 active:scale-[0.98]",
                  response === 'declined' && "opacity-100 border-none"
                )}
                style={{
                  backgroundColor: response === 'declined' ? heading : withAlpha(secondary, 0.92),
                  borderColor: withAlpha(secondary, 0.16),
                  color: response === 'declined' ? secondary : heading,
                }}
              >
                Sorry, I can't make it
              </button>
            </div>
          )}

          {response === 'accepted' && (
            <p className="mt-8 font-serif text-[17px] italic animate-in fade-in slide-in-from-top-4 duration-700" style={{ color: withAlpha(secondary, 0.82) }}>
              "We cannot wait to celebrate this special moment with you."
            </p>
          )}

          {response === 'declined' && (
            <div
              className="mt-8 rounded-2xl border px-6 py-4 text-xs italic leading-relaxed animate-in fade-in slide-in-from-top-4 duration-700"
              style={{
                borderColor: withAlpha(secondary, 0.08),
                backgroundColor: withAlpha(secondary, 0.06),
                color: withAlpha(secondary, 0.72),
              }}
            >
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
