import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone } from 'lucide-react';
import { cn } from '../../utils/cn';
import { DesignElement } from '../preview/DesignElement';

/* ─── Live Countdown ──────────────────────────────────────── */
function Countdown({ date, dark }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      if (!date) return;
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
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
    <div className="grid grid-cols-4 gap-2 text-center">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className={cn('rounded-xl p-2', box)}>
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
export function SharedSections({ data, dark = false }) {
  const { event, events, family, content, media, theme } = data;

  const textPrimary = dark ? 'text-white'    : 'text-slate-900';
  const textMuted   = dark ? 'text-white/65' : 'text-slate-500';
  const cardBg      = dark ? 'bg-white/8 border-white/10' : 'bg-white/90 border-white/60';
  const innerBg     = dark ? 'bg-black/25 border-white/10' : 'bg-slate-50 border-slate-100';

  /* section shape from user theme, fallback to rounded-2xl */
  const shape = theme?.sectionShape || 'rounded-2xl';

  return (
    <div className="space-y-4 p-4">

      {/* ── Countdown ── */}
      {theme.enableCountdown && <Countdown date={event.date} dark={dark} />}

      {/* ── Event schedule ── */}
      {(events || []).length > 0 && (
        <div className={cn('border p-4', shape, cardBg)}>
          <h3 className={cn('mb-3 text-base font-bold', textPrimary)}>Event Schedule</h3>
          <div className="space-y-3">
            {events.map((evt) => (
              <div key={evt.id || evt.name} className={cn('rounded-xl border p-3', innerBg)}>
                <div className={cn('font-semibold text-sm mb-1.5', textPrimary)}>{evt.name}</div>
                <div className={cn('space-y-1 text-xs', textMuted)}>
                  {evt.date    && <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3 shrink-0" />{evt.date}</div>}
                  {evt.time    && <div className="flex items-center gap-1.5"><Clock    className="h-3 w-3 shrink-0" />{evt.time}</div>}
                  {evt.venue   && <div className="flex items-center gap-1.5"><MapPin   className="h-3 w-3 shrink-0" />{evt.venue}</div>}
                  {evt.address && <div className="pl-4 opacity-75">{evt.address}</div>}
                  {evt.notes   && <div className="pl-4 opacity-60 italic">{evt.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Families + Blessing ── */}
      <div className="space-y-4">
        {(family?.brideParents || family?.groomParents) && (
          <div className={cn('border p-4', shape, cardBg)}>
            <h3 className={cn('mb-2 text-base font-bold', textPrimary)}>Families</h3>
            {family.brideParents  && <p className={cn('text-xs', textMuted)}>Bride: {family.brideParents}</p>}
            {family.groomParents  && <p className={cn('text-xs', textMuted)}>Groom: {family.groomParents}</p>}
            {content.familyMessage && (
              <DesignElement id="sharedFamilyMessage" label="Family Message" defaultColor={dark ? '#ffffff' : '#0f172a'}>
                <p className={cn('mt-2 text-xs leading-relaxed', textMuted)}>{content.familyMessage}</p>
              </DesignElement>
            )}
          </div>
        )}

        {content.quote && (
          <div className={cn('border p-4', shape, cardBg)}>
            <h3 className={cn('mb-2 text-base font-bold', textPrimary)}>Blessing</h3>
            <DesignElement id="sharedBlessing" label="Blessing Quote" defaultColor={dark ? '#ffffff' : '#0f172a'}>
              <p className={cn('text-sm italic leading-relaxed', textMuted)}>{content.quote}</p>
            </DesignElement>
          </div>
        )}
      </div>

      {/* ── Gallery ── */}
      {theme.enableGallery && media?.gallery?.length > 0 && (
        <div className={cn('border p-4', shape, cardBg)}>
          <h3 className={cn('mb-3 text-base font-bold', textPrimary)}>Gallery</h3>
          <div className="grid grid-cols-2 gap-2">
            {media.gallery.map((img, idx) => (
              <img key={idx} src={img} alt={`gallery-${idx}`}
                   className="h-32 w-full rounded-xl object-cover" />
            ))}
          </div>
        </div>
      )}

      {/* ── Video ── */}
      {theme.enableVideo && media?.video && (
        <div className={cn('border p-4', shape, cardBg)}>
          <h3 className={cn('mb-3 text-base font-bold', textPrimary)}>Video Message</h3>
          <video controls className="w-full rounded-xl">
            <source src={media.video} type="video/mp4" />
          </video>
        </div>
      )}

      {/* ── RSVP & Contact ── */}
      <div className={cn('border p-4', shape, cardBg)}>
        <h3 className={cn('mb-1.5 text-base font-bold', textPrimary)}>RSVP & Contact</h3>
        {content.rsvpText && (
          <DesignElement id="sharedRsvpText" label="RSVP Text" defaultColor={dark ? '#ffffff' : '#0f172a'}>
            <p className={cn('mb-3 text-xs leading-relaxed', textMuted)}>{content.rsvpText}</p>
          </DesignElement>
        )}

        <div className="space-y-2">
          {content.contact1 && (
            <div className={cn('rounded-xl border p-3', innerBg)}>
              <div className={cn('text-xs font-semibold mb-0.5', textPrimary)}>Contact 1</div>
              <div className={cn('flex items-center gap-1.5 text-xs', textMuted)}>
                <Phone className="h-3 w-3 shrink-0" />{content.contact1}
              </div>
            </div>
          )}
          {content.contact2 && (
            <div className={cn('rounded-xl border p-3', innerBg)}>
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
        {event.mapLink && (
          <a href={event.mapLink} target="_blank" rel="noreferrer"
             className={cn('mt-4 inline-flex rounded-xl px-4 py-2.5 text-xs font-semibold',
               dark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white')}>
            Open in Maps →
          </a>
        )}
      </div>

    </div>
  );
}
