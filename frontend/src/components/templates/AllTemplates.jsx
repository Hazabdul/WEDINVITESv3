import React from 'react';
import { SharedSections } from './SharedSections';
import { DesignElement } from '../preview/DesignElement';

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

function resolveMediaSource(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    return item.src || item.url || item.image || item.path || item.poster || '';
  }
  return '';
}

function isVideoUrl(src = '') {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(src);
}

function unique(list) {
  return [...new Set(list.filter(Boolean))];
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

  return {
    heroVideo,
    secondaryVideo: secondaryVideo && secondaryVideo !== heroVideo ? secondaryVideo : '',
    heroImage,
    poster,
    gallery: galleryCandidates.slice(0, 6),
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
    <div className={`relative overflow-hidden ${className}`}>
      {showVideo && (
        <video
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
    <div className={`grid ${gridCols} gap-3 ${className}`}>
      {items.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className={`overflow-hidden rounded-[24px] border border-white/10 bg-white/10 shadow-[0_14px_30px_rgba(15,23,42,0.12)] ${frameClassName}`}
        >
          <img src={src} alt={`gallery ${index + 1}`} className="h-28 w-full object-cover" />
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
    <div className={`rounded-[30px] border p-4 shadow-[0_18px_40px_rgba(15,23,42,0.1)] ${cardClasses} ${className}`}>
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

          <div className="rounded-[28px] border border-white/20 bg-white/10 p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl animate-fade-in-up stagger-2">
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
        <div className="absolute left-[-80px] top-[-90px] h-56 w-56 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="absolute right-[-70px] top-20 h-52 w-52 rounded-full bg-fuchsia-200/50 blur-3xl" />

        {/* Hero media full-width */}
        <div className="relative overflow-hidden rounded-b-[34px] mx-4 mt-4 shadow-[0_24px_55px_rgba(136,19,55,0.14)]">
          {mediaPack.heroVideo ? (
            <video className="h-56 w-full object-cover" autoPlay muted loop playsInline poster={mediaPack.poster || undefined}>
              <source src={mediaPack.heroVideo} />
            </video>
          ) : mediaPack.heroImage ? (
            <img src={mediaPack.heroImage} alt="botanical hero" className="h-56 w-full object-cover" />
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
            <div className="rounded-[22px] border border-rose-200 bg-white/75 p-4 shadow-[0_18px_40px_rgba(136,19,55,0.08)] backdrop-blur-md">
              <DetailsRow label="When" value={`${formatShortDate(event.date)}${event.time ? ` · ${event.time}` : ''}`} designId="floralWhen" designLabel="Floral Date and Time" />
              <DetailsRow label="Venue" value={event.venue} className="mt-3" designId="floralVenue" designLabel="Floral Venue" />
              <DetailsRow label="Address" value={event.address} className="mt-3 text-rose-900/70" designId="floralAddress" designLabel="Floral Address" />
            </div>
          </div>

          {/* Side gallery as horizontal strip */}
          {mediaPack.gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {mediaPack.gallery.slice(1, 3).map((src, i) => (
                <div key={`fg-${i}`} className="overflow-hidden rounded-[20px] border border-white/60">
                  <img src={src} alt={`g${i}`} className="h-28 w-full object-cover" />
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

          <div className="rounded-[26px] border border-white/10 bg-white/8 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl mt-5">
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

          <div className="rounded-t-[70px] rounded-b-[28px] border border-yellow-200/15 bg-black/30 p-5 text-center shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(253,224,71,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_25%)]" />

        {/* Hero image */}
        <div className="relative overflow-hidden rounded-b-[28px] mx-4 mt-4 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          {mediaPack.heroImage ? (
            <img src={mediaPack.heroImage} alt="heritage hero" className="h-52 w-full object-cover" />
          ) : (
            <div className="h-52 w-full bg-[linear-gradient(180deg,#7f1d1d_0%,#451a03_100%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.35))]" />
          <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-amber-100/80 backdrop-blur-md">
            Heritage portrait
          </div>
        </div>

        <div className="relative px-5 py-6">
          <div className="rounded-[28px] border border-yellow-200/15 bg-black/15 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-md">
            <div className="rounded-[22px] border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,244,214,0.92))] p-4 text-stone-900">
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
                <div key={`tg-${i}`} className="overflow-hidden rounded-[20px] border border-yellow-200/10">
                  <img src={src} alt={`g${i}`} className="h-28 w-full object-cover" />
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
