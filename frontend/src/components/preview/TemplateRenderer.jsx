import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CeremonyTemplate, ClassicTemplate, FloralTemplate, ModernTemplate, TraditionalTemplate, HighEndImmersiveTemplate, NoirTemplate, SolsticeTemplate } from '../templates/AllTemplates';
import { RSVPSection } from './RSVPSection';
import { cn } from '../../utils/cn';

const templates = {
  ceremony: CeremonyTemplate,
  classic: ClassicTemplate,
  floral: FloralTemplate,
  modern: ModernTemplate,
  traditional: TraditionalTemplate,
  mountain: HighEndImmersiveTemplate,
  noir: NoirTemplate,
  solstice: SolsticeTemplate,
};

export function TemplateRenderer({ type, data, className = "", isPreview = true, previewMode = 'desktop' }) {
  const rootRef = useRef(null);
  const hasData = Boolean(data);
  const effectiveType = templates[type] ? type : 'ceremony';
  const SelectedTemplate = templates[effectiveType];
  const theme = data?.theme || {};

  useEffect(() => {
    if (!hasData || theme.enableAnimation === false || !rootRef.current || typeof window === 'undefined') {
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);

    // In the builder, scrolling happens inside a custom div, not the window.
    const scrollerSelector = ".custom-scrollbar-preview";
    const scrollerElement = document.querySelector(scrollerSelector);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('[data-live-invite-section]');
      const cards = gsap.utils.toArray('[data-live-invite-card]');
      const mediaItems = gsap.utils.toArray('[data-live-invite-media]');
      const floatItems = gsap.utils.toArray('[data-live-invite-float]');
      const revealItems = gsap.utils.toArray('.reveal-up');

      if (prefersReducedMotion) {
        gsap.set([...sections, ...cards, ...mediaItems, ...revealItems], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          clearProps: 'all',
        });
        return;
      }

      // Generic reveal-up for editorial elements
      revealItems.forEach((item) => {
        gsap.fromTo(item, 
          { autoAlpha: 0, y: 30 },
          { 
            autoAlpha: 1, 
            y: 0, 
            duration: 1, 
            ease: "expo.out",
            scrollTrigger: {
              trigger: item,
              scroller: isPreview && scrollerElement ? scrollerElement : window,
              start: "top 95%",
              toggleActions: "play none none none"
            }
          }
        );
      });

      sections.forEach((item, index) => {
        gsap.fromTo(
          item,
          { autoAlpha: 0, y: 48, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            delay: index === 0 ? 0.06 : 0,
            scrollTrigger: {
              trigger: item,
              scroller: isPreview && scrollerElement ? scrollerElement : window,
              start: 'top 86%',
              once: true,
            },
          }
        );
      });

      cards.forEach((item) => {
        gsap.fromTo(
          item,
          { autoAlpha: 0, y: 24, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              scroller: isPreview && scrollerElement ? scrollerElement : window,
              start: 'top 90%',
              once: true,
            },
          }
        );
      });

      mediaItems.forEach((item) => {
        gsap.fromTo(
          item,
          { scale: 1.08, autoAlpha: 0.78 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              scroller: isPreview && scrollerElement ? scrollerElement : window,
              start: 'top 92%',
              once: true,
            },
          }
        );
      });

      floatItems.forEach((item, index) => {
        gsap.to(item, {
          yPercent: index % 2 === 0 ? -9 : 9,
          xPercent: index % 2 === 0 ? 5 : -5,
          duration: 7 + index,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, rootRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [effectiveType, hasData, isPreview, theme.enableAnimation]);

  if (!hasData) return null;

  const bgClass = theme.backgroundStyle === 'pattern'
    ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]'
    : theme.backgroundStyle === 'solid' ? 'bg-[#f5ede0]' : '';

  return (
    <div
      ref={rootRef}
      className={cn("w-full transition-all duration-500", bgClass, className)}
      style={{
        fontFamily: theme.font || 'serif',
      }}
    >
      <SelectedTemplate data={data} isPreview={isPreview} previewMode={previewMode} />
    </div>
  );
}
