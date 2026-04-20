import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, CheckCircle2, PartyPopper, AlertCircle } from 'lucide-react';
import { TemplateRenderer } from '../components/preview/TemplateRenderer';
import apiClient from '../utils/api';
import { Button } from '../components/ui/Button';

function playCelebrationTone() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const startAt = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99];

  notes.forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.02 + index * 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.26 + index * 0.04);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startAt + index * 0.06);
    oscillator.stop(startAt + 0.32 + index * 0.06);
  });
}

export function InvitationView() {
  const { slug } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceResponse, setAttendanceResponse] = useState(null);
  const [showCelebrate, setShowCelebrate] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getPublicInvitation(slug);
        setInvitation(data);
      } catch (err) {
        setError('This invitation is not available right now.');
        console.error('Failed to fetch invitation:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchInvitation();
    }
  }, [slug]);

  useEffect(() => {
    if (!showCelebrate) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowCelebrate(false);
    }, 1600);

    return () => window.clearTimeout(timeoutId);
  }, [showCelebrate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-rose-500"></div>
          <p className="text-slate-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900">Invitation Not Found</h1>
          <p className="mb-6 text-slate-600">{error || 'This invitation may have been removed or the link is incorrect.'}</p>
          <Button onClick={() => { window.location.href = '/'; }}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const brideName = invitation.brideName || invitation.couple?.bride || '';
  const groomName = invitation.groomName || invitation.couple?.groom || '';
  const theme = invitation.theme || { id: 'ceremony' };

  const handleAccept = () => {
    setAttendanceResponse('accepted');
    setShowCelebrate(true);
    playCelebrationTone();
  };

  const handleDecline = () => {
    setAttendanceResponse('declined');
    setShowCelebrate(false);
  };

  const templateData = {
    couple: invitation.couple || {
      bride: brideName,
      groom: groomName,
      title: '',
    },
    event: invitation.event || {},
    family: invitation.family || {},
    content: invitation.content || {},
    theme,
    media: invitation.media || { gallery: [] },
    positions: invitation.positions || {},
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-800">
              <Heart className="h-4 w-4" />
              You're Invited
            </div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">
              {brideName} & {groomName}
            </h1>
            <p className="text-slate-600">{invitation.couple?.title || 'Wedding Invitation'}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <TemplateRenderer
          type={theme.id || theme.templateId || 'ceremony'}
          data={templateData}
          isPreview={false}
          className="overflow-hidden rounded-2xl shadow-2xl"
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">Will You Attend?</h2>
          <p className="mb-6 text-slate-600">
            Let the couple know whether you will be joining their celebration.
          </p>

          <div className="relative min-h-14">
            {showCelebrate && (
              <div className="pointer-events-none absolute inset-x-0 -top-12 flex justify-center">
                <div className="animate-[popIn_420ms_cubic-bezier(0.22,1,0.36,1)] rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-xl">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    RSVP saved. We cannot wait to celebrate with you.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              className={`px-8 py-3 transition-all duration-300 ${attendanceResponse === 'accepted' ? 'scale-105 bg-emerald-600 shadow-[0_18px_40px_rgba(16,185,129,0.28)] hover:bg-emerald-500' : ''}`}
              onClick={handleAccept}
            >
              <PartyPopper className="h-4 w-4" />
              Yes, I&apos;ll be there
            </Button>
            <Button
              variant="outline"
              className={`px-8 py-3 transition-all duration-300 ${attendanceResponse === 'declined' ? 'border-slate-400 bg-slate-50' : ''}`}
              onClick={handleDecline}
            >
              Sorry, I can&apos;t make it
            </Button>
          </div>

          <style>{`
            @keyframes popIn {
              0% {
                opacity: 0;
                transform: translateY(14px) scale(0.82);
              }
              70% {
                opacity: 1;
                transform: translateY(-4px) scale(1.04);
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
