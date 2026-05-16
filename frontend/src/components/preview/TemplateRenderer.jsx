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
    gsap.config({ force3D: true });

    // In the builder, scrolling happens inside a custom div, not the window.
    const scrollerSelector = "#preview-scroll-container";
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
        '--tw-primary': theme.primaryColor || '#c9a87c',
        '--tw-secondary': theme.secondaryColor || '#f5ede0',
        '--tw-heading': theme.headingColor || theme.primaryColor || '#1a3529',
        '--tw-subheading': theme.subheadingColor || theme.primaryColor || '#c9a87c',
        '--tw-body': theme.bodyColor || '#1a3529',
        '--tw-meta': theme.metaColor || '#4f5a47',
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
        /* Headings */
        .template-renderer-root h1, 
        .template-renderer-root h2, 
        .template-renderer-root h3, 
        .template-renderer-root .font-serif {
          color: var(--tw-heading) !important;
        }
        /* Primary accent text — catch all common hardcoded accent classes */
        .template-renderer-root .text-primary,
        .template-renderer-root [class*="text-[#c9a87c]"],
        .template-renderer-root [class*="text-[#b08f72]"],
        .template-renderer-root [class*="text-[#b68d40]"],
        .template-renderer-root [class*="text-[#D4A76A]"] {
          color: var(--tw-primary) !important;
        }
        /* Subheading text */
        .template-renderer-root [class*="text-[#876c57]"],
        .template-renderer-root [class*="text-[#876C57]"] {
          color: var(--tw-subheading) !important;
        }
        /* Meta/label text */
        .template-renderer-root [class*="text-[#9a7d66]"],
        .template-renderer-root [class*="text-[#9A7D66]"] {
          color: var(--tw-meta) !important;
        }
        /* Primary accent backgrounds (buttons, badges, dividers) */
        .template-renderer-root [class*="bg-[#c9a87c]"],
        .template-renderer-root [class*="bg-[#b68d40]"],
        .template-renderer-root [class*="bg-[#D4A76A]"],
        .template-renderer-root [class*="bg-[#B68D40]"] {
          background-color: var(--tw-primary) !important;
        }
        /* Primary accent borders */
        .template-renderer-root [class*="border-[#c9a87c]"],
        .template-renderer-root [class*="border-[#b68d40]"],
        .template-renderer-root [class*="border-[#D4A76A]"] {
          border-color: var(--tw-primary) !important;
        }
        /* Secondary / warm background sections */
        .template-renderer-root .arch-container {
          background-color: var(--tw-secondary, #f5ede0) !important;
        }
        /* Via/gradient accent dividers */
        .template-renderer-root [class*="via-[#c9a87c]"] {
          --tw-gradient-via: var(--tw-primary) !important;
        }
      `}</style>
      <SelectedTemplate data={data} isPreview={isPreview} previewMode={previewMode} />
    </div>
  );
}
