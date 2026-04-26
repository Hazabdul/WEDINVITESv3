import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, Share2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useInvitationState } from '../hooks/useInvitationState';
import { templatesList } from '../data/mockData';
import { TemplateRenderer } from '../components/preview/TemplateRenderer';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const featureHighlights = [
  {
    id: "01",
    title: "Start in seconds",
    subtitle: "No login required",
    description: "Begin instantly with zero friction. No signup, no passwords — just pure creative flow from the first click.",
    tags: ["No signup", "Private flow", "Instant-ready"]
  },
  {
    id: "02",
    title: "Publish once",
    subtitle: "Instantly shareable",
    description: "One click to generate a private, premium link optimized for WhatsApp and social sharing at the highest quality.",
    tags: ["Private link", "Mobile ready", "One-click"]
  },
  {
    id: "03",
    title: "Designed to feel alive",
    subtitle: "Media rich",
    description: "Add high-resolution galleries, ambient music, and cinematic video to create an immersive digital experience.",
    tags: ["Gallery", "Music", "Video"]
  }
];

function TemplateCard({ template, onSelect }) {
  // Mapping specific high-end images to the themes
  const themeImages = {
    mountain: "/template1.jpg",
    noir: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    solstice: "https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=800&q=80",
  };

  return (
    <div className="group h-full flex flex-col relative isolate overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] transition-all duration-500">
      {/* Laptop Mockup Presentation */}
      <div className="relative pt-8 px-6 flex-shrink-0">
        <div className="relative mx-auto">
          {/* Laptop Screen */}
          <div className="relative rounded-t-2xl border-[8px] border-[#1a1a1a] bg-[#1a1a1a] shadow-2xl overflow-hidden aspect-[16/10]">
            {/* Screen Highlight */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
            <img
              src={themeImages[template.id] || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"}
              alt={template.name}
              className="h-full w-full object-cover"
            />
          </div>
          {/* Precision Base */}
          <div className="relative h-2.5 w-[106%] -ml-[3%] bg-[#2a2a2a] rounded-b-xl border-t border-white/5 shadow-xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-black/40 rounded-b-md" />
          </div>
        </div>
      </div>

      {/* Editorial Content Section */}
      <div className="relative flex-grow flex flex-col items-center px-8 pb-10 pt-6 text-center overflow-hidden">
        {/* Subtle Architectural Overlay */}
        <img
          src="/bg1.avif"
          alt=""
          className="absolute -right-[15%] top-1/2 -translate-y-1/2 h-full w-auto object-contain opacity-5 pointer-events-none mix-blend-multiply select-none"
        />

        <h3 className="relative font-serif text-[26px] italic leading-tight text-slate-900 tracking-tight">
          {template.name}
        </h3>

        <p className="relative mt-3 text-[13px] leading-relaxed text-slate-500/80 max-w-[240px] flex-grow">
          {template.description}
        </p>

        <div className="relative mt-8">
          <button
            onClick={() => onSelect(template.id)}
            className="rounded-full bg-gradient-to-r from-[#D4A76A] to-[#B68D40] px-7 py-2.5 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all hover:scale-[1.05] active:scale-95"
          >
            USE THIS
          </button>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { data, setTemplate } = useInvitationState();
  const [activeStep, setActiveStep] = React.useState(0);

  const steps = [
    {
      title: "Choose Template",
      description: "Pick from beautifully designed invitation templates curated for luxury and simplicity.",
      image: "https://images.unsplash.com/photo-1549416878-b9ca35c2d495?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Customize Design",
      description: "Personalize every detail including high-end typography, colors, and interactive elements.",
      image: "https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Add Event Details",
      description: "Input venues, timings, and custom maps to keep your guests perfectly informed.",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Share Invitation Link",
      description: "Generate a premium digital link ready for instant sharing on WhatsApp or Social Media.",
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Manage Responses",
      description: "Track RSVPs and heartfelt guest messages in real-time within your private dashboard.",
      image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // GSAP Scroll Animations
  React.useEffect(() => {
    const ctx = gsap.context(() => {
      // Templates Section
      gsap.from(".templates-header", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#templates-section",
          start: "top 90%",
          toggleActions: "play none none none"
        }
      });

      gsap.from(".template-card-stagger", {
        opacity: 0,
        y: 60,
        duration: 1.2,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".templates-grid",
          start: "top 90%",
          toggleActions: "play none none none"
        }
      });

      // How It Works
      gsap.from(".how-it-works-header", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: {
          trigger: ".how-it-works-trigger",
          start: "top 90%",
          toggleActions: "play none none none"
        }
      });

      gsap.from(".how-it-works-visual", {
        opacity: 0,
        x: -50,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".how-it-works-trigger",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });

      gsap.from(".how-it-works-steps", {
        opacity: 0,
        x: 50,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".how-it-works-trigger",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });

      // Features Section
      gsap.from(".features-header", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-trigger",
          start: "top 90%",
          toggleActions: "play none none none"
        }
      });

      gsap.from(".features-item-reveal", {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });

      // Pre-Footer CTA Banner
      gsap.from(".cta-banner", {
        opacity: 0,
        scale: 0.95,
        y: 30,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".cta-banner-trigger",
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const handleUseTemplate = (id) => {
    setTemplate(id);
    navigate('/builder');
  };

  return (
    <main className="min-h-screen bg-white">
      {/* PREMIUM HERO SECTION (uMake Style) */}
      <section
        aria-labelledby="hero-heading"
        className="relative flex min-h-[100vh] flex-col items-center justify-center pt-32 pb-24 text-center overflow-hidden"
      >
        {/* Background Image Overlay Container - Raw Full Visibility */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/hero_bg.png"
            alt="Wedding Background"
            className="h-full w-full object-cover grayscale-0 opacity-100"
          />
        </div>

        <div className="container relative z-10 mx-auto max-w-5xl px-6">
          {/* Top Badge/Pill - Refined with Icon */}
          <div className="animate-artemis-hero stagger-1 mb-8 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20 shadow-xl cursor-default">
              <Sparkles className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/90">
                Premium Digital Invitations
              </span>
            </div>
          </div>

          {/* Typography-Focused Heading - Balanced Scale */}
          <h1
            id="hero-heading"
            className="animate-artemis-hero stagger-2 mx-auto flex flex-col items-center gap-1 sm:gap-2 px-4"
          >
            <span className="font-serif italic font-normal text-[28px] sm:text-[40px] md:text-[48px] lg:text-[62px] text-white leading-[1.1] tracking-tight drop-shadow-2xl">
              Create beautifully.
            </span>
            <span className="font-serif font-bold text-[32px] sm:text-[44px] md:text-[52px] lg:text-[70px] text-white leading-[1.1] tracking-tight drop-shadow-2xl">
              Design luxury invites.
            </span>
          </h1>

          {/* Subheading - Scaled & Softened for balance */}
          <div className="animate-artemis-hero stagger-3 mt-8 flex justify-center px-6">
            <p className="max-w-[580px] text-[11px] sm:text-[13px] md:text-[15px] font-medium text-white/80 leading-relaxed sm:leading-8 drop-shadow-md text-center">
              Create elegant digital wedding invitations that feel premium and unforgettable.
              Designed for couples who value sophisticated simplicity.
            </p>
          </div>

          {/* Primary CTA Button - Refined Scale */}
          <div className="animate-artemis-hero stagger-4 mt-12 flex justify-center">
            <button
              onClick={() => navigate('/builder')}
              className="group flex items-center gap-2.5 rounded-full bg-white px-9 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black shadow-2xl transition-all hover:scale-[1.03] active:scale-95"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* TEMPLATES SECTION */}
      <section
        id="templates-section"
        aria-labelledby="templates-heading"
        className="bg-[linear-gradient(180deg,#ffffff_0%,#f7eadb_50%,#e2c6aa_100%)] py-24"
      >
        <div className="mx-auto max-w-6xl px-6">
          {/* Section Header */}
          <header className="mb-16 text-center templates-header">
            <h2
              id="templates-heading"
              className="font-serif text-[42px] sm:text-[52px] italic leading-tight text-slate-900 font-normal tracking-tight"
            >
              Choose your template
            </h2>
            <div className="mt-4 mx-auto w-12 h-1 bg-slate-900/10 rounded-full" />
          </header>

          {/* Templates Grid */}
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 templates-grid">
            {templatesList.map((tmplt) => (
              <div key={tmplt.id} className="template-card-stagger">
                <TemplateCard
                  template={tmplt}
                  onSelect={handleUseTemplate}
                />
              </div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <button
              onClick={() => navigate('/templates')}
              className="flex items-center gap-2.5 rounded-full text-slate-900 px-10 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] bg-white transition-all hover:scale-[1.03] active:scale-95"
            >
              View all designs
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-white py-16 border-t border-gray-100 how-it-works-trigger">
        <div className="mx-auto max-w-6xl px-6">
          <header className="mb-16 text-center how-it-works-header">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">How It Works</div>
            <h2 className="font-serif text-[42px] italic leading-tight text-slate-900 font-normal tracking-tight">
              Simple steps to stunning
            </h2>
            <div className="mt-4 mx-auto w-12 h-1 bg-slate-900/10 rounded-full" />
          </header>

          <div className="flex flex-col lg:flex-row items-stretch gap-10">

            {/* Visual Preview (Left) */}
            <div className="w-full lg:w-1/2 how-it-works-visual">
              <div className="relative h-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 shadow-sm">
                <img
                  key={activeStep}
                  src={steps[activeStep].image}
                  alt={steps[activeStep].title}
                  className="h-full w-full object-cover transition-all duration-1000 animate-fadeIn"
                />
                <div className="absolute inset-0 bg-black/5" />
              </div>
            </div>

            {/* Steps Accordion (Right) */}
            <div className="w-full lg:w-1/2 how-it-works-steps">
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`cursor-pointer group flex items-start gap-5 p-3 rounded-xl transition-all duration-500 ${activeStep === index ? 'bg-slate-50' : 'hover:bg-slate-50/30'}`}
                  >
                    {/* Vertical Progress Indicator */}
                    <div className="flex flex-col items-center h-full">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-700 ${activeStep === index ? 'bg-gradient-to-r from-[#D4A76A] to-[#B68D40] text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                        {index + 1}
                      </div>

                      {/* Vertical line connecting steps */}
                      {index < steps.length - 1 && (
                        <div className={`relative mt-1 w-[2px] bg-slate-100 overflow-hidden rounded-full transition-all duration-700 ${activeStep === index ? 'h-14' : 'h-6'}`}>
                          {activeStep === index && (
                            <div
                              className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#D4A76A] to-[#B68D40] origin-top transition-transform"
                              style={{
                                height: '100%',
                                animation: 'progress-v 4000ms linear forwards'
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 pt-0.5">
                      <h3 className={`text-[17px] font-semibold italic transition-colors duration-500 ${activeStep === index ? 'text-slate-900' : 'text-slate-500'}`}>
                        {step.title}
                      </h3>
                      <div className={`overflow-hidden transition-all duration-700 ease-in-out ${activeStep === index ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                        <p className="text-[14px] leading-relaxed text-slate-500/80">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION — Luxury Layout Redesign */}
      <section
        aria-labelledby="features-heading"
        className="py-24 sm:py-32 border-t border-gray-100 features-trigger"
      >
        <div className="mx-auto max-w-6xl px-6">
          <header className="mx-auto max-w-2xl text-center mb-20 features-header">
            <div className="text-[10px] font-black uppercase tracking-[0.56em] text-slate-400 mb-4">
              Simple. Fast. Elegant.
            </div>
            <h2 id="features-heading" className="font-serif text-[42px] sm:text-[56px] leading-[1.1] text-slate-900 italic font-normal tracking-tight">
              Elegant for couples.<br />Effortless for guests.
            </h2>
            <p className="mt-8 text-[15px] font-medium leading-relaxed text-slate-500/70 max-w-xl mx-auto">
              Everything important is kept simple: build fast, publish once, and send a link that feels polished on every screen.
            </p>
          </header>

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 features-grid">
            {featureHighlights.map((feature) => (
              <article key={feature.id} className="group relative features-item-reveal">
                <div className="mb-6 font-serif text-[48px] text-slate-400 font-normal leading-none">
                  {feature.id}
                </div>

                <h3 className="text-[20px] font-bold text-slate-900 tracking-tight">
                  {feature.title}
                </h3>
                <div className="text-[13px] font-semibold text-slate-400/80 uppercase tracking-[0.1em] mt-1">
                  {feature.subtitle}
                </div>

                <p className="mt-4 text-[14px] leading-relaxed text-slate-500/80">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      {/* PRE-FOOTER CTA SECTION (Setpoint Style) */}
      <section className="bg-white py-12 sm:py-16 overflow-hidden px-6 cta-banner-trigger">
        <div className="mx-auto max-w-5xl container cta-banner">
          <div className="relative isolate overflow-hidden bg-[#111111] px-6 pt-16 pb-16 text-center rounded-[30px] sm:px-16">
            {/* Background Pattern Overlay */}
            <img
              src="/bg1.avif"
              alt=""
              className="absolute -right-[25%] top-1/2 -translate-y-1/2 h-[180%] w-auto object-contain object-right opacity-10 pointer-events-none mix-blend-lighten select-none"
            />

            {/* Soft Glow Effect */}
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[120%] h-[150%] bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.08)_0%,transparent_60%)] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-xl">
              <h2 className="font-serif text-[32px] sm:text-[44px] leading-[1.1] text-white italic font-normal tracking-tight mb-6">
                Ready to design your<br />dream invitation?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[14px] leading-relaxed text-white/50 mb-10">
                Join thousands of couples creating beautiful digital experiences and cinematic memories for their special day.
              </p>
              <div className="flex items-center justify-center gap-x-6">
                <button
                  onClick={() => navigate('/builder')}
                  className="rounded-full bg-gradient-to-r from-[#D4A76A] to-[#B68D40] px-10 py-3.5 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all hover:scale-[1.05] active:scale-95"
                >
                  Start Building
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
