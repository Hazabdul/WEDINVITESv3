import React, { useEffect, useRef } from 'react';
import { Sparkles, Heart, Moon, Zap, Leaf, ArrowRight as ArrowRightIcon, Calendar, Clock, MapPin } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SharedSections } from './SharedSections';
import { DesignElement } from '../preview/DesignElement';
import { resolveMediaSource } from '../../utils/media';
import { cn } from '../../utils/cn';

/* ── Cinematic Timer Helper ── */
function CinematicTimer({ date, dark = true }) {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const tick = () => {
      if (!date) return;
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000)) % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date]);

  return (
    <div className={cn("flex items-center gap-5", dark ? "text-[#f5ede0]" : "text-[#1a3529]")}>
      {Object.entries(timeLeft).map(([label, value], i) => (
        <React.Fragment key={label}>
          <div className="text-center">
            <div className="font-serif text-3xl font-light tracking-tighter sm:text-4xl">
              {String(value).padStart(2, '0')}
            </div>
            <div className="text-[8px] font-bold uppercase tracking-[4px] opacity-40">
              {label}
            </div>
          </div>
          {i < 3 && <div className={cn("h-8 w-px", dark ? "bg-white/10" : "bg-[#1a3529]/20")} />}
        </React.Fragment>
      ))}
    </div>
  );
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatElegantDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const dayName = DAYS[d.getDay()];
  const monthName = MONTHS[d.getMonth()];
  const date = d.getDate();
  const year = d.getFullYear();
  const suffix = (date === 1 || date === 21 || date === 31)
    ? 'st'
    : (date === 2 || date === 22)
      ? 'nd'
      : (date === 3 || date === 23)
        ? 'rd'
        : 'th';

  return `${dayName}, the ${date}${suffix} of ${monthName} ${year}`;
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatLongDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}



function getDateParts(dateStr) {
  if (!dateStr) return { month: '', day: '', year: '' };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { month: '', day: '', year: '' };

  return {
    month: MONTHS[d.getMonth()].slice(0, 3).toUpperCase(),
    day: String(d.getDate()).padStart(2, '0'),
    year: d.getFullYear(),
  };
}

function getCountdownLabel(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return '';

  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days > 1) return `${days} days to go`;
  if (days === 1) return 'Tomorrow';
  if (days === 0) return 'Today';
  if (days === -1) return 'Yesterday';
  return 'Celebrated';
}

function pickIntro(content = {}) {
  return (
    content.welcomeHeading ||
    content.introMessage ||
    content.invitationText ||
    content.storySnippet ||
    content.subtitle ||
    ''
  );
}

function initialsForCouple(couple = {}) {
  const brideInitial = (couple.bride || '?').trim().charAt(0).toUpperCase();
  const groomInitial = (couple.groom || '?').trim().charAt(0).toUpperCase();
  return `${brideInitial}${groomInitial}`;
}

function normalizeList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function isVideoUrl(src = '') {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(src);
}

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const normalized = hex.replace('#', '').trim();
  const expanded = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;

  const int = Number.parseInt(expanded, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function withAlpha(hex, alpha) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function buildMediaPackage(media = {}) {
  const heroVideo = [
    media.heroVideo,
    media.coverVideo,
    media.backgroundVideo,
    media.videoUrl,
    media.inviteVideo,
  ]
    .map(resolveMediaSource)
    .find(Boolean) || '';

  const secondaryVideo = [
    media.storyVideo,
    media.reelVideo,
    media.secondaryVideo,
    media.highlightVideo,
  ]
    .map(resolveMediaSource)
    .find(Boolean) || '';

  const galleryCandidates = unique([
    resolveMediaSource(media.coverImage),
    resolveMediaSource(media.coupleImage),
    resolveMediaSource(media.detailImage),
    resolveMediaSource(media.secondaryImage),
    resolveMediaSource(media.locationImage),
    ...normalizeList(media.gallery).map(resolveMediaSource),
    ...normalizeList(media.galleryImages).map(resolveMediaSource),
    ...normalizeList(media.photos).map(resolveMediaSource),
    ...normalizeList(media.storyGallery).map(resolveMediaSource),
  ]).filter((src) => src && !isVideoUrl(src));

  const heroImage = galleryCandidates[0] || '';
  const poster = [
    media.videoPoster,
    media.posterImage,
    heroImage,
  ]
    .map(resolveMediaSource)
    .find(Boolean) || '';

  const video = [
    media.video,
    media.videoUrl,
    media.storyVideo,
    media.inviteVideo,
  ]
    .map(resolveMediaSource)
    .find(Boolean) || '';

  return {
    heroVideo,
    secondaryVideo: secondaryVideo && secondaryVideo !== heroVideo ? secondaryVideo : '',
    video,
    heroImage,
    poster,
    gallery: galleryCandidates.slice(0, 12),
  };
}

function InfoPill({ children, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.34em] ${className}`}>
      {children}
    </div>
  );
}

function HeroBackground({ media, className = '', overlayClass = '', children }) {
  const mediaPack = buildMediaPackage(media);
  const showVideo = Boolean(mediaPack.heroVideo);
  const showImage = !showVideo && Boolean(mediaPack.heroImage);

  return (
    <div data-live-invite-section className={`relative overflow-hidden ${className}`}>
      {showVideo && (
        <video
          data-live-invite-media
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={mediaPack.poster || undefined}
        >
          <source src={mediaPack.heroVideo} />
        </video>
      )}

      {showImage && (
        <img
          data-live-invite-media
          src={mediaPack.heroImage}
          alt="wedding cover"
          className="absolute inset-0 h-full w-full object-cover animate-reveal"
        />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.16),rgba(10,10,10,0.52))]" />
      {overlayClass && <div className={`absolute inset-0 ${overlayClass}`} />}
      {children}
    </div>
  );
}

function DateBadge({ event, dark = false }) {
  const parts = getDateParts(event?.date);
  const baseClasses = dark
    ? 'border-white/10 bg-white/5 text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)]'
    : 'border-white/60 bg-white/85 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)]';

  if (!parts.month && !parts.day) return null;

  return (
    <div className={`inline-flex min-w-[86px] flex-col items-center rounded-[26px] border px-4 py-3 backdrop-blur-md ${baseClasses}`}>
      <span className="text-[10px] tracking-[0.35em] opacity-70">{parts.month}</span>
      <span className="mt-1 text-3xl font-semibold leading-none">{parts.day}</span>
      <span className="mt-1 text-[11px] tracking-[0.3em] opacity-60">{parts.year}</span>
    </div>
  );
}

function DetailsRow({ label, value, className = '', designId, designLabel }) {
  if (!value) return null;
  return (
    <div className={className}>
      <div className="text-[10px] uppercase tracking-[0.32em] opacity-55">{label}</div>
      <div className="mt-1 text-sm font-medium leading-snug">
        {designId ? (
          <DesignElement id={designId} label={designLabel || label}>
            <span>{value}</span>
          </DesignElement>
        ) : value}
      </div>
    </div>
  );
}

function PhotoRibbon({ media, className = '', frameClassName = '' }) {
  const items = buildMediaPackage(media).gallery.slice(0, 3);
  if (!items.length) return null;

  const gridCols = items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div data-live-invite-card className={`grid ${gridCols} gap-3 ${className}`}>
      {items.map((src, index) => (
        <div
          key={`${src}-${index}`}
          data-live-invite-card
          className={`overflow-hidden rounded-[24px] border border-white/10 bg-white/10 shadow-[0_14px_30px_rgba(15,23,42,0.12)] ${frameClassName}`}
        >
          <img data-live-invite-media src={src} alt={`gallery ${index + 1}`} className="h-28 w-full object-cover" />
        </div>
      ))}
    </div>
  );
}

function StoryVideoCard({ media, dark = false, className = '' }) {
  const mediaPack = buildMediaPackage(media);
  if (!mediaPack.secondaryVideo) return null;

  const cardClasses = dark
    ? 'border-white/10 bg-white/5 text-white'
    : 'border-slate-200 bg-white text-slate-900';

  return (
    <div data-live-invite-section className={`rounded-[30px] border p-4 shadow-[0_18px_40px_rgba(15,23,42,0.1)] ${cardClasses} ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.34em] opacity-50">Featured Video</div>
          <div className="mt-1 text-sm font-semibold">A cinematic moment for your invitation</div>
        </div>
        <div className="rounded-full border border-current/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] opacity-70">
          Play
        </div>
      </div>
      <video
        data-live-invite-media
        controls
        playsInline
        preload="metadata"
        poster={mediaPack.poster || undefined}
        className="h-56 w-full rounded-[22px] object-cover"
      >
        <source src={mediaPack.secondaryVideo} />
      </video>
    </div>
  );
}

function EditorialNames({ brideId, groomId, bride, groom, brideColor, groomColor, dividerClassName = '' }) {
  return (
    <h1 className="text-3xl font-semibold leading-tight" style={{ fontFamily: 'inherit' }}>
      <DesignElement id={brideId} label="Bride Name" defaultColor={brideColor}>
        <span style={{ color: `var(--tw-primary,${brideColor})`, fontWeight: 700 }}>{bride}</span>
      </DesignElement>
      <span className={`mx-2 inline-block align-middle text-xl font-light italic ${dividerClassName}`}>&amp;</span>
      <DesignElement id={groomId} label="Groom Name" defaultColor={groomColor}>
        <span style={{ color: `var(--tw-primary,${groomColor})`, fontWeight: 700 }}>{groom}</span>
      </DesignElement>
    </h1>
  );
}


/* ─── Mountain / Forest Vault Immersive ────────────────── */
export function HighEndImmersiveTemplate({ data }) {
  const rootRef = useRef(null);
  const mainContentRef = useRef(null);
  const { couple = {}, content = {}, event = {}, events = [], family = {}, media = {}, theme = {} } = data;

  const mediaPack = buildMediaPackage(media);
  const intro = pickIntro(content);

  const brideName = couple.bride || 'Bride Name';
  const groomName = couple.groom || 'Groom Name';
  const heroSubtitle = couple.title || 'You are invited to the wedding of';
  const eventDate = event.date ? formatLongDate(event.date) : 'Month DD, YYYY';
  const eventTime = event.time || '11:00 AM – 11:30 AM';
  const eventVenue = event.venue || 'Venue Name';
  const eventCity = event.address ? event.address.split(',').pop().trim() : 'City, State';

  const goldLeaf = '/premium-leaf-v2.png';
  const greenLeaf = '/premium-leaf-v2.png';

  useEffect(() => {
    if (!rootRef.current || typeof window === 'undefined') return undefined;
    gsap.registerPlugin(ScrollTrigger);
    const container = rootRef.current.closest('.custom-scrollbar-preview') ||
      rootRef.current.closest('.overflow-y-auto') ||
      window;

    const ctx = gsap.context(() => {
      // Float Animation for leaves
      gsap.to('.leaf-float', {
        y: -15,
        rotation: 12,
        duration: 4,
        repeat: -1,
        yoyo: true,
        stagger: 0.8,
        ease: 'sine.inOut'
      });

      // Arch Reveal Parallax - THE WHITE ELEMENT
      gsap.fromTo('#vault-arch',
        { y: 120, autoAlpha: 0.8 },
        {
          y: 0,
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: {
            trigger: '#vault-arch',
            scroller: container,
            start: "top bottom",
            end: "top center",
            scrub: 1.2
          }
        }
      );

      // Hero Media Parallax
      gsap.to('.hero-media', {
        y: 100,
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: '.hero-media',
          scroller: container,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

      // Snappy Reveal
      gsap.from('.reveal-up', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.reveal-up',
          scroller: container,
          start: 'top 98%'
        }
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="forest-vault-template relative min-h-screen w-full bg-[#1a3529] font-sans selection:bg-[#c9a87c] selection:text-white" style={{ color: '#f5ede0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        .forest-vault-template h1, .forest-vault-template h2, .forest-vault-template h3, .forest-vault-template .font-serif { font-family: 'Cormorant Garamond', serif; }
        .forest-vault-template { font-family: 'Montserrat', sans-serif; }
        .vault-frame { 
          border-radius: 999px 999px 0 0;
          overflow: hidden;
        }
        .arch-container {
          border-radius: clamp(120px, 15vw, 400px) clamp(120px, 15vw, 400px) 0 0;
        }
      `}</style>

      {/* Hero with Cinematic Video */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Background Media */}
        <div className="absolute inset-0 z-0 hero-media">
          {mediaPack.heroVideo ? (
            <video autoPlay muted loop playsInline className="h-full w-full object-cover">
              <source src={mediaPack.heroVideo} type="video/mp4" />
            </video>
          ) : mediaPack.heroImage ? (
            <img src={mediaPack.heroImage} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[#0a1a13]" />
          )}

          {/* Fog / Mist Effect Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#1a3529] via-[#1a3529]/40 to-transparent blur-2xl opacity-80" />
          <div className="absolute inset-x-0 bottom-[-5%] h-1/3 bg-[#f5ede0]/5 blur-3xl" />
          <div className="absolute inset-0 bg-black/15" />
        </div>

        <div className="relative z-10 w-full transition-all duration-1000 animate-in fade-in slide-in-from-bottom-10">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[8px] text-[#c9a87c]/90">{heroSubtitle}</p>
          <h1 className="flex items-center justify-center gap-4 text-[clamp(42px,10vw,86px)] font-light leading-none" style={{ color: '#f5ede0' }}>
            <span className="reveal-up inline-block">{brideName}</span>
            <span className="font-serif italic text-[#c9a87c]/60">&</span>
            <span className="reveal-up inline-block">{groomName}</span>
          </h1>
          <DesignElement id="emeraldHeroLocation" label="Hero Location">
            <p className="mt-4 text-[13px] font-medium uppercase tracking-[5px] opacity-70 underline underline-offset-[12px] decoration-[#c9a87c]/40" style={{ color: '#f5ede0' }}>{eventCity || 'Saudi Arabia'}</p>
          </DesignElement>
          <p className="mt-8 text-[11px] font-light tracking-[3px] opacity-50" style={{ color: '#f5ede0' }}>{eventDate}</p>
        </div>

        {/* Floating Icons */}
        <div className="leaf-float absolute left-[12%] top-[30%] rotate-[-15deg] opacity-20">
          <Leaf className="h-10 w-10 text-[#c9a87c]" strokeWidth={0.5} />
        </div>
        <div className="leaf-float absolute right-[10%] top-[15%] rotate-[140deg] opacity-15">
          <Leaf className="h-12 w-12 text-[#c9a87c]" strokeWidth={0.5} />
        </div>
      </section>

      {/* The Vault Arch Content */}
      <section id="vault-arch" className="arch-container relative mt-[-40px] min-h-screen bg-[#f5ede0] px-4 pb-20 pt-24 text-[#1a3529] sm:mt-[-80px] sm:pt-32">
        <div className="mx-auto max-w-[840px]">

          <div className="reveal-up mb-20 text-center">
            <div className="mx-auto mb-6 flex justify-center opacity-40">
              <Leaf className="h-8 w-8 rotate-12 text-[#1a3529]" strokeWidth={1} />
            </div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[5px] text-[#c9a87c]">The Union</p>
            <p className="mx-auto max-w-[480px] font-serif text-[18px] italic leading-relaxed opacity-80 sm:text-[22px]">
              {intro || 'In the presence of ancestors and the embrace of nature, we journey into forever.'}
            </p>
          </div>

          {/* Cinematic Signature Section - Video Background */}
          <div className="reveal-up relative mb-16 h-[220px] w-full overflow-hidden rounded-[24px] bg-stone-900 shadow-md sm:h-[320px] sm:rounded-[32px]">
            {mediaPack.video ? (
              <video autoPlay muted loop playsInline className="h-full w-full object-cover opacity-70">
                <source src={mediaPack.video} type="video/mp4" />
              </video>
            ) : mediaPack.heroImage && (
              <img src={mediaPack.heroImage} className="h-full w-full object-cover opacity-60" />
            )}

            {/* Dramatic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a3529] via-transparent to-[#1a3529]/40" />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-[#f5ede0]">
              <DesignElement id="emeraldCinematicNames" label="Cinematic Names">
                <div className="relative">
                  <p className="mb-2 text-[8px] font-bold uppercase tracking-[6px] text-[#c9a87c]/80">The Union Of</p>
                  <h2 className="mb-2 font-serif text-[clamp(24px,7vw,48px)] font-light italic leading-none tracking-tight drop-shadow-xl">
                    {brideName} <span className="not-italic text-[#c9a87c]">&</span> {groomName}
                  </h2>
                  <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-[#c9a87c]/40 to-transparent" />
                </div>
              </DesignElement>
              <p className="mt-4 text-[10px] font-medium uppercase tracking-[5px] text-[#c9a87c]">{eventCity}</p>
            </div>

            {/* Decorative Leaf in corner */}
            <div className="absolute bottom-10 right-10 opacity-30">
              <Leaf className="h-8 w-8 text-[#c9a87c]" strokeWidth={0.5} />
            </div>
          </div>


          {/* Cinematic Event Schedule - Premium Vertical Timeline */}
          <div className="reveal-up mb-32 px-4 sm:px-0">
            <div className="mx-auto mb-10 h-px w-32 bg-gradient-to-r from-transparent via-[#c9a87c]/40 to-transparent" />
            <h2 className="mb-16 text-center font-serif text-[clamp(28px,5vw,42px)] italic tracking-tight text-[#c9a87c]">The Schedule</h2>

            <div className="mx-auto max-w-[700px] space-y-24">
              {(events || []).map((evt, i) => (
                <div key={i} className={cn("reveal-up flex flex-col gap-8 sm:items-center sm:gap-16", i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse")}>
                  {/* Arched Portrait for Event */}
                  <div className="vault-frame relative h-[320px] w-full shrink-0 shadow-2xl sm:h-[420px] sm:w-[300px]">
                    {mediaPack.gallery[i + 2] ? (
                      <img src={mediaPack.gallery[i + 2]} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#1a3529]/5 opacity-20">
                        <Leaf className="h-12 w-12 text-[#c9a87c]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a3529]/40 via-transparent to-transparent" />
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 space-y-6 text-center sm:text-left">
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[5px] text-[#c9a87c]/80">Ceremony {i + 1}</p>
                      <h3 className="font-serif text-[clamp(24px,4vw,36px)] leading-tight text-[#1a3529]">{evt.name}</h3>
                    </div>

                    <div className="mx-auto h-px w-12 bg-[#c9a87c]/30 sm:mx-0" />

                    <div className="space-y-4">
                      <div className="flex flex-col gap-4 text-sm text-[#1a3529]/70 sm:flex-row sm:items-center sm:gap-6">
                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#c9a87c]/80" /> {evt.date}</span>
                        <span className="hidden h-4 w-px bg-[#1a3529]/10 sm:block" />
                        <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#c9a87c]/80" /> {evt.time}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-[#1a3529]/70">
                        <MapPin className="h-4 w-4 shrink-0 text-[#c9a87c]/80 mt-1" />
                        <div>
                          <p className="font-serif text-lg leading-tight text-[#1a3529]">{evt.venue}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[2px] opacity-50">{evt.address}</p>
                        </div>
                      </div>
                    </div>

                    {evt.notes && (
                      <p className="font-serif text-sm italic opacity-60">“{evt.notes}”</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h2 className="reveal-up mb-12 font-serif text-[clamp(28px,5vw,42px)] italic tracking-tight opacity-90">Our Journey</h2>

            <div className="grid grid-cols-2 gap-3 pb-24 sm:grid-cols-3 sm:gap-4">
              {[0, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="reveal-up vault-frame overflow-hidden bg-stone-200/30 h-[240px] sm:h-[400px]">
                  {mediaPack.gallery[idx] ? (
                    <img
                      src={mediaPack.gallery[idx]}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                      alt={`Moment ${idx}`}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase tracking-[3px] opacity-20">MOMENT</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Detail */}
        <div className="mt-12 border-t border-[#1a3529]/10 pt-16 text-center">
          <div className="leaf-float mx-auto mb-10 flex justify-center text-[#c9a87c] opacity-60">
            <Leaf size={40} strokeWidth={1} />
          </div>

          {theme.enableCountdown && (
            <div className="reveal-up mb-10 flex justify-center text-[#1a3529]">
              <CinematicTimer date={event.date} dark={false} />
            </div>
          )}

          <p className="font-serif text-[clamp(24px,4vw,36px)] font-light opacity-90">{brideName} & {groomName}</p>

          <DesignElement id="emeraldEndInvite" label="End Invitation Text">
            <p className="mx-auto mt-8 max-w-[280px] text-[11px] font-medium uppercase leading-relaxed tracking-[4px] opacity-50 sm:max-w-none">
              We look forward to celebrating <br className="hidden sm:block" /> this special day with you.
            </p>
          </DesignElement>


        </div>
      </section>


    </div>
  );
}

export const EmeraldTemplate = HighEndImmersiveTemplate;

/* ─── Classic / Editorial Luxe ──────────────────────────── */

export function ClassicTemplate({ data }) {
  const { couple = {}, content = {}, event = {}, media = {} } = data;
  const intro = pickIntro(content);
  const countdown = getCountdownLabel(event.date);

  return (
    <div className="bg-[#f4eee7] text-stone-900">
      <HeroBackground
        media={media}
        className="min-h-[420px]"
        overlayClass="bg-[radial-gradient(circle_at_top,rgba(255,244,219,0.38),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.18),rgba(28,25,23,0.52))]"
      >
        <div className="relative flex min-h-[420px] flex-col justify-between px-5 py-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <InfoPill className="border-white/40 bg-white/15 text-white backdrop-blur-md">
              {couple.title || 'Editorial Celebration'}
            </InfoPill>
            <DateBadge event={event} />
          </div>

          <div data-live-invite-section className="rounded-[28px] border border-white/20 bg-white/10 p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl animate-fade-in-up stagger-2">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm tracking-[0.3em] text-white/90">
              {initialsForCouple(couple)}
            </div>

            <EditorialNames
              brideId="classicBrideName"
              groomId="classicGroomName"
              bride={couple.bride}
              groom={couple.groom}
              brideColor="#fffaf0"
              groomColor="#fffaf0"
              dividerClassName="text-white/55"
            />

            {intro && (
              <DesignElement id="classicIntro" label="Classic Intro" defaultColor="#fffaf0">
                <p className="mt-3 text-xs leading-relaxed text-white/80 animate-fade-in-up stagger-3">
                  {intro}
                </p>
              </DesignElement>
            )}

            <div className="mt-4 grid gap-3 rounded-[22px] border border-white/15 bg-white/10 p-3">
              <DetailsRow label="Date" value={formatElegantDate(event.date)} designId="classicDate" designLabel="Classic Date" />
              <DetailsRow label="Time" value={event.time} designId="classicTime" designLabel="Classic Time" />
              <DetailsRow label="Venue" value={event.venue || event.address} designId="classicVenue" designLabel="Classic Venue" />
            </div>
          </div>

          <div className="mt-4">
            <PhotoRibbon media={media} frameClassName="border-white/20 bg-white/10 backdrop-blur-md" />
            {countdown && (
              <div className="mt-2 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/80 backdrop-blur-md">
                {countdown}
              </div>
            )}
          </div>
        </div>
      </HeroBackground>

      <div className="px-5 py-4">
        <StoryVideoCard media={media} className="bg-white/80 backdrop-blur-md" />
      </div>

      <SharedSections data={data} />
    </div>
  );
}

/* ─── Floral / Botanical Motion ─────────────────────────── */
export function FloralTemplate({ data }) {
  const { couple = {}, content = {}, event = {}, media = {} } = data;
  const intro = pickIntro(content);
  const mediaPack = buildMediaPackage(media);

  return (
    <div className="bg-[linear-gradient(180deg,#fff8fb_0%,#ffe9ef_52%,#fffdfd_100%)] text-rose-950">
      <div className="relative overflow-hidden">
        <div data-live-invite-float className="absolute left-[-80px] top-[-90px] h-56 w-56 rounded-full bg-rose-200/50 blur-3xl" />
        <div data-live-invite-float className="absolute right-[-70px] top-20 h-52 w-52 rounded-full bg-fuchsia-200/50 blur-3xl" />

        {/* Hero media full-width */}
        <div data-live-invite-section className="relative overflow-hidden rounded-b-[34px] mx-4 mt-4 shadow-[0_24px_55px_rgba(136,19,55,0.14)]">
          {mediaPack.heroVideo ? (
            <video data-live-invite-media className="h-56 w-full object-cover" autoPlay muted loop playsInline poster={mediaPack.poster || undefined}>
              <source src={mediaPack.heroVideo} />
            </video>
          ) : mediaPack.heroImage ? (
            <img data-live-invite-media src={mediaPack.heroImage} alt="botanical hero" className="h-56 w-full object-cover" />
          ) : (
            <div className="h-56 w-full bg-[linear-gradient(180deg,#fbcfe8_0%,#f9a8d4_100%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(15,23,42,0.22))]" />
          <div className="absolute bottom-3 left-3 rounded-full border border-white/60 bg-white/75 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-rose-700 backdrop-blur-md">
            Botanical motion
          </div>
        </div>

        <div className="relative px-5 py-6">
          <InfoPill className="border-rose-300/80 bg-white/70 text-rose-700 backdrop-blur-md">
            Floral Celebration
          </InfoPill>

          <div className="mt-4">
            <h1 className="text-3xl font-semibold leading-tight" style={{ fontFamily: 'inherit' }}>
              <DesignElement id="floralBrideName" label="Bride Name" defaultColor="#881337">
                <span style={{ color: 'var(--tw-primary,#881337)', fontWeight: 700 }}>{couple.bride}</span>
              </DesignElement>
              <span className="mx-2 inline-block text-xl font-light italic text-rose-400/80">&amp;</span>
              <DesignElement id="floralGroomName" label="Groom Name" defaultColor="#881337">
                <span style={{ color: 'var(--tw-primary,#881337)', fontWeight: 700 }}>{couple.groom}</span>
              </DesignElement>
            </h1>

            {intro && (
              <DesignElement id="floralIntro" label="Floral Intro" defaultColor="#881337">
                <p className="mt-3 text-xs leading-relaxed text-rose-900/75 animate-fade-in-up stagger-2">
                  {intro}
                </p>
              </DesignElement>
            )}
          </div>

          <div className="mt-5 space-y-3">
            <DateBadge event={event} />
            <div data-live-invite-section className="rounded-[22px] border border-rose-200 bg-white/75 p-4 shadow-[0_18px_40px_rgba(136,19,55,0.08)] backdrop-blur-md">
              <DetailsRow label="When" value={`${formatShortDate(event.date)}${event.time ? ` · ${event.time}` : ''}`} designId="floralWhen" designLabel="Floral Date and Time" />
              <DetailsRow label="Venue" value={event.venue} className="mt-3" designId="floralVenue" designLabel="Floral Venue" />
              <DetailsRow label="Address" value={event.address} className="mt-3 text-rose-900/70" designId="floralAddress" designLabel="Floral Address" />
            </div>
          </div>

          {/* Side gallery as horizontal strip */}
          {mediaPack.gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {mediaPack.gallery.slice(1, 3).map((src, i) => (
                <div key={`fg-${i}`} data-live-invite-card className="overflow-hidden rounded-[20px] border border-white/60">
                  <img data-live-invite-media src={src} alt={`g${i}`} className="h-28 w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-5">
        <StoryVideoCard media={media} className="mt-2 border-rose-200 bg-white/80" />
      </div>

      <SharedSections data={data} />
    </div>
  );
}

/* ─── Modern / Cinematic Minimal ────────────────────────── */
export function ModernTemplate({ data }) {
  const { couple = {}, content = {}, event = {}, media = {} } = data;
  const intro = pickIntro(content);
  const countdown = getCountdownLabel(event.date);

  return (
    <div className="bg-[#0b1020] text-white">
      <HeroBackground
        media={media}
        className="min-h-[420px]"
        overlayClass="bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.20),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.28),rgba(2,6,23,0.86))]"
      >
        <div className="relative flex min-h-[420px] flex-col justify-between px-5 py-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <InfoPill className="border-white/15 bg-white/8 text-white/80 backdrop-blur-xl">
              Wedding Invitation
            </InfoPill>
            {countdown && (
              <div className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/65 backdrop-blur-xl">
                {countdown}
              </div>
            )}
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.5em] text-white/50 mb-3">A modern wedding story</div>
            <h1 className="text-4xl font-black leading-none tracking-tight" style={{ fontFamily: 'inherit' }}>
              <DesignElement id="modernBrideName" label="Bride Name" defaultColor="#f8fafc">
                <span style={{ color: 'var(--tw-primary,#f8fafc)', fontWeight: 800 }}>{couple.bride}</span>
              </DesignElement>
              <br />
              <span className="text-xl font-light italic text-white/35">and</span>
              <br />
              <DesignElement id="modernGroomName" label="Groom Name" defaultColor="#f8fafc">
                <span style={{ color: 'var(--tw-primary,#f8fafc)', fontWeight: 800 }}>{couple.groom}</span>
              </DesignElement>
            </h1>

            {intro && (
              <DesignElement id="modernIntro" label="Modern Intro" defaultColor="#f8fafc">
                <p className="mt-3 text-xs leading-relaxed text-white/70 animate-fade-in-up stagger-3">
                  {intro}
                </p>
              </DesignElement>
            )}
          </div>

          <div data-live-invite-section className="rounded-[26px] border border-white/10 bg-white/8 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl mt-5">
            <div className="flex items-start justify-between gap-3">
              <DateBadge event={event} dark />
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Details</div>
                <div className="mt-1 text-sm font-semibold text-white/90">{formatShortDate(event.date)}</div>
                {event.time && <div className="mt-0.5 text-xs text-white/60">{event.time}</div>}
              </div>
            </div>
            <div className="mt-4 h-px bg-white/10" />
            <DetailsRow label="Venue" value={event.venue} className="mt-4" designId="modernVenue" designLabel="Modern Venue" />
            <DetailsRow label="Location" value={event.address} className="mt-3 text-white/70" designId="modernLocation" designLabel="Modern Location" />
            <PhotoRibbon media={media} className="mt-4" frameClassName="border-white/10 bg-white/5" />
          </div>
        </div>
      </HeroBackground>

      <div className="px-5 py-4">
        <StoryVideoCard media={media} dark className="border-white/10 bg-white/5" />
      </div>

      <SharedSections data={data} />
    </div>
  );
}

/* ─── Arabic / Majestic Noir ────────────────────────────── */
export function ArabicTemplate({ data }) {
  const { couple = {}, content = {}, event = {}, media = {} } = data;
  const intro = pickIntro(content);

  return (
    <div className="bg-[linear-gradient(180deg,#050505_0%,#0f0b07_38%,#18120b_100%)] text-yellow-50">
      <HeroBackground
        media={media}
        className="min-h-[420px]"
        overlayClass="bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(180,83,9,0.16),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.72))]"
      >
        <div className="relative flex min-h-[420px] flex-col justify-between px-5 py-7">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <InfoPill className="border-yellow-300/25 bg-yellow-300/10 text-yellow-100 backdrop-blur-md">
              {couple.title || 'Royal Celebration'}
            </InfoPill>
            <div className="rounded-full border border-yellow-300/20 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-yellow-100/75 backdrop-blur-md">
              Evening affair
            </div>
          </div>

          <div data-live-invite-section className="rounded-t-[70px] rounded-b-[28px] border border-yellow-200/15 bg-black/30 p-5 text-center shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-transparent via-yellow-300/80 to-transparent" />

            <h1 className="text-3xl font-semibold leading-tight" style={{ fontFamily: 'inherit' }}>
              <DesignElement id="arabicBrideName" label="Bride Name" defaultColor="#fef3c7">
                <span style={{ color: 'var(--tw-primary,#fef3c7)', fontWeight: 600 }}>{couple.bride}</span>
              </DesignElement>
              <span className="mx-2 text-yellow-500/45">&amp;</span>
              <DesignElement id="arabicGroomName" label="Groom Name" defaultColor="#fef3c7">
                <span style={{ color: 'var(--tw-primary,#fef3c7)', fontWeight: 600 }}>{couple.groom}</span>
              </DesignElement>
            </h1>

            {intro && (
              <DesignElement id="arabicIntro" label="Arabic Intro" defaultColor="#fef3c7">
                <p className="mx-auto mt-3 text-xs leading-relaxed text-yellow-100/70">
                  {intro}
                </p>
              </DesignElement>
            )}

            <div className="mt-5 space-y-3 rounded-[22px] border border-yellow-100/10 bg-black/20 p-4 text-left">
              <DateBadge event={event} dark />
              <DetailsRow label="Date" value={formatElegantDate(event.date)} designId="arabicDate" designLabel="Arabic Date" />
              <DetailsRow label="Time" value={event.time} designId="arabicTime" designLabel="Arabic Time" />
              <DetailsRow label="Venue" value={event.venue || event.address} designId="arabicVenue" designLabel="Arabic Venue" />
            </div>
          </div>

          <PhotoRibbon media={media} className="mt-4" frameClassName="border-yellow-200/10 bg-white/5" />
        </div>
      </HeroBackground>

      <div className="px-5 py-4">
        <StoryVideoCard media={media} dark className="border-yellow-100/10 bg-white/5 text-yellow-50" />
      </div>

      <SharedSections data={data} dark />
    </div>
  );
}

/* ─── Traditional / Heritage Luxe ───────────────────────── */
export function TraditionalTemplate({ data }) {
  const { couple = {}, content = {}, event = {}, media = {} } = data;
  const intro = pickIntro(content);
  const mediaPack = buildMediaPackage(media);

  return (
    <div className="bg-[linear-gradient(180deg,#3b0d0d_0%,#4a140f_35%,#23090a_100%)] text-amber-50">
      <div className="relative overflow-hidden">
        <div data-live-invite-float className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(253,224,71,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_25%)]" />

        {/* Hero image */}
        <div data-live-invite-section className="relative overflow-hidden rounded-b-[28px] mx-4 mt-4 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          {mediaPack.heroImage ? (
            <img data-live-invite-media src={mediaPack.heroImage} alt="heritage hero" className="h-52 w-full object-cover" />
          ) : (
            <div className="h-52 w-full bg-[linear-gradient(180deg,#7f1d1d_0%,#451a03_100%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.35))]" />
          <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-amber-100/80 backdrop-blur-md">
            Heritage portrait
          </div>
        </div>

        <div className="relative px-5 py-6">
          <div data-live-invite-section className="rounded-[28px] border border-yellow-200/15 bg-black/15 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-md">
            <div data-live-invite-card className="rounded-[22px] border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,244,214,0.92))] p-4 text-stone-900">
              <InfoPill className="border-amber-300 bg-amber-50 text-amber-800">
                Traditional Wedding
              </InfoPill>

              <div className="mt-4">
                <EditorialNames
                  brideId="traditionalBrideName"
                  groomId="traditionalGroomName"
                  bride={couple.bride}
                  groom={couple.groom}
                  brideColor="#7c2d12"
                  groomColor="#7c2d12"
                  dividerClassName="text-amber-700/50"
                />
              </div>

              {intro && (
                <DesignElement id="traditionalIntro" label="Traditional Intro" defaultColor="#7c2d12">
                  <p className="mt-3 text-xs leading-relaxed text-stone-600">
                    {intro}
                  </p>
                </DesignElement>
              )}

              <div className="mt-4 space-y-3 rounded-[20px] border border-amber-200 bg-white/70 p-3">
                <DateBadge event={event} />
                <DetailsRow label="Date" value={formatElegantDate(event.date)} designId="traditionalDate" designLabel="Traditional Date" />
                <DetailsRow label="Time" value={event.time} designId="traditionalTime" designLabel="Traditional Time" />
                <DetailsRow label="Venue" value={event.venue || event.address} designId="traditionalVenue" designLabel="Traditional Venue" />
              </div>
            </div>
          </div>

          {/* Secondary gallery grid */}
          {mediaPack.gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {mediaPack.gallery.slice(1, 3).map((src, i) => (
                <div key={`tg-${i}`} data-live-invite-card className="overflow-hidden rounded-[20px] border border-yellow-200/10">
                  <img data-live-invite-media src={src} alt={`g${i}`} className="h-28 w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-4">
        <StoryVideoCard media={media} dark className="border-yellow-100/10 bg-white/5" />
      </div>

      <SharedSections data={data} dark />
    </div>
  );
}

/* --- Ceremony / Portrait Editorial --- */
export function CeremonyTemplate({ data, isPreview = false, previewMode = 'desktop' }) {
  const rootRef = useRef(null);
  const gallerySectionRef = useRef(null);
  const { couple = {}, content = {}, event = {}, family = {}, media = {}, theme = {} } = data;
  const mediaPack = buildMediaPackage(media);
  const intro = pickIntro(content);
  const bridePortrait = resolveMediaSource(media.brideImage) || mediaPack.gallery[0] || mediaPack.heroImage;
  const groomPortrait = resolveMediaSource(media.groomImage) || mediaPack.gallery[1] || mediaPack.heroImage;
  const gallery = mediaPack.gallery.slice(0, 4);
  const note = content.familyMessage || content.specialNotes || content.quote;
  const ceremonyPrimary = theme?.primaryColor || '#876c57';
  const ceremonySecondary = theme?.secondaryColor || '#efe2d3';
  const headingColor = theme?.headingColor || withAlpha(ceremonyPrimary, 0.92);
  const subheadingColor = theme?.subheadingColor || ceremonyPrimary;
  const bodyColor = theme?.bodyColor || withAlpha(ceremonyPrimary, 0.82);
  const metaColor = theme?.metaColor || withAlpha(ceremonyPrimary, 0.72);
  const rootBackground = theme?.backgroundStyle === 'solid'
    ? withAlpha(ceremonySecondary, 0.38)
    : theme?.backgroundStyle === 'pattern'
      ? `radial-gradient(${withAlpha(ceremonyPrimary, 0.14)} 1px, transparent 1px), linear-gradient(180deg, ${withAlpha(ceremonySecondary, 0.34)} 0%, ${withAlpha(ceremonySecondary, 0.18)} 38%, #fbf8f4 100%)`
      : `linear-gradient(180deg, ${withAlpha(ceremonySecondary, 0.46)} 0%, ${withAlpha(ceremonySecondary, 0.26)} 38%, #fbf8f4 100%)`;
  const primarySoftBorder = withAlpha(ceremonyPrimary, 0.18);
  const primaryLight = withAlpha(ceremonyPrimary, 0.1);
  const secondaryPanel = withAlpha(ceremonySecondary, 0.5);
  const surfaceStrong = withAlpha(ceremonySecondary, 0.52);
  const surfaceSoft = withAlpha(ceremonySecondary, 0.28);
  const isCompactPreview = isPreview && previewMode === 'mobile';

  const handleScrollToGallery = () => {
    gallerySectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    if (!rootRef.current || typeof window === 'undefined' || isPreview || theme.enableAnimation === false) return undefined;

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanupFns = [];

    const ctx = gsap.context(() => {
      const revealItems = gsap.utils.toArray('[data-ceremony-reveal]');
      const tiltItems = gsap.utils.toArray('[data-ceremony-tilt]');
      const mediaItems = gsap.utils.toArray('[data-ceremony-media]');
      const blobs = gsap.utils.toArray('[data-ceremony-float]');

      if (!prefersReducedMotion) {
        revealItems.forEach((item, index) => {
          gsap.fromTo(
            item,
            { autoAlpha: 0, y: 42, scale: 0.985 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              delay: index === 0 ? 0.08 : 0,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 86%',
                once: true,
              },
            }
          );
        });

        mediaItems.forEach((item) => {
          gsap.fromTo(
            item,
            { scale: 1.08, autoAlpha: 0.72 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 1.4,
              ease: 'power2.out',
            }
          );
        });

        blobs.forEach((blob, index) => {
          gsap.to(blob, {
            yPercent: index % 2 === 0 ? -10 : 10,
            xPercent: index % 2 === 0 ? 6 : -6,
            duration: 7 + index,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        });

        tiltItems.forEach((item) => {
          gsap.set(item, {
            transformPerspective: 900,
            transformStyle: 'preserve-3d',
          });

          const rotateXTo = gsap.quickTo(item, 'rotationX', { duration: 0.35, ease: 'power2.out' });
          const rotateYTo = gsap.quickTo(item, 'rotationY', { duration: 0.35, ease: 'power2.out' });
          const yTo = gsap.quickTo(item, 'y', { duration: 0.35, ease: 'power2.out' });

          const handleMove = (event) => {
            const rect = item.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            rotateXTo((0.5 - y) * 8);
            rotateYTo((x - 0.5) * 10);
            yTo(-4);
          };

          const handleLeave = () => {
            rotateXTo(0);
            rotateYTo(0);
            yTo(0);
          };

          item.addEventListener('pointermove', handleMove);
          item.addEventListener('pointerleave', handleLeave);
          cleanupFns.push(() => {
            item.removeEventListener('pointermove', handleMove);
            item.removeEventListener('pointerleave', handleLeave);
          });
        });
      } else {
        gsap.set(revealItems, { autoAlpha: 1, y: 0, scale: 1 });
      }
    }, rootRef);

    return () => {
      cleanupFns.forEach((cleanup) => cleanup());
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [bridePortrait, gallery, groomPortrait, isPreview, mediaPack.heroImage, note, theme.enableAnimation]);

  return (
    <div
      ref={rootRef}
      className="overflow-x-hidden"
      style={{
        '--ceremony-primary': ceremonyPrimary,
        '--ceremony-secondary': ceremonySecondary,
        color: bodyColor,
        background: rootBackground,
        backgroundSize: theme?.backgroundStyle === 'pattern' ? '18px 18px, auto' : undefined,
      }}
    >
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-3 py-10 sm:px-5">
        <div data-ceremony-float className="absolute left-[-90px] top-[-40px] h-48 w-48 rounded-full blur-3xl" style={{ backgroundColor: withAlpha(ceremonySecondary, 0.7) }} />
        <div data-ceremony-float className="absolute right-[-80px] top-24 h-52 w-52 rounded-full blur-3xl" style={{ backgroundColor: withAlpha(ceremonyPrimary, 0.12) }} />

        <div
          data-ceremony-reveal
          data-ceremony-tilt
          className="relative mx-auto max-w-xl rounded-[24px] border p-3.5 text-center shadow-[0_24px_70px_-34px_rgba(61,46,33,0.35)] backdrop-blur-md will-change-transform sm:rounded-[36px] sm:p-6"
          style={{ borderColor: withAlpha(ceremonyPrimary, 0.16), backgroundColor: withAlpha(ceremonySecondary, 0.34) }}
        >
          <div className="text-[8px] uppercase tracking-[0.18em] sm:text-[10px] sm:tracking-[0.42em]" style={{ color: metaColor }}>
            You are invited to the wedding of
          </div>

          <div className={cn('mt-4 flex flex-col items-center gap-2 sm:mt-5', !isCompactPreview && 'sm:flex-row sm:justify-center sm:gap-3')}>
            <DesignElement id="ceremonyBrideName" label="Bride Name" defaultColor={headingColor}>
              <span className="block max-w-full break-words text-[clamp(2rem,8vw,3rem)] font-semibold leading-[0.95] tracking-tight" style={{ color: headingColor }}>
                {couple.bride}
              </span>
            </DesignElement>
            <span className="inline-block text-lg font-light italic sm:text-2xl" style={{ color: metaColor }}>&amp;</span>
            <DesignElement id="ceremonyGroomName" label="Groom Name" defaultColor={headingColor}>
              <span className="block max-w-full break-words text-[clamp(2rem,8vw,3rem)] font-semibold leading-[0.95] tracking-tight" style={{ color: headingColor }}>
                {couple.groom}
              </span>
            </DesignElement>
          </div>

          <div className="mt-3 text-[11px] font-medium tracking-[0.08em] uppercase sm:mt-4 sm:text-sm sm:tracking-[0.18em]" style={{ color: metaColor }}>
            {formatShortDate(event.date) || 'Save the date'}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-5">
            <div className="inline-flex rounded-full border px-3 py-2 text-[8px] uppercase tracking-[0.16em] sm:px-4 sm:text-[10px] sm:tracking-[0.34em]" style={{ borderColor: primarySoftBorder, backgroundColor: withAlpha(ceremonySecondary, 0.3), color: metaColor }}>
              Open invitation
            </div>
            {gallery.length > 0 && (
              <button
                type="button"
                onClick={handleScrollToGallery}
                className="inline-flex rounded-full border px-3 py-2 text-[8px] font-medium uppercase tracking-[0.16em] transition sm:px-4 sm:text-[10px] sm:tracking-[0.3em]"
                style={{ borderColor: primarySoftBorder, backgroundColor: primaryLight, color: subheadingColor }}
              >
                View gallery
              </button>
            )}
          </div>

          {mediaPack.heroImage && (
            <div className="mt-5 overflow-hidden rounded-[18px] border sm:mt-6 sm:rounded-[28px]" style={{ borderColor: withAlpha(ceremonyPrimary, 0.12) }}>
              <img data-ceremony-media src={mediaPack.heroImage} alt="cover" className="h-44 w-full object-cover will-change-transform sm:h-64" />
            </div>
          )}
        </div>
      </section>

      <section className="px-3 py-2.5 sm:px-5 sm:py-4">
        <div data-ceremony-reveal className="mx-auto max-w-xl rounded-[24px] border p-3.5 shadow-[0_24px_60px_-36px_rgba(61,46,33,0.28)] sm:rounded-[34px] sm:p-6" style={{ borderColor: withAlpha(ceremonyPrimary, 0.14), backgroundColor: withAlpha(ceremonySecondary, 0.24) }}>
          <div className="text-center">
            <div className="text-[8px] uppercase tracking-[0.18em] sm:text-[10px] sm:tracking-[0.4em]" style={{ color: metaColor }}>With great joy</div>
            {intro && (
              <DesignElement id="ceremonyIntro" label="Ceremony Intro" defaultColor={bodyColor}>
                <p className="mt-3 text-[13px] leading-6 sm:mt-4 sm:text-sm sm:leading-7" style={{ color: bodyColor }}>
                  {intro}
                </p>
              </DesignElement>
            )}
          </div>

          <div className="mt-6 grid gap-3.5 sm:mt-8 sm:gap-4">
            {[
              {
                key: 'bride',
                label: 'Bride',
                name: couple.bride,
                image: bridePortrait,
                familyName: family.brideParents,
              },
              {
                key: 'groom',
                label: 'Groom',
                name: couple.groom,
                image: groomPortrait,
                familyName: family.groomParents,
              },
            ].map((person) => (
              <div
                key={person.key}
                data-ceremony-tilt
                className={cn('grid gap-3 rounded-[20px] border p-3 will-change-transform sm:gap-4 sm:rounded-[28px] sm:p-4', !isCompactPreview && 'sm:grid-cols-[140px_1fr] sm:items-center')}
                style={{ borderColor: withAlpha(ceremonyPrimary, 0.12), backgroundColor: surfaceSoft }}
              >
                <div className="overflow-hidden rounded-[16px] border sm:rounded-[24px]" style={{ borderColor: withAlpha(ceremonyPrimary, 0.12), backgroundColor: secondaryPanel }}>
                  {person.image ? (
                    <img src={person.image} alt={person.name} className="h-36 w-full object-cover sm:h-44" />
                  ) : (
                    <div className="flex h-36 items-center justify-center text-sm uppercase tracking-[0.22em] sm:h-44 sm:tracking-[0.35em]" style={{ color: metaColor }}>
                      {person.label}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[8px] uppercase tracking-[0.18em] sm:text-[10px] sm:tracking-[0.36em]" style={{ color: metaColor }}>{person.label}</div>
                  <h2 className="mt-2 break-words text-[clamp(1.55rem,6vw,1.9rem)] font-semibold leading-tight sm:text-3xl" style={{ color: headingColor }}>{person.name || person.label}</h2>
                  {person.familyName && (
                    <p className="mt-2 text-[13px] leading-6 sm:mt-3 sm:text-sm sm:leading-7" style={{ color: bodyColor }}>{person.familyName}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-2.5 sm:px-5 sm:py-4">
        <div data-ceremony-reveal className="mx-auto max-w-xl rounded-[24px] border p-3.5 shadow-[0_24px_60px_-34px_rgba(61,46,33,0.24)] sm:rounded-[34px] sm:p-6" style={{ borderColor: withAlpha(ceremonyPrimary, 0.14), background: `linear-gradient(180deg, ${withAlpha(ceremonySecondary, 0.18)} 0%, ${withAlpha(ceremonySecondary, 0.34)} 100%)` }}>
          <div className="text-center">
            <div className="text-[8px] uppercase tracking-[0.18em] sm:text-[10px] sm:tracking-[0.4em]" style={{ color: metaColor }}>The celebration</div>
            <h3 className="mt-3 text-[clamp(1.55rem,6vw,1.9rem)] font-semibold sm:mt-4 sm:text-3xl" style={{ color: subheadingColor }}>Join us for the ceremony</h3>
          </div>

          <div className={cn('mt-5 grid gap-3 sm:mt-6 sm:gap-4', !isCompactPreview && 'sm:grid-cols-3')}>
            <div className="rounded-[20px] border p-3.5 text-center sm:rounded-[24px] sm:p-4" style={{ borderColor: withAlpha(ceremonyPrimary, 0.14), backgroundColor: surfaceStrong }}>
              <div className="text-[9px] uppercase tracking-[0.22em] sm:text-[10px] sm:tracking-[0.35em]" style={{ color: metaColor }}>Date</div>
              <p className="mt-2 text-[13px] font-medium leading-6 sm:mt-3 sm:text-sm" style={{ color: subheadingColor }}>{formatElegantDate(event.date) || 'Date to be announced'}</p>
            </div>
            <div className="rounded-[20px] border p-3.5 text-center sm:rounded-[24px] sm:p-4" style={{ borderColor: withAlpha(ceremonyPrimary, 0.14), backgroundColor: surfaceStrong }}>
              <div className="text-[9px] uppercase tracking-[0.22em] sm:text-[10px] sm:tracking-[0.35em]" style={{ color: metaColor }}>Time</div>
              <p className="mt-2 text-[13px] font-medium leading-6 sm:mt-3 sm:text-sm" style={{ color: subheadingColor }}>{event.time || 'Time to be announced'}</p>
            </div>
            <div className="rounded-[20px] border p-3.5 text-center sm:rounded-[24px] sm:p-4" style={{ borderColor: withAlpha(ceremonyPrimary, 0.14), backgroundColor: surfaceStrong }}>
              <div className="text-[9px] uppercase tracking-[0.22em] sm:text-[10px] sm:tracking-[0.35em]" style={{ color: metaColor }}>Venue</div>
              <p className="mt-2 break-words text-[13px] font-medium leading-6 sm:mt-3 sm:text-sm" style={{ color: subheadingColor }}>{event.venue || 'Venue to be announced'}</p>
            </div>
          </div>

          {event.address && (
            <DesignElement id="ceremonyVenueAddress" label="Ceremony Address" defaultColor={bodyColor}>
              <p className="mt-4 text-center text-[13px] leading-6 sm:mt-5 sm:text-sm sm:leading-7" style={{ color: bodyColor }}>{event.address}</p>
            </DesignElement>
          )}
        </div>
      </section>

      {gallery.length > 0 && (
        <section ref={gallerySectionRef} className="px-3 py-2.5 sm:px-5 sm:py-4">
          <div data-ceremony-reveal className="mx-auto max-w-xl rounded-[24px] border p-3.5 shadow-[0_24px_60px_-36px_rgba(61,46,33,0.22)] sm:rounded-[34px] sm:p-6" style={{ borderColor: withAlpha(ceremonyPrimary, 0.14), backgroundColor: withAlpha(ceremonySecondary, 0.24) }}>
            <div className="text-center">
              <div className="text-[8px] uppercase tracking-[0.18em] sm:text-[10px] sm:tracking-[0.4em]" style={{ color: metaColor }}>Our journey</div>
              <h3 className="mt-3 text-[clamp(1.55rem,6vw,1.9rem)] font-semibold sm:mt-4 sm:text-3xl" style={{ color: subheadingColor }}>A few cherished moments</h3>
            </div>

            <div className={cn('mt-5 grid grid-cols-1 gap-3 sm:mt-6', !isCompactPreview && 'sm:grid-cols-2')}>
              {gallery.map((src, index) => (
                <div key={`${src}-${index}`} className={index === 0 && !isCompactPreview ? 'sm:col-span-2' : ''}>
                  <div
                    data-ceremony-tilt
                    className="overflow-hidden rounded-[18px] border will-change-transform sm:rounded-[24px]"
                    style={{ borderColor: withAlpha(ceremonyPrimary, 0.12), backgroundColor: withAlpha(ceremonySecondary, 0.25) }}
                  >
                    <img
                      src={src}
                      alt={`gallery ${index + 1}`}
                      className={index === 0 ? 'h-44 w-full object-cover sm:h-52' : 'h-36 w-full object-cover sm:h-32'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-3 pb-5 pt-2.5 sm:px-5 sm:pb-8 sm:pt-4">
        <div data-ceremony-reveal className="mx-auto max-w-xl rounded-[24px] border px-3.5 py-5 text-center shadow-[0_24px_60px_-34px_rgba(61,46,33,0.24)] sm:rounded-[34px] sm:px-6 sm:py-8" style={{ borderColor: withAlpha(ceremonyPrimary, 0.14), background: `linear-gradient(180deg, ${withAlpha(ceremonySecondary, 0.18)} 0%, ${withAlpha(ceremonySecondary, 0.42)} 100%)` }}>
          {note && (
            <DesignElement id="ceremonyClosingNote" label="Ceremony Closing Note" defaultColor={bodyColor}>
              <p className="mx-auto max-w-lg text-[13px] leading-6 sm:text-sm sm:leading-7" style={{ color: bodyColor }}>{note}</p>
            </DesignElement>
          )}
          <div className="mt-5 text-[8px] uppercase tracking-[0.18em] sm:mt-6 sm:text-[10px] sm:tracking-[0.42em]" style={{ color: metaColor }}>With love</div>
          <h3 className="mt-3 break-words text-[clamp(1.55rem,6vw,1.9rem)] font-semibold sm:mt-4 sm:text-3xl" style={{ color: headingColor }}>{couple.bride} &amp; {couple.groom}</h3>
          {content.rsvpText && (
            <p className="mt-3 text-[13px] leading-6 sm:mt-4 sm:text-sm sm:leading-7" style={{ color: bodyColor }}>{content.rsvpText}</p>
          )}
        </div>
      </section>
    </div>
  );
}


/* ─── Mountain / Paper-cut Immersive ────────────────────── */


/* ─── Noir Editorial / High-End Modern ─────────────────── */
export function NoirTemplate({ data, isPreview = false }) {
  const rootRef = useRef(null);
  const { couple = {}, event = {}, content = {} } = data;

  useEffect(() => {
    if (!rootRef.current || typeof window === 'undefined' || data.theme?.enableAnimation === false) return undefined;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-noir-reveal]',
        { autoAlpha: 0, x: -30 },
        { autoAlpha: 1, x: 0, stagger: 0.2, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: rootRef.current, start: 'top 80%', once: true } }
      );
    }, rootRef);
    return () => ctx.revert();
  }, [data.theme.enableAnimation]);

  return (
    <div ref={rootRef} className="min-h-screen bg-black text-white px-8 py-24 flex flex-col items-center justify-center text-center font-sans tracking-tighter">
      <div data-noir-reveal className="mb-8 h-px w-32 bg-white/20" />
      <div data-noir-reveal className="text-[10px] font-black uppercase tracking-[0.8em] text-white/50 mb-12">Premier Event 2026</div>
      <h1 data-noir-reveal className="text-[clamp(4rem,15vw,10rem)] font-black leading-[0.85] uppercase mb-12">
        {couple.bride} <br />
        <span className="text-white/20 italic font-serif">&amp;</span> <br />
        {couple.groom}
      </h1>
      <div data-noir-reveal className="space-y-4">
        <p className="text-2xl font-serif italic text-white/70">{formatElegantDate(event.date)}</p>
        <p className="text-[12px] font-bold uppercase tracking-[0.4em]">{event.venue}</p>
      </div>
      <div data-noir-reveal className="mt-20 h-[300px] w-px bg-gradient-to-b from-white/40 to-transparent" />
    </div>
  );
}

/* ─── Solstice Minimal / Organic Botanical ─────────────── */
export function SolsticeTemplate({ data, isPreview = false }) {
  const rootRef = useRef(null);
  const { couple = {}, event = {} } = data;

  return (
    <div ref={rootRef} className="min-h-screen bg-[#FDFCFB] text-[#1A2B2F] p-10 flex flex-col items-center justify-center text-center font-serif text-sm">
      <div className="absolute top-10 left-10 opacity-10">
        <Leaf className="h-32 w-32 rotate-45" strokeWidth={0.5} />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10">
        <Leaf className="h-32 w-32 -rotate-12" strokeWidth={0.5} />
      </div>

      <div className="relative z-10">
        <div className="mb-6 text-[10px] font-bold uppercase tracking-[0.4em] text-[#C5A059]">You are invited</div>
        <h1 className="text-[clamp(3rem,10vw,6rem)] font-normal italic leading-tight mb-8">
          {couple.bride} <br />
          <span className="text-2xl not-italic font-sans font-light opacity-30">to be wed with</span> <br />
          {couple.groom}
        </h1>
        <div className="h-px w-20 bg-[#C5A059]/30 mx-auto mb-10" />
        <p className="text-xl font-light tracking-wide">{formatLongDate(event.date)}</p>
        <p className="mt-4 text-[11px] uppercase tracking-[0.3em] opacity-60">{event.venue}</p>
      </div>
    </div>
  );
}



