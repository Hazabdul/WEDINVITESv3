import React, { useEffect, useState } from 'react';
import { TemplateRenderer } from '../components/preview/TemplateRenderer';
import { InvitationCover } from '../components/preview/InvitationCover';
import { RSVPSection } from '../components/preview/RSVPSection';
import { cn } from '../utils/cn';

export function LivePreviewReceiver() {
  const [data, setData] = useState(null);
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'UPDATE_PREVIEW') {
        setData(event.data.payload);
      }
    };
    window.addEventListener('message', handleMessage);
    // Tell parent we are ready
    if (window.parent) {
      window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
    }
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!isOpened) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpened]);

  // When data changes, if cover is closed, we might want to keep it closed or open it. 
  // For preview, it's better to keep it open if it was already opened.

  if (!data) {
    return null;
  }

  const brideName = data.couple?.bride || data.brideName || '';
  const groomName = data.couple?.groom || data.groomName || '';
  const theme = data.theme || { id: 'ceremony' };

  const templateData = {
    couple: data.couple || {
      bride: brideName,
      groom: groomName,
      title: '',
    },
    event: data.event || {},
    family: data.family || {},
    content: data.content || {},
    theme,
    events: data.events || [],
    media: data.media || { gallery: [] },
    positions: data.positions || {},
  };

  const pageBg = theme.id === 'mountain' ? 'bg-[#f5ede0]' : theme.id === 'noir' ? 'bg-black' : 'bg-slate-50';

  return (
    <div className={cn("min-h-screen w-full max-w-[100vw] overflow-x-hidden transition-colors duration-1000", pageBg)}>
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
          attendanceResponse={null}
          onResponse={() => { }}
        />
      </div>
    </div>
  );
}
