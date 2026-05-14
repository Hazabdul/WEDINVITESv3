import React, { useEffect, useRef } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { resolveMediaSource } from '../../utils/media';
import { CouplePortraits } from '../preview/CouplePortraits';

/* ─── Sky Lanterns Data (Identical to Original HTML) ──────── */
const LANTERNS_DATA = [
  // Row 1 — visible on load
  { x: 5, w: 90, spd: 0.55, sw: 18, ph: 0.0, sy: 0.68 },
  // { x: 18, w: 120, spd: 0.42, sw: 28, ph: 1.2, sy: 0.82 },
  { x: 32, w: 75, spd: 0.60, sw: 14, ph: 2.3, sy: 0.72 },
  { x: 45, w: 100, spd: 0.48, sw: 22, ph: 0.7, sy: 0.78 },
  // { x: 60, w: 85, spd: 0.53, sw: 16, ph: 1.8, sy: 0.65 },
  { x: 72, w: 110, spd: 0.44, sw: 25, ph: 3.1, sy: 0.76 },
  { x: 84, w: 70, spd: 0.58, sw: 12, ph: 0.4, sy: 0.82 },
  // { x: 94, w: 95, spd: 0.51, sw: 20, ph: 2.0, sy: 0.70 },
  // Row 2 — start just below screen
  { x: 12, w: 80, spd: 0.50, sw: 16, ph: 1.5, sy: 1.08 },
  // { x: 25, w: 105, spd: 0.47, sw: 24, ph: 2.8, sy: 1.18 },
  { x: 38, w: 65, spd: 0.63, sw: 11, ph: 0.9, sy: 1.12 },
  // { x: 46, w: 105, spd: 0.46, sw: 21, ph: 2.5, sy: 1.20 },
  // { x: 58, w: 85, spd: 0.52, sw: 17, ph: 1.0, sy: 1.10 },
  { x: 70, w: 118, spd: 0.40, sw: 27, ph: 0.2, sy: 1.18 },
  { x: 82, w: 68, spd: 0.62, sw: 11, ph: 1.6, sy: 1.06 },
  // { x: 93, w: 98, spd: 0.45, sw: 19, ph: 2.2, sy: 1.14 },
  // Row 3 — deeper below
  { x: 8, w: 82, spd: 0.54, sw: 15, ph: 1.3, sy: 1.45 },
  // { x: 30, w: 108, spd: 0.43, sw: 23, ph: 0.5, sy: 1.55 },
  { x: 55, w: 90, spd: 0.49, sw: 20, ph: 1.8, sy: 1.40 },
  { x: 78, w: 76, spd: 0.57, sw: 14, ph: 2.7, sy: 1.50 },
];

export function SkyLanternsTemplate({ data, isPreview = false }) {
  const { couple = {}, content = {}, event = {}, events = [], theme = {}, media = {} } = data || {};
  const overlayRef = useRef(null);

  const videoUrl = resolveMediaSource(media?.video || media?.videoStory || media?.videoUrl || media?.storyVideo || media?.inviteVideo);
  const videoEnabled = theme?.showVideo !== false && theme?.enableVideo !== false && media?.enableVideo !== false;

  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url) => {
    try {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1].split(/[?#]/)[0];
      } else if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v');
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch {
      return url;
    }
  };

  useEffect(() => {
    const layer = overlayRef.current;
    if (!layer) return;

    // 1. Determine container for scrolling
    // In the builder we use #preview-scroll-container, on live site we use window
    const scrollEl = document.querySelector('#preview-scroll-container') || window;
    const isWindow = scrollEl === window;

    // 2. Create lantern DOM elements dynamically just like native JS
    const els = LANTERNS_DATA.map((c) => {
      const d = document.createElement('div');
      d.style.cssText = [
        'position:absolute',
        `background-image:url('/template2/lamp.avif')`,
        'background-size:contain',
        'background-repeat:no-repeat',
        'background-position:center',
        'will-change:transform,opacity',
        `width:${c.w}px`,
        `height:${Math.round(c.w * 1.4)}px`,
        `left:${c.x}%`,
        'transform: translate3d(0,0,0)', // Trigger composite layer
      ].join(';');
      layer.appendChild(d);
      return d;
    });

    function update() {
      const scrollY = isWindow ? window.scrollY : scrollEl.scrollTop;
      const wh = isWindow ? window.innerHeight : scrollEl.clientHeight;

      LANTERNS_DATA.forEach((c, i) => {
        const el = els[i];
        const baseY = wh * c.sy;
        const travel = scrollY * c.spd;
        const y = baseY - travel;

        // Exact math from sky-lanterns (1).html
        const swayX = Math.sin((scrollY * 0.003) + c.ph) * c.sw;
        const rot = Math.sin((scrollY * 0.004) + c.ph) * 4;

        let op = 1;
        // fade in from bottom
        if (y > wh * 0.88) {
          op = Math.max(0, 1 - (y - wh * 0.88) / (wh * 0.14));
        }
        // fade out above screen
        if (y < -c.w * 0.6) {
          op = Math.max(0, 1 - (-y - c.w * 0.6) / (wh * 0.18));
        }
        if (y > wh + c.w) op = 0;

        const glowR = 16 + Math.sin((scrollY * 0.005) + c.ph) * 7;

        el.style.transform = `translate3d(calc(${swayX}px - 50%), ${y}px, 0) rotate(${rot}deg)`;
        el.style.opacity = op;
        el.style.filter = `drop-shadow(0 0 ${glowR}px rgba(245,175,50,0.68)) brightness(1.07)`;
      });
    }

    scrollEl.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    // Initial render
    update();

    return () => {
      scrollEl.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      els.forEach(el => el.remove());
    };
  }, []);

  const formatDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return d; }
  };

  return (
    <div style={{
      margin: 0,
      padding: 0,
      backgroundColor: '#080610',
      backgroundImage: 'url(/template2/bg1.avif)',
      backgroundSize: '100% auto',
      backgroundRepeat: 'repeat',
      overflowX: 'hidden',
      position: 'relative',
      width: '100%'
    }}>

      {/* Fixed lantern overlay overlay */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 20,
          pointerEvents: 'none',
          overflow: 'hidden',
          // Support fixed within specific container context for standard usage if needed
        }}
      />

      {/* Background Section exactly matched */}
      <div style={{ position: 'relative', width: '100%', zIndex: 0 }}>
        <img
          src="/template2/bg.avif"
          alt=""
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />

        {/* High-fidelity Content Overlay matched to aesthetics */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: '3.5vh',
          fontFamily: '"Cormorant Garamond", serif',
          color: '#f5e6c8',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>

          <div style={{ height: '2vh' }} />

          <p style={{
            fontSize: 'clamp(0.6rem, 1.2vw, 0.8rem)',
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            fontFamily: 'Arial, sans-serif',
            color: '#f5c96a',
            marginBottom: '1.5rem',
            opacity: 0.85,
          }}>
            THE WEDDING CELEBRATION OF
          </p>

          <div style={{ width: 60, height: 1, background: 'rgba(245,201,106,0.4)', marginBottom: '1.5rem' }} />

          <h1 style={{
            fontSize: 'clamp(2.2rem, 7vw, 5rem)',
            fontWeight: 400,
            lineHeight: 1.0,
            marginBottom: '0.2em',
            color: '#fff',
            textShadow: '0 4px 32px rgba(245,175,50,0.3)',
          }}>
            {couple.bride || 'Bride'}
          </h1>

          <div style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.7rem)',
            color: 'rgba(245,201,106,0.8)',
            margin: '0.1em 0',
            fontStyle: 'italic',
            fontFamily: 'serif'
          }}>
            &amp;
          </div>

          <h1
            className="template2-name"
            style={{
              fontSize: 'clamp(2.2rem, 7vw, 5rem)',
              fontWeight: 400,
              lineHeight: 1.0,
              marginBottom: '1.5rem',
              color: '#fff',
              textShadow: '0 4px 32px rgba(245,175,50,0.3)',
            }}>
            {couple.groom || 'Groom'}
          </h1>

          <div style={{ width: 80, height: 1, background: 'rgba(245,201,106,0.3)', marginBottom: '1.5rem' }} />

          {content.introMessage && (
            <p style={{
              fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
              fontFamily: '"Montserrat", sans-serif',
              letterSpacing: '0.02em',
              color: '#ffffff',
              maxWidth: '300px',
              opacity: 0.85,
              lineHeight: 1.5,
            }}>
              {content.introMessage}
            </p>
          )}

        </div>

        {/* LOWER OVERLAY - Event Details aligned to green background section */}
        {(event.date || event.venue || event.address || (events && events.length > 0) || (videoEnabled && videoUrl) || (theme?.showGallery !== false && media?.gallery?.length > 0) || (theme.showPortraits !== false && (media.brideImage || media.groomImage))) && (
          <div style={{
            position: 'absolute',
            top: '44%',
            left: 0,
            width: '100%',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
          }}>
            {/* BRIDE & GROOM PORTRAITS */}
            {theme?.showPortraits !== false && (media?.brideImage || media?.groomImage) && (
              <div style={{
                marginBottom: '5rem',
                width: '100%',
                pointerEvents: 'auto',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 'clamp(3rem, 6vw, 5rem)'
              }}>
                {media?.brideImage && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ position: 'relative', width: '240px', height: '315px', flexShrink: 0 }}>
                      <img src="/template2/flower.avif" alt="" style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: 'auto', zIndex: 3, filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.25))' }} />
                      <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'url(/template2/frame.avif)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.35))' }} />
                      <div style={{ position: 'absolute', inset: '7%', zIndex: 2, overflow: 'hidden', borderRadius: '140px' }}>
                        <img src={resolveMediaSource(media.brideImage)} alt="Bride" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <img src="/template2/flower.avif" alt="" style={{ position: 'absolute', bottom: '-24px', left: '50%', transform: 'translateX(-50%) rotate(180deg)', width: '100px', height: 'auto', zIndex: 3, filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.25))' }} />
                    </div>
                    <h3 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: '"Cormorant Garamond", serif', color: '#f5e6c8', margin: 0, fontWeight: 500, fontStyle: 'italic', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                      {couple.bride || 'The Bride'}
                    </h3>
                  </div>
                )}

                {media?.groomImage && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ position: 'relative', width: '240px', height: '315px', flexShrink: 0 }}>
                      <img src="/template2/flower.avif" alt="" style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: 'auto', zIndex: 3, filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.25))' }} />
                      <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'url(/template2/frame.avif)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.35))' }} />
                      <div style={{ position: 'absolute', inset: '7%', zIndex: 2, overflow: 'hidden', borderRadius: '140px' }}>
                        <img src={resolveMediaSource(media.groomImage)} alt="Groom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <img src="/template2/flower.avif" alt="" style={{ position: 'absolute', bottom: '-24px', left: '50%', transform: 'translateX(-50%) rotate(180deg)', width: '100px', height: 'auto', zIndex: 3, filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.25))' }} />
                    </div>
                    <h3 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: '"Cormorant Garamond", serif', color: '#f5e6c8', margin: 0, fontWeight: 500, fontStyle: 'italic', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                      {couple.groom || 'The Groom'}
                    </h3>
                  </div>
                )}
              </div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              pointerEvents: 'auto',
              textAlign: 'center'
            }}>
              {event.date && (
                <p style={{
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                  fontFamily: '"Cormorant Garamond", serif',
                  fontWeight: 600,
                  color: '#ffffff',
                  margin: '0 0 0.2rem 0',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}>
                  {formatDate(event.date)}
                </p>
              )}

              {event.time && (
                <p style={{
                  fontSize: 'clamp(0.95rem, 1.8vw, 1.2rem)',
                  fontFamily: '"Montserrat", sans-serif',
                  color: '#f5c96a',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  margin: 0,
                  textShadow: '0 1px 6px rgba(0,0,0,0.3)',
                  textTransform: 'uppercase'
                }}>
                  {event.time}
                </p>
              )}

              <div style={{ margin: '1.5rem 0', width: 80, height: 1, background: 'rgba(255,255,255,0.3)' }} />

              {event.venue && (
                <h2 style={{
                  fontSize: 'clamp(1.3rem, 3vw, 2rem)',
                  fontFamily: 'serif',
                  fontWeight: 400,
                  fontStyle: 'italic', // Adding back the elegance 
                  color: '#ffffff',
                  margin: '0.2rem 0 0.8rem 0',
                  textShadow: '0 2px 15px rgba(0,0,0,0.3)',
                  lineHeight: 1.2,
                  letterSpacing: '0.02em'
                }}>
                  {event.venue}
                </h2>
              )}

              {event.address && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  maxWidth: '420px',
                  margin: '0 auto'
                }}>
                  <MapPin size={18} style={{
                    marginTop: '0.3rem',
                    color: '#f5c96a',
                    flexShrink: 0,
                    filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))'
                  }} />
                  <p style={{
                    fontSize: 'clamp(0.9rem, 1.6vw, 1.1rem)',
                    fontFamily: '"Montserrat", sans-serif',
                    color: '#ffffff',
                    lineHeight: 1.6,
                    fontWeight: 500,
                    margin: 0,
                    textAlign: 'left',
                    textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                    opacity: 0.95
                  }}>
                    {event.address}
                  </p>
                </div>
              )}

              {event.mapLink && (
                <a
                  href={event.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: '1.5rem',
                    display: 'inline-block',
                    padding: '0.7rem 2rem',
                    border: '1px solid rgba(245,201,106,0.6)',
                    borderRadius: '1px',
                    fontSize: '0.8rem',
                    fontFamily: 'sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3em',
                    color: '#f5c96a',
                    textDecoration: 'none',
                    background: 'rgba(0, 0, 0, 0.35)',
                    backdropFilter: 'blur(6px)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  View Map
                </a>
              )}
            </div>

            {/* DYNAMIC EVENT SCHEDULE SECTION */}
            {events && events.length > 0 && (
              <div style={{
                width: '100%',
                maxWidth: '850px',
                marginTop: '6rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '5rem',
                padding: '0 2rem',
                pointerEvents: 'none' // Pass pointer events through to inner layers
              }}>

                {events.map((ev, idx) => {
                  const isReversed = idx % 2 !== 0;

                  return (
                    <div key={ev.id || idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'clamp(2rem, 5vw, 4rem)',
                      flexDirection: isReversed ? 'row-reverse' : 'row',
                      flexWrap: 'wrap',
                      pointerEvents: 'auto',
                      width: '100%'
                    }}>

                      {/* LEFT/RIGHT SIDE - FRAMED IMAGE */}
                      <div style={{ position: 'relative', width: '280px', height: '370px', flexShrink: 0 }}>
                        {/* Top flower ornament */}
                        <img src="/template2/flower.avif" alt="" style={{
                          position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)',
                          width: '120px', height: 'auto', zIndex: 3, filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.25))'
                        }} />

                        {/* Main Decorative Frame Cover */}
                        <div style={{
                          position: 'absolute', inset: 0, zIndex: 1,
                          backgroundImage: 'url(/template2/frame.avif)',
                          backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
                          filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.35))'
                        }} />

                        {/* Actual Schedule Event Image inside frame cutout area */}
                        <div style={{
                          position: 'absolute', inset: '7%',
                          zIndex: 2, overflow: 'hidden', borderRadius: '50%'
                        }}>
                          <img
                            src={ev.image || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=400&q=80'}
                            alt={ev.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        {/* Bottom flower ornament flipped */}
                        <img src="/template2/flower.avif" alt="" style={{
                          position: 'absolute', bottom: '-28px', left: '50%', transform: 'translateX(-50%) rotate(180deg)',
                          width: '120px', height: 'auto', zIndex: 3, filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.25))'
                        }} />
                      </div>

                      {/* RIGHT/LEFT SIDE - DETAILS WRAPPER */}
                      <div style={{
                        flex: 1,
                        minWidth: '280px',
                        maxWidth: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center', // Centrally anchor the overall mass in the gap
                        pointerEvents: 'none'
                      }}>
                        {/* INNER CONTENT - Anchors all text strictly to the LEFT edge of the centered block */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start', // STRICT LEFT ALIGNMENT OF THE BLOCK
                          textAlign: 'left',
                          gap: '0.6rem',
                          width: 'fit-content',
                          pointerEvents: 'auto'
                        }}>
                          {ev.time && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              color: '#f5c96a'
                            }}>
                              <Clock size={18} style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.4))' }} />
                              <span style={{
                                fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em',
                                textShadow: '0 1px 4px rgba(0,0,0,0.4)'
                              }}>{ev.time}</span>
                            </div>
                          )}

                          <h3 style={{
                            fontSize: 'clamp(2.2rem, 4vw, 3rem)',
                            fontFamily: '"Cormorant Garamond", serif',
                            color: '#fff',
                            margin: '0.1rem 0',
                            fontWeight: 500,
                            textShadow: '0 2px 15px rgba(0,0,0,0.35)',
                            lineHeight: 1.1
                          }}>
                            {ev.name}
                          </h3>

                          {ev.venue && (
                            <p style={{
                              fontSize: '1.25rem',
                              fontFamily: '"Cormorant Garamond", serif',
                              fontStyle: 'italic',
                              fontWeight: 600,
                              color: '#ffffff',
                              margin: 0,
                              textShadow: '0 1px 8px rgba(0,0,0,0.4)'
                            }}>
                              {ev.venue}
                            </p>
                          )}

                          {ev.notes && (
                            <p style={{
                              fontSize: '0.95rem', fontFamily: '"Montserrat", sans-serif', color: 'rgba(255,255,255,0.9)',
                              lineHeight: 1.6,
                              marginTop: '1.2rem',
                              paddingLeft: '1.2rem',
                              borderLeft: '2px solid rgba(245,201,106,0.5)', // Restore clean edge decor
                              textShadow: '0 1px 4px rgba(0,0,0,0.25)',
                              maxWidth: '300px'
                            }}>
                              {ev.notes}
                            </p>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* VIDEO MESSAGE SECTION */}
            {videoEnabled && videoUrl && (
              <div style={{
                width: '100%',
                maxWidth: '850px',
                marginTop: '6rem',
                marginBottom: '4rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
                padding: '0 2rem',
                pointerEvents: 'auto'
              }}>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem'
                }}>
                  <p style={{
                    fontSize: 'clamp(0.6rem, 1.2vw, 0.8rem)',
                    letterSpacing: '0.5em',
                    textTransform: 'uppercase',
                    fontFamily: 'Arial, sans-serif',
                    color: '#f5c96a',
                    marginBottom: '0.5rem',
                    opacity: 0.85,
                  }}>
                    OUR STORY
                  </p>
                  <div style={{ width: 60, height: 1, background: 'rgba(245,201,106,0.4)', marginBottom: '0.5rem' }} />
                </div>

                <div style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '750px', // High-fidelity wide scaling
                  aspectRatio: '617/404',
                }}>
                  {/* Video Layer (Behind Frame) */}
                  <div style={{
                    position: 'absolute',
                    top: '24.5%',
                    left: '9.0%',
                    right: '9.0%',
                    bottom: '24.5%',
                    overflow: 'hidden',
                    background: '#000',
                    zIndex: 1,
                    borderRadius: '4px', // Subtle rounding to prevent corner bleed
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                  }}>
                    {isYouTubeUrl(videoUrl) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(videoUrl)}
                        title="Wedding Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ width: '100%', height: '100%', border: 0 }}
                      />
                    ) : (
                      <video
                        src={videoUrl}
                        controls
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>

                  {/* Gemini Elegant Gold Frame Overlay (On Top) */}
                  <img
                    src="/template2/simple_video_frame.png"
                    alt=""
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      zIndex: 10, // Renders on top of the video
                      pointerEvents: 'none', // Ensures video controls remain fully clickable
                      mixBlendMode: 'screen' // Flawlessly dissolves the black background, preserving the golden frame
                    }}
                  />
                </div>
              </div>
            )}

            {/* GALLERY SECTION */}
            {theme?.showGallery !== false && media?.gallery?.length > 0 && (
              <div style={{
                marginTop: '12rem',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4rem',
                padding: '0 2rem',
                pointerEvents: 'auto'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem'
                }}>
                  <h2 style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                    fontFamily: '"Cormorant Garamond", serif',
                    fontWeight: 500,
                    fontStyle: 'italic',
                    color: '#f5e6c8',
                    margin: 0,
                    textShadow: '0 4px 20px rgba(0,0,0,0.4)'
                  }}>
                    Beautiful Moments
                  </h2>
                  <p style={{
                    fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)',
                    letterSpacing: '0.4em',
                    textTransform: 'uppercase',
                    fontFamily: '"Montserrat", sans-serif',
                    color: '#d4af37',
                    marginTop: '0.5rem',
                    opacity: 0.9,
                  }}>
                    A GLIMPSE INTO OUR STORY
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '2.5rem',
                  width: '100%'
                }}>
                  {media.gallery.slice(0, 6).map((imgSrc, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '220px', height: '288px', flexShrink: 0 }}>
                      {/* Top flower ornament */}
                      <img src="/template2/flower.avif" alt="" style={{
                        position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)',
                        width: '90px', height: 'auto', zIndex: 3, filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.25))'
                      }} />

                      {/* Main Decorative Frame Cover */}
                      <div style={{
                        position: 'absolute', inset: 0, zIndex: 1,
                        backgroundImage: 'url(/template2/frame.avif)',
                        backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
                        filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.35))'
                      }} />

                      {/* Actual Event Image inside frame cutout area */}
                      <div style={{
                        position: 'absolute', inset: '7%',
                        zIndex: 2, overflow: 'hidden', borderRadius: '140px'
                      }}>
                        <img
                          src={resolveMediaSource(imgSrc)}
                          alt={`Gallery image ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Bottom flower ornament flipped */}
                      <img src="/template2/flower.avif" alt="" style={{
                        position: 'absolute', bottom: '-22px', left: '50%', transform: 'translateX(-50%) rotate(180deg)',
                        width: '90px', height: 'auto', zIndex: 3, filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.25))'
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
