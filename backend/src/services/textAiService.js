import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const MAX_MAGIC_MEDIA_IMAGES = 8;
const MAX_MAGIC_IMAGE_BYTES = 8 * 1024 * 1024;

const DEFAULT_THEME = {
  id: 'ceremony',
  primaryColor: '#876c57',
  secondaryColor: '#efe2d3',
  headingColor: '#6f5642',
  subheadingColor: '#876c57',
  bodyColor: '#705f53',
  metaColor: '#9a7d66',
  font: 'serif',
  backgroundStyle: 'soft-gradient',
  borderStyle: 'rounded',
  sectionShape: 'rounded-3xl',
  enableAnimation: true,
  enableCountdown: true,
  enableGallery: true,
  enableVideo: true,
  enableMusic: false,
};

const TEMPLATE_IDS = new Set([
  'ceremony',
  'classic',
  'floral',
  'modern',
  'traditional',
  'mountain',
  'noir',
  'solstice',
]);

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueStrings(values = []) {
  return [...new Set(safeArray(values).map(cleanText).filter(Boolean))];
}

function isVideoUrl(src = '') {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(cleanText(src));
}

function isImageUrl(src = '') {
  return /\.(jpe?g|png|webp|avif)(\?.*)?$/i.test(cleanText(src));
}

function isUsableMediaValue(value = '') {
  const clean = cleanText(value);
  return (
    clean &&
    !clean.includes('placeholder') &&
    !clean.includes('example.com') &&
    !clean.includes('dummy')
  );
}

function resolveUploadedMediaValue(value, uploadedMedia = []) {
  const clean = cleanText(value);
  if (!clean) return '';

  if (uploadedMedia.includes(clean)) return clean;

  const labelMatch = clean.match(/(?:uploaded\s*)?(?:media|image|photo|picture)\s*#?\s*(\d+)/i);
  if (labelMatch) {
    const index = Number.parseInt(labelMatch[1], 10) - 1;
    return uploadedMedia[index] || '';
  }

  const containedUrl = uploadedMedia.find((url) => clean.includes(url));
  if (containedUrl) return containedUrl;

  return isUsableMediaValue(clean) && /^(https?:\/\/|\/uploads\/)/i.test(clean) ? clean : '';
}

function getImageMimeType(src = '') {
  const clean = cleanText(src).split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.avif')) return 'image/avif';
  return 'image/jpeg';
}

function resolveUploadPath(src = '') {
  const clean = cleanText(src);
  if (!clean) return null;

  let pathname = clean;
  try {
    pathname = new URL(clean).pathname;
  } catch {
    pathname = clean;
  }

  const normalizedPath = decodeURIComponent(pathname).replace(/\\/g, '/');
  const uploadMarker = '/uploads/';
  const uploadIndex = normalizedPath.lastIndexOf(uploadMarker);
  const filenameSource = uploadIndex >= 0
    ? normalizedPath.slice(uploadIndex + uploadMarker.length)
    : normalizedPath;
  const filename = path.basename(filenameSource);

  if (!filename || filename === '.' || filename === '..') return null;

  const filePath = path.resolve(uploadsDir, filename);
  const relativePath = path.relative(uploadsDir, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) return null;

  return filePath;
}

async function readImagePayload(src = '') {
  const localPath = resolveUploadPath(src);

  if (localPath) {
    try {
      const stats = await fs.promises.stat(localPath);
      if (!stats.isFile() || stats.size > MAX_MAGIC_IMAGE_BYTES) return null;

      return {
        buffer: await fs.promises.readFile(localPath),
        mimeType: getImageMimeType(localPath),
      };
    } catch {
      // Fall back to fetching below when the URL is not backed by local storage.
    }
  }

  if (!/^https?:\/\//i.test(cleanText(src))) return null;

  try {
    const response = await fetch(src);
    const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() || '';

    if (!response.ok || !contentType.startsWith('image/')) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_MAGIC_IMAGE_BYTES) return null;

    return {
      buffer,
      mimeType: contentType,
    };
  } catch {
    return null;
  }
}

async function buildUploadedImageParts(mediaUrls = []) {
  const urls = uniqueStrings(mediaUrls)
    .filter((url) => !isVideoUrl(url))
    .slice(0, MAX_MAGIC_MEDIA_IMAGES);
  const parts = [];

  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index];
    const payload = await readImagePayload(url);

    if (!payload) continue;

    parts.push({
      text: `Uploaded image ${index + 1}. Exact URL: ${url}`,
    });
    parts.push({
      inlineData: {
        mimeType: payload.mimeType,
        data: payload.buffer.toString('base64'),
      },
    });
  }

  return parts;
}

function parseJsonObject(raw) {
  const jsonMatch = String(raw || '').match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('AI did not return valid JSON.');
  }

  return JSON.parse(jsonMatch[0]);
}

function splitCoupleNames(coupleNames = '') {
  const parts = String(coupleNames)
    .split(/\s+(?:and|&|\+)\s+|,|\/|\\|-/i)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    bride: parts[0] || '',
    groom: parts[1] || '',
  };
}

function normalizeTheme(theme = {}) {
  const input = safeObject(theme);
  const normalized = { ...DEFAULT_THEME, ...input };

  if (!TEMPLATE_IDS.has(normalized.id)) {
    normalized.id = DEFAULT_THEME.id;
  }

  [
    'primaryColor',
    'secondaryColor',
    'headingColor',
    'subheadingColor',
    'bodyColor',
    'metaColor',
  ].forEach((key) => {
    if (!HEX_COLOR_REGEX.test(String(normalized[key] || ''))) {
      normalized[key] = DEFAULT_THEME[key];
    }
  });

  if (!['serif', 'sans', 'mono'].includes(normalized.font)) {
    normalized.font = DEFAULT_THEME.font;
  }

  if (!['soft-gradient', 'solid', 'pattern'].includes(normalized.backgroundStyle)) {
    normalized.backgroundStyle = DEFAULT_THEME.backgroundStyle;
  }

  if (!['rounded', 'none', 'sharp'].includes(normalized.borderStyle)) {
    normalized.borderStyle = DEFAULT_THEME.borderStyle;
  }

  if (!['rounded-none', 'rounded-lg', 'rounded-3xl'].includes(normalized.sectionShape)) {
    normalized.sectionShape = DEFAULT_THEME.sectionShape;
  }

  return normalized;
}

function normalizeMedia(media = {}, mediaUrls = []) {
  const input = safeObject(media);
  const uploadedMedia = uniqueStrings(mediaUrls);
  const uploadedVideos = uploadedMedia.filter(isVideoUrl);
  const uploadedImages = uploadedMedia.filter((url) => !isVideoUrl(url));

  const cleanGallery = uniqueStrings(input.gallery)
    .map((url) => resolveUploadedMediaValue(url, uploadedImages) || cleanText(url))
    .filter((url) => isUsableMediaValue(url) && !isVideoUrl(url));

  const normalized = {
    heroVideo: resolveUploadedMediaValue(input.heroVideo, uploadedVideos),
    heroImage: resolveUploadedMediaValue(input.heroImage, uploadedImages),
    coverImage: resolveUploadedMediaValue(input.coverImage, uploadedImages),
    coupleImage: resolveUploadedMediaValue(input.coupleImage, uploadedImages),
    brideImage: resolveUploadedMediaValue(input.brideImage, uploadedImages),
    groomImage: resolveUploadedMediaValue(input.groomImage, uploadedImages),
    gallery: cleanGallery,
  };

  if (uploadedMedia.length > 0) {
    normalized.heroVideo = normalized.heroVideo || uploadedVideos[0] || '';
    normalized.heroImage = normalized.heroImage || normalized.coverImage || uploadedImages[0] || '';
    normalized.coverImage = normalized.coverImage || normalized.heroImage;
    normalized.coupleImage = normalized.coupleImage || uploadedImages.find((url) => (
      url !== normalized.heroImage &&
      url !== normalized.brideImage &&
      url !== normalized.groomImage
    )) || normalized.heroImage;
    normalized.brideImage = normalized.brideImage || '';
    normalized.groomImage = normalized.groomImage || '';
    normalized.gallery = uniqueStrings([...uploadedImages, ...cleanGallery]);
  }

  return normalized;
}

function normalizeWizardInvitation(payload = {}, source = {}) {
  const fallbackNames = splitCoupleNames(source.coupleNames);

  const couple = safeObject(payload.couple);
  const event = safeObject(payload.event);
  const family = safeObject(payload.family);
  const content = safeObject(payload.content);
  const theme = normalizeTheme(payload.theme);

  const primaryDate = cleanText(event.date) || cleanText(source.eventDate);
  const primaryTime = cleanText(event.time) || cleanText(source.eventTime);
  const primaryVenue = cleanText(event.venue) || cleanText(source.venue);
  const primaryAddress = cleanText(event.address) || cleanText(source.venue);
  const eventType =
    cleanText(source.eventType) ||
    cleanText(content.welcomeHeading) ||
    'Wedding Ceremony';

  const normalizedEvents = safeArray(payload.events)
    .map((item, index) => {
      const eventItem = safeObject(item);

      return {
        id: cleanText(eventItem.id) || String(index + 1),
        name: cleanText(eventItem.name) || (index === 0 ? eventType : `Event ${index + 1}`),
        date: cleanText(eventItem.date) || primaryDate,
        time: cleanText(eventItem.time) || '',
        venue: cleanText(eventItem.venue) || primaryVenue,
        address: cleanText(eventItem.address) || primaryAddress,
        notes: cleanText(eventItem.notes),
      };
    })
    .filter((item) => item.name);

  if (normalizedEvents.length === 0) {
    normalizedEvents.push({
      id: '1',
      name: eventType,
      date: primaryDate,
      time: primaryTime,
      venue: primaryVenue,
      address: primaryAddress,
      notes: '',
    });
  }

  return {
    couple: {
      bride: cleanText(couple.bride) || fallbackNames.bride,
      groom: cleanText(couple.groom) || fallbackNames.groom,
      title: cleanText(couple.title) || cleanText(source.hostNames) || 'Together with their families',
    },
    event: {
      date: primaryDate,
      time: primaryTime,
      venue: primaryVenue,
      address: primaryAddress,
      mapLink: cleanText(event.mapLink),
    },
    events: normalizedEvents.slice(0, 5),
    family: {
      brideParents: cleanText(family.brideParents),
      groomParents: cleanText(family.groomParents),
    },
    content: {
      welcomeHeading: cleanText(content.welcomeHeading) || eventType,
      introMessage: cleanText(content.introMessage),
      invitationText: cleanText(content.invitationText),
      quote: cleanText(content.quote),
      familyMessage: cleanText(content.familyMessage) || cleanText(source.hostNames),
      specialNotes: cleanText(content.specialNotes),
      dressCode: cleanText(content.dressCode),
      rsvpText: cleanText(content.rsvpText),
      contact1: cleanText(content.contact1),
      contact2: cleanText(content.contact2),
    },
    theme,
  };
}

export async function generateIntroMessage({
  bride,
  groom,
  tagline,
  parents,
  tone = 'romantic',
}) {
  const toneGuide = {
    romantic: 'Warm, heartfelt, and deeply romantic. Use poetic language.',
    formal: 'Dignified, traditional, and elegantly formal.',
    islamic: 'Respectful Islamic tone. Begin with Bismillah. Reference marriage with dignity and faith.',
    modern: 'Fresh, contemporary, and conversational but still refined.',
    poetic: 'Lyrical and literary, like a love letter or poem.',
  };

  const prompt = `
You are a luxury wedding invitation copywriter.

Generate one beautiful intro message for a wedding invitation.

Rules:
- Keep it between 2 and 4 sentences.
- Do not include the bride or groom names.
- Do not include greetings.
- Do not include sign-offs.
- Return only the message text.
- No quotes.
- No markdown.

Tone:
${toneGuide[tone] || toneGuide.romantic}

Bride:
${bride || 'the bride'}

Groom:
${groom || 'the groom'}

Tagline or context:
${tagline || 'Together with their families'}

Parents:
${parents || 'Not specified'}

Write the invitation intro message now.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return (response.text() || '').trim().replace(/^["']|["']$/g, '');
}

export async function generateColorPalette({ mood, templateId }) {
  const prompt = `
You are a luxury wedding design system.

Generate a harmonious 6-color palette for a premium wedding invitation.

Return only valid JSON with exactly these keys:
{
  "primaryColor": "#hex",
  "secondaryColor": "#hex",
  "headingColor": "#hex",
  "subheadingColor": "#hex",
  "bodyColor": "#hex",
  "metaColor": "#hex"
}

Rules:
- All values must be valid 6-digit hex colors.
- primaryColor is the dominant accent color.
- secondaryColor must be soft and light unless the style is dark/noir.
- headingColor must be deep and readable.
- subheadingColor should support the heading color.
- bodyColor must be readable on white or light cards.
- metaColor should be soft and muted.
- Palette must feel premium, elegant, and wedding-appropriate.
- No markdown.
- No explanations.

Mood:
"${mood || 'elegant golden sunset'}"

Template style:
${templateId || 'classic'}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const palette = parseJsonObject(response.text());

  const requiredKeys = [
    'primaryColor',
    'secondaryColor',
    'headingColor',
    'subheadingColor',
    'bodyColor',
    'metaColor',
  ];

  for (const key of requiredKeys) {
    if (!HEX_COLOR_REGEX.test(String(palette[key] || ''))) {
      throw new Error(`Invalid or missing color for "${key}".`);
    }
  }

  return palette;
}

export async function generateWhatsAppMessage({
  bride,
  groom,
  date,
  venue,
  shareUrl,
  style = 'formal',
}) {
  const styleGuide = {
    formal: 'Dignified and traditional. Use proper salutation. Keep it warm but formal.',
    casual: 'Friendly, warm, simple, and heartfelt.',
    fun: 'Playful, joyful, upbeat, and celebratory.',
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'our special day';

  const prompt = `
You are a wedding invitation sharing assistant.

Generate a WhatsApp-ready message that the couple can copy and send to guests.

Rules:
- Include the invitation link naturally.
- Keep it under 150 words.
- Return only the message text.
- No explanation.
- No markdown.
- No quotes.

Style:
${styleGuide[style] || styleGuide.formal}

Bride:
${bride || 'the bride'}

Groom:
${groom || 'the groom'}

Date:
${formattedDate}

Venue:
${venue || 'our celebration venue'}

Invitation link:
${shareUrl || 'https://weddinginvites.online/invitation/...'}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return (response.text() || '').trim();
}

export async function generateInvitationWizard(input = {}) {
  const prompt = `
You are an expert digital wedding invitation planner, luxury copywriter, and design assistant.

Create a complete first draft for a wedding invitation builder from the user's answers.

Return only valid JSON.
No markdown.
No comments.
No explanations.

Use exactly this shape:
{
  "couple": {"bride": "", "groom": "", "title": ""},
  "event": {"date": "", "time": "", "venue": "", "address": "", "mapLink": ""},
  "events": [
    {"id": "1", "name": "", "date": "", "time": "", "venue": "", "address": "", "notes": ""}
  ],
  "family": {"brideParents": "", "groomParents": ""},
  "content": {
    "welcomeHeading": "",
    "introMessage": "",
    "invitationText": "",
    "quote": "",
    "familyMessage": "",
    "specialNotes": "",
    "dressCode": "",
    "rsvpText": "",
    "contact1": "",
    "contact2": ""
  },
  "theme": {
    "id": "ceremony",
    "primaryColor": "#876c57",
    "secondaryColor": "#efe2d3",
    "headingColor": "#6f5642",
    "subheadingColor": "#876c57",
    "bodyColor": "#705f53",
    "metaColor": "#9a7d66",
    "font": "serif",
    "backgroundStyle": "soft-gradient",
    "borderStyle": "rounded",
    "sectionShape": "rounded-3xl",
    "enableAnimation": true,
    "enableCountdown": true,
    "enableGallery": true,
    "enableVideo": true,
    "enableMusic": false
  }
}

Rules:
- Use the requested language for guest-facing text.
- Keep content elegant, concise, and premium.
- If date or time is not provided, leave it empty.
- If map link or phone numbers are not provided, leave them empty.
- Do not invent factual details.
- Use 2 to 4 event schedule items only when helpful.
- Theme id must be one of: ceremony, classic, floral, modern, traditional, mountain, noir, solstice.
- Colors must be valid 6-digit hex colors.
- secondaryColor must be soft and light unless template id is noir.
- Match the theme to culture, tone, event type, and color mood.

User answers:
Couple names: ${cleanText(input.coupleNames)}
Hosts or family names: ${cleanText(input.hostNames)}
Event type: ${cleanText(input.eventType)}
Event date: ${cleanText(input.eventDate)}
Event time: ${cleanText(input.eventTime)}
Venue or location: ${cleanText(input.venue)}
Culture or tradition: ${cleanText(input.culture)}
Tone: ${cleanText(input.tone)}
Language: ${cleanText(input.language)}
Color mood: ${cleanText(input.colorMood)}

Generate the JSON now.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const parsed = parseJsonObject(response.text());

  return normalizeWizardInvitation(parsed, input);
}

export async function generateMagicInvitation(
  promptText,
  mediaUrls = [],
  email,
  referenceUrl = '',
  referenceImageUrls = []
) {
  const prompt = `
You are an elite wedding invitation website creative director, luxury UI designer, event copywriter, and JSON data architect.

Your job is to generate a complete, production-ready wedding invitation website JSON.

Return only valid JSON.
No markdown.
No comments.
No explanations.
No placeholder text.
No fake URLs unless the user gave URLs.
No trailing commas.

The website must feel:
- premium
- emotional
- cinematic
- mobile-first
- elegant
- culturally appropriate
- professionally designed
- suitable for a luxury digital wedding invitation

Important data rules:
- Carefully identify bride and groom names from the user request.
- If gender is unclear, infer carefully from cultural/name context, but do not force it.
- Never invent date, time, phone number, map link, or venue details.
- If a factual detail is missing, return an empty string.
- Guest-facing text must use the requested language.
- Match tone, culture, religion, tradition, and event type.
- Keep copy elegant and concise.
- Avoid generic wording unless there is no better context.

Design rules:
- Choose the best theme id from:
  ceremony, classic, floral, modern, traditional, mountain, noir, solstice

- Use a luxury color palette based on the prompt and references.
- All colors must be valid 6-digit hex values.
- secondaryColor must be soft and light unless theme is noir.
- Text colors must be readable.
- Typography must match the wedding style.
- Prefer serif for luxury, classic, traditional, royal, or romantic themes.
- Prefer sans for modern, minimal, editorial, or clean themes.
- Avoid mono unless specifically requested.

Content quality:
- introMessage must feel emotional and custom.
- invitationText must sound like a premium invitation.
- quote must be short, elegant, and meaningful.
- familyMessage must respect host and family details.
- specialNotes should only include useful details.
- dressCode should be filled only if provided or strongly implied.
- rsvpText should be warm and clear.

Event structure:
- Use 1 to 5 events.
- Add multiple events only if useful, such as:
  Nikah, Reception, Haldi, Mehndi, Walima, Engagement, Dinner, Ceremony.
- Do not duplicate the same event.
- Keep event names culturally appropriate.

Media rules:
- Use uploaded media URLs only.
- Do not invent gallery images.
- If uploaded image parts are attached after this prompt, visually inspect each numbered image before assigning it.
- Assign media fields by what is visible in the uploaded images, not by upload order.
- Use the exact URL string from the matching uploaded media item.
- Never return labels such as "Uploaded image 1" in JSON fields. JSON media values must be exact URLs.
- If an image clearly shows the bride alone, use it as media.brideImage.
- If an image clearly shows the groom alone, use it as media.groomImage.
- If an image clearly shows the couple together, use it as media.coupleImage and it may also be the hero/cover image.
- If an image is wide, decorative, venue-focused, landscape, or cinematic, use it as media.heroImage or media.coverImage.
- Do not put a bride-only image in groomImage or a groom-only image in brideImage.
- If the role is uncertain, leave brideImage/groomImage empty and keep the image in gallery.
- Videos can be used as heroVideo.
- All uploaded image URLs should appear in gallery.
- If no media is provided, keep media fields empty.

Animation rules:
- Use cinematic but tasteful animation metadata.
- Avoid excessive animation.
- Animations should improve elegance, not distract.
- Mobile experience is priority.

Reference rules:
Use references only for inspiration:
- layout direction
- color mood
- typography feel
- animation style
- section flow

Never directly copy a reference website.

Return JSON matching this exact schema:
{
  "couple": {
    "bride": "",
    "groom": "",
    "title": ""
  },
  "event": {
    "date": "",
    "time": "",
    "venue": "",
    "address": "",
    "mapLink": ""
  },
  "events": [
    {
      "id": "1",
      "name": "",
      "date": "",
      "time": "",
      "venue": "",
      "address": "",
      "notes": ""
    }
  ],
  "family": {
    "brideParents": "",
    "groomParents": ""
  },
  "content": {
    "welcomeHeading": "",
    "introMessage": "",
    "invitationText": "",
    "quote": "",
    "familyMessage": "",
    "specialNotes": "",
    "dressCode": "",
    "rsvpText": "",
    "contact1": "",
    "contact2": ""
  },
  "theme": {
    "id": "ceremony",
    "primaryColor": "#876c57",
    "secondaryColor": "#efe2d3",
    "headingColor": "#6f5642",
    "subheadingColor": "#876c57",
    "bodyColor": "#705f53",
    "metaColor": "#9a7d66",
    "font": "serif",
    "backgroundStyle": "soft-gradient",
    "borderStyle": "rounded",
    "sectionShape": "rounded-3xl",
    "enableAnimation": true,
    "enableCountdown": true,
    "enableGallery": true,
    "enableVideo": true,
    "enableMusic": false
  },
  "media": {
    "heroVideo": "",
    "heroImage": "",
    "coverImage": "",
    "coupleImage": "",
    "brideImage": "",
    "groomImage": "",
    "gallery": []
  },
  "animation": {
    "enabled": true,
    "library": "gsap",
    "style": "luxury-cinematic",
    "sections": {
      "hero": "fade-up",
      "couple": "scale-in",
      "gallery": "stagger-fade",
      "timeline": "slide-up",
      "rsvp": "fade-in"
    }
  },
  "designMeta": {
    "mood": "",
    "style": "",
    "typography": "",
    "cinematicLevel": "high",
    "luxuryLevel": "high"
  }
}

User request:
"${cleanText(promptText)}"

Reference website:
"${cleanText(referenceUrl)}"

Uploaded media URLs:
${JSON.stringify(uniqueStrings(mediaUrls))}

Reference image URLs:
${JSON.stringify(safeArray(referenceImageUrls))}

User email:
"${cleanText(email)}"

Generate the final JSON now.
`;

  const uploadedImageParts = await buildUploadedImageParts(mediaUrls);
  const result = uploadedImageParts.length > 0
    ? await model.generateContent([{ text: prompt }, ...uploadedImageParts])
    : await model.generateContent(prompt);
  const response = await result.response;
  const parsed = parseJsonObject(response.text());

  const normalized = normalizeWizardInvitation(parsed, {});
  normalized.media = normalizeMedia(parsed.media, mediaUrls);
  normalized.animation = safeObject(parsed.animation);
  normalized.designMeta = safeObject(parsed.designMeta);

  return normalized;
}

export async function editMagicInvitation(
  currentInvitationData,
  editPrompt,
  referenceUrl = '',
  referenceImageUrls = []
) {
  const prompt = `
You are an elite wedding invitation website creative director, luxury UI designer, copywriter, and JSON editor.

You will receive the current invitation JSON and an edit request.

Your job:
- Update the JSON based on the edit request.
- Preserve all existing data unless the edit request clearly asks to change it.
- Keep the same schema.
- Return the complete updated JSON.

Return only valid JSON.
No markdown.
No comments.
No explanations.
No trailing commas.

Rules:
- Preserve existing names, dates, venue, media, family details, and RSVP details unless requested.
- Do not invent factual details.
- Keep guest-facing text elegant and premium.
- Match the current language and tone unless requested to change.
- If reference website or reference images are provided, use them only for inspiration.
- Never directly copy a reference website.

Current JSON:
${JSON.stringify(currentInvitationData, null, 2)}

Edit request:
"${cleanText(editPrompt)}"

Reference website:
"${cleanText(referenceUrl)}"

Reference image URLs:
${JSON.stringify(safeArray(referenceImageUrls))}

Return the complete updated JSON now.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const parsed = parseJsonObject(response.text());

  const merged = {
    ...currentInvitationData,
    ...parsed,
    couple: {
      ...safeObject(currentInvitationData?.couple),
      ...safeObject(parsed.couple),
    },
    event: {
      ...safeObject(currentInvitationData?.event),
      ...safeObject(parsed.event),
    },
    family: {
      ...safeObject(currentInvitationData?.family),
      ...safeObject(parsed.family),
    },
    content: {
      ...safeObject(currentInvitationData?.content),
      ...safeObject(parsed.content),
    },
    theme: {
      ...safeObject(currentInvitationData?.theme),
      ...safeObject(parsed.theme),
    },
    media: {
      ...safeObject(currentInvitationData?.media),
      ...safeObject(parsed.media),
    },
    animation: {
      ...safeObject(currentInvitationData?.animation),
      ...safeObject(parsed.animation),
    },
    designMeta: {
      ...safeObject(currentInvitationData?.designMeta),
      ...safeObject(parsed.designMeta),
    },
  };

  const normalized = normalizeWizardInvitation(merged, {});
  normalized.media = normalizeMedia(merged.media, []);
  normalized.animation = safeObject(merged.animation);
  normalized.designMeta = safeObject(merged.designMeta);

  return normalized;
}
