import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CeremonyTemplate, ClassicTemplate, FloralTemplate, ModernTemplate, TraditionalTemplate, HighEndImmersiveTemplate, SkyLanternsTemplate } from '../templates/AllTemplates';
import { RSVPSection } from './RSVPSection';
import { cn } from '../../utils/cn';

const templates = {
  ceremony: CeremonyTemplate,
  classic: ClassicTemplate,
  floral: FloralTemplate,
  modern: ModernTemplate,
  traditional: TraditionalTemplate,
  mountain: HighEndImmersiveTemplate,
  skylanterns: SkyLanternsTemplate,
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

    let ctx;
    const initTimeout = setTimeout(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.config({ force3D: true });

      // In the builder, scrolling happens inside a custom div, not the window.
      const scrollerSelector = "#preview-scroll-container";
      const scrollerElement = document.querySelector(scrollerSelector);

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      ctx = gsap.context(() => {
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
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      if (ctx) ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [effectiveType, hasData, isPreview, theme.enableAnimation]);

  if (!hasData) return null;

  const bgClass = theme.backgroundStyle === 'pattern'
    ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]'
    : theme.backgroundStyle === 'solid' ? 'bg-[#f5ede0]' : '';

  const getFontFamily = (font) => {
    switch (font) {
      case 'sans': return '"Inter", ui-sans-serif, system-ui, sans-serif';
      case 'mono': return '"Space Mono", ui-monospace, SFMono-Regular, monospace';
      case 'serif':
      default: return '"Playfair Display", "Cormorant Garamond", ui-serif, Georgia, serif';
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn("w-full transition-all duration-500", bgClass, className, "template-renderer-root")}
      style={{
        fontFamily: getFontFamily(theme.font),
        '--tw-primary': theme.primaryColor || '#b68d40',
        '--tw-secondary': theme.secondaryColor || '#f7e7ce',
        '--tw-heading': theme.headingColor || theme.primaryColor || '#6f5642',
        '--tw-subheading': theme.subheadingColor || theme.primaryColor || '#876c57',
        '--tw-body': theme.bodyColor || '#705f53',
        '--tw-meta': theme.metaColor || '#9a7d66',
      }}
    >
      <style>{`
        .template-renderer-root {
          font-family: ${getFontFamily(theme.font)};
          -webkit-overflow-scrolling: touch;
          touch-action: pan-y;
          overscroll-behavior-y: auto;
        }
        .template-renderer-root::-webkit-scrollbar {
          display: none;
        }
        .template-renderer-root {
          color: var(--tw-body) !important;
        }
        .template-renderer-root h1, 
        .template-renderer-root h2, 
        .template-renderer-root h3, 
        .template-renderer-root .font-serif {
          color: var(--tw-heading) !important;
        }
        .template-renderer-root .text-primary,
        .template-renderer-root [class*="text-[#c9a87c]"],
        .template-renderer-root [class*="text-[#b08f72]"],
        .template-renderer-root [class*="text-[#b68d40]"] {
          color: var(--tw-primary) !important;
        }
      `}</style>
      <SelectedTemplate data={data} isPreview={isPreview} previewMode={previewMode} />
    </div>
  );
}
