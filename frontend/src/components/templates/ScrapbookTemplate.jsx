import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  CalendarDays,
  ChevronDown,
  Heart,
  Image as ImageIcon,
  MapPin,
  Menu,
  Sparkles,
  X,
} from 'lucide-react';
import { resolveMediaSource } from '../../utils/media';
import { DesignElement } from '../preview/DesignElement';

gsap.registerPlugin(ScrollTrigger);

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function isVideo(src = '') {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(src);
}

function buildMediaPackage(media = {}) {
  const rawImages = [
    media.heroImage,
    media.coverImage,
    media.coupleImage,
    media.detailImage,
    media.secondaryImage,
    media.locationImage,
    ...asArray(media.gallery),
    ...asArray(media.galleryImages),
    ...asArray(media.photos),
    ...asArray(media.storyGallery),
  ];

  const gallery = unique(rawImages.map(resolveMediaSource)).filter((src) => src && !isVideo(src));

  return {
    heroImage: gallery[0] || '',
    venueImage: resolveMediaSource(media.locationImage) || gallery[8] || gallery[0] || '',
    finalImage: gallery[9] || gallery[0] || '',
    gallery: gallery.slice(0, 20),
  };
}

function getCoupleNames(data = {}) {
  const couple = data.couple || {};

  return {
    bride: couple.bride || 'Aarav',
    groom: couple.groom || 'Ananya',
    title: couple.title || 'Together with their families',
  };
}

function formatEventLine(event = {}) {
  return [event.date, event.time].filter(Boolean).join(' • ') || 'Date and time to be announced';
}

function useSectionScroll(containerRef) {
  return useCallback(
    (id) => {
      const target = document.getElementById(id);
      if (!target) return;

      const scroller = containerRef?.current;

      if (scroller && scroller !== window) {
        scroller.scrollTo({
          top: target.offsetTop - 18,
          behavior: 'smooth',
        });
        return;
      }

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },
    [containerRef],
  );
}

function PlaceholderImage({ src, label = 'Replace image', variant = 'warm', className = '' }) {
  return (
    <div className={cx('placeholder-img', variant, className)}>
      {src ? (
        <img src={src} alt={label} loading="lazy" decoding="async" />
      ) : (
        <>
          <div className="placeholder-glow" />
          <ImageIcon size={30} strokeWidth={1.35} />
          <span>{label}</span>
        </>
      )}
    </div>
  );
}

function MagneticButton({ children, className = '', onClick, icon, type = 'button' }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();

  const handleMove = (event) => {
    if (reduceMotion || !ref.current) return;

    const bounds = ref.current.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;

    ref.current.style.transform = `translate(${x * 0.12}px, ${y * 0.16}px)`;
  };

  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0, 0)';
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cx('magnetic-btn', className)}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function RSVPModal({ open, onClose, data }) {
  const event = data.event || {};
  const { bride, groom } = getCoupleNames(data);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="rsvp-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="RSVP details"
        >
          <button className="rsvp-backdrop" onClick={onClose} aria-label="Close RSVP" />

          <motion.div
            className="rsvp-sheet"
            initial={{ opacity: 0, y: 48, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="rsvp-close" onClick={onClose} aria-label="Close RSVP">
              <X size={18} />
            </button>

            <span className="eyebrow">You are invited</span>

            <h3 className="font-serif">
              {bride} &amp; {groom}
            </h3>

            <p>
              <DesignElement id="rsvpModalText" label="RSVP Text">
                {data.content?.rsvpText ||
                  'We would be delighted to celebrate this day with you. Please confirm your attendance with the couple or family host.'}
              </DesignElement>
            </p>

            <div className="rsvp-details">
              <span>
                <CalendarDays size={16} />
                {formatEventLine(event)}
              </span>
              <span>
                <MapPin size={16} />
                {event.venue || 'Venue to be announced'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Navbar({ onOpenRsvp, data, containerRef }) {
  const [open, setOpen] = useState(false);
  const { bride, groom } = getCoupleNames(data);
  const goTo = useSectionScroll(containerRef);

  const navItems = useMemo(
    () => [
      { label: 'Story', target: 'story' },
      { label: 'Moments', target: 'gallery' },
      { label: 'Venue', target: 'venue' },
    ],
    [],
  );

  const handleNav = (target) => {
    setOpen(false);
    goTo(target);
  };

  return (
    <motion.header
      className="topbar"
      initial={{ y: -68, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      <button className="brand font-serif" onClick={() => handleNav('home')} aria-label="Go home">
        {bride} <span>&amp;</span> {groom}
      </button>

      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button key={item.target} onClick={() => handleNav(item.target)}>
            {item.label}
          </button>
        ))}
      </nav>

      <button className="nav-rsvp" onClick={onOpenRsvp}>
        RSVP
      </button>

      <button className="menu-btn" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            {navItems.map((item) => (
              <button key={item.target} onClick={() => handleNav(item.target)}>
                {item.label}
              </button>
            ))}

            <button
              onClick={() => {
                setOpen(false);
                onOpenRsvp();
              }}
            >
              RSVP
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function Hero({ data, containerRef, onOpenRsvp }) {
  const heroRef = useRef(null);
  const mainImageRef = useRef(null);
  const mainImageInnerRef = useRef(null);
  const leftTopRef = useRef(null);
  const leftBottomRef = useRef(null);
  const rightTopRef = useRef(null);
  const rightBottomRef = useRef(null);
  const titleRef = useRef(null);
  const copyRef = useRef(null);
  const kickerRef = useRef(null);
  const darkOverlayRef = useRef(null);
  const grainRef = useRef(null);
  const revealRef = useRef(null);

  const reduceMotion = useReducedMotion();
  const goTo = useSectionScroll(containerRef);

  const mediaPack = useMemo(() => buildMediaPackage(data.media), [data.media]);
  const { bride, groom, title } = getCoupleNames(data);
  const content = data.content || {};

  useEffect(() => {
    if (!heroRef.current || reduceMotion) return undefined;

    const scroller = containerRef?.current || window;
    const mm = gsap.matchMedia();

    mm.add(
      {
        small: '(max-width: 430px)',
        mobile: '(max-width: 760px) and (min-width: 431px)',
        tablet: '(max-width: 980px) and (min-width: 761px)',
        desktop: '(min-width: 981px)',
      },
      (context) => {
        const { small, mobile, tablet, desktop } = context.conditions;

        let finalMainWidth = '520px';
        let finalMainHeight = '740px';
        let finalRadius = 30;

        if (desktop) {
          finalMainWidth = '520px';
          finalMainHeight = '740px';
          finalRadius = 30;
        } else if (tablet) {
          finalMainWidth = '420px';
          finalMainHeight = '580px';
          finalRadius = 28;
        } else if (mobile) {
          finalMainWidth = '68vw';
          finalMainHeight = '480px';
          finalRadius = 26;
        } else if (small) {
          finalMainWidth = '72vw';
          finalMainHeight = '420px';
          finalRadius = 24;
        }

        const sideImages = [
          leftTopRef.current,
          leftBottomRef.current,
          rightTopRef.current,
          rightBottomRef.current,
        ].filter(Boolean);

        gsap.set(mainImageRef.current, {
          position: 'absolute',
          left: 0,
          top: 0,
          xPercent: 0,
          yPercent: 0,
          width: '100%',
          height: '100svh',
          borderRadius: 0,
          scale: 1,
          rotate: 0,
          transformOrigin: 'center center',
        });

        gsap.set(mainImageInnerRef.current, {
          scale: 1.08,
          yPercent: 0,
          transformOrigin: 'center center',
        });

        gsap.set(darkOverlayRef.current, {
          opacity: 0.28,
        });

        gsap.set(grainRef.current, {
          opacity: 0.32,
        });

        gsap.set(revealRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
        });

        gsap.set(sideImages, {
          opacity: 0,
          scale: 0.78,
          pointerEvents: 'none',
          filter: 'blur(6px)',
          transformOrigin: 'center center',
        });

        gsap.set(leftTopRef.current, {
          x: desktop ? -180 : -120,
          y: 40,
          rotate: -8,
        });

        gsap.set(leftBottomRef.current, {
          x: desktop ? -160 : -110,
          y: 70,
          rotate: 7,
        });

        gsap.set(rightTopRef.current, {
          x: desktop ? 180 : 120,
          y: 40,
          rotate: 8,
        });

        gsap.set(rightBottomRef.current, {
          x: desktop ? 160 : 110,
          y: 70,
          rotate: -7,
        });

        gsap.set(kickerRef.current, {
          opacity: 0,
          y: -14,
        });

        gsap.set(titleRef.current, {
          opacity: 0,
          x: desktop ? 110 : 0,
          y: 35,
          scale: 0.94,
        });

        gsap.set(copyRef.current, {
          opacity: 0,
          y: 34,
        });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            scroller,
            start: 'top top',
            end: '+=2400',
            scrub: 1.15,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(
            mainImageRef.current,
            {
              left: '50%',
              top: '52%',
              xPercent: -50,
              yPercent: -50,
              width: finalMainWidth,
              height: finalMainHeight,
              borderRadius: finalRadius,
              ease: 'power3.inOut',
              duration: 1.6,
            },
            0,
          )
          .fromTo(
            mainImageRef.current,
            { scale: 1.2 },
            { scale: 1, ease: 'power2.out', duration: 1.6 },
            0,
          )
          .to(
            mainImageInnerRef.current,
            {
              scale: 1,
              yPercent: -1,
              ease: 'none',
              duration: 1.2,
            },
            0,
          )
          .to(
            revealRef.current,
            {
              opacity: 0,
              y: -24,
              scale: 0.96,
              ease: 'power2.out',
              duration: 0.45,
            },
            0.05,
          )
          .to(
            darkOverlayRef.current,
            {
              opacity: 0.12,
              ease: 'none',
              duration: 0.8,
            },
            0,
          )
          .to(
            grainRef.current,
            {
              opacity: 0.18,
              ease: 'none',
              duration: 0.8,
            },
            0,
          )
          .to(
            kickerRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              ease: 'power2.out',
            },
            0.25,
          )
          .to(
            leftTopRef.current,
            {
              opacity: 1,
              x: 0,
              y: 0,
              rotate: -4,
              scale: 1,
              filter: 'blur(0px)',
              ease: 'power3.out',
              duration: 0.9,
            },
            0.82,
          )
          .to(
            leftBottomRef.current,
            {
              opacity: 1,
              x: 0,
              y: 0,
              rotate: 3,
              scale: 1,
              filter: 'blur(0px)',
              ease: 'power3.out',
              duration: 0.9,
            },
            0.98,
          )
          .to(
            rightTopRef.current,
            {
              opacity: 1,
              x: 0,
              y: 0,
              rotate: 4,
              scale: 1,
              filter: 'blur(0px)',
              ease: 'power3.out',
              duration: 0.9,
            },
            1.02,
          )
          .to(
            rightBottomRef.current,
            {
              opacity: 1,
              x: 0,
              y: 0,
              rotate: -3,
              scale: 1,
              filter: 'blur(0px)',
              ease: 'power3.out',
              duration: 0.9,
            },
            1.18,
          )
          .to(
            titleRef.current,
            {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              ease: 'power3.out',
              duration: 0.8,
            },
            1.55,
          )
          .to(
            copyRef.current,
            {
              opacity: 1,
              y: 0,
              ease: 'power3.out',
              duration: 0.7,
            },
            1.72,
          );

        gsap.to(sideImages, {
          y: (index) => (index % 2 === 0 ? -12 : 12),
          rotate: (index) => [-5, 4, 5, -4][index],
          ease: 'sine.inOut',
          duration: 3,
          repeat: -1,
          yoyo: true,
          stagger: 0.18,
        });

        return () => {
          timeline.kill();
        };
      },
      heroRef,
    );

    return () => {
      mm.revert();
      ScrollTrigger.refresh();
    };
  }, [containerRef, reduceMotion]);

  if (reduceMotion) {
    return (
      <section id="home" className="hero-static section-shell">
        <div className="hero-static-card">
          <PlaceholderImage src={mediaPack.heroImage} label="Wedding couple" className="hero-static-img" />

          <span className="eyebrow">{title}</span>

          <h1 className="font-serif">
            {bride} <em>&amp;</em> {groom}
          </h1>

          <p>{content.welcomeHeading || 'Join us for a weekend of love, laughter, celebration, and memories.'}</p>


        </div>
      </section>
    );
  }

  return (
    <section ref={heroRef} id="home" className="wedding-gsap-hero">
      <div ref={mainImageRef} className="collage-main-photo">
        <div ref={mainImageInnerRef} className="main-photo-inner">
          <PlaceholderImage src={mediaPack.heroImage} label="Wedding couple" className="w-full h-full" />
        </div>

        <div ref={darkOverlayRef} className="collage-main-overlay" />
        <div ref={grainRef} className="hero-grain" />

        <div ref={revealRef} className="hero-reveal-copy">
          <span className="eyebrow">Wedding invitation</span>
          <h2 className="font-serif">
            {bride} <span>&amp;</span> {groom}
          </h2>
          <p className="font-sans"></p>
        </div>
      </div>

      <div className="wedding-hero-inner">
        <p ref={kickerRef} className="hero-kicker font-sans">
          <DesignElement id="heroSubtitle" label="Subtitle">
            {title}
          </DesignElement>
        </p>

        <div className="wedding-collage-stage">
          <div ref={leftTopRef} className="collage-photo left-photo-top">
            <PlaceholderImage src={mediaPack.gallery[1]} label="Memory 01" variant="cream" />
          </div>

          <div ref={leftBottomRef} className="collage-photo left-photo-bottom">
            <PlaceholderImage src={mediaPack.gallery[2]} label="Memory 02" variant="rose" />
          </div>

          <div ref={rightTopRef} className="collage-photo right-photo-top">
            <PlaceholderImage src={mediaPack.gallery[3]} label="Memory 03" variant="gold" />
          </div>

          <div ref={rightBottomRef} className="collage-photo right-photo-bottom">
            <PlaceholderImage src={mediaPack.gallery[4]} label="Memory 04" variant="green" />
          </div>

          <div ref={titleRef} className="collage-name">
            <h1 className="font-serif">
              <DesignElement id="brideName" label="Bride">
                {bride}
              </DesignElement>
              <span>&amp;</span>
              <DesignElement id="groomName" label="Groom">
                {groom}
              </DesignElement>
            </h1>
          </div>
        </div>

        <div ref={copyRef} className="hero-bottom-copy">
          <p className="font-sans">
            <DesignElement id="welcomeHeading" label="Welcome Heading">
              {content.welcomeHeading || 'Join us for a weekend of love, laughter, celebration, and memories.'}
            </DesignElement>
          </p>


        </div>
      </div>


    </section>
  );
}

function IntroGallery({ data }) {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const mediaPack = useMemo(() => buildMediaPackage(data.media), [data.media]);
  const content = data.content || {};

  const cards = [
    { rotate: -8, y: 34, src: mediaPack.gallery[5], label: 'Memory 01', variant: 'cream' },
    { rotate: 4, y: -8, src: mediaPack.gallery[6], label: 'Memory 02', variant: 'rose' },
    { rotate: 10, y: 42, src: mediaPack.gallery[7], label: 'Memory 03', variant: 'gold' },
  ];

  useEffect(() => {
    if (!sectionRef.current) return undefined;

    const ctx = gsap.context(() => {
      const cardEls = cardsRef.current.filter(Boolean);

      gsap.set(cardEls, {
        transformOrigin: 'center center',
        willChange: 'transform',
      });

      gsap.from('.intro-gsap-copy', {
        opacity: 0,
        y: 50,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      });

      gsap.from(cardEls, {
        opacity: 0,
        y: 120,
        scale: 0.86,
        rotate: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      });

      gsap.to(cardEls[0], {
        rotate: -20,
        y: -42,
        x: -26,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      gsap.to(cardEls[1], {
        rotate: 18,
        y: 34,
        scale: 1.04,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      gsap.to(cardEls[2], {
        rotate: -16,
        y: -32,
        x: 28,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="intro-gallery section-shell">
      <div className="gallery-copy intro-gsap-copy">
        <span className="eyebrow">
          <DesignElement id="introSubtitle" label="Intro Subtitle">
            {content.subtitle || 'A Glowing Invitation'}
          </DesignElement>
        </span>

        <h2 className="font-serif">
          <DesignElement id="introMessage" label="Intro Message">
            {content.introMessage || 'Made to feel like a little love story, not just a card.'}
          </DesignElement>
        </h2>
      </div>

      <div className="stacked-cards">
        {cards.map((card, index) => (
          <motion.div
            ref={(el) => {
              cardsRef.current[index] = el;
            }}
            className="photo-card intro-gsap-card cursor-grab active:cursor-grabbing"
            key={card.label}
            style={{
              transform: `translateY(${card.y}px) rotate(${card.rotate}deg)`,
            }}
            drag
            dragConstraints={sectionRef}
            dragElastic={0.6}
            whileHover={{ 
              scale: 1.2, 
              rotate: 0, 
              zIndex: 50,
              transition: { type: 'spring', stiffness: 400, damping: 25 }
            }}
            whileTap={{ 
              scale: 0.94,
              rotate: index % 2 === 0 ? -2 : 2,
            }}
            dragTransition={{ bounceStiffness: 400, bounceDamping: 25 }}
          >
            <PlaceholderImage src={card.src} label={card.label} variant={card.variant} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Story({ data }) {
  const sectionRef = useRef(null);
  const content = data.content || {};
  const mediaPack = useMemo(() => buildMediaPackage(data.media), [data.media]);

  useEffect(() => {
    if (!sectionRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.from('.story-gsap-title', {
        opacity: 0,
        y: 80,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
        },
      });

      gsap.from('.story-gsap-text', {
        opacity: 0,
        x: -64,
        duration: 0.95,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 58%',
        },
      });

      gsap.from('.story-gsap-media', {
        opacity: 0,
        x: 64,
        rotate: 5,
        scale: 0.94,
        duration: 1.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 58%',
        },
      });

      gsap.to('.story-gsap-media img', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="story" className="story section-shell">
      <div className="story-gsap-title">
        <span className="eyebrow">The beginning</span>
        <h2 className="font-serif">our story</h2>
      </div>

      <div className="story-grid">
        <div className="story-text story-gsap-text font-sans">
          <p>
            <DesignElement id="storySnippet" label="Story Paragraph">
              {content.storySnippet ||
                'It began with a simple hello, grew through shared laughter, and became a promise to keep choosing each other every day.'}
            </DesignElement>
          </p>

          <p>
            <DesignElement id="invitationText" label="Invitation Text">
              {content.invitationText ||
                'We are delighted to invite you to the day where our next chapter begins, surrounded by family, friends, music, and warm evening light.'}
            </DesignElement>
          </p>
        </div>

        <div className="story-media story-gsap-media">
          <PlaceholderImage src={mediaPack.heroImage} label="Story photo" variant="rose" />
        </div>
      </div>
    </section>
  );
}

function HorizontalGallery({ data }) {
  const ref = useRef(null);
  const mediaPack = useMemo(() => buildMediaPackage(data.media), [data.media]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['8%', '-46%']);

  const galleryItems = [
    { title: 'The Beginning', caption: 'Where it all started', src: mediaPack.gallery[0], variant: 'cream' },
    { title: 'Adventures', caption: 'Exploring the world together', src: mediaPack.gallery[1], variant: 'rose' },
    { title: 'The Proposal', caption: 'A beautiful yes', src: mediaPack.gallery[2], variant: 'gold' },
    { title: 'Forever', caption: 'To infinity and beyond', src: mediaPack.gallery[3], variant: 'green' },
    { title: 'Celebration', caption: 'The night becomes a memory', src: mediaPack.gallery[4], variant: 'cream' },
  ];

  useEffect(() => {
    if (!ref.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.from('.gallery-gsap-heading', {
        opacity: 0,
        y: 60,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 72%',
        },
      });

      gsap.from('.memory-card', {
        opacity: 0,
        y: 80,
        scale: 0.94,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 58%',
        },
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="gallery" className="horizontal-gallery section-shell">
      <div className="section-heading-row gallery-gsap-heading">
        <div>
          <span className="eyebrow">Memory wall</span>
          <h2 className="font-serif">moments</h2>
        </div>
        <p className="font-sans">Swipe or scroll through a soft cinematic gallery made for beautiful memories.</p>
      </div>

      <motion.div className="gallery-track" style={{ x }}>
        {galleryItems.map((item, index) => (
          <motion.article
            className="memory-card"
            key={`${item.title}-${index}`}
            whileHover={{ scale: 1.15, y: -15, rotate: 0, zIndex: 10 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
          >
            <div className="memory-image">
              <PlaceholderImage src={item.src} label={`Gallery ${index + 1}`} variant={item.variant} />
            </div>
            <div className="memory-copy">
              <h3 className="font-serif">{item.title}</h3>
              <p className="font-sans">{item.caption}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

function CountdownSection({ data }) {
  const sectionRef = useRef(null);
  const event = data.event || {};
  const rawDate = event.date || 'June 18, 2027';

  const targetDate = useMemo(() => {
    const parsed = Date.parse(rawDate);
    return Number.isNaN(parsed) ? Date.parse('June 18, 2027') : parsed;
  }, [rawDate]);

  const [timeLeft, setTimeLeft] = useState({
    days: '000',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const update = () => {
      const distance = Math.max(0, targetDate - Date.now());

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setTimeLeft({
        days: String(days).padStart(3, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    };

    update();
    const timer = window.setInterval(update, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  useEffect(() => {
    if (!sectionRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.from('.countdown-eyebrow', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
        },
      });

      gsap.from('.countdown-date', {
        opacity: 0,
        y: 90,
        scale: 0.92,
        filter: 'blur(10px)',
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 68%',
        },
      });

      gsap.from('.countdown-box', {
        opacity: 0,
        y: 70,
        scale: 0.92,
        duration: 0.9,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 58%',
        },
      });

      gsap.to('.countdown-date', {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="countdown-section section-shell">
      <div className="countdown-inner">
        <span className="eyebrow countdown-eyebrow">We hope you join us</span>

        <h2 className="font-serif countdown-date">
          <DesignElement id="countdownDate" label="Countdown Date">
            {rawDate}
          </DesignElement>
        </h2>

        <div className="countdown-grid font-sans">
          <div className="countdown-box">
            <strong>{timeLeft.days}</strong>
            <span>Days</span>
          </div>

          <div className="countdown-box">
            <strong>{timeLeft.hours}</strong>
            <span>Hours</span>
          </div>

          <div className="countdown-box">
            <strong>{timeLeft.minutes}</strong>
            <span>Minutes</span>
          </div>

          <div className="countdown-box">
            <strong>{timeLeft.seconds}</strong>
            <span>Seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Venue({ data, onOpenRsvp }) {
  const sectionRef = useRef(null);
  const mediaPack = useMemo(() => buildMediaPackage(data.media), [data.media]);
  const event = data.event || {};
  const content = data.content || {};

  useEffect(() => {
    if (!sectionRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.from('.venue-image-wrap', {
        opacity: 0,
        y: 80,
        scale: 0.96,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 68%',
        },
      });

      gsap.from('.venue-card', {
        opacity: 0,
        y: 100,
        scale: 0.94,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 56%',
        },
      });

      gsap.to('.venue-image-wrap img', {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="venue" className="venue section-shell">
      <div className="venue-image-wrap">
        <PlaceholderImage src={mediaPack.venueImage} label="Venue header image" variant="green" />
      </div>

      <div className="venue-card">
        <div className="venue-icon">
          <MapPin size={32} />
        </div>

        <span className="eyebrow">The celebration</span>

        <h2 className="font-serif">
          <DesignElement id="eventVenue" label="Venue">
            {event.venue || 'Taj Exotica Resort & Spa, Goa'}
          </DesignElement>
        </h2>

        <p className="font-sans">
          <DesignElement id="specialNotes" label="Special Notes">
            {content.specialNotes || 'Sunset ceremony followed by dinner, dancing, and a celebration by the sea.'}
          </DesignElement>
        </p>

        <div className="venue-meta font-sans">
          <span>
            <CalendarDays size={16} />
            <DesignElement id="eventDate" label="Date">
              {event.date || 'Date TBA'}
            </DesignElement>
            {event.time ? (
              <>
                {' '}
                •{' '}
                <DesignElement id="eventTime" label="Time">
                  {event.time}
                </DesignElement>
              </>
            ) : null}
          </span>

          <span>
            <MapPin size={16} />
            <DesignElement id="eventAddress" label="Address">
              {event.address || 'Beach Lawn'}
            </DesignElement>
          </span>
        </div>

        <MagneticButton icon={<Heart size={16} />} onClick={onOpenRsvp}>
          Confirm RSVP
        </MagneticButton>
      </div>
    </section>
  );
}





function FinalCinematicSection({ data, onOpenRsvp }) {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const mediaPack = useMemo(() => buildMediaPackage(data.media), [data.media]);
  const { bride, groom } = getCoupleNames(data);

  useEffect(() => {
    if (!sectionRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.from('.final-copy', {
        opacity: 0,
        y: 80,
        scale: 0.94,
        filter: 'blur(10px)',
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
        },
      });

      gsap.from(imageRef.current, {
        scale: 1.18,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });

      gsap.to(imageRef.current, {
        scale: 1.06,
        yPercent: -5,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const videoSrc = mediaPack.finalVideo;
  const showVideo = videoSrc && isVideo(videoSrc);

  return (
    <section ref={sectionRef} className="final-cinematic">
      <div ref={imageRef} className="final-image">
        {showVideo ? (
          <video
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.7)' }}
          />
        ) : (
          <PlaceholderImage src={mediaPack.finalImage || mediaPack.heroImage} label="Final wedding photo" variant="rose" />
        )}
      </div>

      <div className="final-overlay" />

      <div className="final-copy">
        <span className="eyebrow">Save our date</span>

        <h2 className="font-serif">you are my favorite person, today, tomorrow, and always</h2>

        <p className="font-sans">
          {bride} &amp; {groom}
        </p>

        <MagneticButton className="light" icon={<Heart size={16} />} onClick={onOpenRsvp}>
          RSVP
        </MagneticButton>
      </div>
    </section>
  );
}

export function ScrapbookTemplate({ data = {}, isPreview = false }) {
  const containerRef = useRef(null);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const { bride, groom } = getCoupleNames(data);

  const openRsvp = useCallback(() => setRsvpOpen(true), []);
  const closeRsvp = useCallback(() => setRsvpOpen(false), []);

  useEffect(() => {
    const scrollContainer = document.querySelector('#preview-scroll-container');
    if (scrollContainer) {
      containerRef.current = scrollContainer;
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className="scrapbook-template w-full relative bg-[#f6f0e8] text-[#241915] overflow-x-hidden font-sans selection:bg-[#b98a53] selection:text-white"
      style={{
        '--bg': '#f6f0e8',
        '--paper': '#fffaf2',
        '--ink': '#241915',
        '--muted': '#806d61',
        '--line': 'rgba(57, 41, 32, 0.14)',
        '--brown': '#6f4a2f',
        '--brown-dark': '#2b1b14',
        '--gold': '#b98a53',
        '--gold-soft': 'rgba(185, 138, 83, 0.14)',
        '--shadow': '0 28px 80px rgba(53, 35, 26, 0.16)',
        '--serif': '"Cormorant Garamond", Georgia, serif',
        '--sans': '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');

        .template-renderer-root .scrapbook-template {
          color: var(--ink) !important;
          font-family: var(--sans) !important;
        }

        .template-renderer-root .scrapbook-template h1,
        .template-renderer-root .scrapbook-template h2,
        .template-renderer-root .scrapbook-template h3,
        .template-renderer-root .scrapbook-template .font-serif {
          color: inherit !important;
          font-family: var(--serif) !important;
        }

        .template-renderer-root .scrapbook-template .font-sans {
          font-family: var(--sans) !important;
        }

        .scrapbook-template {
          min-height: 100svh;
          background:
            radial-gradient(circle at top left, rgba(190, 142, 91, 0.2), transparent 38rem),
            radial-gradient(circle at 88% 28%, rgba(111, 74, 47, 0.08), transparent 28rem),
            linear-gradient(180deg, #fbf6ee 0%, var(--bg) 45%, #efe2d3 100%);
        }

        .scrapbook-template,
        .scrapbook-template * {
          box-sizing: border-box;
        }

        .scrapbook-template button {
          font-family: inherit;
          cursor: pointer;
        }

        .scrapbook-template .section-shell {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
        }

        .scrapbook-template .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--gold) !important;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          font-size: 11px;
          font-weight: 800;
        }

        .scrapbook-template .topbar {
          position: fixed;
          z-index: 80;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          width: min(780px, calc(100% - 30px));
          min-height: 48px;
          padding: 6px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 10px;
          background: rgba(255, 250, 242, 0.72);
          -webkit-backdrop-filter: blur(20px);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(93, 69, 52, 0.12);
          border-radius: 999px;
          box-shadow: 0 18px 40px rgba(40, 28, 19, 0.12);
        }

        .scrapbook-template .brand {
          height: 36px;
          border: 0;
          background: #fff8ed;
          color: var(--brown-dark);
          border-radius: 999px;
          padding: 0 16px;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        .scrapbook-template .brand span {
          color: var(--gold);
        }

        .scrapbook-template .desktop-nav {
          display: flex;
          justify-content: center;
          gap: 4px;
        }

        .scrapbook-template .desktop-nav button,
        .scrapbook-template .nav-rsvp,
        .scrapbook-template .mobile-menu button,
        .scrapbook-template .menu-btn,
        .scrapbook-template .rsvp-close {
          border: 0;
          border-radius: 999px;
          transition:
            transform 0.22s ease,
            background 0.22s ease,
            box-shadow 0.22s ease,
            color 0.22s ease;
        }

        .scrapbook-template .desktop-nav button {
          color: var(--muted);
          background: transparent;
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 700;
        }

        .scrapbook-template .desktop-nav button:hover {
          color: var(--ink);
          background: rgba(111, 74, 47, 0.08);
        }

        .scrapbook-template .nav-rsvp {
          background: var(--brown-dark);
          color: #fff8ed;
          height: 36px;
          padding: 0 18px;
          font-size: 13px;
          font-weight: 800;
        }

        .scrapbook-template .menu-btn {
          display: none;
          width: 36px;
          height: 36px;
          background: #fff8ed;
          align-items: center;
          justify-content: center;
          color: var(--ink);
        }

        .scrapbook-template .mobile-menu {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          right: 0;
          padding: 10px;
          display: grid;
          gap: 6px;
          background: rgba(255, 250, 242, 0.94);
          border: 1px solid rgba(93, 69, 52, 0.12);
          border-radius: 24px;
          box-shadow: 0 22px 50px rgba(40, 28, 19, 0.15);
        }

        .scrapbook-template .mobile-menu button {
          min-height: 42px;
          background: rgba(111, 74, 47, 0.07);
          color: var(--ink);
          font-weight: 800;
        }

        .scrapbook-template .mobile-menu button:last-child {
          background: var(--brown-dark);
          color: #fff8ed;
        }

        .scrapbook-template .magnetic-btn {
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          border-radius: 999px;
          padding: 0 22px;
          background: var(--brown-dark);
          color: #fff8ed;
          font-size: 13px;
          font-weight: 800;
          transition:
            transform 0.18s ease,
            box-shadow 0.24s ease,
            background 0.24s ease;
          will-change: transform;
        }

        .scrapbook-template .magnetic-btn.light {
          background: rgba(255, 250, 242, 0.76);
          color: var(--brown-dark);
          border: 1px solid var(--line);
        }

        .scrapbook-template .placeholder-img {
          position: relative;
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
          min-height: inherit;
          border-radius: inherit;
          overflow: hidden;
          color: rgba(255, 248, 237, 0.88);
          background: linear-gradient(135deg, #d2aa75, #755033 48%, #2c1c15);
        }

        .scrapbook-template .placeholder-img img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.01);
        }

        .scrapbook-template .placeholder-img.cream {
          background: linear-gradient(135deg, #f7e8d6, #c79d70, #7d563b);
        }

        .scrapbook-template .placeholder-img.rose {
          background: linear-gradient(135deg, #f2dedb, #c98f83, #5b3a31);
        }

        .scrapbook-template .placeholder-img.gold {
          background: linear-gradient(135deg, #ebc070, #7e4d26 52%, #1b1412);
        }

        .scrapbook-template .placeholder-img.green {
          background: linear-gradient(135deg, #e5dac5, #769266, #3c4f33);
        }

        .scrapbook-template .placeholder-img svg,
        .scrapbook-template .placeholder-img span,
        .scrapbook-template .placeholder-glow {
          position: relative;
          z-index: 2;
        }

        .scrapbook-template .placeholder-img span {
          display: block;
          margin-top: 46px;
          position: absolute;
          font-size: 12px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .scrapbook-template .placeholder-glow {
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          filter: blur(10px);
        }

        .scrapbook-template .wedding-gsap-hero {
          position: relative;
          height: 100svh;
          min-height: 760px;
          overflow: hidden;
          padding: 18px 24px 56px;
          background:
            radial-gradient(circle at 16% 12%, rgba(185, 138, 83, 0.18), transparent 28rem),
            radial-gradient(circle at 84% 78%, rgba(111, 74, 47, 0.12), transparent 30rem),
            linear-gradient(180deg, #fbf6ee 0%, #f6f0e8 48%, #efe2d3 100%);
          margin-bottom: 60px;
        }

        .scrapbook-template .wedding-gsap-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          background-image:
            linear-gradient(rgba(43, 27, 20, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(43, 27, 20, 0.035) 1px, transparent 1px);
          background-size: 46px 46px;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
          pointer-events: none;
        }

        .scrapbook-template .collage-main-photo {
          position: absolute;
          z-index: 4;
          overflow: hidden;
          background: #332018;
          box-shadow:
            0 42px 120px rgba(43, 27, 20, 0.22),
            0 14px 40px rgba(43, 27, 20, 0.14);
          will-change: left, top, width, height, border-radius, transform;
        }

        .scrapbook-template .main-photo-inner {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          will-change: transform;
        }

        .scrapbook-template .collage-main-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(30, 18, 11, 0.08), rgba(30, 18, 11, 0.28)),
            radial-gradient(circle at 50% 42%, transparent 0%, rgba(20, 12, 8, 0.36) 100%);
          pointer-events: none;
        }

        .scrapbook-template .hero-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0 1px, transparent 1px),
            radial-gradient(circle at 80% 70%, rgba(0,0,0,0.08) 0 1px, transparent 1px);
          background-size: 18px 18px, 22px 22px;
          mix-blend-mode: soft-light;
        }

        .scrapbook-template .hero-reveal-copy {
          position: absolute;
          inset: 0;
          z-index: 6;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 12px;
          text-align: center;
          padding: 24px;
          color: #fff8ed;
          pointer-events: none;
          text-shadow: 0 16px 50px rgba(0, 0, 0, 0.35);
        }

        .scrapbook-template .hero-reveal-copy .eyebrow {
          color: #f4d4a7 !important;
        }

        .scrapbook-template .hero-reveal-copy h2 {
          margin: 0;
          font-size: clamp(56px, 10vw, 126px);
          line-height: 0.86;
          font-weight: 500;
          letter-spacing: -0.07em;
          color: #fff8ed !important;
        }

        .scrapbook-template .hero-reveal-copy h2 span {
          display: block;
          color: #f9e2bd;
          font-size: 0.36em;
          font-style: italic;
          letter-spacing: 0;
        }

        .scrapbook-template .hero-reveal-copy p {
          margin: 0;
          color: rgba(255, 248, 237, 0.86);
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.18em;
        }

        .scrapbook-template .wedding-hero-inner {
          position: relative;
          z-index: 10;
          width: min(1300px, 100%);
          height: calc(100svh - 90px);
          min-height: 800px;
          margin: 0 auto;
          display: grid;
          grid-template-rows: auto 1fr auto;
          justify-items: center;
          pointer-events: none;
        }

        .scrapbook-template .hero-kicker {
          position: relative;
          z-index: 20;
          margin: clamp(56px, 7vh, 76px) 0 18px;
          color: var(--gold) !important;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          font-size: 11px;
          font-weight: 800;
          text-align: center;
        }

        .scrapbook-template .wedding-collage-stage {
          position: relative;
          width: min(1200px, 94vw);
          height: 800px;
          min-height: 800px;
          pointer-events: none;
        }

        .scrapbook-template .collage-photo {
          position: absolute;
          z-index: 8;
          overflow: hidden;
          border-radius: 18px;
          background: #fffaf2;
          box-shadow:
            0 24px 65px rgba(54, 39, 28, 0.14),
            0 8px 22px rgba(54, 39, 28, 0.1);
          will-change: transform, opacity, filter;
        }

        .scrapbook-template .left-photo-top {
          width: 320px;
          height: 240px;
          left: 10px;
          top: 40px;
        }

        .scrapbook-template .left-photo-bottom {
          width: 340px;
          height: 210px;
          left: 60px;
          top: 340px;
        }

        .scrapbook-template .right-photo-top {
          width: 310px;
          height: 210px;
          right: 10px;
          top: 180px;
        }

        .scrapbook-template .right-photo-bottom {
          width: 340px;
          height: 320px;
          right: 40px;
          top: 440px;
        }

        .scrapbook-template .collage-name {
          position: absolute;
          z-index: 12;
          right: 58px;
          top: 460px;
          width: 460px;
          pointer-events: none;
          will-change: transform, opacity;
        }

        .scrapbook-template .collage-name h1 {
          margin: 0;
          color: #fff8ed !important;
          font-size: clamp(72px, 7vw, 128px);
          font-weight: 500;
          line-height: 0.82;
          letter-spacing: -0.08em;
          text-shadow:
            0 24px 68px rgba(0, 0, 0, 0.36),
            0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .scrapbook-template .collage-name h1 span {
          display: block;
          margin: 9px 0;
          color: #f9e2bd !important;
          font-size: 0.34em;
          line-height: 1;
          letter-spacing: 0;
          font-style: italic;
        }

        .scrapbook-template .hero-bottom-copy {
          position: relative;
          z-index: 20;
          margin-top: 8px;
          text-align: center;
          max-width: 660px;
          pointer-events: auto;
          will-change: transform, opacity;
        }

        .scrapbook-template .hero-bottom-copy p {
          margin: 0 auto;
          color: var(--muted);
          font-size: clamp(15px, 1.8vw, 19px);
          line-height: 1.7;
        }

        .scrapbook-template .hero-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .scrapbook-template .scroll-cue {
          position: absolute;
          z-index: 20;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.38);
          border-radius: 50%;
          background: rgba(255, 250, 242, 0.6);
          color: var(--brown-dark);
          animation: scrapbook-bounce 1.8s ease-in-out infinite;
        }

        @keyframes scrapbook-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(7px); }
        }

        .scrapbook-template .hero-static {
          min-height: 100svh;
          display: grid;
          place-items: center;
          padding: 110px 0 70px;
        }

        .scrapbook-template .hero-static-card {
          width: min(780px, 100%);
          text-align: center;
          background: rgba(255, 250, 242, 0.82);
          border: 1px solid rgba(255, 255, 255, 0.58);
          border-radius: 36px;
          box-shadow: var(--shadow);
          padding: 18px 18px 42px;
        }

        .scrapbook-template .hero-static-img {
          height: min(62vh, 560px);
          border-radius: 28px;
          margin-bottom: 30px;
        }

        .scrapbook-template .hero-static h1 {
          margin: 14px auto 10px;
          font-size: clamp(58px, 11vw, 110px);
          line-height: 0.88;
          font-weight: 500;
          letter-spacing: -0.07em;
        }

        .scrapbook-template .hero-static h1 em {
          color: var(--gold);
          font-size: 0.42em;
          font-style: italic;
        }

        .scrapbook-template .hero-static p {
          max-width: 570px;
          margin: 0 auto;
          color: var(--muted);
          line-height: 1.7;
        }

        .scrapbook-template .intro-gallery {
          min-height: 92svh;
          display: grid;
          grid-template-columns: 0.82fr 1.18fr;
          align-items: center;
          gap: 54px;
          padding: 110px 0;
        }

        .scrapbook-template .gallery-copy h2 {
          margin: 14px 0 0;
          color: var(--ink) !important;
          font-size: clamp(42px, 7vw, 88px);
          line-height: 0.95;
          font-weight: 500;
          letter-spacing: -0.055em;
        }

        .scrapbook-template .stacked-cards {
          height: 540px;
          position: relative;
          perspective: 1100px;
        }

        .scrapbook-template .photo-card {
          position: absolute;
          width: min(318px, 32vw);
          aspect-ratio: 0.75;
          padding: 12px;
          background: #fffaf2;
          border-radius: 26px;
          box-shadow: 0 30px 76px rgba(62, 43, 33, 0.2);
          will-change: transform;
          transform-origin: center center;
        }

        .scrapbook-template .photo-card:nth-child(1) {
          left: 3%;
          top: 20%;
          z-index: 2;
        }

        .scrapbook-template .photo-card:nth-child(2) {
          left: 31%;
          top: 4%;
          z-index: 3;
        }

        .scrapbook-template .photo-card:nth-child(3) {
          left: 58%;
          top: 22%;
          z-index: 1;
        }

        .scrapbook-template .photo-card .placeholder-img {
          border-radius: 18px;
        }

        .scrapbook-template .story,
        .scrapbook-template .horizontal-gallery {
          padding: 124px 0;
        }

        .scrapbook-template .story h2,
        .scrapbook-template .section-heading-row h2 {
          margin: 12px 0 0;
          color: var(--ink) !important;
          font-weight: 500;
          letter-spacing: -0.06em;
          line-height: 0.88;
          font-size: clamp(64px, 11vw, 150px);
        }

        .scrapbook-template .story-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 58px;
          align-items: center;
          margin-top: 48px;
        }

        .scrapbook-template .story-text {
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          padding: 42px 0;
          color: var(--muted);
          font-size: clamp(16px, 1.8vw, 21px);
          line-height: 1.75;
        }

        .scrapbook-template .story-text p {
          margin: 0;
        }

        .scrapbook-template .story-text p + p {
          margin-top: 18px;
        }

        .scrapbook-template .story-media {
          min-height: 460px;
          padding: 14px;
          background: var(--paper);
          border-radius: 30px;
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .scrapbook-template .story-media .placeholder-img {
          min-height: 440px;
          border-radius: 22px;
        }

        .scrapbook-template .section-heading-row {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 24px;
          margin-bottom: 38px;
        }

        .scrapbook-template .section-heading-row p {
          max-width: 340px;
          color: var(--muted);
          line-height: 1.65;
        }

        .scrapbook-template .horizontal-gallery {
          overflow: hidden;
        }

        .scrapbook-template .gallery-track {
          display: flex;
          gap: 22px;
          width: max-content;
          padding: 16px 0 34px;
        }

        .scrapbook-template .memory-card {
          width: min(390px, 82vw);
          padding: 12px;
          border-radius: 30px;
          background: var(--paper);
          border: 1px solid rgba(255, 255, 255, 0.82);
          box-shadow: 0 28px 74px rgba(57, 41, 32, 0.14);
        }

        .scrapbook-template .memory-image {
          height: 335px;
          border-radius: 22px;
          overflow: hidden;
        }

        .scrapbook-template .memory-copy {
          padding: 18px 10px 12px;
        }

        .scrapbook-template .memory-card h3 {
          margin: 0 0 6px;
          color: var(--ink) !important;
          font-size: 34px;
          line-height: 1;
          font-weight: 500;
        }

        .scrapbook-template .memory-card p {
          margin: 0;
          color: var(--muted);
          line-height: 1.5;
        }

        .scrapbook-template .countdown-section {
          min-height: 92svh;
          display: grid;
          place-items: center;
          padding: 120px 0;
          text-align: center;
        }

        .scrapbook-template .countdown-inner {
          width: min(980px, 100%);
          margin: 0 auto;
        }

        .scrapbook-template .countdown-date {
          margin: 18px auto 34px;
          color: var(--ink) !important;
          font-size: clamp(72px, 13vw, 170px);
          line-height: 0.82;
          font-weight: 500;
          letter-spacing: -0.075em;
        }

        .scrapbook-template .countdown-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          width: min(700px, 100%);
          margin: 0 auto;
        }

        .scrapbook-template .countdown-box {
          padding: 24px 16px;
          border-radius: 24px;
          background: rgba(255, 250, 242, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow: 0 22px 60px rgba(57, 41, 32, 0.1);
        }

        .scrapbook-template .countdown-box strong {
          display: block;
          color: var(--brown-dark);
          font-size: clamp(26px, 4vw, 48px);
          line-height: 1;
          font-weight: 800;
        }

        .scrapbook-template .countdown-box span {
          display: block;
          margin-top: 8px;
          color: var(--muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-weight: 800;
        }

        .scrapbook-template .venue {
          position: relative;
          min-height: 90svh;
          display: grid;
          align-items: center;
          padding: 124px 0;
        }

        .scrapbook-template .venue-image-wrap {
          position: absolute;
          inset: 80px 0 auto;
          height: 340px;
          z-index: 0;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .scrapbook-template .venue-card {
          position: relative;
          z-index: 2;
          margin: 250px auto 0;
          width: min(540px, 94%);
          background: rgba(255, 250, 242, 0.9);
          -webkit-backdrop-filter: blur(20px);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.56);
          border-radius: 32px;
          text-align: center;
          padding: 44px 36px;
          box-shadow: var(--shadow);
        }

        .scrapbook-template .venue-icon {
          width: 62px;
          height: 62px;
          margin: 0 auto 16px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: var(--gold);
          background: var(--gold-soft);
        }

        .scrapbook-template .venue-card h2 {
          margin: 14px 0 0;
          color: var(--ink) !important;
          font-size: clamp(38px, 5vw, 64px);
          line-height: 0.95;
          font-weight: 500;
          letter-spacing: -0.04em;
        }

        .scrapbook-template .venue-card p {
          color: var(--muted);
          line-height: 1.7;
          margin: 16px auto 0;
          max-width: 430px;
        }

        .scrapbook-template .venue-meta {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin: 24px 0;
        }

        .scrapbook-template .venue-meta span {
          display: inline-flex;
          gap: 7px;
          align-items: center;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(111, 74, 47, 0.08);
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
        }





        .scrapbook-template .final-cinematic {
          position: relative;
          min-height: 100svh;
          overflow: hidden;
          display: grid;
          place-items: center;
          text-align: center;
          background: #1f140f;
        }

        .scrapbook-template .final-image {
          position: absolute;
          inset: 0;
          z-index: 0;
          will-change: transform;
        }

        .scrapbook-template .final-image .placeholder-img {
          border-radius: 0;
        }

        .scrapbook-template .final-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            linear-gradient(180deg, rgba(20, 12, 8, 0.3), rgba(20, 12, 8, 0.62)),
            radial-gradient(circle at center, rgba(20, 12, 8, 0.08), rgba(20, 12, 8, 0.72));
        }

        .scrapbook-template .final-copy {
          position: relative;
          z-index: 2;
          width: min(860px, calc(100% - 32px));
          margin: 0 auto;
          color: #fff8ed;
        }

        .scrapbook-template .final-copy .eyebrow {
          color: #f4d4a7 !important;
        }

        .scrapbook-template .final-copy h2 {
          margin: 18px 0 16px;
          color: #fff8ed !important;
          font-size: clamp(44px, 8vw, 104px);
          line-height: 0.92;
          font-weight: 500;
          letter-spacing: -0.06em;
          text-shadow: 0 20px 60px rgba(0, 0, 0, 0.36);
        }

        .scrapbook-template .final-copy p {
          margin: 0 0 24px;
          color: rgba(255, 248, 237, 0.82);
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .scrapbook-template .footer {
          padding: 74px 0 94px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          border-top: 1px solid var(--line);
        }

        .scrapbook-template .footer p {
          margin: 0;
          font-size: clamp(31px, 5vw, 44px);
          line-height: 1;
        }

        .scrapbook-template .footer small {
          color: var(--muted);
          font-weight: 700;
        }

        .scrapbook-template .rsvp-layer {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 18px;
        }

        .scrapbook-template .rsvp-backdrop {
          position: absolute;
          inset: 0;
          border: 0;
          background: rgba(25, 16, 11, 0.42);
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
        }

        .scrapbook-template .rsvp-sheet {
          position: relative;
          z-index: 2;
          width: min(520px, 100%);
          padding: 42px 34px;
          border-radius: 34px;
          background: linear-gradient(180deg, rgba(255, 250, 242, 0.96), rgba(247, 235, 217, 0.94));
          border: 1px solid rgba(255, 255, 255, 0.68);
          box-shadow: 0 42px 140px rgba(0, 0, 0, 0.28);
          text-align: center;
        }

        .scrapbook-template .rsvp-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          background: rgba(111, 74, 47, 0.08);
          color: var(--ink);
        }

        .scrapbook-template .rsvp-sheet h3 {
          margin: 14px 0 10px;
          font-size: clamp(42px, 8vw, 68px);
          line-height: 0.92;
          font-weight: 500;
          letter-spacing: -0.055em;
        }

        .scrapbook-template .rsvp-sheet p {
          max-width: 410px;
          margin: 0 auto;
          color: var(--muted);
          line-height: 1.7;
        }

        .scrapbook-template .rsvp-details {
          margin-top: 24px;
          display: grid;
          gap: 9px;
        }

        .scrapbook-template .rsvp-details span {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          color: var(--brown-dark);
          font-size: 14px;
          font-weight: 800;
        }

        @media (max-width: 980px) {
          .scrapbook-template .wedding-hero-inner {
            min-height: 700px;
          }

          .scrapbook-template .wedding-collage-stage {
            width: min(760px, 96vw);
            height: 610px;
            min-height: 610px;
          }

          .scrapbook-template .left-photo-top {
            width: 158px;
            height: 122px;
            left: 0;
            top: 58px;
          }

          .scrapbook-template .left-photo-bottom {
            width: 178px;
            height: 110px;
            left: 12px;
            top: 292px;
          }

          .scrapbook-template .right-photo-top {
            width: 158px;
            height: 110px;
            right: 0;
            top: 158px;
          }

          .scrapbook-template .right-photo-bottom {
            width: 178px;
            height: 178px;
            right: 8px;
            top: 348px;
          }

          .scrapbook-template .collage-name {
            left: 50%;
            right: auto;
            top: 390px;
            width: 92vw;
            transform: translateX(-50%);
            text-align: center;
          }

          .scrapbook-template .collage-name h1 {
            font-size: clamp(58px, 18vw, 104px);
          }
        }

        @media (max-width: 840px) {
          .scrapbook-template .intro-gallery,
          .scrapbook-template .story-grid,
          .scrapbook-template .questions-section {
            grid-template-columns: 1fr;
          }

          .scrapbook-template .intro-gallery {
            gap: 18px;
            padding: 88px 0;
          }

          .scrapbook-template .stacked-cards {
            height: 470px;
          }

          .scrapbook-template .photo-card {
            width: 44vw;
          }

          .scrapbook-template .photo-card:nth-child(1) {
            left: 0;
          }

          .scrapbook-template .photo-card:nth-child(2) {
            left: 27%;
          }

          .scrapbook-template .photo-card:nth-child(3) {
            left: 54%;
          }

          .scrapbook-template .section-heading-row {
            display: block;
          }

          .scrapbook-template .countdown-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }



          .scrapbook-template .venue-image-wrap {
            height: 260px;
          }

          .scrapbook-template .venue-card {
            margin-top: 220px;
            padding: 36px 22px;
          }

          .scrapbook-template .footer {
            display: block;
            text-align: center;
          }

          .scrapbook-template .footer small {
            display: block;
            margin-top: 10px;
          }
        }

        @media (max-width: 760px) {
          .scrapbook-template .topbar {
            grid-template-columns: auto 1fr auto;
            width: calc(100% - 22px);
            top: 11px;
          }

          .scrapbook-template .desktop-nav,
          .scrapbook-template .nav-rsvp {
            display: none;
          }

          .scrapbook-template .menu-btn {
            display: flex;
            justify-self: end;
          }

          .scrapbook-template .brand {
            max-width: calc(100vw - 96px);
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .scrapbook-template .wedding-gsap-hero {
            padding: 14px 14px 50px;
          }

          .scrapbook-template .hero-kicker {
            margin-top: 72px;
            letter-spacing: 0.2em;
          }

          .scrapbook-template .wedding-collage-stage {
            height: 560px;
            min-height: 560px;
          }

          .scrapbook-template .left-photo-top {
            width: 122px;
            height: 96px;
            left: 0;
            top: 70px;
          }

          .scrapbook-template .left-photo-bottom {
            width: 140px;
            height: 88px;
            left: 6px;
            top: 288px;
          }

          .scrapbook-template .right-photo-top {
            width: 122px;
            height: 88px;
            right: 0;
            top: 165px;
          }

          .scrapbook-template .right-photo-bottom {
            width: 140px;
            height: 146px;
            right: 4px;
            top: 340px;
          }

          .scrapbook-template .collage-photo {
            border-radius: 14px;
          }

          .scrapbook-template .collage-name {
            top: 382px;
          }

          .scrapbook-template .collage-name h1 {
            font-size: clamp(54px, 18vw, 92px);
          }

          .scrapbook-template .hero-actions {
            margin-top: 16px;
          }

          .scrapbook-template .story,
          .scrapbook-template .horizontal-gallery,
          .scrapbook-template .venue,
          .scrapbook-template .countdown-section {
            padding: 88px 0;
          }

          .scrapbook-template .story-media,
          .scrapbook-template .story-media .placeholder-img {
            min-height: 330px;
          }

          .scrapbook-template .memory-image {
            height: 290px;
          }
        }

        @media (max-width: 520px) {
          .scrapbook-template .photo-card {
            width: 50vw;
            padding: 9px;
            border-radius: 20px;
          }

          .scrapbook-template .stacked-cards {
            height: 400px;
          }

          .scrapbook-template .photo-card:nth-child(1) {
            left: -4%;
            top: 23%;
          }

          .scrapbook-template .photo-card:nth-child(2) {
            left: 23%;
            top: 5%;
          }

          .scrapbook-template .photo-card:nth-child(3) {
            left: 50%;
            top: 24%;
          }

          .scrapbook-template .countdown-box {
            padding: 20px 12px;
          }



          .scrapbook-template .venue-card {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scrapbook-template *,
          .scrapbook-template *::before,
          .scrapbook-template *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      {!isPreview && <Navbar data={data} onOpenRsvp={openRsvp} containerRef={containerRef} />}

      <main>
        <Hero data={data} containerRef={containerRef} onOpenRsvp={openRsvp} />
        <IntroGallery data={data} />
        <Story data={data} />
        <HorizontalGallery data={data} />
        <CountdownSection data={data} />
        <Venue data={data} onOpenRsvp={openRsvp} />

        <FinalCinematicSection data={data} onOpenRsvp={openRsvp} />

        <footer className="footer section-shell">
          <p className="font-serif">
            {bride} &amp; {groom}
          </p>
          <small>Made with love, light, and memories.</small>
        </footer>
      </main>

      <RSVPModal open={rsvpOpen} onClose={closeRsvp} data={data} />
    </div>
  );
}

export default ScrapbookTemplate;