import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowRight, Heart, PlayCircle, Share2, CalendarDays, MapPin } from 'lucide-react';
import apiClient from '../utils/api';

function GalleryCard({ invitation, onOpen }) {
  const coverImage = invitation.media?.coverImage || invitation.media?.coupleImage || invitation.media?.backgroundImage;
  const brideName = invitation.brideName || invitation.couple?.bride || 'Bride';
  const groomName = invitation.groomName || invitation.couple?.groom || 'Groom';
  const title = invitation.couple?.title || invitation.content?.welcomeHeading || 'Wedding Invitation';
  const venue = invitation.event?.venue || 'Venue to be announced';
  const eventDate = invitation.event?.date || invitation.weddingDate;
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Date to be announced';

  return (
    <article className="group h-full overflow-hidden rounded-[24px] glass-card p-1.5 transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`${brideName} and ${groomName}`}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#fdfcfb] text-slate-300">
            Preview
          </div>
        )}
      </div>

      <div className="space-y-4 p-8">
        <div>
          <h3 className="text-2xl font-serif text-[#1a2b5a]">{brideName} & {groomName}</h3>
          <p className="mt-2 min-h-12 text-[13px] leading-relaxed text-[#1a2b5a]/60 font-medium">{title}</p>
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-[#1a2b5a]/40">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-[120px]">{venue}</span>
          </div>
        </div>

        <button onClick={onOpen} className="group/btn relative w-full overflow-hidden rounded-full border border-[#1a2b5a]/10 bg-white/50 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a2b5a] transition-all hover:bg-[#1a2b5a] hover:text-white">
          <span className="relative z-10">View Detail</span>
        </button>
      </div>
    </article>
  );
}

function GallerySkeleton() {
  return (
    <article className="overflow-hidden rounded-[24px] glass-card p-1.5">
      <div className="aspect-[4/3] animate-pulse bg-slate-50/50 rounded-[20px]" />
      <div className="space-y-4 p-8">
        <div className="h-8 animate-pulse rounded bg-slate-50/50" />
        <div className="h-12 animate-pulse rounded bg-slate-50/50" />
        <div className="h-12 animate-pulse rounded-full bg-slate-50/50" />
      </div>
    </article>
  );
}

export function Home() {
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [galleryError, setGalleryError] = useState('');
  const loaderRef = useRef(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    let ignore = false;

    const fetchInvitations = async (nextPage = 1, append = false) => {
      if (fetchingRef.current) return;
      if (!append && nextPage !== 1) return;
      if (append && !hasMore) return;

      fetchingRef.current = true;
      setGalleryError('');
      if (append) {
        setLoadingMore(true);
      } else {
        setInitialLoading(true);
      }

      try {
        const response = await apiClient.getPublishedInvitations(nextPage, 6);
        if (ignore) return;

        const nextItems = Array.isArray(response.items) ? response.items : [];
        setInvitations((prev) => {
          if (!append) return nextItems;
          const existingIds = new Set(prev.map((item) => item._id));
          return [...prev, ...nextItems.filter((item) => !existingIds.has(item._id))];
        });
        setPage(response.pagination?.page ?? nextPage);
        setHasMore(Boolean(response.pagination?.hasMore));
      } catch (error) {
        if (!ignore) {
          setGalleryError('Could not load published invitations right now.');
        }
      } finally {
        if (!ignore) {
          setInitialLoading(false);
          setLoadingMore(false);
        }
        fetchingRef.current = false;
      }
    };

    fetchInvitations(1, false);

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (!firstEntry?.isIntersecting) return;
        if (fetchingRef.current || !hasMore) return;
        fetchInvitations(page + 1, true);
      },
      { rootMargin: '200px 0px' }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      ignore = true;
      observer.disconnect();
    };
  }, [hasMore, page]);

  return (
    <main className="min-h-screen bg-white">
      {/* ARTEMIS HERO SECTION */}
      <section aria-labelledby="hero-heading" className="relative flex min-h-screen overflow-hidden pt-32 pb-24 items-center justify-center bg-white">
        
        {/* Background Accents — Minimalist */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-rose-50/20 blur-[130px]" />
           <div className="absolute bottom-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-indigo-50/20 blur-[110px]" />
        </div>

        {/* Floating Rotated Cards — Precise Artemis Physic */}
        <div className="absolute inset-0 h-full w-full pointer-events-none overflow-hidden">
           {/* Top Left */}
           <div className="absolute top-[15%] left-[8%] animate-artemis-card stagger-card-1" style={{ '--rot': '-12deg' } }>
              <div className="h-[240px] w-[170px] rounded-[16px] glass-card p-1.5 transition-transform hover:scale-105 pointer-events-auto rotate-[-12deg] group">
                 <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400" alt="Wedding Detail" className="h-full w-full object-cover rounded-[12px] grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
              </div>
           </div>

           {/* Top Right */}
           <div className="absolute top-[10%] right-[10%] animate-artemis-card stagger-card-2" style={{ '--rot': '15deg' }}>
              <div className="h-[300px] w-[210px] rounded-[16px] glass-card p-1.5 transition-transform hover:scale-105 pointer-events-auto rotate-[15deg] group">
                 <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400" alt="The Couple" className="h-full w-full object-cover rounded-[12px] grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
              </div>
           </div>

           {/* Bottom Left */}
           <div className="absolute bottom-[10%] left-[12%] animate-artemis-card stagger-card-4" style={{ '--rot': '8deg' }}>
              <div className="h-[180px] w-[240px] rounded-[16px] glass-card p-1.5 transition-transform hover:scale-105 pointer-events-auto rotate-[8deg] group">
                 <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400" alt="Wedding Vibe" className="h-full w-full object-cover rounded-[12px] grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
              </div>
           </div>

           {/* Bottom Right */}
           <div className="absolute bottom-[14%] right-[18%] animate-artemis-card stagger-card-3" style={{ '--rot': '-10deg' }}>
              <div className="h-[170px] w-[120px] rounded-[16px] glass-card p-1.5 transition-transform hover:scale-105 pointer-events-auto rotate-[-10deg] group">
                <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=400" alt="Floral" className="h-full w-full object-cover rounded-[12px] grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
              </div>
           </div>
        </div>

        <div className="container relative z-10 mx-auto px-6 text-center">
          <div className="animate-artemis-hero stagger-1 mb-6 inline-block">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff2d55]/70 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/40">
              Weddinginvites Luxury Edition
            </span>
          </div>

          <h1 id="hero-heading" className="animate-artemis-hero stagger-2 mx-auto max-w-4xl text-[38px] italic font-serif leading-[1.05] tracking-[-0.015em] text-[#1a2b5a] sm:text-[68px]">
            Digital & <br className="hidden sm:block" /> <span className="text-[#ff2d55]">High-End</span> Invites
          </h1>

          <p className="animate-artemis-hero stagger-3 mx-auto mt-6 max-w-lg text-[11px] font-black uppercase tracking-[0.3em] text-[#1a2b5a]/60 leading-relaxed">
            weddings can count on!
          </p>

          <div className="animate-artemis-hero stagger-5 mt-10 flex items-center justify-center">
            <button
              onClick={() => navigate('/builder')}
              className="group relative h-[54px] overflow-hidden rounded-full bg-brand-gradient px-10 text-[13px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_20px_40px_-10px_rgba(255,45,85,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-2.5">
                Get Started <span className="text-lg transition-transform group-hover:translate-x-1 duration-300">↗</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section id="published-gallery" aria-labelledby="gallery-heading" className="container mx-auto px-6 py-40">
        <header className="mb-24 text-center">
           <div className="animate-artemis-reveal stagger-1 text-[10px] font-black uppercase tracking-[0.6em] text-[#ff2d55]/40 mb-4">Registry of Love</div>
          <h2 id="gallery-heading" className="font-serif text-[42px] sm:text-[56px] italic text-[#1a2b5a] leading-tight">Featured Collections</h2>
          <p className="mx-auto mt-6 max-w-xl text-[14px] text-[#1a2b5a]/50 font-medium leading-relaxed">
            Explore live invitations created on the platform.
          </p>
        </header>

        {galleryError && (
          <div className="mx-auto mb-16 max-w-2xl rounded-2xl border border-rose-50 bg-rose-50/50 p-6 text-center text-sm font-medium text-[#ff2d55] backdrop-blur-md">
            {galleryError}
          </div>
        )}

        {initialLoading ? (
          <div className="mx-auto grid max-w-7xl gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <GallerySkeleton key={i} />
            ))}
          </div>
        ) : invitations.length === 0 && !galleryError ? (
          <div className="mx-auto max-w-3xl rounded-[32px] glass-card p-20 text-center shadow-sm">
            <h3 className="text-3xl font-serif italic text-[#1a2b5a]">Start Your Collection</h3>
            <p className="mt-4 text-[#1a2b5a]/50">Every wedding begins with a single invitation.</p>
            <button onClick={() => navigate('/builder')} className="mt-10 rounded-full border border-[#ff2d55]/30 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff2d55] transition-all hover:bg-[#ff2d55] hover:text-white">
              Create My First
            </button>
          </div>
        ) : (
          <div className="mx-auto grid max-w-7xl gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {invitations.map((inv) => (
              <GalleryCard
                key={inv._id}
                invitation={inv}
                onOpen={() => navigate(`/invitation/${inv.slug}`)}
              />
            ))}
          </div>
        )}

        <div ref={loaderRef} className="flex min-h-40 items-center justify-center pt-24">
          {loadingMore && <div className="h-6 w-6 border-2 border-[#ff2d55] border-t-transparent animate-spin rounded-full" />}
          {!loadingMore && !hasMore && invitations.length > 0 && (
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff2d55]/20">
              End of Gallery
            </div>
          )}
        </div>
      </section>

      {/* FEATURES SECTION — Luxury Layout */}
      <section aria-labelledby="features-heading" className="bg-white/30 backdrop-blur-3xl py-40 border-t border-white/40">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-20 md:grid-cols-3">
            {[
              { icon: Heart, title: 'No Login Required', text: 'Start crafting immediately. Frictionless flow for you and your guests.' },
              { icon: Share2, title: 'Instantly Shareable', text: 'One click to publish. A stunning, private link ready for WhatsApp & Socials.' },
              { icon: Sparkles, title: 'Media Rich', text: 'Support for high-res galleries, ambient music, and cinematic video.' }
            ].map((feature, i) => (
              <article key={i} className="text-left group">
                <div className="mb-10 w-16 h-16 flex items-center justify-center rounded-[20px] glass-card text-[#ff2d55] group-hover:scale-110 transition-all duration-500">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-6 text-3xl font-serif italic text-[#1a2b5a]">{feature.title}</h3>
                <p className="text-[14px] leading-relaxed text-[#1a2b5a]/60 font-medium">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
