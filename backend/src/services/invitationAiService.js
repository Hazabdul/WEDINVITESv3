import Tesseract from 'tesseract.js';
import sharp from 'sharp';

const DEFAULT_ANALYSIS = {
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

const TEMPLATE_DIRECTIONS = {
  floral: ['floral', 'ceremony', 'classic'],
  minimal: ['modern', 'ceremony', 'classic'],
  luxury: ['classic', 'ceremony', 'modern'],
  traditional: ['traditional', 'classic', 'ceremony'],
  modern: ['ceremony', 'modern', 'classic'],
};

const TEMPLATE_METADATA = {
  ceremony: {
    name: 'Ceremony Portrait',
    description: 'Soft portrait-led invitation with editorial spacing and a formal ceremony tone.',
  },
  classic: {
    name: 'Classic Editorial',
    description: 'Structured and refined with elegant contrast, ideal for formal and luxury invites.',
  },
  floral: {
    name: 'Botanical Floral',
    description: 'Light floral styling with soft gradients and a romantic invitation mood.',
  },
  modern: {
    name: 'Modern Minimal',
    description: 'Clean cinematic styling with stronger contrast and a more minimal rhythm.',
  },
  traditional: {
    name: 'Traditional Gold',
    description: 'Formal ceremonial styling with ornate warmth and a classic invitation voice.',
  },
};

const DATE_PATTERNS = [
  /\b(?:mon|tues|wednes|thurs|fri|satur|sun)day,\s+\d{1,2}\s+[a-z]+\s+\d{4}\b/i,
  /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/,
  /\b\d{1,2}\s+[a-z]+\s+\d{4}\b/i,
  /\b[a-z]+\s+\d{1,2},\s+\d{4}\b/i,
];

const TIME_PATTERNS = [
  /\b\d{1,2}:\d{2}\s?(?:am|pm)\b/i,
  /\b\d{1,2}\s?(?:am|pm)\b/i,
];

const PHONE_PATTERNS = [
  /\+\d{1,3}[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/,
  /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/,
];

const VENUE_HINTS = ['venue', 'hall', 'hotel', 'pavilion', 'ballroom', 'garden', 'resort', 'palace'];
const ADDRESS_HINTS = ['street', 'st.', 'avenue', 'ave', 'road', 'rd', 'boulevard', 'blvd', 'riyadh', 'jeddah', 'dubai'];
const EVENT_KEYWORDS = [
  { key: 'wedding', value: 'Wedding Ceremony' },
  { key: 'nikah', value: 'Nikah Ceremony' },
  { key: 'engagement', value: 'Engagement Celebration' },
  { key: 'birthday', value: 'Birthday Celebration' },
  { key: 'reception', value: 'Wedding Reception' },
  { key: 'bridal shower', value: 'Bridal Shower' },
];

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeHexColor(input) {
  if (!input) return null;
  const value = `${input}`.trim().toUpperCase();
  return /^#([\dA-F]{6}|[\dA-F]{3})$/.test(value) ? value : null;
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
}

function clamp(value, min = 0, max = 255) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;

  const value = normalized.slice(1);
  const expanded = value.length === 3
    ? value.split('').map((char) => char + char).join('')
    : value;

  const integer = Number.parseInt(expanded, 16);

  return {
    r: (integer >> 16) & 255,
    g: (integer >> 8) & 255,
    b: integer & 255,
  };
}

function rgbToHex(rgb) {
  if (!rgb) return null;
  return `#${[rgb.r, rgb.g, rgb.b].map((channel) => clamp(channel).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

function mixColors(colorA, colorB, weight = 0.5) {
  const first = hexToRgb(colorA);
  const second = hexToRgb(colorB);
  if (!first) return normalizeHexColor(colorB);
  if (!second) return normalizeHexColor(colorA);

  const ratio = Math.max(0, Math.min(1, weight));
  return rgbToHex({
    r: first.r + (second.r - first.r) * ratio,
    g: first.g + (second.g - first.g) * ratio,
    b: first.b + (second.b - first.b) * ratio,
  });
}

function shiftColor(hex, amount) {
  const rgb = hexToRgb(hex);
  if (!rgb) return normalizeHexColor(hex);

  return rgbToHex({
    r: rgb.r + amount,
    g: rgb.g + amount,
    b: rgb.b + amount,
  });
}

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const channels = [rgb.r, rgb.g, rgb.b].map((value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function sortPalette(colors) {
  return dedupe(colors.map(normalizeHexColor)).sort((left, right) => relativeLuminance(left) - relativeLuminance(right));
}

function averageHex(pixel) {
  return `#${[pixel.r, pixel.g, pixel.b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

function scorePixelGroup(pixel) {
  const brightness = pixel.r + pixel.g + pixel.b;
  const saturation = Math.max(pixel.r, pixel.g, pixel.b) - Math.min(pixel.r, pixel.g, pixel.b);
  return brightness * 0.4 + saturation * 1.6;
}

async function extractPalette(filePath) {
  const { data, info } = await sharp(filePath)
    .resize(48, 48, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = [];

  for (let index = 0; index < data.length; index += info.channels) {
    pixels.push({
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
    });
  }

  const sorted = pixels
    .map((pixel) => ({ pixel, score: scorePixelGroup(pixel) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 18)
    .map(({ pixel }) => averageHex(pixel));

  return dedupe(sorted.map(normalizeHexColor)).slice(0, 5);
}

async function extractImageMeta(filePath) {
  const metadata = await sharp(filePath).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  let layout = 'centered';

  if (height > width * 1.1) {
    layout = 'portrait';
  } else if (width > height * 1.1) {
    layout = 'landscape';
  }

  return { width, height, layout };
}

function cleanOcrText(text) {
  return text
    .replace(/[|]/g, 'I')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractText(filePath) {
  const result = await Tesseract.recognize(filePath, 'eng', {
    logger: () => {},
  });

  return cleanOcrText(result.data?.text || '');
}

function findFirstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[0]) return match[0].trim();
  }
  return '';
}

function getLines(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractHostLine(lines) {
  return lines.find((line) => /together|families|parents|host/i.test(line)) || '';
}

function extractInvitationMessage(lines) {
  return lines.find((line) => /invite|request the pleasure|join us|celebration/i.test(line)) || '';
}

function inferEventType(text) {
  const haystack = text.toLowerCase();
  const match = EVENT_KEYWORDS.find((item) => haystack.includes(item.key));
  return match?.value || 'Invitation Event';
}

function inferCardType(eventType) {
  const value = eventType.toLowerCase();
  if (value.includes('birthday')) return 'birthday';
  if (value.includes('engagement')) return 'engagement';
  if (value.includes('nikah')) return 'nikah';
  if (value.includes('reception')) return 'reception';
  return 'wedding';
}

function looksLikeName(line) {
  if (!line || line.length > 40) return false;
  if (/\d/.test(line)) return false;
  if (/venue|address|rsvp|time|date|phone|call|whatsapp/i.test(line)) return false;
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 4) return false;
  return words.every((word) => /^[A-Z][a-zA-Z'`-]+$/.test(word));
}

function extractNames(lines) {
  const filtered = lines.filter(looksLikeName).slice(0, 8);
  const joinedText = lines.join(' ');
  const withAmpersand = joinedText.match(/([A-Z][a-zA-Z'-]+)\s*(?:&|and)\s*([A-Z][a-zA-Z'-]+)/);

  if (withAmpersand) {
    return {
      bride_name: withAmpersand[1] || '',
      groom_name: withAmpersand[2] || '',
    };
  }

  return {
    bride_name: filtered[0] || '',
    groom_name: filtered[1] || '',
  };
}

function findLineByHint(lines, hints) {
  return lines.find((line) => hints.some((hint) => line.toLowerCase().includes(hint))) || '';
}

function extractVenue(lines) {
  const hinted = findLineByHint(lines, VENUE_HINTS);
  if (hinted) return hinted.replace(/^venue[:\s-]*/i, '').trim();
  return lines.find((line) => /at\s+[A-Za-z]/.test(line) && !/\d{1,2}:\d{2}/.test(line)) || '';
}

function extractAddress(lines) {
  const hinted = findLineByHint(lines, ADDRESS_HINTS);
  if (hinted) return hinted.replace(/^address[:\s-]*/i, '').trim();
  return lines.find((line) => /,/.test(line) && ADDRESS_HINTS.some((hint) => line.toLowerCase().includes(hint))) || '';
}

function inferTheme(text, colors) {
  const haystack = text.toLowerCase();
  const warmColors = colors.some((color) => /^#(?:F|E|D|C)/.test(color.replace('#', '')));

  if (/floral|rose|flower|garden|blossom/.test(haystack)) return 'floral';
  if (/minimal|simple|clean/.test(haystack)) return 'minimal';
  if (/traditional|classic|arabic/.test(haystack)) return 'traditional';
  if (/gold|luxury|elegant|royal/.test(haystack) || warmColors) return 'luxury';
  return 'modern';
}

function inferFontStyle(text) {
  const haystack = text.toLowerCase();
  if (/calligraphy|script|cursive/.test(haystack)) return 'script';
  if (/minimal|modern|clean/.test(haystack)) return 'modern';
  return 'serif';
}

function inferDesignElements(text, theme, layout) {
  const haystack = text.toLowerCase();
  const elements = [];

  if (/floral|rose|flower|leaf|garden/.test(haystack) || theme === 'floral') elements.push('floral');
  if (/border|frame|outline/.test(haystack) || theme === 'luxury' || theme === 'traditional') elements.push('border');
  if (/geometric|line|arch/.test(haystack) || theme === 'modern') elements.push('geometric');
  if (layout === 'portrait') elements.push('centered');
  if (elements.length === 0) elements.push('ornamental');

  return dedupe(elements);
}

function buildNotes(text) {
  if (!text) return 'Limited OCR text was detected. Review the extracted details manually.';
  if (text.length < 80) return 'OCR extracted partial text. Review names, venue, and timing before export.';
  return 'Details were extracted with OCR and heuristic parsing. Review before final export.';
}

export async function analyzeInvitationImage(file) {
  const [text, primaryColors, imageMeta] = await Promise.all([
    extractText(file.path),
    extractPalette(file.path),
    extractImageMeta(file.path),
  ]);

  const lines = getLines(text);
  const names = extractNames(lines);
  const eventType = inferEventType(text);
  const cardType = inferCardType(eventType);
  const theme = inferTheme(text, primaryColors);
  const fontStyle = inferFontStyle(text);
  const designElements = inferDesignElements(text, theme, imageMeta.layout);

  return {
    ...DEFAULT_ANALYSIS,
    card_type: cardType,
    bride_name: names.bride_name,
    groom_name: names.groom_name,
    host_line: extractHostLine(lines),
    invitation_message: extractInvitationMessage(lines),
    event_type: eventType,
    date: findFirstMatch(text, DATE_PATTERNS),
    time: findFirstMatch(text, TIME_PATTERNS),
    venue: extractVenue(lines),
    address: extractAddress(lines),
    rsvp_phone: findFirstMatch(text, PHONE_PATTERNS),
    notes: buildNotes(text),
    visual_style: {
      theme,
      primary_colors: primaryColors,
      layout: imageMeta.layout,
      font_style: fontStyle,
      design_elements: designElements,
    },
  };
}

function inferTemplateIds(theme, cardType) {
  if (theme.includes('floral')) return TEMPLATE_DIRECTIONS.floral;
  if (theme.includes('minimal')) return TEMPLATE_DIRECTIONS.minimal;
  if (theme.includes('luxury')) return TEMPLATE_DIRECTIONS.luxury;
  if (theme.includes('traditional') || cardType === 'nikah') return TEMPLATE_DIRECTIONS.traditional;
  return TEMPLATE_DIRECTIONS.modern;
}

function inferFontFamily(fontStyle, templateId) {
  const style = normalizeString(fontStyle).toLowerCase();

  if (style.includes('script')) {
    return 'Georgia, Cambria, "Times New Roman", serif';
  }

  if (style.includes('modern') || style.includes('minimal') || templateId === 'modern') {
    return '"Segoe UI", "Helvetica Neue", Arial, sans-serif';
  }

  return '"Palatino Linotype", "Book Antiqua", Georgia, serif';
}

function buildThemeFromPalette(templateId, visualStyle = {}) {
  const palette = sortPalette(visualStyle.primary_colors || []);
  const darkest = palette[0] || '#5C4B44';
  const medium = palette[Math.max(1, Math.floor(palette.length / 2))] || shiftColor(darkest, 32) || '#876C57';
  const lightest = palette[palette.length - 1] || '#F4EEE7';
  const floralAccent = palette[palette.length - 2] || mixColors(medium, lightest, 0.5) || '#D7C9E3';

  const templatePrimary = templateId === 'floral'
    ? floralAccent
    : templateId === 'modern'
      ? darkest
      : medium;

  const secondaryBase = templateId === 'modern'
    ? mixColors(lightest, '#F3F4F6', 0.35)
    : mixColors(lightest, '#FFFFFF', 0.4);

  const headingColor = relativeLuminance(templatePrimary) > 0.52
    ? shiftColor(templatePrimary, -85)
    : templatePrimary;

  return {
    id: templateId,
    primaryColor: normalizeHexColor(templatePrimary) || '#876C57',
    secondaryColor: normalizeHexColor(secondaryBase) || '#F4EEE7',
    headingColor: normalizeHexColor(headingColor) || '#6F5642',
    subheadingColor: normalizeHexColor(mixColors(templatePrimary, darkest, 0.35)) || '#876C57',
    bodyColor: normalizeHexColor(mixColors(darkest, lightest, 0.18)) || '#705F53',
    metaColor: normalizeHexColor(mixColors(medium, lightest, 0.28)) || '#9A7D66',
    font: inferFontFamily(visualStyle.font_style, templateId),
    backgroundStyle: visualStyle.layout === 'portrait' ? 'soft-gradient' : 'pattern',
    borderStyle: templateId === 'modern' ? 'soft' : 'rounded',
    sectionShape: templateId === 'modern' ? 'rounded-2xl' : 'rounded-3xl',
    enableAnimation: true,
    enableCountdown: true,
    enableGallery: true,
    enableVideo: false,
    enableMusic: false,
  };
}

function buildTemplateOption(templateId, visualStyle) {
  return {
    id: templateId,
    ...TEMPLATE_METADATA[templateId],
    theme: buildThemeFromPalette(templateId, visualStyle),
  };
}

export async function generateInvitationTemplates(input) {
  const theme = normalizeString(input?.visual_style?.theme || '').toLowerCase();
  const cardType = normalizeString(input?.card_type || '').toLowerCase();
  const visualStyle = input?.visual_style || {};

  return inferTemplateIds(theme, cardType).map((templateId) => buildTemplateOption(templateId, visualStyle));
}
