import React from 'react';
import { ArrowRight, Check, Quote, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

const FONT_FAMILY = {
  serif: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
  sans: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
  display: '"Trebuchet MS", "Gill Sans", "Segoe UI", sans-serif',
};

const RADIUS_CLASS = {
  soft: 'rounded-[20px]',
  rounded: 'rounded-[28px]',
  sharp: 'rounded-[12px]',
};

function getBackgroundStyle(theme) {
  const { backgroundStyle, backgroundColor, secondaryColor, accentColor } = theme;

  if (backgroundStyle === 'solid') {
    return { background: backgroundColor };
  }

  if (backgroundStyle === 'pattern') {
    return {
      backgroundImage: `radial-gradient(${accentColor}22 1px, transparent 1px), linear-gradient(180deg, ${backgroundColor} 0%, ${secondaryColor} 100%)`,
      backgroundSize: '18px 18px, auto',
    };
  }

  return {
    backgroundImage: `linear-gradient(180deg, ${backgroundColor} 0%, ${secondaryColor} 52%, ${accentColor}18 100%)`,
  };
}

function SectionHeading({ eyebrow, title, description, color, mutedColor }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: mutedColor }}>
          {eyebrow}
        </div>
      ) : null}
      <h2 className="mt-3 text-3xl leading-tight sm:text-4xl" style={{ color }}>
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-sm leading-7 sm:text-base" style={{ color: mutedColor }}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

function FeatureGridSection({ section, theme, radiusClass }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Structure"
        title={section.title}
        description={section.description}
        color={theme.textColor}
        mutedColor={theme.mutedColor}
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {section.items.map((item) => (
          <Card
            key={`${section.title}-${item.title}`}
            title={item.title}
            subtitle={item.meta || ''}
            className={cn('border-white/60 bg-white/80 backdrop-blur-md shadow-[0_24px_60px_-40px_rgba(47,41,37,0.35)]', radiusClass)}
          >
            <p className="text-sm leading-7" style={{ color: theme.mutedColor }}>{item.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ContentSplitSection({ section, theme, radiusClass }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={cn('border border-white/60 bg-white/76 p-7 shadow-[0_26px_70px_-40px_rgba(47,41,37,0.32)] backdrop-blur-md', radiusClass)}>
          <SectionHeading
            eyebrow="Layout"
            title={section.title}
            description={section.description}
            color={theme.textColor}
            mutedColor={theme.mutedColor}
          />
          <div className="mt-6 grid gap-3">
            {section.points.map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-[18px] border border-black/5 bg-white/70 px-4 py-3">
                <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${theme.accentColor}22`, color: theme.primaryColor }}>
                  <Check className="h-4 w-4" />
                </span>
                <p className="text-sm leading-7" style={{ color: theme.mutedColor }}>{point}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={cn('border p-7 shadow-[0_26px_70px_-40px_rgba(47,41,37,0.26)]', radiusClass)} style={{ borderColor: `${theme.primaryColor}22`, background: `linear-gradient(180deg, ${theme.secondaryColor}, ${theme.surfaceColor})` }}>
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ borderColor: `${theme.primaryColor}22`, color: theme.primaryColor }}>
            <Sparkles className="h-3.5 w-3.5" />
            Visual Panel
          </div>
          <h3 className="mt-6 text-2xl" style={{ color: theme.textColor }}>{section.panelTitle}</h3>
          <p className="mt-4 text-sm leading-7" style={{ color: theme.mutedColor }}>{section.panelBody}</p>
          <div className="mt-8 grid gap-3">
            <div className={cn('border bg-white/68 p-5', radiusClass)} style={{ borderColor: `${theme.primaryColor}18` }}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.primaryColor }}>Responsive rhythm</div>
              <div className="mt-3 h-3 w-4/5 rounded-full" style={{ backgroundColor: `${theme.primaryColor}22` }} />
              <div className="mt-2 h-3 w-3/5 rounded-full" style={{ backgroundColor: `${theme.accentColor}26` }} />
              <div className="mt-2 h-24 rounded-[18px]" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}18 0%, ${theme.accentColor}22 100%)` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBandSection({ section, theme, radiusClass }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
      <div className={cn('border p-6 shadow-[0_26px_70px_-40px_rgba(47,41,37,0.28)]', radiusClass)} style={{ borderColor: `${theme.primaryColor}18`, background: `linear-gradient(135deg, ${theme.surfaceColor}, ${theme.secondaryColor})` }}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: theme.primaryColor }}>
          {section.title}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {section.items.map((item) => (
            <div key={`${item.label}-${item.value}`} className={cn('border bg-white/78 p-5 backdrop-blur-md', radiusClass)} style={{ borderColor: `${theme.primaryColor}14` }}>
              <div className="text-3xl" style={{ color: theme.textColor }}>{item.value}</div>
              <div className="mt-2 text-sm leading-6" style={{ color: theme.mutedColor }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialSection({ section, theme, radiusClass }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
      <div className={cn('border bg-white/80 p-8 shadow-[0_26px_70px_-40px_rgba(47,41,37,0.3)] backdrop-blur-md', radiusClass)} style={{ borderColor: `${theme.primaryColor}1A` }}>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${theme.accentColor}20`, color: theme.primaryColor }}>
          <Quote className="h-5 w-5" />
        </div>
        <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: theme.primaryColor }}>
          {section.title}
        </div>
        <blockquote className="mt-5 text-xl leading-9 sm:text-2xl" style={{ color: theme.textColor }}>
          {section.quote}
        </blockquote>
        <div className="mt-6 text-sm" style={{ color: theme.mutedColor }}>
          {section.author} · {section.role}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ section, theme, radiusClass }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Questions"
        title={section.title}
        description={section.description}
        color={theme.textColor}
        mutedColor={theme.mutedColor}
      />
      <div className="mt-8 grid gap-4">
        {section.questions.map((item) => (
          <div key={item.question} className={cn('border bg-white/78 p-5 backdrop-blur-md', radiusClass)} style={{ borderColor: `${theme.primaryColor}16` }}>
            <div className="text-lg" style={{ color: theme.textColor }}>{item.question}</div>
            <p className="mt-3 text-sm leading-7" style={{ color: theme.mutedColor }}>{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaBannerSection({ section, theme, radiusClass }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
      <div className={cn('border p-8 shadow-[0_30px_80px_-42px_rgba(47,41,37,0.34)]', radiusClass)} style={{ borderColor: `${theme.primaryColor}16`, background: `linear-gradient(135deg, ${theme.primaryColor}F0 0%, ${theme.accentColor}D0 100%)` }}>
        <div className="max-w-3xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">Call To Action</div>
          <h3 className="mt-4 text-3xl text-white sm:text-4xl">{section.title}</h3>
          <p className="mt-4 text-sm leading-7 text-white/82 sm:text-base">{section.description}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="bg-white text-[#2f2925] hover:bg-white/90">
            {section.primaryCta}
          </Button>
          <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/18">
            {section.secondaryCta}
          </Button>
        </div>
      </div>
    </section>
  );
}

function renderSection(section, theme, radiusClass) {
  switch (section.type) {
    case 'feature_grid':
      return <FeatureGridSection key={`${section.type}-${section.title}`} section={section} theme={theme} radiusClass={radiusClass} />;
    case 'content_split':
      return <ContentSplitSection key={`${section.type}-${section.title}`} section={section} theme={theme} radiusClass={radiusClass} />;
    case 'stats_band':
      return <StatsBandSection key={`${section.type}-${section.title}`} section={section} theme={theme} radiusClass={radiusClass} />;
    case 'testimonial':
      return <TestimonialSection key={`${section.type}-${section.title}`} section={section} theme={theme} radiusClass={radiusClass} />;
    case 'faq':
      return <FaqSection key={`${section.type}-${section.title}`} section={section} theme={theme} radiusClass={radiusClass} />;
    case 'cta_banner':
      return <CtaBannerSection key={`${section.type}-${section.title}`} section={section} theme={theme} radiusClass={radiusClass} />;
    default:
      return null;
  }
}

export function GeneratedWebsiteRenderer({ spec }) {
  if (!spec?.page) return null;

  const { page } = spec;
  const theme = page.theme;
  const fontFamily = FONT_FAMILY[theme.fontFamily] || FONT_FAMILY.serif;
  const radiusClass = RADIUS_CLASS[theme.borderRadius] || RADIUS_CLASS.rounded;

  return (
    <div
      className="overflow-hidden border border-white/70 shadow-[0_36px_90px_-46px_rgba(47,41,37,0.36)]"
      style={{
        ...getBackgroundStyle(theme),
        color: theme.textColor,
        fontFamily,
        borderRadius: theme.borderRadius === 'sharp' ? '18px' : theme.borderRadius === 'soft' ? '30px' : '36px',
      }}
    >
      <header className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 lg:px-8 lg:pt-7">
        <div className={cn('flex flex-col gap-4 border border-white/60 bg-white/72 px-5 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between', radiusClass)} style={{ borderColor: `${theme.primaryColor}18` }}>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: theme.primaryColor }}>
              Generated Layout
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl" style={{ color: theme.textColor }}>{page.title}</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {page.navigation.map((item) => (
              <span
                key={item.label}
                className="rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ borderColor: `${theme.primaryColor}1A`, color: theme.mutedColor }}
              >
                {item.label}
              </span>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-5 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-12">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: theme.primaryColor }}>
            {page.hero.eyebrow}
          </div>
          <h2 className="mt-5 max-w-3xl text-4xl leading-tight sm:text-5xl" style={{ color: theme.textColor }}>
            {page.hero.title}
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: theme.mutedColor }}>
            {page.hero.subtitle}
          </p>

          {Array.isArray(page.hero.badges) && page.hero.badges.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {page.hero.badges.map((badge) => (
                <span key={badge} className="rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: `${theme.primaryColor}16`, backgroundColor: `${theme.surfaceColor}E8`, color: theme.primaryColor }}>
                  {badge}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-3">
            <Button className="shadow-[0_20px_50px_-28px_rgba(47,41,37,0.55)]" style={{ backgroundColor: theme.primaryColor, color: '#ffffff' }}>
              {page.hero.primaryCta}
            </Button>
            <Button variant="outline" className="bg-white/55 hover:bg-white/80" style={{ borderColor: `${theme.primaryColor}26`, color: theme.primaryColor }}>
              {page.hero.secondaryCta}
            </Button>
          </div>
        </div>

        <div className={cn('border p-6 shadow-[0_26px_80px_-40px_rgba(47,41,37,0.32)] backdrop-blur-md', radiusClass)} style={{ borderColor: `${theme.primaryColor}18`, background: `linear-gradient(180deg, ${theme.surfaceColor}, ${theme.secondaryColor})` }}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: theme.primaryColor }}>
            Visual Summary
          </div>
          <div className="mt-4 text-2xl" style={{ color: theme.textColor }}>{page.hero.highlight}</div>
          <div className={cn('mt-6 border bg-white/76 p-5', radiusClass)} style={{ borderColor: `${theme.primaryColor}16` }}>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.primaryColor }}>
              <span>Responsive preview</span>
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className={cn('border bg-white/70 p-4', radiusClass)} style={{ borderColor: `${theme.primaryColor}14` }}>
                <div className="h-3 w-20 rounded-full" style={{ backgroundColor: `${theme.primaryColor}1E` }} />
                <div className="mt-3 h-16 rounded-[18px]" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}18 0%, ${theme.accentColor}22 100%)` }} />
                <div className="mt-3 h-3 w-4/5 rounded-full" style={{ backgroundColor: `${theme.primaryColor}18` }} />
              </div>
              <div className={cn('border bg-white/70 p-4', radiusClass)} style={{ borderColor: `${theme.primaryColor}14` }}>
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.secondaryColor }} />
                </div>
                <div className="mt-4 grid gap-2">
                  <div className="h-12 rounded-[16px]" style={{ backgroundColor: `${theme.primaryColor}14` }} />
                  <div className="h-12 rounded-[16px]" style={{ backgroundColor: `${theme.accentColor}18` }} />
                </div>
              </div>
            </div>
          </div>

          {Array.isArray(page.hero.stats) && page.hero.stats.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {page.hero.stats.map((item) => (
                <div key={`${item.value}-${item.label}`} className={cn('border bg-white/70 p-4', radiusClass)} style={{ borderColor: `${theme.primaryColor}14` }}>
                  <div className="text-2xl" style={{ color: theme.textColor }}>{item.value}</div>
                  <div className="mt-1 text-sm" style={{ color: theme.mutedColor }}>{item.label}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {page.sections.map((section) => renderSection(section, theme, radiusClass))}
    </div>
  );
}

export default GeneratedWebsiteRenderer;
