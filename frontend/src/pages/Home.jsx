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
    <article className="group overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`${brideName} and ${groomName}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-50 to-white text-slate-500">
            Invitation Preview
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-700 backdrop-blur">
            Published
          </div>
        </div>
      </div>

      <div className="space-y-4 p-7">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{brideName} & {groomName}</h3>
          <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{title}</p>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span className="truncate">{venue}</span>
          </div>
        </div>

        <Button onClick={onOpen} variant="outline" className="w-full rounded-xl border-slate-200 transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600">
          Open Invitation
        </Button>
      </div>
    </article>
  );
}

function GallerySkeleton() {
  return (
    <article className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="space-y-4 p-7">
        <div className="h-8 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        <div className="space-y-2">
          <div className="h-4 animate-pulse rounded bg-slate-100" />
          <div className="h-4 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
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

  const testAPIConnection = async () => {
    try {
      setApiStatus('Testing...');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://wedinvitesv3.onrender.com'}/health`);
      if (response.ok) {
        setApiStatus('Connected. Backend is responding.');
      } else {
        setApiStatus('Backend responded with an error.');
      }
    } catch (error) {
      setApiStatus('Cannot connect to backend. Check if the server is running.');
    }
  };

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
    <main className="min-h-screen bg-slate-50 pb-20">
      <section aria-labelledby="hero-heading" className="relative overflow-hidden rounded-b-[64px] bg-slate-900 pb-48 pt-32 text-center text-white shadow-2xl lg:pb-64 lg:pt-48">
        <div className="absolute inset-0 bg-[url('/swiss-wedding.png')] bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" aria-hidden="true" />
        <div className="absolute inset-0 bg-emerald-900/10 mix-blend-multiply" aria-hidden="true" />

        <div className="container relative z-10 mx-auto flex flex-col items-center px-4">
          <div className="mb-8 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/30 bg-black/40 px-5 py-2.5 text-sm font-medium text-emerald-100 shadow-lg backdrop-blur-md transition-all hover:bg-black/50">
            <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden="true" /> Welcome to the Future of Wedding Invites
          </div>

          <h1 id="hero-heading" className="mx-auto max-w-5xl text-5xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-xl sm:text-7xl lg:text-8xl">
            Your dream invitation.<br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent drop-shadow-sm">
              Designed in minutes.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-slate-200 drop-shadow-md sm:text-xl">
            Create, customize, and share breathtaking digital wedding invitations. No coding, no downloads, just pure elegance delivered instantly to your guests.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Button onClick={() => navigate('/builder')} className="group rounded-full border-0 bg-white px-8 py-6 text-lg font-bold text-slate-950 shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)] transition-all hover:scale-105 hover:bg-emerald-50 active:scale-95" aria-label="Start designing your wedding invitation">
              Start Designing <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
            <Button onClick={() => document.getElementById('published-gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} variant="outline" className="glass-effect-dark rounded-full border-white/40 px-8 py-6 text-lg text-white shadow-lg transition-all hover:bg-white/20 hover:text-white" aria-label="View published invitation gallery">
              <PlayCircle className="mr-2 h-5 w-5" aria-hidden="true" /> View Gallery
            </Button>
            <Button onClick={testAPIConnection} variant="outline" className="glass-effect-dark rounded-full border-white/40 px-8 py-6 text-lg text-white shadow-lg transition-all hover:bg-white/20 hover:text-white" aria-label="Test API connection">
              Test API Connection
            </Button>
          </div>

          {apiStatus && (
            <div className="mt-4 rounded-lg bg-white/20 p-4 font-medium text-white backdrop-blur-sm">
              {apiStatus}
            </div>
          )}
        </div>
      </section>

      <section id="published-gallery" aria-labelledby="gallery-heading" className="container mx-auto px-4 py-32">
        <header className="mb-20 text-center">
          <h2 id="gallery-heading" className="text-4xl font-extrabold tracking-tight text-slate-900">Published Invitations</h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl font-light text-slate-500">
            Browse live invitations created on the platform. Scroll to load more published designs.
          </p>
        </header>

        {galleryError && (
          <div className="mx-auto mb-10 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700">
            {galleryError}
          </div>
        )}

        {initialLoading ? (
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <GallerySkeleton key={index} />
            ))}
          </div>
        ) : invitations.length === 0 && !galleryError ? (
          <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white px-8 py-14 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">No published invitations yet</h3>
            <p className="mt-3 text-slate-500">Publish an invitation from the builder and it will appear here automatically.</p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {invitations.map((invitation) => (
              <GalleryCard
                key={invitation._id}
                invitation={invitation}
                onOpen={() => navigate(`/invitation/${invitation.slug}`)}
              />
            ))}
          </div>
        )}

        <div ref={loaderRef} className="flex min-h-20 items-center justify-center pt-12">
          {loadingMore && <div className="text-sm font-medium text-slate-500">Loading more invitations...</div>}
          {!loadingMore && !hasMore && invitations.length > 0 && <div className="text-sm font-medium text-slate-400">You have reached the end of the gallery.</div>}
        </div>
      </section>

      <section aria-labelledby="features-heading" className="relative mx-4 mb-20 overflow-hidden rounded-[64px] border border-slate-100 bg-white py-24 shadow-2xl lg:mx-8">
        <div className="absolute inset-0 bg-[url('/floral-frame.png')] bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105" aria-hidden="true" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" aria-hidden="true" />

        <div className="container relative z-10 mx-auto max-w-6xl px-4">
          <header className="mb-16 text-center lg:mb-28">
            <h2 id="features-heading" className="mb-6 text-5xl font-serif leading-[1.1] text-slate-800 drop-shadow-sm md:text-7xl">
              Flawless elegance. <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text font-light italic text-transparent">
                Effortlessly crafted.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg font-light text-slate-600">
              Discover the intuitive tools that transform your vision into a digital masterpiece.
            </p>
          </header>

          <div className="mt-auto grid gap-8 md:grid-cols-3 md:gap-12">
            <article className="group rounded-[32px] border border-white/50 bg-white/70 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all hover:-translate-y-2 hover:border-emerald-200 hover:bg-white/90">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm transition-transform duration-500 group-hover:scale-110">
                <Heart className="h-8 w-8 text-emerald-600" aria-hidden="true" />
              </div>
              <h3 className="mb-4 font-display text-2xl font-bold text-slate-800 transition-colors group-hover:text-emerald-700">No Login Required</h3>
              <p className="text-sm font-light leading-relaxed text-slate-600">Frictionless flow ensures you or your clients can start building immediately without hurdles.</p>
            </article>
            <article className="group rounded-[32px] border border-white/50 bg-white/70 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all hover:-translate-y-2 hover:border-blue-200 hover:bg-white/90">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-100 to-blue-50 shadow-sm transition-transform duration-500 group-hover:scale-110">
                <Share2 className="h-8 w-8 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="mb-4 font-display text-2xl font-bold text-slate-800 transition-colors group-hover:text-blue-700">Instantly Shareable</h3>
              <p className="text-sm font-light leading-relaxed text-slate-600">Publish your invitation with one click and share a beautiful link with all your guests.</p>
            </article>
            <article className="group rounded-[32px] border border-white/50 bg-white/70 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all hover:-translate-y-2 hover:border-violet-200 hover:bg-white/90">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-100 to-violet-50 shadow-sm transition-transform duration-500 group-hover:scale-110">
                <Sparkles className="h-8 w-8 text-violet-600" aria-hidden="true" />
              </div>
              <h3 className="mb-4 font-display text-2xl font-bold text-slate-800 transition-colors group-hover:text-violet-700">Media Rich Experience</h3>
              <p className="text-sm font-light leading-relaxed text-slate-600">Support for stunning high-res galleries, ambient background music, and video messages.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
