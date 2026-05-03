import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone } from 'lucide-react';
import { cn } from '../../utils/cn';
import { DesignElement } from '../preview/DesignElement';
import { CouplePortraits } from '../preview/CouplePortraits';
import { resolveMediaSource } from '../../utils/media';

/* ─── Live Countdown ──────────────────────────────────────── */
function Countdown({ date, dark }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      if (!date) return;
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date]);

  const box = dark
    ? 'bg-white/10 border border-white/10'
    : 'bg-white shadow-sm border border-slate-100';

  return (
    <div data-live-invite-card className="grid grid-cols-4 gap-2 text-center">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} data-live-invite-card className={cn('rounded-xl p-2', box)}>
          <div className={cn('text-xl font-bold tabular-nums', dark ? 'text-white' : 'text-slate-900')}>
            {String(value).padStart(2, '0')}
          </div>
          <div className={cn('text-[9px] uppercase tracking-widest mt-0.5', dark ? 'text-white/50' : 'text-slate-400')}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── SharedSections ──────────────────────────────────────── */
export function SharedSections({ data, dark = false, hideGallery = false, hideVideo = false, hideRSVP = false, hideMap = false, hideEvents = false, hideFamily = false, hideBlessings = false, hideCountdown = false }) {
<<<<<<< HEAD
  const { event, events, family, content, media, theme } = data;
  const videoEnabled = theme?.enableVideo !== false && media?.enableVideo !== false;
=======
  const { couple, event, events, family, content, media, theme } = data;
>>>>>>> 18cd4af871a25116551158a124e81f9596563ea5

  const textPrimary = dark ? 'text-white' : 'text-slate-900';
  const textMuted = dark ? 'text-white/65' : 'text-slate-500';
  const cardBg = dark ? 'bg-white/8 border-white/10' : 'bg-white/90 border-white/60';
  const innerBg = dark ? 'bg-black/25 border-white/10' : 'bg-slate-50 border-slate-100';

  /* section shape from user theme, fallback to rounded-2xl */
  const shape = theme?.sectionShape || 'rounded-2xl';

  const brideImage = resolveMediaSource(media?.brideImage) || '';
  const groomImage = resolveMediaSource(media?.groomImage) || '';
  const brideName  = couple?.bride  || '';
  const groomName  = couple?.groom  || '';

  return (
    <div className="space-y-4 p-4">

      {/* ── Couple Portraits ── */}
      {theme.showPortraits !== false && (brideImage || groomImage) && (
        <CouplePortraits
          brideImage={brideImage}
          groomImage={groomImage}
          brideName={brideName}
          groomName={groomName}
          nameColor={dark ? 'rgba(245,237,220,0.9)' : '#5C4A2A'}
        />
      )}

      {/* ── Countdown ── */}
      {theme.showCountdown !== false && theme.enableCountdown && !hideCountdown && <Countdown date={event.date} dark={dark} />}

      {/* ── Event schedule ── */}
      {theme.showSchedule !== false && (events || []).length > 0 && !hideEvents && (
        <div data-live-invite-section className={cn('border p-4', shape, cardBg)}>
          <h3 className={cn('mb-3 text-base font-bold', textPrimary)}>Event Schedule</h3>
          <div className="space-y-3">
            {events.map((evt) => (
              <div key={evt.id || evt.name} data-live-invite-card className={cn('rounded-xl border p-3', innerBg)}>
                <div className={cn('font-semibold text-sm mb-1.5', textPrimary)}>{evt.name}</div>
                <div className={cn('space-y-1 text-xs', textMuted)}>
                  {evt.date && <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3 shrink-0" />{evt.date}</div>}
                  {evt.time && <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 shrink-0" />{evt.time}</div>}
                  {evt.venue && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 shrink-0" />{evt.venue}</div>}
                  {evt.address && <div className="pl-4 opacity-75">{evt.address}</div>}
                  {evt.notes && <div className="pl-4 opacity-60 italic">{evt.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Families + Blessing ── */}
      <div className="space-y-4">
        {(family?.brideParents || family?.groomParents) && !hideFamily && (
          <div data-live-invite-section className={cn('border p-4', shape, cardBg)}>
            <h3 className={cn('mb-2 text-base font-bold', textPrimary)}>Families</h3>
            {family.brideParents && <p className={cn('text-xs', textMuted)}>Bride: {family.brideParents}</p>}
            {family.groomParents && <p className={cn('text-xs', textMuted)}>Groom: {family.groomParents}</p>}
            {content.familyMessage && (
              <DesignElement id="sharedFamilyMessage" label="Family Message" defaultColor={dark ? '#ffffff' : '#0f172a'}>
                <p className={cn('mt-2 text-xs leading-relaxed', textMuted)}>{content.familyMessage}</p>
              </DesignElement>
            )}
          </div>
        )}

        {content.quote && !hideBlessings && (
          <div data-live-invite-section className={cn('border p-4', shape, cardBg)}>
            <h3 className={cn('mb-2 text-base font-bold', textPrimary)}>Blessing</h3>
            <DesignElement id="sharedBlessing" label="Blessing Quote" defaultColor={dark ? '#ffffff' : '#0f172a'}>
              <p className={cn('text-sm italic leading-relaxed', textMuted)}>{content.quote}</p>
            </DesignElement>
          </div>
        )}
      </div>

      {/* ── Gallery ── */}
      {theme.showGallery !== false && theme.enableGallery && media?.gallery?.length > 0 && !hideGallery && (
        <div data-live-invite-section className={cn('border p-4', shape, cardBg)}>
          <h3 className={cn('mb-3 text-base font-bold', textPrimary)}>Gallery</h3>
          <div className="grid grid-cols-2 gap-2">
            {media.gallery.map((img, idx) => (
              <img
                key={idx}
                data-live-invite-media
                src={img}
                alt={`gallery-${idx}`}
                className="h-32 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Video ── */}
<<<<<<< HEAD
      {videoEnabled && media?.video && !hideVideo && (
=======
      {theme.showVideo !== false && theme.enableVideo && media?.video && !hideVideo && (
>>>>>>> 18cd4af871a25116551158a124e81f9596563ea5
        <div data-live-invite-section className={cn('border p-4', shape, cardBg)}>
          <h3 className={cn('mb-3 text-base font-bold', textPrimary)}>Video Message</h3>
          <video data-live-invite-media controls className="w-full rounded-xl">
            <source src={media.video} type="video/mp4" />
          </video>
        </div>
      )}

      {/* ── Event Location & Map ── */}
      {event.mapLink && theme.showMap !== false && !hideMap && (
        <div data-live-invite-section className={cn('border p-5', shape, cardBg)}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/5 dark:bg-white/10">
              <MapPin className={cn("h-4.5 w-4.5", textPrimary)} />
            </div>
            <div>
              <h3 className={cn('text-[15px] font-bold leading-none', textPrimary)}>Event Location</h3>
              <p className={cn('text-[10px] mt-1 opacity-60 uppercase tracking-widest', textMuted)}>Directions & Venue</p>
            </div>
          </div>
          
          <div data-live-invite-card className={cn('rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md', innerBg)}>
            <div className={cn('font-bold text-sm mb-1.5 tracking-tight', textPrimary)}>
              {event.venue || 'Wedding Venue'}
            </div>
            {event.address && (
              <div className={cn('text-xs mb-5 leading-relaxed opacity-75 font-medium', textMuted)}>
                {event.address}
              </div>
            )}
            <a 
              href={event.mapLink} 
              target="_blank" 
              rel="noreferrer"
              className={cn(
                'group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.98]',
                dark ? 'bg-white text-slate-900 shadow-xl shadow-white/5' : 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
              )}
            >
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
              <MapPin className="h-3.5 w-3.5" />
              Go to the Map
            </a>
          </div>
        </div>
      )}

      {/* ── RSVP & Contact ── */}
      {theme.showRSVP !== false && !hideRSVP && (
        <div data-live-invite-section className={cn('border p-4', shape, cardBg)}>
          <h3 className={cn('mb-1.5 text-base font-bold', textPrimary)}>RSVP & Contact</h3>
          {content.rsvpText && (
            <DesignElement id="sharedRsvpText" label="RSVP Text" defaultColor={dark ? '#ffffff' : '#0f172a'}>
              <p className={cn('mb-3 text-xs leading-relaxed', textMuted)}>{content.rsvpText}</p>
            </DesignElement>
          )}

          <div className="space-y-2">
            {content.contact1 && (
              <div data-live-invite-card className={cn('rounded-xl border p-3', innerBg)}>
                <div className={cn('text-xs font-semibold mb-0.5', textPrimary)}>Contact 1</div>
                <div className={cn('flex items-center gap-1.5 text-xs', textMuted)}>
                  <Phone className="h-3 w-3 shrink-0" />{content.contact1}
                </div>
              </div>
            )}
            {content.contact2 && (
              <div data-live-invite-card className={cn('rounded-xl border p-3', innerBg)}>
                <div className={cn('text-xs font-semibold mb-0.5', textPrimary)}>Contact 2</div>
                <div className={cn('flex items-center gap-1.5 text-xs', textMuted)}>
                  <Phone className="h-3 w-3 shrink-0" />{content.contact2}
                </div>
              </div>
            )}
          </div>

          {content.dressCode && (
            <div className={cn('mt-3 text-xs', textMuted)}>
              <span className="font-semibold">Dress Code:</span> {content.dressCode}
            </div>
          )}
          {content.specialNotes && (
            <div className={cn('mt-1.5 text-xs leading-relaxed', textMuted)}>{content.specialNotes}</div>
          )}
        </div>
      )}
    </div>
  );
}
