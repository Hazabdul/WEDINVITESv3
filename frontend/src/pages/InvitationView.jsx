import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, PartyPopper, AlertCircle } from 'lucide-react';
import { TemplateRenderer } from '../components/preview/TemplateRenderer';
import apiClient from '../utils/api';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { InvitationCover } from '../components/preview/InvitationCover';
import { RSVPSection } from '../components/preview/RSVPSection';

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
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    // Lock scroll if cover is active
    if (!isOpened) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpened]);

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
    events: invitation.events || [],
    media: invitation.media || { gallery: [] },
    positions: invitation.positions || {},
  };

  const pageBg = theme.id === 'mountain' ? 'bg-[#f5ede0]' : theme.id === 'noir' ? 'bg-black' : 'bg-slate-50';

  return (
    <div className={cn("min-h-screen transition-colors duration-1000", pageBg)}>
      {!isOpened && (
        <InvitationCover
          bride={brideName}
          groom={groomName}
          onOpen={() => setIsOpened(true)}
        />
      )}

      <div className={cn(
        "transition-opacity duration-1000",
        isOpened ? "opacity-100" : "opacity-0"
      )}>
        <div className="mx-auto w-full">
          <TemplateRenderer
            type={theme.id || theme.templateId || 'ceremony'}
            data={templateData}
            isPreview={false}
            className="w-full"
          />
        </div>

        <RSVPSection
          attendanceResponse={attendanceResponse}
          onResponse={(res) => {
            setAttendanceResponse(res);
            if (res === 'accepted') {
              setShowCelebrate(true);
              playCelebrationTone();
            } else {
              setShowCelebrate(false);
            }
          }}
        />
      </div>
    </div>
  );
}
