import React, { useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  ImagePlus,
  LayoutTemplate,
  LoaderCircle,
  Monitor,
  Palette,
  Smartphone,
  Sparkles,
  Type,
  WandSparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/FormElements';
import { TemplateRenderer } from '../components/preview/TemplateRenderer';
import apiClient from '../utils/api';
import { cn } from '../utils/cn';

const EMPTY_ANALYSIS = {
  card_type: '',
  bride_name: '',
  groom_name: '',
  host_line: '',
  invitation_message: '',
  event_type: '',
  date: '',
  time: '',
  venue: '',
  address: '',
  rsvp_phone: '',
  notes: '',
  visual_style: {
    theme: '',
    primary_colors: [],
    layout: '',
    font_style: '',
    design_elements: [],
  },
};

const DEFAULT_THEME = {
  id: 'ceremony',
  primaryColor: '#876c57',
  secondaryColor: '#efe2d3',
  headingColor: '#6f5642',
  subheadingColor: '#876c57',
  bodyColor: '#705f53',
  metaColor: '#9a7d66',
  font: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
  backgroundStyle: 'soft-gradient',
  borderStyle: 'rounded',
  sectionShape: 'rounded-3xl',
  enableAnimation: true,
  enableCountdown: true,
  enableGallery: true,
  enableVideo: false,
  enableMusic: false,
};

const DETAIL_FIELDS = [
  { key: 'host_line', label: 'Host Line', placeholder: 'Together with their families' },
  { key: 'bride_name', label: 'Bride Name', placeholder: 'Enter bride name' },
  { key: 'groom_name', label: 'Groom Name', placeholder: 'Enter groom name' },
  { key: 'event_type', label: 'Event Type', placeholder: 'Wedding Celebration' },
  { key: 'date', label: 'Date', placeholder: 'Saturday, 18 October 2026' },
  { key: 'time', label: 'Time', placeholder: '6:30 PM' },
  { key: 'venue', label: 'Venue', placeholder: 'The Grand Pavilion' },
  { key: 'address', label: 'Address', placeholder: '123 Celebration Avenue, Riyadh' },
  { key: 'rsvp_phone', label: 'RSVP Phone', placeholder: '+966 555 123 456' },
];

const SCALE = 0.33;

function normalizeAnalysis(payload = {}) {
  return {
    ...EMPTY_ANALYSIS,
    ...payload,
    host_line: payload.host_line || 'Together with their families',
    invitation_message:
      payload.invitation_message ||
      `Invite you to celebrate their ${payload.event_type || 'special day'}.`,
    visual_style: {
      ...EMPTY_ANALYSIS.visual_style,
      ...(payload.visual_style || {}),
      primary_colors: Array.isArray(payload.visual_style?.primary_colors) ? payload.visual_style.primary_colors : [],
      design_elements: Array.isArray(payload.visual_style?.design_elements) ? payload.visual_style.design_elements : [],
    },
  };
}

function normalizeEventDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

function toWeddingDate(value) {
  const normalized = normalizeEventDate(value);
  if (!normalized) return null;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildInvitationData(details, templateOption) {
  const eventDate = normalizeEventDate(details.date);
  const theme = templateOption?.theme ? { ...DEFAULT_THEME, ...templateOption.theme } : DEFAULT_THEME;
  const rsvpText = details.rsvp_phone ? `RSVP: ${details.rsvp_phone}` : '';

  return {
    brideName: details.bride_name || '',
    groomName: details.groom_name || '',
    weddingDate: toWeddingDate(details.date),
    package: 'STANDARD',
    couple: {
      bride: details.bride_name || 'Bride',
      groom: details.groom_name || 'Groom',
      title: details.host_line || 'Together with their families',
    },
    event: {
      date: eventDate,
      time: details.time || '',
      venue: details.venue || '',
      address: details.address || '',
      mapLink: '',
    },
    events: [
      {
        id: 'primary-event',
        name: details.event_type || 'Wedding Ceremony',
        date: eventDate,
        time: details.time || '',
        venue: details.venue || '',
        address: details.address || '',
        notes: details.notes || '',
      },
    ],
    family: {
      brideParents: '',
      groomParents: '',
    },
    content: {
      welcomeHeading: details.event_type || 'Wedding Celebration',
      introMessage: details.invitation_message || '',
      invitationText: details.invitation_message || '',
      quote: '',
      familyMessage: details.host_line || '',
      specialNotes: details.notes || '',
      dressCode: '',
      rsvpText,
      contact1: details.rsvp_phone || '',
      contact2: '',
    },
    media: {
      coverImage: '',
      backgroundImage: '',
      brideImage: '',
      groomImage: '',
      coupleImage: '',
      gallery: [],
      video: '',
      music: '',
    },
    theme,
    positions: {},
  };
}

function ColorSwatch({ color }) {
  return (
    <div className="space-y-2">
      <div className="h-12 rounded-2xl border border-black/5 shadow-inner" style={{ backgroundColor: color }} />
      <div className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{color}</div>
    </div>
  );
}

function TemplateOption({ option, details, isSelected, onSelect }) {
  const previewData = buildInvitationData(details, option);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group overflow-hidden rounded-[28px] border bg-white text-left transition-all',
        isSelected
          ? 'border-[#2f2925] shadow-[0_26px_60px_-26px_rgba(47,41,37,0.45)]'
          : 'border-[#eadfd2] hover:-translate-y-1 hover:border-[#ccb49a] hover:shadow-[0_20px_45px_-30px_rgba(47,41,37,0.35)]'
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f7f1ea]">
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `scale(${SCALE})`,
            width: `${100 / SCALE}%`,
          }}
        >
          <TemplateRenderer type={option.id} data={previewData} isPreview previewMode="mobile" />
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#2f2925]">{option.name}</div>
            <div className="mt-1 text-xs leading-5 text-slate-500">{option.description}</div>
          </div>
          <div className={cn('mt-1 h-3 w-3 shrink-0 rounded-full border', isSelected ? 'border-[#2f2925] bg-[#2f2925]' : 'border-slate-300 bg-white')} />
        </div>

        <div className="flex flex-wrap gap-2">
          {[option.theme?.primaryColor, option.theme?.secondaryColor, option.theme?.headingColor]
            .filter(Boolean)
            .slice(0, 3)
            .map((color) => (
              <span key={`${option.id}-${color}`} className="h-5 w-5 rounded-full border border-black/5" style={{ backgroundColor: color }} />
            ))}
        </div>
      </div>
    </button>
  );
}

export function InvitationAnalyzer() {
  const previewCanvasRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState('');
  const [analysis, setAnalysis] = useState(EMPTY_ANALYSIS);
  const [details, setDetails] = useState(normalizeAnalysis());
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewMode, setPreviewMode] = useState('mobile');
  const [publishedInvitation, setPublishedInvitation] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreview('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(selectedFile);
    setSelectedFilePreview(nextUrl);

    return () => URL.revokeObjectURL(nextUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!templates.length) {
      setSelectedTemplateId('');
      return;
    }

    if (!templates.some((template) => template.id === selectedTemplateId)) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  const styleSummary = useMemo(() => normalizeAnalysis(analysis).visual_style, [analysis]);
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) || templates[0] || null,
    [selectedTemplateId, templates]
  );
  const invitationPreviewData = useMemo(
    () => buildInvitationData(details, selectedTemplate),
    [details, selectedTemplate]
  );

  const updateDetailField = (key, value) => {
    setDetails((current) => ({ ...current, [key]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setError('');
    setAnalysis(EMPTY_ANALYSIS);
    setDetails(normalizeAnalysis());
    setTemplates([]);
    setPublishedInvitation(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Select an invitation image before analyzing.');
      return;
    }

    setError('');
    setStatus({ loading: true, message: 'Reading the invitation, extracting text, and identifying the design language.' });

    try {
      const response = normalizeAnalysis(await apiClient.analyzeInvitation(selectedFile));
      setAnalysis(response);
      setDetails(response);
      setTemplates([]);
      setPublishedInvitation(null);
    } catch (requestError) {
      setError(requestError.message || 'Invitation analysis failed.');
    } finally {
      setStatus({ loading: false, message: '' });
    }
  };

  const handleGenerateTemplates = async () => {
    if (!analysis.card_type && !styleSummary.theme) {
      setError('Analyze the invitation first so the generator has a style profile to follow.');
      return;
    }

    setError('');
    setStatus({ loading: true, message: 'Generating live invitation directions from the extracted style profile.' });

    try {
      const response = await apiClient.generateInvitationTemplates({
        ...details,
        card_type: analysis.card_type,
        visual_style: analysis.visual_style,
      });

      setTemplates(Array.isArray(response.templates) ? response.templates.slice(0, 3) : []);
      setPublishedInvitation(null);
    } catch (requestError) {
      setError(requestError.message || 'Template generation failed.');
    } finally {
      setStatus({ loading: false, message: '' });
    }
  };

  const exportPreview = async (format) => {
    if (!previewCanvasRef.current || !selectedTemplate) return;

    setIsExporting(true);
    setError('');

    try {
      const dataUrl = await toPng(previewCanvasRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      if (format === 'image') {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'invitation-preview.png';
        link.click();
        return;
      }

      const bounds = previewCanvasRef.current.getBoundingClientRect();
      const orientation = bounds.width > bounds.height ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [bounds.width, bounds.height],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, bounds.width, bounds.height);
      pdf.save('invitation-preview.pdf');
    } catch (exportError) {
      setError(exportError.message || 'Preview export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedTemplate) {
      setError('Generate and select a template before publishing.');
      return;
    }

    setError('');
    setIsPublishing(true);

    try {
      const invitationId = publishedInvitation?.id || (await apiClient.createInvitation({}))._id;
      const payload = buildInvitationData(details, selectedTemplate);

      await apiClient.updateInvitation(invitationId, payload);
      const published = await apiClient.publishInvitation(invitationId);

      setPublishedInvitation({
        id: invitationId,
        slug: published.slug,
        shareUrl: `${window.location.origin}/invitation/${published.slug}`,
      });
    } catch (requestError) {
      setError(requestError.message || 'Publishing failed.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publishedInvitation?.shareUrl) return;
    await navigator.clipboard.writeText(publishedInvitation.shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="bg-[linear-gradient(180deg,#fffaf4_0%,#f8f1e8_100%)]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[36px] border border-[#eadfd2] bg-white/78 p-7 shadow-[0_30px_90px_-50px_rgba(47,41,37,0.42)] backdrop-blur-xl sm:p-10">
          <div className="grid gap-10 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className="space-y-6">
              <div>
                <div className="inline-flex rounded-full border border-[#e6d6c4] bg-[#fff8f1] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#9a7757]">
                  Invitation Analyzer & Generator
                </div>
                <h1 className="mt-5 text-4xl leading-tight text-[#2f2925] sm:text-5xl">
                  Turn a static invite into a real editable invitation link.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-7 text-[#6d6257]">
                  Analyze the uploaded card, generate live invitation variations that follow its palette and tone, then publish the selected version as a shareable link.
                </p>
              </div>

              <Card
                icon={ImagePlus}
                title="1. Upload Invitation"
                subtitle="Use JPG, PNG, or WebP. The uploaded card is previewed before analysis."
                className="border-[#eee1d3] bg-[#fffcf8]"
              >
                <div className="space-y-4">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-[#d8c2aa] bg-[#fff7ee] px-5 py-8 text-center transition hover:border-[#b8926d] hover:bg-[#fff4e7]">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <ImagePlus className="h-8 w-8 text-[#9a7757]" />
                    <span className="mt-3 text-sm font-semibold text-[#2f2925]">Choose invitation image</span>
                    <span className="mt-1 text-xs uppercase tracking-[0.22em] text-[#9a7757]">Image upload section</span>
                  </label>

                  <div className="overflow-hidden rounded-[28px] border border-[#efe2d4] bg-[#f8f1e8]">
                    <div className="aspect-[4/5]">
                      {selectedFilePreview ? (
                        <img src={selectedFilePreview} alt="Uploaded invitation preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#8b7a68]">
                          Uploaded invitation preview will appear here.
                        </div>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleAnalyze} disabled={!selectedFile || status.loading} className="w-full bg-[linear-gradient(135deg,#2f2925_0%,#5a4636_100%)] hover:bg-[linear-gradient(135deg,#2f2925_0%,#5a4636_100%)]">
                    <Sparkles className="h-4 w-4" />
                    Analyze Invitation
                  </Button>
                </div>
              </Card>

              <Card
                icon={status.loading ? LoaderCircle : WandSparkles}
                title="2. Processing Status"
                subtitle="The page keeps the workflow responsive while the card is analyzed or generated."
                className="border-[#eee1d3] bg-white"
              >
                {status.loading ? (
                  <div className="flex items-start gap-4 rounded-[24px] border border-[#ecdcc9] bg-[#fff8f1] p-4">
                    <LoaderCircle className="mt-1 h-5 w-5 animate-spin text-[#9a7757]" />
                    <div>
                      <div className="text-sm font-semibold text-[#2f2925]">Processing invitation</div>
                      <p className="mt-1 text-sm leading-6 text-[#6d6257]">{status.message}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[#e8d9c8] bg-[#fffdfa] p-4 text-sm text-[#6d6257]">
                    Analyze the original card first, then generate live invitation directions that keep the extracted details and style profile connected.
                  </div>
                )}

                {error ? (
                  <div className="mt-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}
              </Card>

              <Card
                icon={Palette}
                title="3. Style Analysis"
                subtitle="Auto-detected design traits are summarized here."
                className="border-[#eee1d3] bg-white"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-[#efe2d4] bg-[#fffcf8] p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Card Type</div>
                    <div className="mt-2 text-base font-semibold text-[#2f2925]">{analysis.card_type || 'Not analyzed yet'}</div>
                  </div>
                  <div className="rounded-[24px] border border-[#efe2d4] bg-[#fffcf8] p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Theme</div>
                    <div className="mt-2 text-base font-semibold text-[#2f2925]">{styleSummary.theme || 'Waiting for analysis'}</div>
                  </div>
                  <div className="rounded-[24px] border border-[#efe2d4] bg-[#fffcf8] p-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">
                      <LayoutTemplate className="h-4 w-4" />
                      Layout
                    </div>
                    <div className="mt-2 text-base font-semibold text-[#2f2925]">{styleSummary.layout || 'Waiting for analysis'}</div>
                  </div>
                  <div className="rounded-[24px] border border-[#efe2d4] bg-[#fffcf8] p-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">
                      <Type className="h-4 w-4" />
                      Font Style
                    </div>
                    <div className="mt-2 text-base font-semibold text-[#2f2925]">{styleSummary.font_style || 'Waiting for analysis'}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Colors</div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(styleSummary.primary_colors.length > 0 ? styleSummary.primary_colors : ['#F5EDE2', '#C89C6D', '#3B2C25']).map((color) => (
                      <ColorSwatch key={color} color={color} />
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Design Elements</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(styleSummary.design_elements.length > 0 ? styleSummary.design_elements : ['border', 'ornament', 'floral']).map((element) => (
                      <span key={element} className="rounded-full border border-[#e6d6c4] bg-[#fff8f1] px-3 py-1.5 text-xs font-medium text-[#6d6257]">
                        {element}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card
                title="4. Editable Details"
                subtitle="The extracted fields stay editable, and these values are what get published into the final invitation link."
                className="border-[#eee1d3] bg-white"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {DETAIL_FIELDS.map((field) => (
                    <Input
                      key={field.key}
                      label={field.label}
                      value={details[field.key] || ''}
                      onChange={(event) => updateDetailField(field.key, event.target.value)}
                      placeholder={field.placeholder}
                    />
                  ))}
                  <Textarea
                    label="Invitation Message"
                    value={details.invitation_message || ''}
                    onChange={(event) => updateDetailField('invitation_message', event.target.value)}
                    placeholder="Invite you to join their wedding celebration on..."
                    rows={4}
                    className="md:col-span-2"
                  />
                  <Textarea
                    label="Special Notes"
                    value={details.notes || ''}
                    onChange={(event) => updateDetailField('notes', event.target.value)}
                    placeholder="Add dress code, RSVP deadline, or any corrections"
                    rows={4}
                    className="md:col-span-2"
                  />
                </div>
              </Card>

              <Card
                title="5. Generate Similar Template"
                subtitle="These are real invitation directions using the extracted palette and structure, not static image placeholders."
                className="border-[#eee1d3] bg-white"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-[#6d6257]">
                      Theme: <span className="font-semibold text-[#2f2925]">{styleSummary.theme || 'Not available yet'}</span>
                    </div>
                    <Button onClick={handleGenerateTemplates} disabled={status.loading} className="bg-[linear-gradient(135deg,#b8926d_0%,#8f6949_100%)] hover:bg-[linear-gradient(135deg,#b8926d_0%,#8f6949_100%)]">
                      <WandSparkles className="h-4 w-4" />
                      Generate Similar Template
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {templates.length > 0 ? (
                      templates.map((template) => (
                        <TemplateOption
                          key={template.id}
                          option={template}
                          details={details}
                          isSelected={selectedTemplate?.id === template.id}
                          onSelect={() => setSelectedTemplateId(template.id)}
                        />
                      ))
                    ) : (
                      <div className="md:col-span-3 rounded-[28px] border border-dashed border-[#e8d9c8] bg-[#fffdfa] px-6 py-10 text-center text-sm text-[#6d6257]">
                        Generate templates after analysis to preview live invitation options here.
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card
                title="6. Live Preview"
                subtitle="The selected direction stays synchronized with the edited fields, export actions, and published link."
                className="border-[#eee1d3] bg-white"
              >
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="overflow-hidden rounded-[32px] border border-[#eadfd2] bg-[#f5ece2] p-3">
                    <div className="mb-3 flex justify-end">
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

                    <div ref={previewCanvasRef} className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_26px_60px_-32px_rgba(47,41,37,0.35)]">
                      {selectedTemplate ? (
                        <TemplateRenderer
                          type={selectedTemplate.id}
                          data={invitationPreviewData}
                          isPreview
                          previewMode={previewMode}
                          className="w-full"
                        />
                      ) : (
                        <div className="flex min-h-[460px] items-center justify-center px-8 text-center text-sm text-[#8b7a68]">
                          Select a generated template to preview the live invitation.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[28px] border border-[#eadfd2] bg-[#fffcf8] p-5">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Current Direction</div>
                      <div className="mt-3 space-y-3 text-sm text-[#6d6257]">
                        <div><span className="font-semibold text-[#2f2925]">Template:</span> {selectedTemplate?.name || 'N/A'}</div>
                        <div><span className="font-semibold text-[#2f2925]">Theme:</span> {styleSummary.theme || 'N/A'}</div>
                        <div><span className="font-semibold text-[#2f2925]">Layout:</span> {styleSummary.layout || 'N/A'}</div>
                        <div><span className="font-semibold text-[#2f2925]">Font:</span> {styleSummary.font_style || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-[#eadfd2] bg-[#fffcf8] p-5">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">7. Export & Publish</div>
                      <div className="mt-4 grid gap-3">
                        <Button onClick={() => exportPreview('image')} disabled={!selectedTemplate || isExporting} className="w-full bg-[linear-gradient(135deg,#2f2925_0%,#5a4636_100%)] hover:bg-[linear-gradient(135deg,#2f2925_0%,#5a4636_100%)]">
                          {isExporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          Download as Image
                        </Button>
                        <Button onClick={() => exportPreview('pdf')} disabled={!selectedTemplate || isExporting} variant="outline" className="w-full border-[#ccb49a] text-[#5f4c3d] hover:bg-[#fff5ea]">
                          {isExporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          Download as PDF
                        </Button>
                        <Button onClick={handlePublish} disabled={!selectedTemplate || isPublishing} className="w-full bg-[linear-gradient(135deg,#6b8f6b_0%,#4e6d53_100%)] hover:bg-[linear-gradient(135deg,#6b8f6b_0%,#4e6d53_100%)]">
                          {isPublishing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          {publishedInvitation ? 'Update Live Link' : 'Publish Live Link'}
                        </Button>
                      </div>
                    </div>

                    {publishedInvitation ? (
                      <div className="space-y-4 rounded-[24px] border border-[#d7e5d7] bg-[#f7fbf6] p-5">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#4f8a59]" />
                          <div>
                            <h4 className="text-sm font-semibold text-[#35563b]">Live invitation ready</h4>
                            <p className="mt-1 text-sm text-[#58715c]">
                              This link uses the generated template and the current edited fields. Publish again after edits to update the same link.
                            </p>
                          </div>
                        </div>

                        <div className="rounded-[18px] border border-[#d7e5d7] bg-white p-3">
                          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#7a927d]">Share URL</div>
                          <div className="mt-2 break-all text-sm text-[#35563b]">{publishedInvitation.shareUrl}</div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <Button onClick={handleCopyLink} variant="outline" className="border-[#cfe1cf] bg-white text-[#35563b] hover:bg-[#f8fcf8]">
                            <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy link'}
                          </Button>
                          <Button onClick={() => window.open(publishedInvitation.shareUrl, '_blank')} className="bg-[#35563b] text-white hover:bg-[#2e4b33]">
                            <ExternalLink className="h-4 w-4" /> Open invitation
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default InvitationAnalyzer;
