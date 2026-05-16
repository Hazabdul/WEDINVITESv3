import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../utils/api';
import { InputPhase } from '../components/magic/InputPhase';
import { EditorPhase } from '../components/magic/EditorPhase';
import { ShareModal } from '../components/magic/ShareModal';
import { AIWizardModal } from '../components/builder/AIWizardModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const cleanValue = (v) => (typeof v === 'string' ? v.trim() : '');
const safeObject = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const safeArray  = (v) => (Array.isArray(v) ? v : []);
const unique     = (items) => [...new Set(items.filter(Boolean))];
const firstClean = (...values) => values.map(cleanValue).find(Boolean) || '';
const isVideoUrl = (v = '') => /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(v);
const isImageUrl = (v = '') => /\.(jpe?g|png|webp|avif)(\?.*)?$/i.test(cleanValue(v));

const getPublishDate = (value) => {
  const clean = cleanValue(value);
  if (!clean) return null;
  const d = new Date(clean);
  return Number.isNaN(d.getTime()) ? null : d;
};

function buildPublishPayload(invitationData, email) {
  const couple    = safeObject(invitationData?.couple);
  const event     = safeObject(invitationData?.event);
  const family    = safeObject(invitationData?.family);
  const content   = safeObject(invitationData?.content);
  const theme     = safeObject(invitationData?.theme);
  const mediaIn   = safeObject(invitationData?.media);
  const rawEvents = safeArray(invitationData?.events);

  const galleryItems = unique([
    ...safeArray(mediaIn.gallery),
    ...safeArray(mediaIn.galleryImages),
    ...safeArray(mediaIn.photos),
  ].map(cleanValue));
  const imageGallery = galleryItems.filter((i) => !isVideoUrl(i));
  const videoGallery = galleryItems.filter(isVideoUrl);

  const heroVideo   = firstClean(mediaIn.heroVideo, mediaIn.coverVideo, mediaIn.video, videoGallery[0]);
  const heroImage   = firstClean(mediaIn.coverImage, mediaIn.heroImage, mediaIn.coupleImage, imageGallery[0]);
  const coupleImage = firstClean(mediaIn.coupleImage, imageGallery[1], heroImage);
  const brideImage  = firstClean(mediaIn.brideImage, imageGallery[0], coupleImage);
  const groomImage  = firstClean(mediaIn.groomImage, imageGallery[1], coupleImage);

  const primaryName = firstClean(rawEvents[0]?.name, content.welcomeHeading, 'Wedding Celebration');

  const eventsPayload = (rawEvents.length > 0 ? rawEvents : [{
    id: '1', name: primaryName, date: event.date, time: event.time,
    venue: event.venue, address: event.address, notes: '',
  }]).map((item, i) => {
    const e = safeObject(item);
    return {
      id:      firstClean(e.id) || String(i + 1),
      name:    firstClean(e.name) || (i === 0 ? primaryName : `Event ${i + 1}`),
      date:    firstClean(e.date)  || cleanValue(event.date),
      time:    firstClean(e.time)  || cleanValue(event.time),
      venue:   firstClean(e.venue) || cleanValue(event.venue),
      address: firstClean(e.address) || cleanValue(event.address),
      notes:   cleanValue(e.notes),
    };
  }).filter((e) => e.name);

  const norm = cleanValue(email).toLowerCase();
  return {
    publishPolicy: 'flexible',
    email: norm, customerEmail: norm,
    brideName: cleanValue(couple.bride),
    groomName:  cleanValue(couple.groom),
    weddingDate: getPublishDate(event.date),
    couple, event, family, content,
    theme: {
      ...theme,
      ...(!event.mapLink ? { showMap: false } : {}),
      ...(!brideImage && !groomImage ? { showPortraits: false } : {}),
    },
    media: {
      ...mediaIn,
      heroVideo, heroImage,
      coverImage:  firstClean(mediaIn.coverImage, heroImage),
      coupleImage, brideImage, groomImage,
      gallery: unique([...imageGallery, heroImage, coupleImage]),
      video:   firstClean(mediaIn.video, heroVideo),
    },
    positions: safeObject(invitationData?.positions),
    events: eventsPayload,
  };
}
function mapStyleToTemplateTheme(style) {
  return {
    classic: 'traditional',
    luxury: 'luxury',
    floral: 'floral',
    modern: 'modern',
    arabic: 'traditional',
    beach: 'botanical',
    minimal: 'minimal',
    cinematic: 'artDeco',
  }[style] || 'modern';
}

function mapToneToDesignElements(tone) {
  return {
    Romantic: 'romantic',
    Formal: 'formal',
    Islamic: 'arabic',
    Modern: 'modern',
    Playful: 'playful',
    Poetic: 'poetic',
  }[tone] || tone?.toLowerCase?.() || 'elegant';
}

function buildMagicTemplateRequest(formState) {
  return {
    card_type: 'wedding',
    bride_name: cleanValue(formState.bride),
    groom_name: cleanValue(formState.groom),
    event_type: 'Wedding Celebration',
    date: formState.date || '',
    time: '',
    venue: cleanValue(formState.venue),
    address: '',
    rsvp_phone: '',
    notes: cleanValue(formState.extra),
    invitation_message: cleanValue(formState.extra),
    visual_style: {
      theme: mapStyleToTemplateTheme(formState.style),
      font_style: cleanValue(formState.tone),
      layout: 'portrait',
      design_elements: unique([
        formState.style,
        mapToneToDesignElements(formState.tone),
        cleanValue(formState.extra),
      ]).slice(0, 6),
    },
  };
}

function mapTemplateIdToFrontendTheme(templateId) {
  return {
    editorialPearl: 'classic',
    royalHeirloom: 'classic',
    glassGarden: 'floral',
    midnightJazz: 'noir',
    futureBloom: 'modern',
  }[templateId] || 'ceremony';
}

function buildInvitationDataFromTemplate(details, template, mediaUrls = []) {
  const themeId = mapTemplateIdToFrontendTheme(template?.id);
  const theme = template?.theme ? { ...template.theme, id: themeId } : { id: themeId };
  const imageUrls = unique(safeArray(mediaUrls).filter((url) => isImageUrl(url)));
  const videoUrls = safeArray(mediaUrls).filter((url) => isVideoUrl(url));
  const heroImage = firstClean(imageUrls[0], imageUrls[1]);
  const coupleImage = firstClean(imageUrls[1], imageUrls[0], heroImage);
  const brideImage = firstClean(imageUrls[0], imageUrls[1], coupleImage);
  const groomImage = firstClean(imageUrls[1], imageUrls[0], coupleImage);
  const gallery = unique([...imageUrls]);

  return {
    brideName: cleanValue(details.bride_name),
    groomName: cleanValue(details.groom_name),
    weddingDate: cleanValue(details.date),
    package: 'STANDARD',
    couple: {
      bride: cleanValue(details.bride_name),
      groom: cleanValue(details.groom_name),
      title: cleanValue(details.host_line) || 'Together with their families',
    },
    event: {
      date: cleanValue(details.date),
      time: cleanValue(details.time),
      venue: cleanValue(details.venue),
      address: cleanValue(details.address),
      mapLink: '',
    },
    events: [
      {
        id: 'primary-event',
        name: cleanValue(details.event_type) || 'Wedding Celebration',
        date: cleanValue(details.date),
        time: cleanValue(details.time),
        venue: cleanValue(details.venue),
        address: cleanValue(details.address),
        notes: cleanValue(details.notes),
      },
    ],
    family: {
      brideParents: '',
      groomParents: '',
    },
    content: {
      welcomeHeading: cleanValue(details.event_type) || 'Wedding Celebration',
      introMessage: cleanValue(details.invitation_message) || cleanValue(details.notes),
      invitationText: cleanValue(details.invitation_message) || cleanValue(details.notes),
      quote: '',
      familyMessage: cleanValue(details.host_line) || '',
      specialNotes: cleanValue(details.notes) || '',
      dressCode: '',
      rsvpText: cleanValue(details.rsvp_phone) ? `RSVP: ${cleanValue(details.rsvp_phone)}` : '',
      contact1: cleanValue(details.rsvp_phone),
      contact2: '',
    },
    theme,
    media: {
      heroVideo: firstClean(videoUrls[0], ''),
      heroImage,
      coverImage: firstClean(heroImage, coupleImage),
      coupleImage,
      brideImage,
      groomImage,
      gallery,
      video: firstClean(videoUrls[0], ''),
      music: '',
    },
    positions: {},
  };
}
// ─── Draft persistence ────────────────────────────────────────────────────────
const DRAFT_KEY = 'magic_designer_draft_v2';
const MAX_HISTORY = 20;

function formatTime(d) {
  return d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function MagicDesigner() {
  // Form state (structured input)
  const [formState, setFormState] = useState({
    bride: '', groom: '', date: '', venue: '',
    style: 'classic', tone: 'Romantic', extra: '', email: '',
  });

  // Files
  const [files, setFiles] = useState([]);
  const [mediaUrls, setMediaUrls] = useState([]);

  // Loading
  const [isUploading, setIsUploading]   = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Invitation state
  const [invitationData, setInvitationData] = useState(null);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [phase, setPhase] = useState('input'); // 'input' | 'generating' | 'editor'

  // AI Chat
  const [messages, setMessages]     = useState([]);
  const [editPrompt, setEditPrompt] = useState('');

  // Undo / Redo
  const [history, setHistory]         = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Share
  const [shareUrl, setShareUrl]       = useState(null);
  const [showShare, setShowShare]     = useState(false);

  // AI Wizard
  const [showWizard, setShowWizard]   = useState(false);

  // Auto-save timestamp
  const [autoSavedAt, setAutoSavedAt] = useState(null);

  // ── Load saved draft on mount ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.invitationData) {
        setInvitationData(draft.invitationData);
        setPhase('editor');
        setMessages(draft.messages || []);
        setFormState((p) => ({ ...p, ...draft.formState }));
        setHistory([draft.invitationData]);
        setHistoryIndex(0);
        toast.success('Draft restored — continue where you left off.', { duration: 3000 });
      }
    } catch { /* ignore */ }
  }, []);

  // ── Auto-save on invitationData change ────────────────────────────────────
  useEffect(() => {
    if (!invitationData) return;
    const now = new Date().toISOString();
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        invitationData, messages, formState, savedAt: now,
      }));
      setAutoSavedAt(formatTime(now));
    } catch { /* ignore */ }
  }, [invitationData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── History helpers ───────────────────────────────────────────────────────
  const pushHistory = useCallback((data) => {
    setHistory((prev) => {
      const next = [...prev.slice(0, historyIndex + 1), data].slice(-MAX_HISTORY);
      setHistoryIndex(next.length - 1);
      return next;
    });
  }, [historyIndex]);

  const applyInvitationData = useCallback((data) => {
    setInvitationData(data);
    pushHistory(data);
  }, [pushHistory]);

  const undo = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setInvitationData(history[idx]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setInvitationData(history[idx]);
    }
  };

  // ── Upload helpers ────────────────────────────────────────────────────────
  const uploadFiles = async (filesToUpload) => {
    const urls = [];
    for (const file of filesToUpload) {
      try {
        const r = await apiClient.uploadFile(file);
        if (r.url) urls.push(r.url);
      } catch { /* skip */ }
    }
    return urls;
  };

  // ── Build prompt from structured form ────────────────────────────────────
  const buildPrompt = () => {
    const { bride, groom, date, venue, style, tone, extra } = formState;
    const parts = [
      `Create a ${style} ${tone.toLowerCase()} wedding invitation website`,
      bride && groom ? `for ${bride} & ${groom}` : bride ? `for ${bride}` : groom ? `for ${groom}` : '',
      date ? `on ${date}` : '',
      venue ? `in ${venue}` : '',
      extra ? `. Additional details: ${extra}` : '',
    ];
    return parts.filter(Boolean).join(' ').trim();
  };

  // ── Generate invitation ───────────────────────────────────────────────────
  const handleGenerate = async () => {
    const { bride, groom, email } = formState;
    if (!bride && !groom) { toast.error('Please enter at least bride or groom name.'); return; }
    if (!email || !email.includes('@')) { toast.error('Please enter a valid email address.'); return; }

    setPhase('generating');
    setIsGenerating(true);

    try {
      let uploadedUrls = [...mediaUrls];
      if (files.length > 0) {
        setIsUploading(true);
        toast.info('Uploading your photos…');
        const newUrls = await uploadFiles(files);
        uploadedUrls = [...uploadedUrls, ...newUrls];
        setMediaUrls(uploadedUrls);
        setFiles([]);
        setIsUploading(false);
      }

      const prompt = buildPrompt();
      const templateRequest = buildMagicTemplateRequest(formState);
      setMessages([{ role: 'user', content: prompt }]);
      toast.info('AI is selecting your premium template…');

      const response = await apiClient.generateInvitationTemplates(templateRequest);
      const templates = Array.isArray(response.templates) ? response.templates : [];

      if (templates.length > 0) {
        const selectedTemplate = templates[0];
        setTemplateOptions(templates);
        setSelectedTemplateId(selectedTemplate.id || '');

        const invitationPayload = buildInvitationDataFromTemplate(
          templateRequest,
          selectedTemplate,
          uploadedUrls
        );

        applyInvitationData(invitationPayload);
        setMessages((p) => [...p, {
          role: 'ai',
          content: `Your invitation is ready! 🎉 I can adjust colors, layout, fonts, or add sections — just ask.`,
        }]);
        setPhase('editor');
      } else {
        toast.error('Generation failed. Please try again.');
        setPhase('input');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
      setPhase('input');
    } finally {
      setIsGenerating(false);
      setIsUploading(false);
    }
  };

  // ── Iterative edit ────────────────────────────────────────────────────────
  const handleEdit = async () => {
    if (!editPrompt.trim() || !invitationData) return;
    const current = editPrompt;
    setEditPrompt('');
    setMessages((p) => [...p, { role: 'user', content: current }]);
    setIsEditing(true);

    try {
      const response = await apiClient.editMagicInvitation(invitationData, current, '', []);
      if (response.success && response.data) {
        applyInvitationData(response.data);
        setMessages((p) => [...p, { role: 'ai', content: 'Done! Here\'s the updated design. What else would you like to change?' }]);
      } else {
        toast.error('Update failed — please try again.');
      }
    } catch (err) {
      toast.error('Something went wrong while editing.');
    } finally {
      setIsEditing(false);
    }
  };

  // ── Update theme (section toggles) ───────────────────────────────────────
  const handleUpdateTheme = (key, value) => {
    const updated = {
      ...invitationData,
      theme: { ...(invitationData?.theme || {}), [key]: value },
    };
    applyInvitationData(updated);
  };

  // ── Publish ───────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!invitationData) return;
    const { email } = formState;
    if (!email || !email.includes('@')) { toast.error('Please provide a valid email address first.'); return; }

    setIsPublishing(true);
    try {
      const created   = await apiClient.createInvitation({});
      const published = await apiClient.publishInvitation(
        created._id,
        buildPublishPayload(invitationData, email)
      );
      const slug = published?.slug;
      if (!slug) throw new Error('No invitation link was returned.');

      const url = `${window.location.origin}/invitation/${slug}`;
      setShareUrl(url);
      setShowShare(true);
      toast.success('Invitation published!');
    } catch (err) {
      const missing = err?.missingFields || err?.payload?.missingFields || [];
      if (missing.length > 0) {
        toast.error(`Missing: ${missing.map((f) => f.label).join(', ')}`);
      } else {
        toast.error(err.message || 'Publishing failed.');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleApplyWizardDraft = (draft) => {
    if (!draft) return;

    const couple = safeObject(draft.couple);
    const event = safeObject(draft.event);
    const theme = safeObject(draft.theme);
    const content = safeObject(draft.content);

    setFormState((prev) => ({
      ...prev,
      bride: firstClean(couple.bride) || prev.bride,
      groom: firstClean(couple.groom) || prev.groom,
      date: firstClean(event.date) || prev.date,
      venue: firstClean(event.venue) || prev.venue,
      style: theme.id || prev.style,
      extra: firstClean(content.welcomeHeading, content.subtitle, content.description) || prev.extra,
    }));

    setInvitationData(draft);
    setTemplateOptions([]);
    setSelectedTemplateId('');
    setMessages([{ role: 'ai', content: 'Your guided invitation draft is ready. Review it below and make any tweaks.' }]);
    setHistory([draft]);
    setHistoryIndex(0);
    setPhase('editor');
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    localStorage.removeItem(DRAFT_KEY);
    setInvitationData(null);
    setTemplateOptions([]);
    setSelectedTemplateId('');
    setMessages([]);
    setMediaUrls([]);
    setFiles([]);
    setHistory([]);
    setHistoryIndex(-1);
    setShareUrl(null);
    setPhase('input');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // GENERATING PHASE — full-screen animated loading
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'generating') {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center text-white p-8 text-center">
        <div className="relative mb-8">
          <div className="h-20 w-20 rounded-full border-[3px] border-[#D4A76A]/20 flex items-center justify-center animate-pulse">
            <div className="h-14 w-14 rounded-full border-[3px] border-[#D4A76A]/40 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-[#D4A76A] animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>
        <h2 className="font-serif text-[28px] italic mb-3">
          {isUploading ? 'Uploading your photos…' : 'Designing your invitation…'}
        </h2>
        <p className="text-white/50 text-[14px] max-w-xs">
          Our AI is crafting a beautiful, personalized wedding website just for you.
        </p>
        <div className="mt-8 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#D4A76A]"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }`}</style>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INPUT PHASE
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'input') {
    return (
      <>
        <InputPhase
          formState={formState}
          setFormState={setFormState}
          files={files}
          setFiles={setFiles}
          onGenerate={handleGenerate}
          onOpenWizard={() => setShowWizard(true)}
          isGenerating={isGenerating}
          isUploading={isUploading}
        />
        <AIWizardModal
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          onApply={handleApplyWizardDraft}
        />
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EDITOR PHASE
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <EditorPhase
        invitationData={invitationData}
        messages={messages}
        onUpdateTheme={handleUpdateTheme}
        onReset={handleReset}
        onPublish={handlePublish}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isPublishing={isPublishing}
        isEditing={isEditing}
        autoSavedAt={autoSavedAt}
        editPrompt={editPrompt}
        setEditPrompt={setEditPrompt}
        onEdit={handleEdit}
      />

      {showShare && shareUrl && (
        <ShareModal shareUrl={shareUrl} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
