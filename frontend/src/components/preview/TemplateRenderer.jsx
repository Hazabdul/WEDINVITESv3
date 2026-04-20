import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CeremonyTemplate } from '../templates/AllTemplates';
import { cn } from '../../utils/cn';

const templates = {
  ceremony: CeremonyTemplate,
};

export function TemplateRenderer({ type, data, className = "", isPreview = true, previewMode = 'desktop' }) {
  const rootRef = useRef(null);
  const hasData = Boolean(data);
  const effectiveType = templates[type] ? type : 'ceremony';
  const SelectedTemplate = templates[effectiveType];
  const theme = data?.theme || {};

  useEffect(() => {
    if (!hasData || isPreview || effectiveType === 'ceremony' || theme.enableAnimation === false || !rootRef.current || typeof window === 'undefined') {
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('[data-live-invite-section]');
      const cards = gsap.utils.toArray('[data-live-invite-card]');
      const mediaItems = gsap.utils.toArray('[data-live-invite-media]');
      const floatItems = gsap.utils.toArray('[data-live-invite-float]');

      if (prefersReducedMotion) {
        gsap.set([...sections, ...cards, ...mediaItems], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          clearProps: 'transform',
        });
        return;
      }

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
    };
  }, [effectiveType, hasData, isPreview, theme.enableAnimation]);

  if (!hasData) return null;

  const bgClass = theme.backgroundStyle === 'pattern'
    ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]'
    : theme.backgroundStyle === 'solid' ? 'bg-white' : '';

  return (
    <div
      ref={rootRef}
      className={cn("overflow-hidden w-full transition-all duration-500", bgClass, className)}
      style={{
        fontFamily: theme.font || 'serif',
      }}
    >
      <SelectedTemplate data={data} isPreview={isPreview} previewMode={previewMode} />
    </div>
  );
}
