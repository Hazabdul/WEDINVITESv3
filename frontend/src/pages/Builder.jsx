import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  Heart,
  Images,
  MapPin,
  Monitor,
  Palette,
  Plus,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useInvitationState } from '../hooks/useInvitationState';
import { Button } from '../components/ui/Button';
import { Select, Toggle } from '../components/ui/FormElements';
import { TemplateRenderer } from '../components/preview/TemplateRenderer';
import { InvitationCover } from '../components/preview/InvitationCover';
import { cn } from '../utils/cn';
import { templatesList } from '../data/mockData';
import apiClient from '../utils/api';
import { normalizeMediaUrl } from '../utils/media';

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
    title: 'Photos',
    description: 'Choose the hero image and gallery moments that shape the look of the invitation.',
  },
  {
    title: 'Schedule',
    description: 'Lay out the flow of the celebration with simple time blocks.',
  },
  {
    title: 'Theme',
    description: 'Pick the visual direction, then refine fonts, colors, and presentation style.',
  },
  {
    title: 'Preview & Publish',
    description: 'Review the invitation, confirm the essentials, and publish the final link.',
  },
];

function Field({ label, helper, className, children }) {
  return (
    <label className={cn('block space-y-1', className)}>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#5f5a55]">{label}</div>
        {helper ? <p className="mt-1 text-[10px] leading-relaxed text-[#8a8178]">{helper}</p> : null}
      </div>
      {children}
    </label>
  );
}

function TextInput({ label, helper, value, onChange, placeholder, type = 'text', className }) {
  return (
    <Field label={label} helper={helper} className={className}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-[5px] border border-[#e8dfd5] bg-[#fffdf9] px-3 py-1.5 text-[13px] text-[#2f2925] outline-none transition placeholder:text-[#b2a79b] focus:border-[#bfa48a] focus:bg-white focus:shadow-[0_0_0_4px_rgba(191,164,138,0.12)]"
      />
    </Field>
  );
}

function TextAreaInput({ label, helper, value, onChange, placeholder, rows = 4, className }) {
  return (
    <Field label={label} helper={helper} className={className}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-[5px] border border-[#e8dfd5] bg-[#fffdf9] px-3 py-1.5 text-[13px] leading-relaxed text-[#2f2925] outline-none transition placeholder:text-[#b2a79b] focus:border-[#bfa48a] focus:bg-white focus:shadow-[0_0_0_4px_rgba(191,164,138,0.12)]"
      />
    </Field>
  );
}

function PreviewFrame({ mode, children }) {
  if (mode === 'mobile') {
    return (
      <div className="mx-auto w-full max-w-[340px] rounded-[16px] border border-[#d9cec1] bg-[#2b2623] p-3 shadow-[0_28px_70px_-28px_rgba(41,31,23,0.55)]">
        <div className="overflow-hidden rounded-[12px] bg-white">
          <div className="flex items-center justify-center px-6 py-3">
            <div className="h-1.5 w-24 rounded-full bg-black/70" />
          </div>
          <div className="h-[680px] overflow-auto custom-scrollbar-preview">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full overflow-hidden rounded-[12px] bg-[#f5ede0] shadow-[0_30px_70px_-30px_rgba(61,46,33,0.35)]">
      <div className="flex items-center gap-2 bg-[#f8f3ed] px-5 py-4">
        <span className="h-2.5 w-2.5 rounded-full bg-[#d7b59b]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e4d3b9]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#c0c5b4]" />
      </div>
      <div>{children}</div>
    </div>
  );
}

export function Builder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaUploadError, setMediaUploadError] = useState('');
  const [publishedInvitation, setPublishedInvitation] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [checkingBackend, setCheckingBackend] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);
  const [backendHealthError, setBackendHealthError] = useState('');
  const { data, clearData, updateSection, updateEvent, addEvent, setTemplate } = useInvitationState();

  const isLastStep = currentStep === STEPS.length - 1;
  const currentStepMeta = STEPS[currentStep];

  const progressInfo = useMemo(() => {
    const requiredFields = [
      { label: 'Bride name', value: data?.couple?.bride },
      { label: 'Groom name', value: data?.couple?.groom },
      { label: 'Tagline', value: data?.couple?.title },
      { label: 'Intro message', value: data?.content?.introMessage },
      { label: 'Date', value: data?.event?.date },
      { label: 'Time', value: data?.event?.time },
      { label: 'Venue', value: data?.event?.venue },
      { label: 'Location', value: data?.event?.address },
      { label: 'Cover photo', value: data?.media?.coverImage || data?.media?.coupleImage },
      { label: 'Theme', value: data?.theme?.id },
    ];

    const filled = requiredFields.filter((field) => field.value && String(field.value).trim() !== '').length;

    return {
      percentage: Math.round((filled / requiredFields.length) * 100),
      missingFields: requiredFields
        .filter((field) => !field.value || String(field.value).trim() === '')
        .map((field) => field.label),
    };
  }, [data]);

  const activeTemplate = useMemo(
    () => templatesList.find((template) => template.id === data?.theme?.id) || templatesList[0],
    [data?.theme?.id]
  );

  const coverImage = data?.media?.coverImage || data?.media?.coupleImage || '';
  const brideImage = data?.media?.brideImage || '';
  const groomImage = data?.media?.groomImage || '';
  const galleryText = useMemo(() => (data?.media?.gallery || []).join('\n'), [data?.media?.gallery]);
  const galleryCount = data?.media?.gallery?.filter(Boolean).length || 0;
  const canPublish = progressInfo.percentage >= 80;

  const nextStep = () => setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1));
  const previousStep = () => setCurrentStep((step) => Math.max(step - 1, 0));

  const uploadFiles = async (files, label) => {
    setIsUploadingMedia(true);
    setMediaUploadError('');

    try {
      const results = await Promise.all(files.map((file) => apiClient.uploadFile(file)));
      const urls = results.map((item) => item?.url).filter(Boolean);

      if (urls.length !== files.length) {
        throw new Error(`${label} upload did not return a valid file URL.`);
      }

      return urls;
    } catch (error) {
      setMediaUploadError(error?.message || `${label} upload failed.`);
      return [];
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const [uploadedUrl] = await uploadFiles([file], 'Banner image');
    event.target.value = '';
    if (!uploadedUrl) return;

    updateSection('media', 'coverImage', uploadedUrl);
    updateSection('media', 'coupleImage', uploadedUrl);
  };

  const handleSingleImageUpload = async (event, field, label) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const [uploadedUrl] = await uploadFiles([file], label);
    event.target.value = '';
    if (!uploadedUrl) return;

    updateSection('media', field, uploadedUrl);
  };

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const uploadedUrls = await uploadFiles(files, 'Gallery image');
    event.target.value = '';
    if (!uploadedUrls.length) return;

    updateSection('media', 'gallery', [...(data.media?.gallery || []), ...uploadedUrls]);
  };

  const handleGalleryUrlsChange = (value) => {
    const urls = value
      .split('\n')
      .map((item) => normalizeMediaUrl(item.trim()))
      .filter(Boolean);
    updateSection('media', 'gallery', urls);
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
          gallery: (data.media?.gallery || []).map((item) => normalizeMediaUrl(item)).filter(Boolean),
          video: normalizeMediaUrl(data.media?.video || ''),
          music: normalizeMediaUrl(data.media?.music || ''),
        },
        positions: data.positions || {},
        events: eventsPayload,
      };

      await apiClient.updateInvitation(created._id, invitationData);
      const published = await apiClient.publishInvitation(created._id);

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
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Bride name"
                placeholder="Aaliyah"
                value={data.couple?.bride || ''}
                onChange={(event) => updateSection('couple', 'bride', event.target.value)}
              />
              <TextInput
                label="Groom name"
                placeholder="Omar"
                value={data.couple?.groom || ''}
                onChange={(event) => updateSection('couple', 'groom', event.target.value)}
              />
            </div>

            <TextInput
              label="Tagline"
              helper="Keep this short. It sits near the hero area in most themes."
              placeholder="Together with their families"
              value={data.couple?.title || ''}
              onChange={(event) => updateSection('couple', 'title', event.target.value)}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Bride's parents"
                helper="Optional. Add father & mother names (e.g. Mr. Ahmed & Mrs. Sara)."
                placeholder="Mr. & Mrs. Rahman"
                value={data.family?.brideParents || ''}
                onChange={(event) => updateSection('family', 'brideParents', event.target.value)}
              />
              <TextInput
                label="Groom's parents"
                helper="Optional. Add father & mother names (e.g. Mr. Khalid & Mrs. Huda)."
                placeholder="Mr. & Mrs. Kareem"
                value={data.family?.groomParents || ''}
                onChange={(event) => updateSection('family', 'groomParents', event.target.value)}
              />
            </div>

            <TextAreaInput
              label="Intro message"
              helper="A short welcome note is enough. Avoid turning this into a paragraph wall."
              placeholder="With joy in our hearts, we invite you to celebrate our wedding day."
              value={data.content?.introMessage || ''}
              onChange={(event) => updateSection('content', 'introMessage', event.target.value)}
              rows={5}
            />
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
                onChange={(event) => updateSection('event', 'date', event.target.value)}
              />
              <TextInput
                label="Time"
                placeholder="07:30 PM"
                value={data.event?.time || ''}
                onChange={(event) => updateSection('event', 'time', event.target.value)}
              />
              <TextInput
                label="Venue"
                placeholder="The Grand Pearl Ballroom"
                value={data.event?.venue || ''}
                onChange={(event) => updateSection('event', 'venue', event.target.value)}
                className="md:col-span-2"
              />
              <TextAreaInput
                label="Location"
                placeholder="King Fahd Road, Riyadh, Saudi Arabia"
                value={data.event?.address || ''}
                onChange={(event) => updateSection('event', 'address', event.target.value)}
                rows={3}
                className="md:col-span-2"
              />
              <TextInput
                label="Map link"
                helper="Optional, but useful if guests will open directions from the invite."
                placeholder="https://maps.google.com/..."
                value={data.event?.mapLink || ''}
                onChange={(event) => updateSection('event', 'mapLink', event.target.value)}
                className="md:col-span-2"
              />
            </div>

            <TextAreaInput
              label="RSVP message"
              helper="This text appears in the RSVP area of the invitation."
              placeholder="Please confirm your attendance before December 1st, 2026."
              value={data.content?.rsvpText || ''}
              onChange={(event) => updateSection('content', 'rsvpText', event.target.value)}
              rows={3}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {mediaUploadError ? (
              <div className="rounded-[10px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {mediaUploadError}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className={cn(
                'flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#dccfc1] bg-[#fbf7f2] px-6 py-8 text-center transition hover:border-[#bfa48a] hover:bg-[#fffdfa]',
                isUploadingMedia && 'cursor-wait opacity-70'
              )}>
                <UploadCloud className="mb-4 h-8 w-8 text-[#b08f72]" />
                <div className="text-sm font-medium text-[#564a42]">
                  {isUploadingMedia ? 'Uploading...' : 'Upload banner'}
                </div>
                <div className="mt-1 text-xs leading-5 text-[#8a8178]">One main image for the top section of the invitation.</div>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={isUploadingMedia} />
              </label>

              <label className={cn(
                'flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#dccfc1] bg-[#fbf7f2] px-6 py-8 text-center transition hover:border-[#bfa48a] hover:bg-[#fffdfa]',
                isUploadingMedia && 'cursor-wait opacity-70'
              )}>
                <UploadCloud className="mb-4 h-8 w-8 text-[#b08f72]" />
                <div className="text-sm font-medium text-[#564a42]">
                  {isUploadingMedia ? 'Uploading...' : 'Upload bride photo'}
                </div>
                <div className="mt-1 text-xs leading-5 text-[#8a8178]">Single portrait used in the bride profile card.</div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleSingleImageUpload(event, 'brideImage', 'Bride image')}
                  disabled={isUploadingMedia}
                />
              </label>

              <label className={cn(
                'flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#dccfc1] bg-[#fbf7f2] px-6 py-8 text-center transition hover:border-[#bfa48a] hover:bg-[#fffdfa]',
                isUploadingMedia && 'cursor-wait opacity-70'
              )}>
                <UploadCloud className="mb-4 h-8 w-8 text-[#b08f72]" />
                <div className="text-sm font-medium text-[#564a42]">
                  {isUploadingMedia ? 'Uploading...' : 'Upload groom photo'}
                </div>
                <div className="mt-1 text-xs leading-5 text-[#8a8178]">Single portrait used in the groom profile card.</div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleSingleImageUpload(event, 'groomImage', 'Groom image')}
                  disabled={isUploadingMedia}
                />
              </label>

              <label className={cn(
                'flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#dccfc1] bg-[#fbf7f2] px-6 py-8 text-center transition hover:border-[#bfa48a] hover:bg-[#fffdfa]',
                isUploadingMedia && 'cursor-wait opacity-70'
              )}>
                <Images className="mb-4 h-8 w-8 text-[#b08f72]" />
                <div className="text-sm font-medium text-[#564a42]">
                  {isUploadingMedia ? 'Uploading...' : 'Add gallery photos'}
                </div>
                <div className="mt-1 text-xs leading-5 text-[#8a8178]">Upload multiple images for the invitation gallery.</div>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={isUploadingMedia} />
              </label>
            </div>

            <TextInput
              label="Banner image URL"
              helper="Use one direct image URL if the banner is hosted elsewhere."
              placeholder="https://..."
              value={coverImage}
              onChange={(event) => {
                updateSection('media', 'coverImage', event.target.value);
                updateSection('media', 'coupleImage', event.target.value);
              }}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Bride photo URL"
                helper="Optional direct image URL for the bride portrait."
                placeholder="https://..."
                value={brideImage}
                onChange={(event) => updateSection('media', 'brideImage', event.target.value)}
              />
              <TextInput
                label="Groom photo URL"
                helper="Optional direct image URL for the groom portrait."
                placeholder="https://..."
                value={groomImage}
                onChange={(event) => updateSection('media', 'groomImage', event.target.value)}
              />
            </div>

            <TextAreaInput
              label={`Gallery image URLs${galleryCount ? ` (${galleryCount})` : ''}`}
              helper="Multiple gallery images supported. Use one image URL per line."
              placeholder={'https://.../photo-1.jpg\nhttps://.../photo-2.jpg'}
              value={galleryText}
              onChange={(event) => handleGalleryUrlsChange(event.target.value)}
              rows={6}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="rounded-[10px] border border-[#e8dfd5] bg-[#fbf7f2] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#2f2925]">Main celebration</h3>
                  <p className="mt-1 text-sm leading-6 text-[#867b71]">This appears as the anchor event in the invitation.</p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#9b7f65]">Primary</div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <TextInput
                  label="Time"
                  placeholder="07:30 PM"
                  value={data.event?.time || ''}
                  onChange={(event) => updateSection('event', 'time', event.target.value)}
                />
                <TextInput
                  label="Title"
                  placeholder="Wedding Ceremony"
                  value={data.events?.[0]?.name || 'Wedding Ceremony'}
                  onChange={(event) => {
                    if (data.events?.[0]) {
                      updateEvent(data.events[0].id, 'name', event.target.value);
                    }
                  }}
                />
                <TextInput
                  label="Location"
                  placeholder="The Grand Pearl Ballroom"
                  value={data.event?.venue || ''}
                  onChange={(event) => updateSection('event', 'venue', event.target.value)}
                  className="md:col-span-2"
                />
                <TextAreaInput
                  label="Note"
                  placeholder="Dinner follows after the ceremony."
                  value={data.events?.[0]?.notes || ''}
                  onChange={(event) => {
                    if (data.events?.[0]) {
                      updateEvent(data.events[0].id, 'notes', event.target.value);
                    }
                  }}
                  rows={3}
                  className="md:col-span-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#2f2925]">Additional schedule blocks</h3>
                  <p className="text-sm text-[#867b71]">Add only the moments guests need to plan around.</p>
                </div>
                <Button onClick={addEvent} variant="outline" className="border-[#d8c9b8] bg-white text-[#6c5848] hover:bg-[#faf5ef]">
                  <Plus className="h-4 w-4" /> Add block
                </Button>
              </div>

              {(data.events || []).slice(1).length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-[#e4d8cb] bg-[#fcf8f3] p-5 text-sm text-[#867b71]">
                  No additional blocks yet. Add a reception, dinner, welcome party, or any moment guests should plan around.
                </div>
              ) : (
                (data.events || []).slice(1).map((eventItem) => (
                  <div key={eventItem.id} className="rounded-[10px] border border-[#ece3d9] bg-white p-5 shadow-[0_10px_30px_-24px_rgba(61,46,33,0.4)]">
                    <div className="grid gap-4 md:grid-cols-2">
                      <TextInput
                        label="Time"
                        placeholder="05:00 PM"
                        value={eventItem.time || ''}
                        onChange={(event) => updateEvent(eventItem.id, 'time', event.target.value)}
                      />
                      <TextInput
                        label="Title"
                        placeholder="Nikah"
                        value={eventItem.name || ''}
                        onChange={(event) => updateEvent(eventItem.id, 'name', event.target.value)}
                      />
                      <TextInput
                        label="Location"
                        placeholder="Grand Palace Hall"
                        value={eventItem.venue || ''}
                        onChange={(event) => updateEvent(eventItem.id, 'venue', event.target.value)}
                        className="md:col-span-2"
                      />
                      <TextAreaInput
                        label="Note"
                        placeholder="Please arrive 30 minutes early."
                        value={eventItem.notes || ''}
                        onChange={(event) => updateEvent(eventItem.id, 'notes', event.target.value)}
                        rows={3}
                        className="md:col-span-2"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid gap-4">
              {templatesList.map((template) => {
                const selected = activeTemplate.id === template.id;
                return (
                  <button
                    type="button"
                    key={template.id}
                    onClick={() => setTemplate(template.id)}
                    className={cn(
                      'rounded-[12px] border p-5 text-left transition-all',
                      selected
                        ? 'border-[#bfa48a] bg-[#fffaf5] shadow-[0_16px_40px_-26px_rgba(94,73,51,0.45)]'
                        : 'border-[#ece3d9] bg-white hover:border-[#d8c9b8] hover:bg-[#fdf9f4]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#b08f72]">{template.badge}</div>
                        <h3 className="mt-2 text-lg font-semibold text-[#2f2925]">{template.name}</h3>
                        <p className="mt-1 text-sm leading-6 text-[#7d7168]">{template.tagline}</p>
                      </div>
                      <div className={cn('mt-1 h-3 w-3 rounded-full', selected ? 'bg-[#b08f72]' : 'bg-[#e8dfd5]')} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Primary color">
                <input
                  type="color"
                  value={data.theme?.primaryColor || '#b68d40'}
                  onChange={(event) => updateSection('theme', 'primaryColor', event.target.value)}
                  className="h-14 w-full rounded-[10px] border border-[#e8dfd5] bg-[#fffdf9] p-2"
                />
              </Field>
              <Field label="Secondary color">
                <input
                  type="color"
                  value={data.theme?.secondaryColor || '#f7e7ce'}
                  onChange={(event) => updateSection('theme', 'secondaryColor', event.target.value)}
                  className="h-14 w-full rounded-[10px] border border-[#e8dfd5] bg-[#fffdf9] p-2"
                />
              </Field>
              <Field label="Heading text color">
                <input
                  type="color"
                  value={data.theme?.headingColor || data.theme?.primaryColor || '#6f5642'}
                  onChange={(event) => updateSection('theme', 'headingColor', event.target.value)}
                  className="h-14 w-full rounded-[10px] border border-[#e8dfd5] bg-[#fffdf9] p-2"
                />
              </Field>
              <Field label="Subheading text color">
                <input
                  type="color"
                  value={data.theme?.subheadingColor || data.theme?.primaryColor || '#876c57'}
                  onChange={(event) => updateSection('theme', 'subheadingColor', event.target.value)}
                  className="h-14 w-full rounded-[10px] border border-[#e8dfd5] bg-[#fffdf9] p-2"
                />
              </Field>
              <Field label="Body text color">
                <input
                  type="color"
                  value={data.theme?.bodyColor || '#705f53'}
                  onChange={(event) => updateSection('theme', 'bodyColor', event.target.value)}
                  className="h-14 w-full rounded-[10px] border border-[#e8dfd5] bg-[#fffdf9] p-2"
                />
              </Field>
              <Field label="Meta / label color">
                <input
                  type="color"
                  value={data.theme?.metaColor || '#9a7d66'}
                  onChange={(event) => updateSection('theme', 'metaColor', event.target.value)}
                  className="h-14 w-full rounded-[10px] border border-[#e8dfd5] bg-[#fffdf9] p-2"
                />
              </Field>

              <Select
                label="Heading style"
                value={data.theme?.font || 'serif'}
                onChange={(event) => updateSection('theme', 'font', event.target.value)}
                options={[
                  { value: 'serif', label: 'Serif elegance' },
                  { value: 'sans', label: 'Modern sans-serif' },
                  { value: 'mono', label: 'Editorial mono accent' },
                ]}
              />
              <Select
                label="Background style"
                value={data.theme?.backgroundStyle || 'soft-gradient'}
                onChange={(event) => updateSection('theme', 'backgroundStyle', event.target.value)}
                options={[
                  { value: 'soft-gradient', label: 'Soft gradient' },
                  { value: 'solid', label: 'Solid' },
                  { value: 'pattern', label: 'Subtle pattern' },
                ]}
              />
            </div>

            <div className="grid gap-3">
              <Toggle
                label="Show countdown"
                checked={Boolean(data.theme?.enableCountdown)}
                onChange={() => updateSection('theme', 'enableCountdown', !data.theme?.enableCountdown)}
                className="border-[#e8dfd5] bg-[#fffdf9]"
              />
              <Toggle
                label="Show gallery"
                checked={Boolean(data.theme?.enableGallery)}
                onChange={() => updateSection('theme', 'enableGallery', !data.theme?.enableGallery)}
                className="border-[#e8dfd5] bg-[#fffdf9]"
              />
              <Toggle
                label="Enable animation"
                checked={Boolean(data.theme?.enableAnimation)}
                onChange={() => updateSection('theme', 'enableAnimation', !data.theme?.enableAnimation)}
                className="border-[#e8dfd5] bg-[#fffdf9]"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="rounded-[12px] border border-[#e7ddd1] bg-[linear-gradient(135deg,#fffdf9_0%,#f8f2ea_100%)] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#b08f72]">Final review</div>
                  <h3 className="mt-2 text-2xl font-semibold text-[#2f2925]">{data.couple?.bride || 'Bride'} & {data.couple?.groom || 'Groom'}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#7e7369]">{data.couple?.title || 'Wedding Invitation'}</p>
                </div>
                <div className="rounded-full border border-[#ddcfbf] bg-white px-4 py-2 text-sm font-medium text-[#6b5848]">
                  {progressInfo.percentage}% ready
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[10px] border border-[#ece3d9] bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#2f2925]"><CalendarDays className="h-4 w-4 text-[#b08f72]" /> Event</div>
                <p className="mt-3 text-sm text-[#72665d]">{data.event?.date || 'No date yet'}</p>
                <p className="mt-1 text-sm text-[#72665d]">{data.event?.time || 'No time yet'}</p>
                <p className="mt-1 text-sm text-[#72665d]">{data.event?.venue || 'No venue yet'}</p>
              </div>
              <div className="rounded-[10px] border border-[#ece3d9] bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#2f2925]"><Palette className="h-4 w-4 text-[#b08f72]" /> Theme</div>
                <p className="mt-3 text-sm text-[#72665d]">{activeTemplate.name}</p>
                <p className="mt-1 text-sm text-[#72665d]">Primary: {data.theme?.primaryColor}</p>
                <p className="mt-1 text-sm text-[#72665d]">Secondary: {data.theme?.secondaryColor}</p>
                <p className="mt-1 text-sm text-[#72665d]">Heading: {data.theme?.headingColor}</p>
                <p className="mt-1 text-sm text-[#72665d]">Subheading: {data.theme?.subheadingColor}</p>
              </div>
            </div>

            {progressInfo.missingFields.length > 0 ? (
              <div className="rounded-[10px] border border-[#ead8c6] bg-[#fff8f0] p-5">
                <h4 className="text-sm font-semibold text-[#5a493a]">Complete these before publishing</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {progressInfo.missingFields.map((item) => (
                    <span key={item} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#8a6f57] ring-1 ring-[#ead8c6]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[10px] border border-[#d8e5d1] bg-[linear-gradient(135deg,#f8fcf7_0%,#eff6ed_100%)] p-5 text-sm text-[#46603d] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#5d854f] animate-pulse" />
                  Core details are complete. The invitation is ready to publish.
                </div>
              </div>
            )}

            {submitError ? (
              <div className="rounded-[10px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</div>
            ) : null}

            {publishedInvitation ? (
              <div className="space-y-5 rounded-[12px] border border-[#d7e5d7] bg-[linear-gradient(135deg,#fbfdfb_0%,#f0f7f0_100%)] p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4f8a59]/10 text-[#4f8a59]">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#2d4c39]">Invitation published</h4>
                    <p className="mt-1 text-sm text-[#5d7a61]">Your live boutique link is ready to share.</p>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#d7e5d7]/60 bg-white/80 p-4 backdrop-blur-sm shadow-inner">
                  <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#7a927d]">Public URL</div>
                  <div className="mt-2 break-all font-mono text-[13px] text-[#2d4c39]">{publishedInvitation.shareUrl}</div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={handleCopyLink} variant="outline" className="flex-1 border-[#cfe1cf] bg-white text-[#35563b] hover:bg-[#f8fcf8]">
                    <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy link'}
                  </Button>
                  <Button
                    onClick={() => window.open(publishedInvitation.shareUrl, '_blank')}
                    className="flex-1 bg-[linear-gradient(135deg,#3c5c45_0%,#24402d_100%)] text-white hover:shadow-lg hover:shadow-emerald-900/10 transition-all font-bold tracking-wide"
                  >
                    <ExternalLink className="h-4 w-4" /> Open invitation
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-[1520px] px-4 py-4 sm:px-6 lg:px-8 lg:py-8">

      {backendHealthError ? (
        <div className="mb-6 rounded-[10px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {backendHealthError}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)] xl:gap-8">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-[14px] border border-[#eadfd2] bg-white shadow-[0_24px_80px_-45px_rgba(61,46,33,0.42)]">
            <div className="border-b border-[#e8dfd5] bg-[#fbf7f2]/80 px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#b08f72]/70">Step {currentStep + 1} of {STEPS.length}</span>
                  <h2 className="font-serif text-3xl italic text-[#2f2925] tracking-tight">{currentStepMeta.title}</h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCheckBackend}
                    className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e8dfd5] bg-white transition-all hover:border-[#b08f72] hover:bg-[#fffdfa]"
                    title="Backend Status"
                  >
                    <Sparkles className={cn("h-4 w-4 transition-colors", backendHealth?.status === 'ok' ? "text-emerald-500" : "text-[#b08f72]/40")} />
                    <span className="absolute -bottom-6 scale-0 text-[8px] font-bold uppercase tracking-widest text-[#b08f72] transition-all group-hover:scale-100 whitespace-nowrap">Status</span>
                  </button>

                  <button
                    onClick={clearData}
                    className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e8dfd5] bg-white transition-all hover:border-red-200 hover:bg-red-50"
                    title="Reset Section"
                  >
                    <Trash2 className="h-4 w-4 text-[#2f2925]/40 transition-colors group-hover:text-red-500/70" />
                    <span className="absolute -bottom-6 scale-0 text-[8px] font-bold uppercase tracking-widest text-red-500/70 transition-all group-hover:scale-100">Reset</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="h-[1.5px] flex-1 bg-[#e8dfd5]/50">
                  <div
                    className="h-full bg-[#b08f72] transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(176,143,114,0.3)]"
                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] font-bold text-[#b08f72] whitespace-nowrap">{progressInfo.percentage}%</div>
              </div>
            </div>

            <div className="flex flex-col xl:min-h-[780px]">
              <div className="flex-1 px-4 py-4 sm:px-6">{renderStepContent()}</div>

              <div className="sticky bottom-0 mt-auto border-t border-[#efe4d7] bg-[linear-gradient(180deg,rgba(255,252,248,0.92)_0%,rgba(252,247,240,0.98)_100%)] px-4 py-4 shadow-[0_-18px_40px_-30px_rgba(61,46,33,0.45)] backdrop-blur sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={previousStep}
                    disabled={currentStep === 0}
                    className="w-full border-[#dccdbb] bg-white text-[#6c5848] hover:bg-[#faf5ef] sm:w-auto"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                    {isLastStep && !canPublish ? (
                      <p className="text-sm text-[#9a7656]">Complete at least 80% of the essentials before publishing.</p>
                    ) : null}
                    <Button
                      onClick={isLastStep ? handleSubmitInvitation : nextStep}
                      disabled={isLastStep ? isSubmitting || !canPublish || Boolean(publishedInvitation) : false}
                      className="w-full min-w-[180px] bg-[#2f2925] text-white hover:bg-[#231e1a] sm:w-auto"
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
            <div className="overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,#fffdf9_0%,#f4ede4_100%)] shadow-[0_24px_80px_-45px_rgba(61,46,33,0.38)]">
              <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b08f72]">Live preview</div>
                  <h3 className="mt-2 text-2xl text-[#2f2925]">See changes instantly</h3>
                  <p className="mt-1 text-sm text-[#7e7369]">Toggle between desktop and mobile without leaving the builder.</p>
                </div>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowCover(true)}
                    className="mr-3 inline-flex items-center gap-1.5 rounded-full border border-[#e2d7cb] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#73675f] transition hover:bg-[#faf6f1] active:scale-95"
                    title="Replay entrance experience"
                  >
                    <Send className="h-3 w-3" /> Replay
                  </button>

                  <div className="inline-flex rounded-full border border-[#e2d7cb] bg-white p-1.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('desktop')}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
                        previewMode === 'desktop' ? 'bg-[#2f2925] text-white' : 'text-[#73675f] hover:bg-[#faf6f1]'
                      )}
                    >
                      <Monitor className="h-4 w-4" /> Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('mobile')}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
                        previewMode === 'mobile' ? 'bg-[#2f2925] text-white' : 'text-[#73675f] hover:bg-[#faf6f1]'
                      )}
                    >
                      <Smartphone className="h-4 w-4" /> Mobile
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="overflow-hidden bg-[#fbf7f2] rounded-xl">
                  {/* Scaled Preview Frame Container */}
                  <div className={cn(
                    "relative w-full transition-all duration-700 overflow-y-auto overflow-x-hidden custom-scrollbar-preview bg-[#f5ede0]/50 rounded-xl",
                    previewMode === 'desktop' ? "h-[calc(100vh-200px)]" : "h-auto"
                  )}>
                    <div className="flex w-full justify-center py-8">
                      <div className={cn(
                        "transition-all duration-700",
                        previewMode === 'desktop' ? "w-[1100px] scale-[0.65] lg:scale-[0.7] xl:scale-[0.75] origin-top" : "w-full scale-100 origin-top-left"
                      )}>
                        <PreviewFrame mode={previewMode}>
                          <div className={cn("relative w-full", showCover ? "h-[820px] overflow-hidden" : "min-h-0")}>
                            {showCover && (
                              <InvitationCover
                                bride={data.couple?.bride || "Bride"}
                                groom={data.couple?.groom || "Groom"}
                                onOpen={() => setShowCover(false)}
                              />
                            )}
                            <div className={cn(showCover ? "pointer-events-none" : "pointer-events-auto")}>
                              <TemplateRenderer type={data.theme?.id} data={data} previewMode={previewMode} />
                            </div>
                          </div>
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
    </div>
  );
}
