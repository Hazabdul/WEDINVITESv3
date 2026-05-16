import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Heart,
  Layout,
  LayoutGrid,
  MessageSquare,
  Monitor,
  Palette,
  Play,
  Loader2,
  Plus,
  Send,
  RotateCcw,
  Smartphone,
  Sparkles,
  Trash2,
  Type,
  UploadCloud,
  Wand2,
  Check,
  X,
} from 'lucide-react';
import { useInvitationState } from '../hooks/useInvitationState';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/FormElements';
import { cn } from '../utils/cn';
import { templatesList } from '../data/mockData';
import apiClient from '../utils/api';
import { normalizeMediaUrl } from '../utils/media';
import { AIWizardModal } from '../components/builder/AIWizardModal';

const STEPS = [
  {
    title: 'Couple Info',
    description: 'Start with the names and a warm introduction your guests will see first.',
  },
  {
    title: 'Event Details',
    description: 'Add the main celebration details clearly so guests know exactly when and where to arrive.',
  },
  {
    title: 'Schedule',
    description: 'Lay out the flow of the celebration with simple time blocks.',
  },
  {
    title: 'Media',
    description: 'Upload your cinematic video story and choose the hero images that shape the look of your invitation.',
  },
  {
    title: 'Visibility Settings',
    description: 'Control which sections are displayed in your invitation to match your celebration style.',
  },
  {
    title: 'Preview & Publish',
    description: 'Review the invitation, confirm the essentials, and publish the final link.',
  },
];

const REQUIRED_INVITATION_FIELDS = [
  { step: 0, label: 'Email address', getValue: (data) => data?.event?.email },
  { step: 0, label: 'Bride name', getValue: (data) => data?.couple?.bride },
  { step: 0, label: 'Groom name', getValue: (data) => data?.couple?.groom },
  { step: 0, label: "Bride's parents", getValue: (data) => data?.family?.brideParents },
  { step: 0, label: "Groom's parents", getValue: (data) => data?.family?.groomParents },
  { step: 1, label: 'Date', getValue: (data) => data?.event?.date },
  { step: 1, label: 'Venue', getValue: (data) => data?.event?.venue },
  { step: 1, label: 'Venue address', getValue: (data) => data?.event?.address },
  { step: 1, label: 'Map link', getValue: (data) => data?.event?.mapLink },
  { step: 3, label: 'Banner photo', getValue: (data) => data?.media?.coverImage || data?.media?.coupleImage },
  { step: 3, label: 'Bride photo', getValue: (data) => data?.media?.brideImage },
  { step: 3, label: 'Groom photo', getValue: (data) => data?.media?.groomImage },
];

const VIDEO_UPLOAD_LIMITS = {
  maxLandscapeWidth: 1920,
  maxLandscapeHeight: 1080,
  maxPortraitWidth: 1080,
  maxPortraitHeight: 1920,
  maxBitrate720: 2.25,
  maxBitrate1080: 4.5,
};

function readVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
    };

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const metadata = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      };
      cleanup();
      resolve(metadata);
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('Could not read video metadata.'));
    };
    video.src = url;
  });
}

async function validateVideoUpload(file) {
  const metadata = await readVideoMetadata(file);
  const { width, height, duration } = metadata;
  const isPortrait = height > width;
  const fitsResolution = isPortrait
    ? width <= VIDEO_UPLOAD_LIMITS.maxPortraitWidth && height <= VIDEO_UPLOAD_LIMITS.maxPortraitHeight
    : width <= VIDEO_UPLOAD_LIMITS.maxLandscapeWidth && height <= VIDEO_UPLOAD_LIMITS.maxLandscapeHeight;

  if (!fitsResolution) {
    return {
      valid: false,
      message: 'Please upload a 1080p-or-smaller MP4/WebM video.',
    };
  }

  if (Number.isFinite(duration) && duration > 0) {
    const bitrateMbps = (file.size * 8) / duration / 1_000_000;
    const shortEdge = Math.min(width, height);
    const maxBitrate = shortEdge <= 720
      ? VIDEO_UPLOAD_LIMITS.maxBitrate720
      : VIDEO_UPLOAD_LIMITS.maxBitrate1080;

    if (bitrateMbps > maxBitrate) {
      return {
        valid: false,
        message: `Please compress this video to about ${shortEdge <= 720 ? '1-2' : '2-4'} Mbps before uploading.`,
      };
    }
  }

  return { valid: true };
}

function hasRequiredValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function Field({ label, helper, className, children, required = false }) {
  return (
    <label className={cn('block space-y-1', className)}>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </div>
        {helper ? <p className="mt-1 text-[10px] leading-relaxed text-[#94a3b8]">{helper}</p> : null}
      </div>
      {children}
    </label>
  );
}

function TextInput({ label, helper, value, onChange, placeholder, type = 'text', className, required = false, error = false }) {
  return (
    <Field label={label} helper={helper} className={className} required={required}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={cn(
          'w-full rounded-[10px] border bg-[#ffffff] px-3 py-1.5 text-[13px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:bg-white',
          error
            ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
            : 'border-[#e2e8f0] focus:border-[#D4A76A] focus:shadow-[0_0_0_4px_rgba(212,167,106,0.1)]'
        )}
      />
    </Field>
  );
}

function TextAreaInput({ label, helper, value, onChange, placeholder, rows = 4, className, required = false, error = false }) {
  return (
    <Field label={label} helper={helper} className={className} required={required}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={cn(
          'w-full rounded-[10px] border bg-[#ffffff] px-3 py-1.5 text-[13px] leading-relaxed text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:bg-white',
          error
            ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
            : 'border-[#e2e8f0] focus:border-[#D4A76A] focus:shadow-[0_0_0_4px_rgba(212,167,106,0.1)]'
        )}
      />
    </Field>
  );
}

function PreviewFrame({ mode, children }) {
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileScreen = windowWidth < 1024;

  // Always show mobile on small screens, or if specifically requested
  if (mode === 'mobile' || isMobileScreen) {
    return (
      <div className="mx-auto w-[375px] relative">
        <div className="rounded-[40px] border-[12px] border-[#1a1a1a] bg-[#1a1a1a] p-1 shadow-2xl relative z-10">
          <div className="overflow-hidden rounded-[28px] bg-white relative">
            <div className="absolute top-0 inset-x-0 flex items-center justify-center pt-3 z-50 pointer-events-none">
              <div className="h-6 w-32 rounded-full bg-[#1a1a1a]" />
            </div>
            <div className="overflow-y-auto custom-scrollbar-preview rounded-b-[28px] h-[667px]">
              {children}
            </div>
          </div>
        </div>
    </div>
  );
}

  // Otherwise show laptop frame
  return (
    <div className="w-full">
      <div className="mx-auto w-full relative">
        <div className="relative rounded-t-xl border-[8px] border-[#1a1a1a] bg-[#1a1a1a] shadow-2xl overflow-hidden z-10">
          <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <div className="bg-white aspect-[16/10] overflow-hidden">{children}</div>
        </div>
        <div className="relative h-3 w-[106%] -ml-[3%] bg-[#2a2a2a] rounded-b-xl border-t border-white/5 shadow-xl z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-black/40 rounded-b-md" />
        </div>
      </div>
    </div>
  );
}

export function Builder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState(null); // Granular loading state
  const [submitError, setSubmitError] = useState('');
  const [publishedInvitation, setPublishedInvitation] = useState(null);
  const [copied, setCopied] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);
  const [backendHealthError, setBackendHealthError] = useState('');
  // Tracks which required field labels had a failed Next click (red border highlight)
  const [errorFields, setErrorFields] = useState(new Set());

  // AI Feature States
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTone, setAiTone] = useState('romantic');
  const [paletteMood, setPaletteMood] = useState('');
  const [paletteGenerating, setPaletteGenerating] = useState(false);
  const [whatsappGenerating, setWhatsappGenerating] = useState(false);
  const [whatsappStyle, setWhatsappStyle] = useState('formal');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappCopied, setWhatsappCopied] = useState(false);

  const [showWizard, setShowWizard] = useState(false);
  const { data, clearData, updateSection, updateEvent, addEvent, removeEvent, setTemplate } = useInvitationState();

  React.useEffect(() => {
    // Only auto-show wizard once per browser session (not on every page load)
    const alreadyShown = sessionStorage.getItem('wizard_shown_v1');
    if (!alreadyShown && !data?.couple?.bride && !data?.couple?.groom) {
      setShowWizard(true);
      sessionStorage.setItem('wizard_shown_v1', '1');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyWizardDraft = (draft) => {
    Object.entries(draft).forEach(([section, sectionData]) => {
      if (section === 'theme' && sectionData.id) {
        setTemplate(sectionData.id);
        Object.entries(sectionData).forEach(([key, value]) => {
          if (key !== 'id') updateSection('theme', key, value);
        });
      } else if (section === 'events') {
        sectionData.forEach(eventData => {
          addEvent();
        });
      } else if (section !== 'events') {
        Object.entries(sectionData).forEach(([key, value]) => {
          updateSection(section, key, value);
        });
      }
    });
    setCurrentStep(1);
  };

  const iframeRef = React.useRef(null);

  React.useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'PREVIEW_READY') {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_PREVIEW', payload: data }, '*');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [data]);

  React.useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_PREVIEW', payload: data }, '*');
    }
  }, [data]);

  const isLastStep = currentStep === STEPS.length - 1;
  const currentStepMeta = STEPS[currentStep];

  const progressInfo = useMemo(() => {
    const requiredFields = REQUIRED_INVITATION_FIELDS.map((field) => ({
      label: field.label,
      value: field.getValue(data),
    }));

    const filled = requiredFields.filter((field) => hasRequiredValue(field.value)).length;

    return {
      percentage: Math.round((filled / requiredFields.length) * 100),
      missingFields: requiredFields
        .filter((field) => !hasRequiredValue(field.value))
        .map((field) => field.label),
    };
  }, [data]);

  const coverImage = data?.media?.coverImage || data?.media?.coupleImage || '';
  const brideImage = data?.media?.brideImage || '';
  const groomImage = data?.media?.groomImage || '';
  const videoStoryUrl = data?.media?.videoStory || data?.media?.video || '';
  const videoPoster = data?.media?.videoPoster || coverImage || '';
  const handleReplay = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.location.reload();
    }
  };

  const canPublish = progressInfo.missingFields.length === 0;
  // Only the Publish button (last step) can be disabled — Next is never disabled
  const isPublishDisabled = isSubmitting || !canPublish || Boolean(publishedInvitation);

  const previousStep = () => setCurrentStep((step) => Math.max(step - 1, 0));

  /** Validates current-step required fields, shows toasts, highlights empty fields, then advances. */
  const handleNext = () => {
    if (isLastStep) {
      handleSubmitInvitation();
      return;
    }

    const missing = REQUIRED_INVITATION_FIELDS.filter(
      (field) => field.step === currentStep && !hasRequiredValue(field.getValue(data))
    );

    if (missing.length > 0) {
      setErrorFields(new Set(missing.map((f) => f.label)));
      missing.forEach((field) => {
        toast.error(`Please fill the field "${field.label}".`, {
          id: field.label,
        });
      });
      return;
    }

    // Email Validation for Step 0
    if (currentStep === 0) {
      const email = data.event?.email || '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        setErrorFields(new Set(['Email address']));
        toast.error("Please enter a valid email address.");
        return;
      }
    }

    // All good — clear errors and advance
    setErrorFields(new Set());
    setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1));
  };

  /** Removes the red-border highlight as the user types into a previously-failed field. */
  const clearError = (label) => {
    setErrorFields((prev) => {
      const next = new Set(prev);
      next.delete(label);
      return next;
    });
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingField('coverImage');
    try {
      const response = await apiClient.uploadFile(file, 'cover');
      if (response.success) {
        updateSection('media', 'coverImage', response.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSingleImageUpload = async (event, field, label) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    try {
      const response = await apiClient.uploadFile(file, label.toLowerCase().replace(' ', '_'));
      if (response.success) {
        updateSection('media', field, response.url);
      }
    } catch (error) {
      console.error(`${label} upload failed:`, error);
    } finally {
      setUploadingField(null);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const validation = await validateVideoUpload(file);
      if (!validation.valid) {
        toast.error(validation.message);
        event.target.value = '';
        return;
      }
    } catch (error) {
      toast.error(error?.message || 'Could not validate this video file.');
      event.target.value = '';
      return;
    }

    setUploadingField('videoStory');
    try {
      const response = await apiClient.uploadFile(file, 'video_story');
      if (response.success) {
        updateSection('media', 'videoStory', response.url);
        updateSection('media', 'video', response.url);
        if (response.posterUrl) {
          updateSection('media', 'videoPoster', response.posterUrl);
        }
      }
    } catch (error) {
      console.error('Video upload failed:', error);
    } finally {
      setUploadingField(null);
    }
  };

  const handleVenueImageUpload = async (event, eventId, label) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingField(eventId);
    try {
      const response = await apiClient.uploadFile(file, label.toLowerCase().replace(' ', '_'));
      if (response.success) {
        updateEvent(eventId, 'image', response.url);
      }
    } catch (error) {
      console.error(`${label} upload failed:`, error);
    } finally {
      setUploadingField(null);
    }
  };

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadingField('gallery');
    try {
      const uploadPromises = files.map((file) => apiClient.uploadFile(file, 'gallery'));
      const results = await Promise.all(uploadPromises);
      const successfulUrls = results.filter((r) => r.success).map((r) => r.url);

      if (successfulUrls.length > 0) {
        const currentGallery = data.media?.gallery || [];
        updateSection('media', 'gallery', [...currentGallery, ...successfulUrls]);
      }
    } catch (error) {
      console.error('Gallery upload failed:', error);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmitInvitation = async () => {
    if (!data || isSubmitting || !canPublish) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const created = await apiClient.createInvitation({});
      const primaryEvent = {
        id: data.events?.[0]?.id || 'primary-event',
        name: data.events?.[0]?.name?.trim() || 'Wedding Ceremony',
        date: data.events?.[0]?.date || data.event?.date || '',
        time: data.events?.[0]?.time || data.event?.time || '',
        venue: data.events?.[0]?.venue || data.event?.venue || '',
        address: data.events?.[0]?.address || data.event?.address || '',
        notes: data.events?.[0]?.notes || '',
      };
      const additionalEvents = (data.events || [])
        .slice(1)
        .map((item, index) => ({
          id: item.id || `event-${index + 2}`,
          name: item.name?.trim() || '',
          date: item.date || '',
          time: item.time || '',
          venue: item.venue || '',
          address: item.address || '',
          notes: item.notes || '',
        }))
        .filter((item) => item.name);

      const eventsPayload = [
        primaryEvent,
        ...additionalEvents,
      ];

      const invitationData = {
        email: data.event?.email?.toLowerCase().trim() || '',
        brideName: data.couple?.bride || '',
        groomName: data.couple?.groom || '',
        weddingDate: data.event?.date ? new Date(data.event.date) : null,
        couple: data.couple || {},
        event: data.event || {},
        family: data.family || {},
        content: data.content || {},
        theme: data.theme || { id: 'classic' },
        media: {
          ...(data.media || { gallery: [] }),
          coverImage: normalizeMediaUrl(data.media?.coverImage || ''),
          backgroundImage: normalizeMediaUrl(data.media?.backgroundImage || ''),
          brideImage: normalizeMediaUrl(data.media?.brideImage || ''),
          groomImage: normalizeMediaUrl(data.media?.groomImage || ''),
          coupleImage: normalizeMediaUrl(data.media?.coupleImage || ''),
          videoPoster: normalizeMediaUrl(data.media?.videoPoster || ''),
          gallery: (data.media?.gallery || []).map((item) => normalizeMediaUrl(item)).filter(Boolean),
          video: normalizeMediaUrl(data.media?.video || data.media?.videoStory || ''),
          videoStory: normalizeMediaUrl(data.media?.videoStory || data.media?.video || ''),
          music: normalizeMediaUrl(data.media?.music || ''),
        },
        positions: data.positions || {},
        events: eventsPayload,
      };

      const published = await apiClient.publishInvitation(created._id, invitationData);

      setPublishedInvitation({
        id: created._id,
        slug: published.slug,
        shareUrl: `${window.location.origin}/invitation/${published.slug}`,
      });
    } catch (error) {
      console.error('Failed to create invitation:', error);
      setSubmitError(error?.message || 'Publishing failed. Check the backend connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publishedInvitation?.shareUrl) return;
    await navigator.clipboard.writeText(publishedInvitation.shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleCheckBackend = async () => {
    if (checkingBackend) return;
    setCheckingBackend(true);
    setBackendHealthError('');

    try {
      const health = await apiClient.getHealth();
      setBackendHealth(health);
    } catch (error) {
      setBackendHealth(null);
      setBackendHealthError(error?.message || 'Could not reach backend.');
    } finally {
      setCheckingBackend(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-4 border border-purple-100">
              <div>
                <h4 className="text-sm font-bold text-purple-900">AI Magic Setup</h4>
                <p className="text-[11px] text-purple-700">Fill your entire invitation in 3 steps</p>
              </div>
              <button
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-purple-700 shadow-md"
              >
                <Sparkles className="h-3 w-3" />
                Start Wizard
              </button>
            </div>
            <TextInput
              label="Email address"
              placeholder="Email address"
              type="email"
              value={data.event?.email || ''}
              onChange={(e) => { updateSection('event', 'email', e.target.value); clearError('Email address'); }}
              required
              error={errorFields.has('Email address')}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Bride name"
                placeholder="Aaliyah"
                value={data.couple?.bride || ''}
                onChange={(e) => { updateSection('couple', 'bride', e.target.value); clearError('Bride name'); }}
                required
                error={errorFields.has('Bride name')}
              />
              <TextInput
                label="Groom name"
                placeholder="Omar"
                value={data.couple?.groom || ''}
                onChange={(e) => { updateSection('couple', 'groom', e.target.value); clearError('Groom name'); }}
                required
                error={errorFields.has('Groom name')}
              />
            </div>

            <TextInput
              label="Tagline"
              placeholder="Together with their families"
              value={data.couple?.title || ''}
              onChange={(e) => updateSection('couple', 'title', e.target.value)}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Bride's parents"
                placeholder="Mr. & Mrs. Rahman"
                value={data.family?.brideParents || ''}
                onChange={(e) => { updateSection('family', 'brideParents', e.target.value); clearError("Bride's parents"); }}
                required
                error={errorFields.has("Bride's parents")}
              />
              <TextInput
                label="Groom's parents"
                placeholder="Mr. & Mrs. Kareem"
                value={data.family?.groomParents || ''}
                onChange={(e) => { updateSection('family', 'groomParents', e.target.value); clearError("Groom's parents"); }}
                required
                error={errorFields.has("Groom's parents")}
              />
            </div>

            <TextAreaInput
              label="Intro message"
              placeholder="With joy in our hearts, we invite you to celebrate our wedding day."
              value={data.content?.introMessage || ''}
              onChange={(e) => updateSection('content', 'introMessage', e.target.value)}
              rows={5}
            />

            {/* AI Text Writer */}
            <div className="rounded-[14px] border border-dashed border-[#D4A76A]/30 bg-gradient-to-br from-[#fffbf5] to-[#fff8ef] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4A76A]/10">
                  <Sparkles className="h-3.5 w-3.5 text-[#D4A76A]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A76A]">AI Writer</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">Generate a beautiful intro message based on your couple details and preferred tone.</p>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {['romantic', 'formal', 'islamic', 'modern', 'poetic'].map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setAiTone(tone)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all',
                      aiTone === tone
                        ? 'bg-[#D4A76A] text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-500 hover:border-[#D4A76A]/40 hover:text-[#D4A76A]'
                    )}
                  >
                    {tone}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={aiGenerating || (!data.couple?.bride && !data.couple?.groom)}
                onClick={async () => {
                  setAiGenerating(true);
                  try {
                    const result = await apiClient.generateIntroMessage({
                      bride: data.couple?.bride || '',
                      groom: data.couple?.groom || '',
                      tagline: data.couple?.title || '',
                      parents: [data.family?.brideParents, data.family?.groomParents].filter(Boolean).join(' & '),
                      tone: aiTone,
                    });
                    if (result.message) {
                      updateSection('content', 'introMessage', result.message);
                      toast.success('Intro message generated!');
                    }
                  } catch (err) {
                    toast.error(err?.message || 'AI generation failed.');
                  } finally {
                    setAiGenerating(false);
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D4A76A] to-[#B68D40] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {aiGenerating ? 'Generating...' : 'Generate with AI'}
              </button>
              {(!data.couple?.bride && !data.couple?.groom) && (
                <p className="mt-2 text-[10px] text-slate-400 text-center">Fill in bride or groom name first</p>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Date"
                type="date"
                value={data.event?.date || ''}
                onChange={(e) => { updateSection('event', 'date', e.target.value); clearError('Date'); }}
                required
                error={errorFields.has('Date')}
              />
              <TextInput
                label="Time"
                placeholder="07:30 PM"
                value={data.event?.time || ''}
                onChange={(e) => updateSection('event', 'time', e.target.value)}
              />
              <TextInput
                label="Venue"
                placeholder="The Grand Pearl Ballroom"
                value={data.event?.venue || ''}
                onChange={(e) => { updateSection('event', 'venue', e.target.value); clearError('Venue'); }}
                className="md:col-span-2"
                required
                error={errorFields.has('Venue')}
              />
              <TextAreaInput
                label="Location"
                placeholder="King Fahd Road, Riyadh, Saudi Arabia"
                value={data.event?.address || ''}
                onChange={(e) => { updateSection('event', 'address', e.target.value); clearError('Venue address'); }}
                rows={3}
                className="md:col-span-2"
                required
                error={errorFields.has('Venue address')}
              />
              <TextInput
                label="Map link"
                placeholder="https://maps.google.com/..."
                value={data.event?.mapLink || ''}
                onChange={(e) => { updateSection('event', 'mapLink', e.target.value); clearError('Map link'); }}
                className="md:col-span-2"
                required
                error={errorFields.has('Map link')}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-1">
              <div>
                <h3 className="text-xl font-black tracking-tight text-[#0f172a]">Event Schedule</h3>
                <p className="text-[11px] font-medium text-slate-400">Add moments like Nikah, Reception, or Dinner.</p>
              </div>
              <button
                onClick={addEvent}
                className="flex items-center justify-center gap-2 rounded-full bg-[#D4A76A] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#B68D40] active:scale-95"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                Add block
              </button>
            </div>

            {data.events.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">No events added</h4>
                <p className="mt-1 text-xs text-slate-500">Add at least one event like your Wedding Ceremony.</p>
                <Button onClick={addEvent} className="mt-6 bg-[#D4A76A] text-white hover:bg-[#B68D40] transition-colors">Add your first event</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.events.map((eventItem, index) => (
                  <div key={eventItem.id} className="group relative rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4A76A]/10 text-[10px] font-bold text-[#D4A76A]">
                          {index + 1}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          {index === 0 ? 'Primary Event' : 'Additional Event'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeEvent(eventItem.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        title="Remove event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                      <TextInput
                        label="Time"
                        placeholder="07:30 PM"
                        value={eventItem.time || ''}
                        onChange={(e) => {
                          updateEvent(eventItem.id, 'time', e.target.value);
                          if (index === 0) updateSection('event', 'time', e.target.value);
                        }}
                      />
                      <TextInput
                        label="Title"
                        placeholder={index === 0 ? "Wedding Ceremony" : "Nikah / Reception"}
                        value={eventItem.name || ''}
                        onChange={(e) => updateEvent(eventItem.id, 'name', e.target.value)}
                      />
                      <TextInput
                        label="Location"
                        placeholder="The Grand Pearl Ballroom"
                        value={eventItem.venue || ''}
                        onChange={(e) => {
                          updateEvent(eventItem.id, 'venue', e.target.value);
                          if (index === 0) updateSection('event', 'venue', e.target.value);
                        }}
                        className="sm:col-span-2"
                      />
                      <TextAreaInput
                        label="Note"
                        placeholder="Please arrive 30 minutes early."
                        value={eventItem.notes || ''}
                        onChange={(e) => updateEvent(eventItem.id, 'notes', e.target.value)}
                        rows={2}
                        className="sm:col-span-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-6">
              {/* Hero Banner Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Main Banner <span className="text-red-500">*</span></span>
                </div>
                <label className={cn(
                  'group relative flex h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-slate-900 hover:bg-white',
                  uploadingField === 'coverImage' && 'cursor-wait opacity-70'
                )}>
                  {coverImage ? (
                    <>
                      <div className="absolute inset-0 z-0">
                        <img src={normalizeMediaUrl(coverImage)} alt="Banner Preview" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-[2px] opacity-0 transition-all duration-300 group-hover:opacity-100" />
                      </div>
                      <div className="relative z-10 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur-md transition-colors hover:bg-white">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center text-center px-6">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-all group-hover:bg-slate-900 group-hover:text-white">
                        {uploadingField === 'coverImage' ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                      </div>
                      <div className="text-[11px] font-bold tracking-tight text-slate-900">
                        {uploadingField === 'coverImage' ? 'Uploading...' : 'Upload Banner'}
                      </div>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={Boolean(uploadingField)} />
                </label>
              </div>

              {/* Bride & Groom Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bride <span className="text-red-500">*</span></span>
                  <label className={cn(
                    'group relative flex h-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-slate-900 hover:bg-white',
                    uploadingField === 'brideImage' && 'cursor-wait opacity-70'
                  )}>
                    {brideImage ? (
                      <>
                        <div className="absolute inset-0 z-0">
                          <img src={normalizeMediaUrl(brideImage)} alt="Bride Preview" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-[2px] opacity-0 transition-all duration-300 group-hover:opacity-100" />
                        </div>
                        <div className="relative z-10 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur-md transition-colors hover:bg-white">
                            <UploadCloud className="h-4 w-4" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="relative z-10 flex flex-col items-center text-center px-4">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-all group-hover:bg-slate-900 group-hover:text-white">
                          {uploadingField === 'brideImage' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                        </div>
                        <div className="text-[10px] font-bold tracking-tight text-slate-900">
                          {uploadingField === 'brideImage' ? 'Uploading...' : 'Upload Bride'}
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleSingleImageUpload(event, 'brideImage', 'Bride image')}
                      disabled={Boolean(uploadingField)}
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Groom <span className="text-red-500">*</span></span>
                  <label className={cn(
                    'group relative flex h-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-slate-900 hover:bg-white',
                    uploadingField === 'groomImage' && 'cursor-wait opacity-70'
                  )}>
                    {groomImage ? (
                      <>
                        <div className="absolute inset-0 z-0">
                          <img src={normalizeMediaUrl(groomImage)} alt="Groom Preview" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-[2px] opacity-0 transition-all duration-300 group-hover:opacity-100" />
                        </div>
                        <div className="relative z-10 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur-md transition-colors hover:bg-white">
                            <UploadCloud className="h-4 w-4" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="relative z-10 flex flex-col items-center text-center px-4">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-all group-hover:bg-slate-900 group-hover:text-white">
                          {uploadingField === 'groomImage' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                        </div>
                        <div className="text-[10px] font-bold tracking-tight text-slate-900">
                          {uploadingField === 'groomImage' ? 'Uploading...' : 'Upload Groom'}
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleSingleImageUpload(event, 'groomImage', 'Groom image')}
                      disabled={Boolean(uploadingField)}
                    />
                  </label>
                </div>
              </div>

              {/* Video Story Section */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Video Story</span>
                <label className={cn(
                  'group relative flex h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-slate-900 hover:bg-white',
                  uploadingField === 'videoStory' && 'cursor-wait opacity-70'
                )}>
                  {videoStoryUrl ? (
                    <>
                      <div className="absolute inset-0 z-0">
                        <video
                          src={normalizeMediaUrl(videoStoryUrl)}
                          className="h-full w-full object-cover"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          poster={videoPoster ? normalizeMediaUrl(videoPoster) : undefined}
                          onMouseOver={(e) => e.target.play()}
                          onMouseOut={(e) => e.target.pause()}
                        />
                        <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-[2px] opacity-0 transition-all duration-300 group-hover:opacity-100" />
                      </div>
                      <div className="relative z-10 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur-md transition-colors hover:bg-white">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center text-center px-6">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-all group-hover:bg-slate-900 group-hover:text-white">
                        {uploadingField === 'videoStory' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Upload Cinematic Video</h4>
                      <p className="mt-1 text-[10px] text-slate-500">Share your journey with a short story video.</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    className="hidden"
                    onChange={handleVideoUpload}
                    disabled={Boolean(uploadingField)}
                  />
                </label>
              </div>

              {/* Venue Portfolios Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Venue</span>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {(data.events || []).map((eventItem, index) => {
                    const galleryImages = data.media?.gallery || [];
                    const fallbackImages = [
                      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80",
                      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80",
                      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
                    ];

                    const displayImage = eventItem.image || galleryImages[index] || fallbackImages[index % fallbackImages.length];
                    const isActualVenueImage = Boolean(eventItem.image);

                    return (
                      <div key={eventItem.id} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-sm">
                        <img
                          src={normalizeMediaUrl(displayImage)}
                          alt="Venue"
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Upload Overlay (on hover) */}
                        <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                          <label className="inline-flex cursor-pointer p-1.5 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors">
                            {uploadingField === eventItem.id ? <Loader2 className="h-3 w-3 animate-spin text-slate-600" /> : <UploadCloud className="h-3 w-3 text-slate-600" />}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => handleVenueImageUpload(event, eventItem.id, `${eventItem.name || 'Venue'} image`)}
                              disabled={Boolean(uploadingField)}
                            />
                          </label>
                        </div>

                        {/* Remove Button (only if custom image is uploaded) */}
                        {isActualVenueImage && (
                          <button
                            onClick={() => updateEvent(eventItem.id, 'image', '')}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-md transition-all hover:bg-red-500 group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gallery Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gallery Collection</span>
                    {data.media?.gallery?.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                        {data.media.gallery.length} Images
                      </span>
                    )}
                  </div>
                  {data.media?.gallery?.length > 0 && (
                    <button
                      onClick={() => updateSection('media', 'gallery', [])}
                      className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {/* Existing Gallery Images */}
                  {(data.media?.gallery || []).map((url, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-sm">
                      <img
                        src={normalizeMediaUrl(url)}
                        alt={`Gallery ${i}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const newGallery = [...data.media.gallery];
                          newGallery.splice(i, 1);
                          updateSection('media', 'gallery', newGallery);
                        }}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-md transition-all hover:bg-red-500 group-hover:opacity-100"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add More Moments Button */}
                  <label className={cn(
                    'group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-slate-900 hover:bg-white',
                    uploadingField === 'gallery' && 'cursor-wait opacity-70'
                  )}>
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-all group-hover:bg-slate-900 group-hover:text-white">
                        {uploadingField === 'gallery' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      </div>
                    </div>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={Boolean(uploadingField)} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Template Selection Section */}
            <div className="rounded-[15px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Choose Template</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {templatesList.map((template) => {
                  const selected = data.theme?.id === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setTemplate(template.id)}
                      className={cn(
                        "group relative aspect-[4/5] overflow-hidden rounded-lg border-2 transition-all",
                        selected ? "border-[#D4A76A] ring-4 ring-[#D4A76A]/10" : "border-slate-50 grayscale hover:grayscale-0 hover:border-slate-200"
                      )}
                    >
                      <img src={template.previewImage} alt={template.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-8 pb-2 px-2">
                        <p className="text-[8px] font-black text-white uppercase tracking-[0.15em] truncate text-center drop-shadow-sm">{template.name}</p>
                      </div>
                      {selected && (
                        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4A76A] text-white shadow-lg">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Color Palette Generator */}
            <div className="rounded-[15px] border border-dashed border-purple-200/60 bg-gradient-to-br from-purple-50/30 to-pink-50/30 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100">
                  <Palette className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">AI Palette</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-4">Describe a mood and AI will generate a complete 6-color theme for your invitation.</p>
              <input
                type="text"
                value={paletteMood}
                onChange={(e) => setPaletteMood(e.target.value)}
                placeholder='e.g. "golden sunset", "midnight garden", "ocean breeze"'
                className="w-full rounded-[10px] border border-purple-200/50 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-purple-400 focus:shadow-[0_0_0_4px_rgba(147,51,234,0.06)] mb-3"
              />
              <button
                type="button"
                disabled={paletteGenerating || !paletteMood.trim()}
                onClick={async () => {
                  setPaletteGenerating(true);
                  try {
                    const result = await apiClient.generateColorPalette({
                      mood: paletteMood.trim(),
                      templateId: data.theme?.id || 'classic',
                    });
                    if (result.palette) {
                      Object.entries(result.palette).forEach(([key, value]) => {
                        updateSection('theme', key, value);
                      });
                      toast.success('Color palette applied!');
                    }
                  } catch (err) {
                    toast.error(err?.message || 'Palette generation failed.');
                  } finally {
                    setPaletteGenerating(false);
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paletteGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {paletteGenerating ? 'Generating...' : 'Generate Palette'}
              </button>

              {/* Live preview of current palette */}
              {data.theme?.primaryColor && (
                <div className="mt-4 flex items-center gap-2">
                  {['primaryColor', 'secondaryColor', 'headingColor', 'subheadingColor', 'bodyColor', 'metaColor'].map((key) => (
                    <div key={key} className="group relative flex-1">
                      <div
                        className="aspect-square rounded-lg border border-white/50 shadow-sm transition-transform hover:scale-110"
                        style={{ backgroundColor: data.theme?.[key] || '#ccc' }}
                      />
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform text-[7px] font-bold text-slate-400 whitespace-nowrap">
                        {key.replace('Color', '')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[15px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Section Visibility</span>
              </div>
              <div className="grid gap-3">
                <Toggle
                  label="Show Bride & Groom Portraits"
                  checked={data.theme?.showPortraits !== false}
                  onChange={() => updateSection('theme', 'showPortraits', data.theme?.showPortraits === false)}
                  className="border-slate-100 bg-slate-50/50"
                />
                <Toggle
                  label="Show Video Story"
                  checked={data.theme?.showVideo !== false}
                  onChange={() => updateSection('theme', 'showVideo', data.theme?.showVideo === false)}
                  className="border-slate-100 bg-slate-50/50"
                />
                <Toggle
                  label="Show Schedule Section"
                  checked={data.theme?.showSchedule !== false}
                  onChange={() => updateSection('theme', 'showSchedule', data.theme?.showSchedule === false)}
                  className="border-slate-100 bg-slate-50/50"
                />
                <Toggle
                  label="Show Gallery Collection"
                  checked={data.theme?.showGallery !== false}
                  onChange={() => updateSection('theme', 'showGallery', data.theme?.showGallery === false)}
                  className="border-slate-100 bg-slate-50/50"
                />
                <Toggle
                  label="Show Countdown Timer"
                  checked={data.theme?.showCountdown !== false}
                  onChange={() => updateSection('theme', 'showCountdown', data.theme?.showCountdown === false)}
                  className="border-slate-100 bg-slate-50/50"
                />
                <Toggle
                  label="Show Map & Location"
                  checked={data.theme?.showMap !== false}
                  onChange={() => updateSection('theme', 'showMap', data.theme?.showMap === false)}
                  className="border-slate-100 bg-slate-50/50"
                />
                <Toggle
                  label="Show Banner"
                  checked={data.theme?.showRSVP !== false}
                  onChange={() => updateSection('theme', 'showRSVP', data.theme?.showRSVP === false)}
                  className="border-slate-100 bg-slate-50/50"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="rounded-[12px] border border-[#f1f5f9] bg-[linear-gradient(135deg,#ffffff_0%,#f8f2ea_100%)] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#94a3b8]">Final review</div>
                  <h3 className="mt-2 text-2xl font-semibold text-[#0f172a]">{data.couple?.bride || 'Bride'} & {data.couple?.groom || 'Groom'}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#64748b]">{data.couple?.title || 'Wedding Invitation'}</p>
                </div>
                <div className="rounded-full border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-medium text-[#334155]">
                  {progressInfo.percentage}% ready
                </div>
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1">
              {/* Event Details */}
              <div className="rounded-[12px] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-[#0f172a]"><CalendarDays className="h-4 w-4 text-slate-400" /> Event Details</div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Date</div>
                    <div className="text-[13px] font-bold text-slate-700">{data.event?.date || 'Not set'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Time</div>
                    <div className="text-[13px] font-bold text-slate-700">{data.event?.time || 'Not set'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Venue</div>
                    <div className="text-[13px] font-bold text-slate-700">{data.event?.venue || 'Not set'}</div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Address</div>
                    <div className="text-[13px] font-bold text-slate-700">{data.event?.address || 'Not set'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Maps Link</div>
                    <div className="text-[13px] font-bold text-slate-700">{data.event?.mapLink ? 'Attached' : 'Missing'}</div>
                  </div>
                </div>
              </div>

              {/* Family Details */}
              <div className="rounded-[12px] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-[#0f172a]"><Heart className="h-4 w-4 text-slate-400" /> Family Details</div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="inline-block px-2 py-0.5 rounded bg-pink-50 text-[9px] font-black uppercase tracking-wider text-pink-600">Bride's Side</div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Parents</div>
                      <div className="text-[13px] font-bold text-slate-700">{data.family?.brideParents || 'Not set'}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="inline-block px-2 py-0.5 rounded bg-blue-50 text-[9px] font-black uppercase tracking-wider text-blue-600">Groom's Side</div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Parents</div>
                      <div className="text-[13px] font-bold text-slate-700">{data.family?.groomParents || 'Not set'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Textual Content */}
              <div className="rounded-[12px] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-[#0f172a]"><Type className="h-4 w-4 text-slate-400" /> Additional Content</div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Intro Message</div>
                    <div className="text-[13px] font-bold text-slate-700 leading-relaxed">{data.content?.introMessage || 'Empty'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Ceremony Note</div>
                    <div className="text-[13px] font-bold text-slate-700 leading-relaxed">{data.events?.[0]?.notes || 'Empty'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">RSVP Text</div>
                    <div className="text-[13px] font-bold text-slate-700 leading-relaxed">{data.content?.rsvpText || 'Empty'}</div>
                  </div>
                </div>
              </div>

              {/* Visibility Status */}
              <div className="rounded-[12px] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-[#0f172a]"><Layout className="h-4 w-4 text-slate-400" /> Section Visibility</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { label: 'Portraits', key: 'showPortraits' },
                    { label: 'Video', key: 'showVideo' },
                    { label: 'Schedule', key: 'showSchedule' },
                    { label: 'Gallery', key: 'showGallery' },
                    { label: 'Countdown', key: 'showCountdown' },
                    { label: 'RSVP Banner', key: 'showRSVP' }
                  ].map(sec => {
                    const active = data.theme?.[sec.key] !== false;
                    return (
                      <div key={sec.key} className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
                        active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100 line-through"
                      )}>
                        {active ? <CheckCircle2 className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {sec.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {submitError ? (
              <div className="rounded-[10px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</div>
            ) : null}

            {publishedInvitation && (
              <div className="space-y-5 rounded-[12px] border border-[#a7f3d0] bg-emerald-50 p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#059669]/10 text-[#059669]">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#064e3b]">Invitation published</h4>
                    <p className="mt-1 text-sm text-[#047857]">Your live boutique link is ready to share.</p>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#a7f3d0]/60 bg-white/80 p-4 backdrop-blur-sm shadow-inner">
                  <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#059669]">Public URL</div>
                  <div className="mt-2 break-all font-mono text-[13px] text-[#064e3b]">{publishedInvitation.shareUrl}</div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={handleCopyLink} variant="outline" className="flex-1 border-[#a7f3d0] bg-white text-[#065f46] hover:bg-emerald-100">
                    <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy link'}
                  </Button>
                  <Button
                    onClick={() => window.open(publishedInvitation.shareUrl, '_blank')}
                    className="flex-1 bg-emerald-900 text-white hover:shadow-lg hover:shadow-emerald-900/10 transition-all font-bold tracking-wide"
                  >
                    <ExternalLink className="h-4 w-4" /> Open invitation
                  </Button>
                </div>

                {/* AI WhatsApp Message Drafter */}
                <div className="rounded-[12px] border border-[#a7f3d0]/60 bg-white/80 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366]/10">
                      <MessageSquare className="h-3.5 w-3.5 text-[#25D366]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#25D366]">WhatsApp Message</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">Generate a ready-to-share WhatsApp message with your invitation link.</p>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {['formal', 'casual', 'fun'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setWhatsappStyle(style)}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all',
                          whatsappStyle === style
                            ? 'bg-[#25D366] text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-500 hover:border-[#25D366]/40 hover:text-[#25D366]'
                        )}
                      >
                        {style}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={whatsappGenerating}
                    onClick={async () => {
                      setWhatsappGenerating(true);
                      setWhatsappMessage('');
                      try {
                        const result = await apiClient.generateWhatsAppMessage({
                          bride: data.couple?.bride || '',
                          groom: data.couple?.groom || '',
                          date: data.event?.date || '',
                          venue: data.event?.venue || '',
                          shareUrl: publishedInvitation.shareUrl,
                          style: whatsappStyle,
                        });
                        if (result.message) {
                          setWhatsappMessage(result.message);
                          toast.success('WhatsApp message generated!');
                        }
                      } catch (err) {
                        toast.error(err?.message || 'WhatsApp generation failed.');
                      } finally {
                        setWhatsappGenerating(false);
                      }
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-md transition-all hover:bg-[#1DA851] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {whatsappGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                    {whatsappGenerating ? 'Drafting...' : 'Generate WhatsApp Message'}
                  </button>

                  {whatsappMessage && (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-[10px] border border-[#25D366]/20 bg-[#DCF8C6]/30 p-4">
                        <pre className="whitespace-pre-wrap text-[13px] text-slate-800 font-sans leading-relaxed">{whatsappMessage}</pre>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(whatsappMessage);
                          setWhatsappCopied(true);
                          toast.success('Message copied!');
                          setTimeout(() => setWhatsappCopied(false), 1800);
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-[#25D366]/30 bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#25D366] transition-all hover:bg-[#DCF8C6]/20 active:scale-95"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {whatsappCopied ? 'Copied!' : 'Copy Message'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-silk">
      {/* Premium Builder Header */}
      <header className="sticky top-0 z-[60] border-b border-gray-100 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="shrink-0 transition-transform active:scale-95">
              <img src="/logo_black.webp" alt="Logo" decoding="async" className="h-7 w-auto" />
            </Link>

            <div className="h-4 w-[1.5px] bg-gray-100" />

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-slate-900"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/templates"
              className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 shadow-sm transition-all hover:border-slate-200 hover:bg-slate-50 active:scale-95"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Templates</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1620px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {backendHealthError ? (
          <div className="mb-6 rounded-[10px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {backendHealthError}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)] xl:gap-8">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-[14px] border border-gray-100 bg-white shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)]">
              <div className="border-b border-[#e2e8f0] bg-white/80 px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#94a3b8]/70">Step {currentStep + 1} of {STEPS.length}</span>
                    <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">{currentStepMeta.title}</h2>
                    <p className="text-[11px] leading-relaxed text-[#64748b] max-w-md">{currentStepMeta.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCheckBackend}
                      className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e2e8f0] bg-white transition-all hover:border-[#94a3b8] hover:bg-white"
                      title="Backend Status"
                    >
                      <Sparkles className={cn("h-4 w-4 transition-colors", backendHealth?.status === 'ok' ? "text-emerald-500" : "text-[#94a3b8]/40")} />
                      <span className="absolute -bottom-6 scale-0 text-[8px] font-bold uppercase tracking-widest text-[#94a3b8] transition-all group-hover:scale-100 whitespace-nowrap">Status</span>
                    </button>

                    <button
                      onClick={clearData}
                      className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e2e8f0] bg-white transition-all hover:border-red-200 hover:bg-red-50"
                      title="Reset Section"
                    >
                      <Trash2 className="h-4 w-4 text-[#0f172a]/40 transition-colors group-hover:text-red-500/70" />
                      <span className="absolute -bottom-6 scale-0 text-[8px] font-bold uppercase tracking-widest text-red-500/70 transition-all group-hover:scale-100">Reset</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="h-1 flex-1 rounded-full bg-slate-100/50 overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-1000 ease-in-out shadow-sm",
                        currentStep === 0 ? "bg-red-500" :
                          currentStep < STEPS.length - 1 ? "bg-amber-500" :
                            "bg-emerald-500"
                      )}
                      style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    />
                  </div>
                  <div className={cn(
                    "text-[10px] font-black tracking-tighter whitespace-nowrap",
                    currentStep === 0 ? "text-red-500" :
                      currentStep < STEPS.length - 1 ? "text-amber-600" :
                        "text-emerald-600"
                  )}>
                    {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
                  </div>
                </div>
              </div>

              <div className="flex flex-col xl:min-h-[780px]">
                <div className="flex-1 px-4 py-4 sm:px-6">{renderStepContent()}</div>

                <div className="sticky bottom-0 mt-auto border-t border-gray-100 bg-white/95 px-4 py-4 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.05)] backdrop-blur sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      variant="outline"
                      onClick={previousStep}
                      disabled={currentStep === 0}
                      className="w-full border-gray-200 bg-white text-slate-700 hover:bg-slate-50 sm:w-auto"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                      <Button
                        onClick={handleNext}
                        disabled={isLastStep ? isPublishDisabled : false}
                        className="w-full min-w-[180px] bg-gradient-to-r from-[#D4A76A] to-[#B68D40] px-7 py-2.5 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-900/20 sm:w-auto"
                      >
                        {isLastStep ? (
                          publishedInvitation ? (
                            'Published'
                          ) : isSubmitting ? (
                            'Publishing...'
                          ) : (
                            <>
                              <Send className="h-4 w-4" /> Publish
                            </>
                          )
                        ) : (
                          <>
                            Next <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="xl:sticky xl:top-24">
              <div className="overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,#ffffff_0%,#f4ede4_100%)] border border-gray-100 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)]">
                <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 border-b border-gray-100/50 bg-white/50 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-medium tracking-tight text-[#0f172a] italic font-serif">Live Preview</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleReplay}
                      className="group flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-slate-500 transition-all hover:text-[#0f172a]"
                      title="Replay entrance experience"
                    >
                      <RotateCcw className="h-3.5 w-3.5 transition-transform group-hover:rotate-[-45deg]" />
                      <span>Replay</span>
                    </button>

                    <div className="hidden lg:block h-4 w-[1px] bg-gray-200" />

                    <div className="hidden lg:flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={() => setPreviewMode('desktop')}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-300',
                          previewMode === 'desktop'
                            ? 'bg-white text-[#0f172a] shadow-sm shadow-black/5'
                            : 'text-slate-500 hover:text-slate-700'
                        )}
                      >
                        <Monitor className="h-3.5 w-3.5" />
                        <span>Desktop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('mobile')}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-300',
                          previewMode === 'mobile'
                            ? 'bg-white text-[#0f172a] shadow-sm shadow-black/5'
                            : 'text-slate-500 hover:text-slate-700'
                        )}
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        <span>Mobile</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-0 md:p-3">
                  <div className="overflow-hidden bg-white rounded-xl">
                    {/* Scaled Preview Frame Container */}
                    <div className={cn(
                      "relative w-full transition-all duration-700 overflow-y-auto overflow-x-hidden custom-scrollbar-preview bg-[#f1f5f9]/50 rounded-xl"
                    )}>
                      <div className="flex w-full justify-center py-4 md:py-8">
                        <div className={cn(
                          "transition-all duration-700 flex justify-center",
                          previewMode === 'desktop' ? "w-[414px] md:w-[1440px] scale-[0.85] md:scale-[0.45] lg:scale-[0.5] xl:scale-[0.55] 2xl:scale-[0.8] origin-top" : "w-[375px] scale-[0.88] origin-top mx-auto"
                        )}>
                          <PreviewFrame mode={previewMode}>
                            <iframe
                              ref={iframeRef}
                              src="/preview-render"
                              className="block w-full h-full border-0"
                              title="Preview"
                            />
                          </PreviewFrame>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Version Footer */}
        <div className="mt-12 pb-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          {/* eslint-disable-next-line no-undef */}
          Build Version: {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'Local Dev'}
        </div>
      </div>
      <AIWizardModal isOpen={showWizard} onClose={() => setShowWizard(false)} onApply={applyWizardDraft} />
    </div>
  );
}


