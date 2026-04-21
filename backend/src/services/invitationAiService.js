import Tesseract from 'tesseract.js';
import sharp from 'sharp';

const DEFAULT_ANALYSIS = {
  card_type: '',
  bride_name: '',
  groom_name: '',
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

const TEMPLATE_LIBRARY = {
  floral: ['/tpl-floral.png', '/tpl-classic.png', '/tpl-modern.png'],
  minimal: ['/tpl-modern.png', '/tpl-arabic.png', '/tpl-classic.png'],
  luxury: ['/tpl-classic.png', '/tpl-floral.png', '/tpl-arabic.png'],
  traditional: ['/tpl-arabic.png', '/tpl-classic.png', '/tpl-floral.png'],
  modern: ['/tpl-modern.png', '/tpl-classic.png', '/tpl-floral.png'],
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

export async function generateInvitationTemplates(input) {
  const theme = normalizeString(input?.visual_style?.theme || '').toLowerCase();
  const cardType = normalizeString(input?.card_type || '').toLowerCase();

  if (theme.includes('floral')) return TEMPLATE_LIBRARY.floral;
  if (theme.includes('minimal')) return TEMPLATE_LIBRARY.minimal;
  if (theme.includes('luxury')) return TEMPLATE_LIBRARY.luxury;
  if (theme.includes('traditional') || cardType === 'nikah') return TEMPLATE_LIBRARY.traditional;
  return TEMPLATE_LIBRARY.modern;
}
