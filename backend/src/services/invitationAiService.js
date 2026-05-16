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
  raw_text: '',
  missing_fields: [],
  confidence: {
    overall: 0,
    ocr: 0,
    names: 0,
    date: 0,
    time: 0,
    venue: 0,
    address: 0,
    rsvp_phone: 0,
    visual_style: 0,
  },
  extraction_meta: {
    parser_version: '2.0.0',
    ocr_languages: '',
    text_length: 0,
    line_count: 0,
    image: null,
  },
  visual_style: {
    theme: '',
    primary_colors: [],
    layout: '',
    font_style: '',
    design_elements: [],
    mood_tags: [],
  },
};

const TEMPLATE_DIRECTIONS = {
  floral: ['glassGarden', 'editorialPearl', 'royalHeirloom'],
  botanical: ['glassGarden', 'editorialPearl', 'futureBloom'],
  minimal: ['editorialPearl', 'glassGarden', 'midnightJazz'],
  luxury: ['royalHeirloom', 'editorialPearl', 'midnightJazz'],
  traditional: ['royalHeirloom', 'editorialPearl', 'glassGarden'],
  modern: ['editorialPearl', 'futureBloom', 'glassGarden'],
  artDeco: ['midnightJazz', 'editorialPearl', 'royalHeirloom'],
  futuristic: ['futureBloom', 'glassGarden', 'editorialPearl'],
};

const TEMPLATE_METADATA = {
  editorialPearl: {
    name: "Editorial Pearl",
    description: "Soft editorial luxury with pearl-white textures, refined typography, and premium pacing.",

    aiPrompt: `
      Create an ultra-premium online wedding invitation inspired by luxury bridal editorials from Vogue, Harper’s Bazaar, and high-fashion wedding campaigns.

      DESIGN LANGUAGE:
      The experience should feel cinematic, emotionally refined, calm, timeless, and impossibly elegant.
      Every section must breathe with intentional negative space.
      The interface should feel designed by an elite luxury art director, not a template marketplace.

      VISUAL STYLE:
      Use soft pearl white backgrounds mixed with warm ivory gradients and champagne undertones.
      Add realistic paper grain texture, subtle embossed edges, delicate foil details, and soft studio shadows.
      Include extremely refined serif typography with oversized couple names and tiny uppercase supporting text.
      Use asymmetrical editorial composition inspired by luxury magazines.
      Layer subtle translucent textures and elegant typography hierarchy.

      LIGHTING:
      Simulate soft diffused studio lighting.
      Add ambient warm reflections as if light is hitting premium textured paper.
      Use soft edge vignettes and luxury product-photography shadows.

      DEPTH & MATERIALS:
      The invitation should feel tactile and physical.
      Add realistic pearl paper textures, soft foil reflections, embossed typography depth, and layered card surfaces.
      Use premium material rendering quality.

      ANIMATION & MOTION:
      Motion must feel slow, cinematic, expensive, and intentional.
      No generic UI animation.
      Typography should reveal elegantly with blur-to-focus transitions.
      Background textures should move subtly like breathing fabric.
      Add slow luxury light sweeps across metallic edges.
      Create a magazine-cover reveal feeling.

      INTERACTION:
      Mouse movement should create gentle parallax depth.
      Hover interactions should trigger subtle champagne reflections.
      Sections should transition like editorial page spreads.

      ATMOSPHERE:
      Sophisticated, emotionally calm, editorial luxury, modern bridal fashion aesthetic.

      IMPORTANT:
      Avoid generic wedding clichés.
      Avoid overcrowded floral borders.
      Avoid cheap gold effects.
      Avoid cartoon styling.
      Avoid stock-template appearance.

      FINAL FEELING:
      The invitation should feel like a luxury fashion house designed a wedding experience for royalty.
    `,
  },

  royalHeirloom: {
    name: "Royal Heirloom",
    description: "Regal palace-inspired wedding directions with ornate gold details and ceremonial luxury.",

    aiPrompt: `
      Design a majestic royal wedding invitation inspired by Mughal palaces, ceremonial halls, royal manuscripts, and antique heirloom art.

      EXPERIENCE:
      The invitation should feel ceremonial, regal, immersive, handcrafted, and historically luxurious.
      It must feel like a digital royal proclamation from an ancient palace dynasty.

      VISUAL STYLE:
      Use deep oxblood velvet, antique gold, dark maroon, aged ivory, and warm amber lighting.
      Create intricate palace-inspired ornamental borders with engraved detailing.
      Add symmetrical royal compositions with grand arches and carved geometric patterns.
      Use realistic embossed gold foil textures and engraved metallic surfaces.
      Include layered ornamental frames with dimensional depth.

      MATERIALS & TEXTURES:
      Velvet textures should feel soft and luxurious.
      Gold should appear physically embossed and reflective.
      Add candlelit paper textures and subtle aging details.
      Use handcrafted luxury detailing everywhere.

      LIGHTING:
      Simulate warm palace candlelight reflecting across gold ornaments.
      Add flickering ambient lighting from unseen ceremonial lanterns.
      Create cinematic shadow depth and dramatic warm highlights.

      TYPOGRAPHY:
      Use timeless royal serif typography with engraved elegance.
      Couple names should feel monumental and ceremonial.
      Supporting text should feel like royal palace announcements.

      ANIMATION:
      Golden ornaments should draw themselves dynamically.
      Palace arches should emerge slowly with depth perspective.
      Gold reflections should react naturally to movement.
      Candlelight flicker should subtly animate across surfaces.
      Floating ember particles should drift slowly.

      INTERACTION:
      Hovering should create metallic shimmer and lighting movement.
      Motion should feel grand, ceremonial, and emotionally powerful.

      ATMOSPHERE:
      Royal, luxurious, sacred, timeless, cinematic, ceremonial grandeur.

      IMPORTANT:
      Avoid generic mandala overload.
      Avoid flat vector graphics.
      Avoid cheap shiny gold.
      Avoid repetitive wedding patterns.

      FINAL FEELING:
      The invitation should feel worthy of a royal palace wedding attended by nobility.
    `,
  },

  glassGarden: {
    name: "Glass Garden",
    description: "Airy botanical luxury with frosted glass layers, organic depth, and soft greenery.",

    aiPrompt: `
      Create a futuristic botanical luxury wedding invitation set inside a cinematic glass greenhouse filled with atmospheric light and organic elegance.

      EXPERIENCE:
      The invitation should feel fresh, airy, premium, romantic, and architecturally beautiful.
      It should combine luxury UI design with nature-inspired emotional storytelling.

      VISUAL STYLE:
      Use layered frosted glass panels floating above soft botanical environments.
      Add realistic glass refraction, translucent overlays, blurred leaves, dewdrop reflections, and sunlight diffusion.
      Use modern editorial spacing with clean composition and airy breathing room.
      Create elegant botanical depth without relying on obvious floral decorations.

      COLOR SYSTEM:
      Use sage green, ivory white, warm botanical gold, eucalyptus tones, soft olive shadows, and diffused natural sunlight.
      Keep colors sophisticated and organic.

      DEPTH:
      Build layered depth with foreground leaves, middle glass panels, and softly blurred botanical backgrounds.
      Add realistic environmental depth blur and cinematic atmosphere.

      LIGHTING:
      Simulate warm greenhouse sunlight entering through glass ceilings.
      Add subtle moving leaf shadows and soft natural reflections.
      Use ambient morning-garden lighting.

      TYPOGRAPHY:
      Elegant serif names combined with minimal luxury sans-serif details.
      Typography should feel breathable, modern, and premium.

      MOTION:
      Glass panels should slide smoothly with elegant blur transitions.
      Botanical shadows should move naturally as if wind is flowing through the greenhouse.
      Light reflections should travel subtly across glass surfaces.
      Dew particles should sparkle softly.

      INTERACTION:
      Cursor movement should create premium glass parallax.
      Hover should trigger realistic refraction and glare movement.
      Background leaves should shift organically with depth.

      ATMOSPHERE:
      Organic luxury, modern romance, elegant botanical calmness, luxury architecture.

      IMPORTANT:
      Avoid generic flower illustrations.
      Avoid cluttered floral borders.
      Avoid basic Pinterest aesthetics.

      FINAL FEELING:
      The invitation should feel like a luxury greenhouse wedding designed by a world-class interior architect.
    `,
  },

  midnightJazz: {
    name: "Midnight Jazz",
    description: "Bold Art Deco glam with midnight black, brushed gold, and cinematic jazz-club drama.",

    aiPrompt: `
      Create a glamorous black-tie wedding invitation inspired by Art Deco architecture, luxury jazz clubs, midnight hotel ballrooms, and cinematic nightlife elegance.

      EXPERIENCE:
      The invitation should feel dramatic, seductive, luxurious, cinematic, and unforgettable.
      Imagine Gatsby-era sophistication reimagined through modern digital luxury.

      VISUAL STYLE:
      Use black lacquer surfaces, brushed gold geometry, velvet darkness, and dramatic amber spotlights.
      Build strong Art Deco framing with geometric elegance and luxury symmetry.
      Add smoky atmosphere layers and cinematic lighting depth.
      Use dramatic vertical compositions and elegant luxury spacing.

      MATERIALS:
      Reflective lacquer textures, brushed gold metal, velvet shadows, smoky ambient atmosphere, polished marble surfaces.

      LIGHTING:
      Simulate luxury ballroom spotlights and jazz-club mood lighting.
      Add warm amber glow reflections and dramatic cinematic contrast.

      TYPOGRAPHY:
      Use tall elegant typography inspired by luxury theatre marquees.
      Couple names should feel iconic and cinematic.

      MOTION:
      Gold geometric lines should animate outward like theatre lights powering on.
      Spotlights should move slowly across typography.
      Smoke should drift subtly in the background.
      Gold edges should pulse with ambient warmth.

      INTERACTION:
      Hover effects should create stage-light shimmer across metallic lines.
      Cursor movement should subtly shift spotlight angles.

      ATMOSPHERE:
      Glamorous, cinematic, seductive, luxurious, unforgettable black-tie elegance.

      IMPORTANT:
      Avoid old dusty vintage styling.
      Avoid overdecorated retro clutter.
      Keep it sharp, premium, and cinematic.

      FINAL FEELING:
      The invitation should feel like entering a luxury ballroom before the most glamorous night of the decade.
    `,
  },

  futureBloom: {
    name: "Future Bloom",
    description: "Futuristic romance with holographic florals, luminous depth, and modern ethereal motion.",

    aiPrompt: `
      Design a futuristic AI-generated romantic wedding invitation where holographic flowers bloom dynamically from light, particles, and emotion.

      EXPERIENCE:
      The invitation should feel alive, intelligent, emotional, futuristic, and visually revolutionary.
      It should feel like love visualized through advanced digital art.

      VISUAL STYLE:
      Use deep midnight environments combined with holographic gradients, iridescent reflections, luminous petals, and glassmorphism surfaces.
      Build dynamic flower systems generated from glowing particles and flowing light trails.
      Create cinematic futuristic depth with elegant restraint.

      COLOR SYSTEM:
      Use luminous cyan, soft neon pink, iridescent lavender, holographic silver, midnight blue, and glowing pearl highlights.

      MATERIALS:
      Transparent holographic glass, liquid chrome reflections, glowing particle blooms, translucent light petals.

      LIGHTING:
      Add reactive ambient glow systems.
      Use soft neon edge lighting and atmospheric bloom effects.
      Create cinematic futuristic illumination with emotional warmth.

      TYPOGRAPHY:
      Typography should feel elegant, intelligent, futuristic, and emotionally soft.
      Couple names should feel like the center of a living digital ecosystem.

      MOTION:
      Flowers should assemble dynamically from particles.
      Holographic surfaces should shift color naturally.
      Floating light trails should orbit typography.
      Petals should react organically to interaction.
      Use cinematic liquid transitions and glass morphing.

      INTERACTION:
      Cursor movement should affect holographic light refractions.
      Hovering should trigger blooming flower expansion.
      Particle systems should react intelligently to motion.

      ATMOSPHERE:
      Futuristic romance, emotional technology, elegant AI art, cinematic holographic beauty.

      IMPORTANT:
      Avoid aggressive cyberpunk aesthetics.
      Avoid gaming UI visuals.
      Avoid harsh neon overload.

      FINAL FEELING:
      The invitation should feel like the future of love designed by an AI luxury art studio from 2050.
    `,
  },
};

const OCR_LANGUAGES = process.env.INVITATION_OCR_LANGUAGES || 'eng+ara';
const PARSER_VERSION = '2.0.0';

const MONTH_PATTERN = [
  'jan(?:uary)?', 'feb(?:ruary)?', 'mar(?:ch)?', 'apr(?:il)?', 'may', 'jun(?:e)?',
  'jul(?:y)?', 'aug(?:ust)?', 'sep(?:t(?:ember)?)?', 'oct(?:ober)?', 'nov(?:ember)?', 'dec(?:ember)?',
  '\\u064A\\u0646\\u0627\\u064A\\u0631', '\\u0641\\u0628\\u0631\\u0627\\u064A\\u0631',
  '\\u0645\\u0627\\u0631\\u0633', '\\u0623\\u0628\\u0631\\u064A\\u0644', '\\u0627\\u0628\\u0631\\u064A\\u0644',
  '\\u0645\\u0627\\u064A\\u0648', '\\u064A\\u0648\\u0646\\u064A\\u0648', '\\u064A\\u0648\\u0644\\u064A\\u0648',
  '\\u0623\\u063A\\u0633\\u0637\\u0633', '\\u0627\\u063A\\u0633\\u0637\\u0633', '\\u0633\\u0628\\u062A\\u0645\\u0628\\u0631',
  '\\u0623\\u0643\\u062A\\u0648\\u0628\\u0631', '\\u0627\\u0643\\u062A\\u0648\\u0628\\u0631', '\\u0646\\u0648\\u0641\\u0645\\u0628\\u0631',
  '\\u062F\\u064A\\u0633\\u0645\\u0628\\u0631',
].join('|');

const DAY_PATTERN = [
  'mon(?:day)?', 'tue(?:sday)?', 'wed(?:nesday)?', 'thu(?:rsday)?', 'fri(?:day)?', 'sat(?:urday)?', 'sun(?:day)?',
  '\\u0627\\u0644\\u0633\\u0628\\u062A', '\\u0627\\u0644\\u0623\\u062D\\u062F', '\\u0627\\u0644\\u0627\\u062D\\u062F',
  '\\u0627\\u0644\\u0627\\u062B\\u0646\\u064A\\u0646', '\\u0627\\u0644\\u062B\\u0644\\u0627\\u062B\\u0627\\u0621',
  '\\u0627\\u0644\\u0623\\u0631\\u0628\\u0639\\u0627\\u0621', '\\u0627\\u0644\\u0627\\u0631\\u0628\\u0639\\u0627\\u0621',
  '\\u0627\\u0644\\u062E\\u0645\\u064A\\u0633', '\\u0627\\u0644\\u062C\\u0645\\u0639\\u0629',
].join('|');

const DATE_PATTERNS = [
  new RegExp(`(?:${DAY_PATTERN})[,]?\\s+\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTH_PATTERN})\\s+\\d{2,4}`, 'iu'),
  new RegExp(`\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTH_PATTERN})\\s+\\d{2,4}`, 'iu'),
  new RegExp(`(?:${MONTH_PATTERN})\\s+\\d{1,2}(?:st|nd|rd|th)?[,]?\\s+\\d{2,4}`, 'iu'),
  /\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b/u,
  /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/u,
  new RegExp(`(?:${DAY_PATTERN})[,]?\\s+\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTH_PATTERN})`, 'iu'),
  new RegExp(`(?:${MONTH_PATTERN})\\s+\\d{1,2}(?:st|nd|rd|th)?`, 'iu'),
];

const TIME_PATTERNS = [
  /\b(?:[01]?\d|2[0-3])[:.]\s?[0-5]\d\s?(?:am|pm|a\.m\.|p\.m\.)\b/iu,
  /\b(?:[01]?\d|2[0-3])[:.]\s?[0-5]\d\b/u,
  /\b\d{1,2}\s?(?:am|pm|a\.m\.|p\.m\.)\b/iu,
  /\b\d{1,2}(?:[:.]\d{2})?\s?(?:\u0635\u0628\u0627\u062D\u0627|\u0635\u0628\u0627\u062D|\u0645\u0633\u0627\u0621|\u0645\u0633\u0627\u0621\u064B|\u0635|\u0645)\b/iu,
];

const PHONE_PATTERN = /(?:\+|00)?(?:\d[\s().-]?){7,16}\d/g;

const EVENT_KEYWORDS = [
  { keys: ['bridal shower'], value: 'Bridal Shower', cardType: 'bridal_shower' },
  { keys: ['engagement', 'betrothal', '\u062E\u0637\u0648\u0628\u0629'], value: 'Engagement Celebration', cardType: 'engagement' },
  { keys: ['nikah', 'nikkah', 'katb kitab', '\u0639\u0642\u062F \u0642\u0631\u0627\u0646', '\u0645\u0644\u0643\u0629'], value: 'Nikah Ceremony', cardType: 'nikah' },
  { keys: ['reception', 'walima', '\u0627\u0633\u062A\u0642\u0628\u0627\u0644', '\u0648\u0644\u064A\u0645\u0629'], value: 'Wedding Reception', cardType: 'reception' },
  { keys: ['wedding', 'marriage', 'weds', 'save the date', '\u0632\u0648\u0627\u062C', '\u0639\u0631\u0633', '\u0632\u0641\u0627\u0641'], value: 'Wedding Ceremony', cardType: 'wedding' },
  { keys: ['birthday', '\u0639\u064A\u062F \u0645\u064A\u0644\u0627\u062F'], value: 'Birthday Celebration', cardType: 'birthday' },
  { keys: ['anniversary'], value: 'Anniversary Celebration', cardType: 'anniversary' },
  { keys: ['graduation'], value: 'Graduation Celebration', cardType: 'graduation' },
];

const HOST_HINTS = [
  'together', 'families', 'parents', 'host', 'honour of', 'honor of', 'cordially',
  '\u064A\u062A\u0634\u0631\u0641', '\u0627\u0644\u0639\u0627\u0626\u0644\u0629', '\u0627\u0644\u0648\u0627\u0644\u062F\u064A\u0646',
];

const INVITATION_HINTS = [
  'invite', 'request the pleasure', 'join us', 'celebration', 'celebrate with us', 'pleasure of your company',
  '\u064A\u0633\u0631\u0646\u0627', '\u0646\u062F\u0639\u0648\u0643\u0645', '\u062F\u0639\u0648\u0629', '\u0628\u062D\u0636\u0648\u0631\u0643\u0645',
];

const VENUE_LABELS = [
  'venue', 'location', 'place', 'at',
  '\u0627\u0644\u0645\u0648\u0642\u0639', '\u0627\u0644\u0645\u0643\u0627\u0646', '\u0627\u0644\u0642\u0627\u0639\u0629',
];

const VENUE_HINTS = [
  'venue', 'hall', 'hotel', 'pavilion', 'ballroom', 'garden', 'resort', 'palace', 'estate', 'club', 'lounge', 'terrace',
  '\u0642\u0627\u0639\u0629', '\u0641\u0646\u062F\u0642', '\u0642\u0635\u0631', '\u0645\u0646\u062A\u062C\u0639', '\u0627\u0633\u062A\u0631\u0627\u062D\u0629',
];

const ADDRESS_LABELS = [
  'address', 'map', 'directions', 'street', 'road', 'avenue',
  '\u0627\u0644\u0639\u0646\u0648\u0627\u0646', '\u0627\u0644\u062E\u0631\u064A\u0637\u0629', '\u0627\u0644\u0645\u0648\u0642\u0639',
];

const ADDRESS_HINTS = [
  'street', 'st.', 'avenue', 'ave', 'road', 'rd', 'boulevard', 'blvd', 'riyadh', 'jeddah', 'dubai', 'doha', 'dammam',
  'saudi', 'ksa', 'uae', 'district', 'city', 'near',
  '\u0627\u0644\u0631\u064A\u0627\u0636', '\u062C\u062F\u0629', '\u062F\u0628\u064A', '\u0627\u0644\u062F\u0645\u0627\u0645', '\u0627\u0644\u062E\u0628\u0631',
  '\u0634\u0627\u0631\u0639', '\u062D\u064A', '\u0637\u0631\u064A\u0642',
];

const DATE_LABELS = ['date', 'day', 'when', '\u0627\u0644\u062A\u0627\u0631\u064A\u062E', '\u0627\u0644\u064A\u0648\u0645'];
const TIME_LABELS = ['time', 'hour', 'starts', '\u0627\u0644\u0648\u0642\u062A', '\u0627\u0644\u0633\u0627\u0639\u0629'];
const PHONE_LABELS = ['rsvp', 'phone', 'call', 'whatsapp', 'contact', '\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0636\u0648\u0631', '\u0648\u0627\u062A\u0633'];

const FIELD_EXCLUSION_WORDS = [
  'venue', 'address', 'rsvp', 'time', 'date', 'phone', 'call', 'whatsapp', 'hotel', 'hall', 'street', 'road', 'invitation',
  'wedding', 'ceremony', 'reception', 'celebration', 'save the date', 'honour', 'honor', 'invite', 'together',
  '\u0627\u0644\u0645\u0648\u0642\u0639', '\u0627\u0644\u0639\u0646\u0648\u0627\u0646', '\u0627\u0644\u0633\u0627\u0639\u0629', '\u0627\u0644\u062A\u0627\u0631\u064A\u062E', '\u062F\u0639\u0648\u0629',
];

const THEME_KEYWORDS = {
  floral: ['floral', 'rose', 'flower', 'garden', 'blossom', 'leaf', 'botanical', 'greenhouse', 'petal', '\u0648\u0631\u062F', '\u0632\u0647\u0631', '\u062D\u062F\u064A\u0642\u0629'],
  minimal: ['minimal', 'simple', 'clean', 'quiet', 'modern', 'white space', 'editorial'],
  luxury: ['gold', 'luxury', 'elegant', 'royal', 'champagne', 'pearl', 'foil', 'velvet', 'premium', 'black tie', '\u0641\u0627\u062E\u0631', '\u0630\u0647\u0628'],
  traditional: ['traditional', 'classic', 'arabic', 'heritage', 'palace', 'ornament', 'mughal', 'islamic', 'heirloom', '\u062A\u0642\u0644\u064A\u062F\u064A', '\u0642\u0635\u0631'],
  artDeco: ['art deco', 'gatsby', 'jazz', 'ballroom', 'black tie', 'midnight', 'deco'],
  futuristic: ['future', 'futuristic', 'holographic', 'neon', 'ai', 'digital', 'particle', 'cyber', 'iridescent'],
};

const TEMPLATE_STYLE_PROFILES = {
  editorialPearl: {
    themes: ['minimal', 'luxury', 'modern'],
    fallbackPalette: ['#2D2622', '#BFA46F', '#F8F3EA', '#FFFFFF'],
    fontStyle: 'editorial serif',
    backgroundStyle: 'editorial-paper',
    borderStyle: 'embossed',
    sectionShape: 'rounded-3xl',
    motionProfile: 'cinematic-editorial',
  },
  royalHeirloom: {
    themes: ['traditional', 'luxury'],
    fallbackPalette: ['#2A1014', '#7A1E2C', '#C8A45D', '#F4E3C1'],
    fontStyle: 'ceremonial serif',
    backgroundStyle: 'royal-velvet',
    borderStyle: 'ornamental-gold',
    sectionShape: 'rounded-3xl',
    motionProfile: 'ceremonial-gold',
  },
  glassGarden: {
    themes: ['floral', 'botanical', 'minimal', 'modern'],
    fallbackPalette: ['#284236', '#7E9A79', '#DCE8D2', '#FAF8F1'],
    fontStyle: 'botanical serif',
    backgroundStyle: 'glass-garden',
    borderStyle: 'glass-soft',
    sectionShape: 'rounded-3xl',
    motionProfile: 'organic-parallax',
  },
  midnightJazz: {
    themes: ['artDeco', 'luxury', 'modern'],
    fallbackPalette: ['#050505', '#151515', '#C49A4A', '#F6E7C5'],
    fontStyle: 'art-deco serif',
    backgroundStyle: 'black-lacquer',
    borderStyle: 'geometric-gold',
    sectionShape: 'rounded-2xl',
    motionProfile: 'spotlight-cinematic',
  },
  futureBloom: {
    themes: ['futuristic', 'modern', 'floral'],
    fallbackPalette: ['#070B1F', '#52E5FF', '#C084FC', '#F9A8D4'],
    fontStyle: 'futuristic luxury sans',
    backgroundStyle: 'holographic-depth',
    borderStyle: 'holographic-glass',
    sectionShape: 'rounded-3xl',
    motionProfile: 'reactive-particles',
  },
};

function normalizeString(value) {
  return typeof value === 'string' ? value.normalize('NFKC').trim() : '';
}

function normalizeArabicIndicDigits(value) {
  return normalizeString(value)
    .replace(/[\u0660-\u0669]/g, (digit) => `${digit.charCodeAt(0) - 0x0660}`)
    .replace(/[\u06F0-\u06F9]/g, (digit) => `${digit.charCodeAt(0) - 0x06F0}`);
}

function normalizeForSearch(value) {
  return normalizeArabicIndicDigits(value)
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\u0622\u0623\u0625]/g, '\u0627')
    .replace(/\s+/g, ' ')
    .trim();
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

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
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
    .map((channel) => clamp(channel).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

function rgbToHsl(rgb) {
  if (!rgb) return { h: 0, s: 0, l: 0 };

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: lightness };

  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue;

  switch (max) {
    case r:
      hue = (g - b) / delta + (g < b ? 6 : 0);
      break;
    case g:
      hue = (b - r) / delta + 2;
      break;
    default:
      hue = (r - g) / delta + 4;
  }

  return { h: hue * 60, s: saturation, l: lightness };
}

function colorDistance(colorA, colorB) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  if (!a || !b) return Number.POSITIVE_INFINITY;
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function pickDistinctColors(colors, limit = 6, minDistance = 28) {
  const picked = [];
  for (const color of colors.map(normalizeHexColor).filter(Boolean)) {
    if (picked.every((existing) => colorDistance(existing, color) >= minDistance)) {
      picked.push(color);
    }
    if (picked.length >= limit) break;
  }
  return picked;
}

function scoreColorGroup(group) {
  const average = {
    r: group.r / group.count,
    g: group.g / group.count,
    b: group.b / group.count,
  };
  const hsl = rgbToHsl(average);
  const frequency = Math.log1p(group.count);
  const balancedBrightness = 1 - Math.min(1, Math.abs(hsl.l - 0.58) / 0.58);
  const accentValue = hsl.s * 2.2 + balancedBrightness * 0.7;
  return frequency * 1.15 + accentValue;
}

async function extractPalette(filePath) {
  const { data, info } = await sharp(filePath)
    .rotate()
    .resize(80, 80, { fit: 'inside', withoutEnlargement: true })
    .toColorspace('srgb')
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const groups = new Map();

  for (let index = 0; index < data.length; index += info.channels) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const brightness = r + g + b;

    if (brightness < 18 || brightness > 750) continue;

    const key = [r, g, b].map((channel) => Math.round(channel / 24) * 24).join('-');
    const current = groups.get(key) || { r: 0, g: 0, b: 0, count: 0 };
    current.r += r;
    current.g += g;
    current.b += b;
    current.count += 1;
    groups.set(key, current);
  }

  const scored = [...groups.values()]
    .map((group) => {
      const average = {
        r: group.r / group.count,
        g: group.g / group.count,
        b: group.b / group.count,
      };
      return { color: averageHex(average), score: scoreColorGroup(group) };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ color }) => color);

  return pickDistinctColors(scored, 6);
}

async function extractImageMeta(filePath) {
  const metadata = await sharp(filePath).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const aspectRatio = width && height ? width / height : 1;

  let layout = 'centered';

  if (height > width * 1.12) {
    layout = 'portrait';
  } else if (width > height * 1.12) {
    layout = 'landscape';
  }

  const megapixels = (width * height) / 1_000_000;
  const resolutionQuality = megapixels >= 2 ? 'high' : megapixels >= 0.75 ? 'medium' : 'low';

  return { width, height, aspect_ratio: round(aspectRatio, 3), layout, resolution_quality: resolutionQuality };
}

async function preprocessForOcr(filePath) {
  const metadata = await sharp(filePath).metadata();
  const width = metadata.width || 0;
  const targetWidth = width && width < 1800 ? 1800 : Math.min(width || 2200, 2400);

  return sharp(filePath)
    .rotate()
    .resize({ width: targetWidth, withoutEnlargement: false })
    .grayscale()
    .normalize()
    .sharpen({ sigma: 1 })
    .png()
    .toBuffer();
}

function cleanOcrText(text) {
  return normalizeArabicIndicDigits(text)
    .replace(/[|]/g, 'I')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[ﬁ]/g, 'fi')
    .replace(/[ﬂ]/g, 'fl')
    .replace(/\u00A0/g, ' ')
    .replace(/\r/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function recognizeWithFallback(imageInput, languages = OCR_LANGUAGES) {
  try {
    return await Tesseract.recognize(imageInput, languages, { logger: () => {} });
  } catch (error) {
    if (languages !== 'eng') {
      return Tesseract.recognize(imageInput, 'eng', { logger: () => {} });
    }
    throw error;
  }
}

function normalizeOcrConfidence(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return clamp(numeric, 0, 100);
}

function scoreOcrResult(result) {
  const text = cleanOcrText(result?.data?.text || '');
  const confidence = normalizeOcrConfidence(result?.data?.confidence);
  return text.length * 0.7 + confidence * 5;
}

async function extractText(filePath) {
  const preprocessed = await preprocessForOcr(filePath);
  const primary = await recognizeWithFallback(preprocessed);

  let best = primary;

  if (cleanOcrText(primary?.data?.text || '').length < 30 || normalizeOcrConfidence(primary?.data?.confidence) < 38) {
    const fallback = await recognizeWithFallback(filePath, 'eng');
    best = scoreOcrResult(fallback) > scoreOcrResult(primary) ? fallback : primary;
  }

  return {
    text: cleanOcrText(best?.data?.text || ''),
    confidence: normalizeOcrConfidence(best?.data?.confidence),
    languages: OCR_LANGUAGES,
  };
}

function escapeRegExp(value) {
  return normalizeString(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function includesAny(value, hints) {
  const haystack = normalizeForSearch(value);
  return hints.some((hint) => haystack.includes(normalizeForSearch(hint)));
}

function stripDecorativeCharacters(line) {
  return normalizeString(line)
    .replace(/[•·*~_=<>]+/g, ' ')
    .replace(/[\u2013\u2014]+/g, ' - ')
    .replace(/^[\s:;,.\-]+|[\s:;,.\-]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getLines(text) {
  const lines = normalizeArabicIndicDigits(text)
    .split('\n')
    .map(stripDecorativeCharacters)
    .filter(Boolean);

  return dedupe(lines);
}

function findFirstMatch(text, patterns) {
  const normalized = normalizeArabicIndicDigits(text);
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[0]) return stripDecorativeCharacters(match[0]);
  }
  return '';
}

function findValueByLabels(lines, labels, { allowNextLine = true, minLength = 2 } = {}) {
  const labelPattern = labels.map(escapeRegExp).filter(Boolean).join('|');
  if (!labelPattern) return '';

  const regex = new RegExp(`(?:^|\\b)(?:${labelPattern})(?:\\b|\\s)?\\s*[:\\-\\u2013\\u2014]?\\s*(.*)$`, 'iu');

  for (let index = 0; index < lines.length; index += 1) {
    const line = stripDecorativeCharacters(lines[index]);
    const match = line.match(regex);
    if (!match) continue;

    const inlineValue = stripDecorativeCharacters(match[1] || '');
    if (inlineValue.length >= minLength && !labels.some((label) => normalizeForSearch(inlineValue) === normalizeForSearch(label))) {
      return inlineValue;
    }

    if (allowNextLine) {
      const next = stripDecorativeCharacters(lines[index + 1] || '');
      if (next.length >= minLength) return next;
    }
  }

  return '';
}

function extractHostLine(lines) {
  return lines.find((line) => includesAny(line, HOST_HINTS) && line.length <= 120) || '';
}

function extractInvitationMessage(lines) {
  return lines.find((line) => includesAny(line, INVITATION_HINTS) && line.length <= 160) || '';
}

function inferEventMatch(text) {
  const haystack = normalizeForSearch(text);
  let best = null;

  for (const item of EVENT_KEYWORDS) {
    const matchedKey = item.keys.find((key) => haystack.includes(normalizeForSearch(key)));
    if (!matchedKey) continue;
    const score = matchedKey.length + (item.cardType === 'wedding' ? 1 : 3);
    if (!best || score > best.score) {
      best = { ...item, score };
    }
  }

  return best || { value: 'Invitation Event', cardType: 'invitation', score: 0 };
}

function inferEventType(text) {
  return inferEventMatch(text).value;
}

function inferCardType(eventTypeOrText) {
  const value = normalizeForSearch(eventTypeOrText);
  const direct = inferEventMatch(value);
  if (direct.cardType !== 'invitation') return direct.cardType;
  if (value.includes('birthday')) return 'birthday';
  if (value.includes('engagement')) return 'engagement';
  if (value.includes('nikah')) return 'nikah';
  if (value.includes('reception')) return 'reception';
  if (value.includes('wedding')) return 'wedding';
  return 'invitation';
}

function hasArabicLetters(value) {
  return /[\u0600-\u06FF]/u.test(value || '');
}

function isExcludedNameLine(line) {
  return FIELD_EXCLUSION_WORDS.some((word) => normalizeForSearch(line).includes(normalizeForSearch(word)));
}

function cleanNameFragment(value) {
  return stripDecorativeCharacters(value)
    .replace(/\b(?:mr|mrs|ms|miss|dr|eng)\.?\s+/giu, '')
    .replace(/\b(?:bride|groom)\b\s*[:\-]?\s*/giu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function latinNameShape(line) {
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 5) return false;

  return words.every((word) => {
    const cleaned = word.replace(/[.'`-]/g, '');
    return /^[A-Za-z]{2,}$/.test(cleaned) && (/^[A-Z]/.test(word) || /^[A-Z]{2,}$/.test(cleaned));
  });
}

function arabicNameShape(line) {
  const words = line.match(/[\u0600-\u06FF]{2,}/gu) || [];
  return words.length >= 1 && words.length <= 5;
}

function looksLikeName(line) {
  const cleaned = cleanNameFragment(line);
  if (!cleaned || cleaned.length > 55) return false;
  if (/\d/.test(cleaned)) return false;
  if (isExcludedNameLine(cleaned)) return false;
  return hasArabicLetters(cleaned) ? arabicNameShape(cleaned) : latinNameShape(cleaned);
}

function scoreNameCandidate(line, index, totalLines) {
  const cleaned = cleanNameFragment(line);
  if (!looksLikeName(cleaned)) return 0;

  const words = cleaned.split(/\s+/).filter(Boolean);
  let score = 25;
  if (index <= Math.max(4, Math.floor(totalLines * 0.35))) score += 12;
  if (/^[A-Z\s.'`-]+$/.test(cleaned) && /[A-Z]{2}/.test(cleaned)) score += 8;
  if (words.length <= 3) score += 10;
  if (hasArabicLetters(cleaned)) score += 5;
  if (cleaned.length <= 28) score += 8;
  return score;
}

function splitCoupleLine(line) {
  const connectors = [
    /\s+(?:&|\+)\s+/u,
    /\s+and\s+/iu,
    /\s+weds\s+/iu,
    /\s+with\s+/iu,
    /\s+\u0648\s+/u,
  ];

  for (const connector of connectors) {
    const parts = line.split(connector).map(cleanNameFragment).filter(Boolean);
    if (parts.length === 2 && parts.every(looksLikeName)) {
      return parts;
    }
  }

  return [];
}

function extractNames(lines) {
  for (let index = 0; index < lines.length; index += 1) {
    const current = cleanNameFragment(lines[index]);
    const split = splitCoupleLine(current);
    if (split.length === 2) {
      return { bride_name: split[0], groom_name: split[1], confidence: 94 };
    }

    if (/^(?:&|\+|and|\u0648)$/iu.test(normalizeForSearch(current))) {
      const previous = cleanNameFragment(lines[index - 1] || '');
      const next = cleanNameFragment(lines[index + 1] || '');
      if (looksLikeName(previous) && looksLikeName(next)) {
        return { bride_name: previous, groom_name: next, confidence: 92 };
      }
    }
  }

  const candidates = lines
    .map((line, index) => ({ value: cleanNameFragment(line), score: scoreNameCandidate(line, index, lines.length) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const unique = [];
  for (const candidate of candidates) {
    if (!unique.some((item) => normalizeForSearch(item.value) === normalizeForSearch(candidate.value))) {
      unique.push(candidate);
    }
    if (unique.length >= 2) break;
  }

  return {
    bride_name: unique[0]?.value || '',
    groom_name: unique[1]?.value || '',
    confidence: unique.length >= 2 ? Math.min(88, Math.round((unique[0].score + unique[1].score) / 2)) : unique.length === 1 ? 56 : 12,
  };
}

function extractDate(text, lines) {
  const labeled = findValueByLabels(lines, DATE_LABELS);
  return findFirstMatch(labeled, DATE_PATTERNS) || findFirstMatch(text, DATE_PATTERNS);
}

function extractTime(text, lines) {
  const labeled = findValueByLabels(lines, TIME_LABELS);
  return findFirstMatch(labeled, TIME_PATTERNS) || findFirstMatch(text, TIME_PATTERNS);
}

function cleanVenue(value) {
  return stripDecorativeCharacters(value)
    .replace(/^at\s+/iu, '')
    .replace(/^venue\s*[:\-]?\s*/iu, '')
    .trim();
}

function lineHasDateOrTime(line) {
  return Boolean(findFirstMatch(line, DATE_PATTERNS) || findFirstMatch(line, TIME_PATTERNS));
}

function extractVenue(lines) {
  const labeled = findValueByLabels(lines, VENUE_LABELS, { allowNextLine: true, minLength: 3 });
  if (labeled && !lineHasDateOrTime(labeled)) return cleanVenue(labeled);

  const hinted = lines.find((line) => includesAny(line, VENUE_HINTS) && !lineHasDateOrTime(line));
  if (hinted) return cleanVenue(hinted.replace(/^venue\s*[:\-]?\s*/iu, ''));

  const atLine = lines.find((line) => /\bat\s+(?:the\s+)?[A-Z\u0600-\u06FF]/u.test(line) && !lineHasDateOrTime(line));
  if (atLine) return cleanVenue(atLine.replace(/^.*?\bat\s+/iu, ''));

  return '';
}

function extractAddress(lines, venue = '') {
  const labeled = findValueByLabels(lines, ADDRESS_LABELS, { allowNextLine: true, minLength: 4 });
  if (labeled && normalizeForSearch(labeled) !== normalizeForSearch(venue)) return stripDecorativeCharacters(labeled);

  const hinted = lines.find((line) => {
    if (normalizeForSearch(line) === normalizeForSearch(venue)) return false;
    const hasAddressHint = includesAny(line, ADDRESS_HINTS);
    const hasAddressShape = /\d/.test(line) || /,/.test(line) || /\b(?:near|opposite|district)\b/iu.test(line);
    return hasAddressHint && hasAddressShape;
  });

  return hinted ? stripDecorativeCharacters(hinted.replace(/^address\s*[:\-]?\s*/iu, '')) : '';
}

function extractPhone(text, lines) {
  const labeled = findValueByLabels(lines, PHONE_LABELS, { allowNextLine: true, minLength: 6 });
  const searchOrder = [labeled, ...lines.filter((line) => includesAny(line, PHONE_LABELS)), text].filter(Boolean);

  for (const value of searchOrder) {
    const candidates = normalizeArabicIndicDigits(value).match(PHONE_PATTERN) || [];
    const phone = candidates
      .map((candidate) => candidate.trim())
      .find((candidate) => {
        const digits = candidate.replace(/\D/g, '');
        return digits.length >= 8 && digits.length <= 15;
      });
    if (phone) return phone;
  }

  return '';
}

function colorHasHue(color, minHue, maxHue, minSaturation = 0.16) {
  const hsl = rgbToHsl(hexToRgb(color));
  if (hsl.s < minSaturation) return false;
  if (minHue <= maxHue) return hsl.h >= minHue && hsl.h <= maxHue;
  return hsl.h >= minHue || hsl.h <= maxHue;
}

function isGoldLike(color) {
  const hsl = rgbToHsl(hexToRgb(color));
  return hsl.h >= 30 && hsl.h <= 58 && hsl.s >= 0.18 && hsl.l >= 0.35 && hsl.l <= 0.82;
}

function isDarkColor(color) {
  return relativeLuminance(color) < 0.11;
}

function isLightNeutral(color) {
  const hsl = rgbToHsl(hexToRgb(color));
  return hsl.l > 0.78 && hsl.s < 0.28;
}

function applyKeywordScores(haystack, scores) {
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const keyword of keywords) {
      if (haystack.includes(normalizeForSearch(keyword))) {
        scores[theme] = (scores[theme] || 0) + Math.min(8, normalizeForSearch(keyword).length / 2 + 3);
      }
    }
  }
}

function inferTheme(text, colors = [], imageMeta = {}) {
  const scores = {
    floral: 0,
    minimal: 0,
    luxury: 0,
    traditional: 0,
    modern: 1,
    artDeco: 0,
    futuristic: 0,
  };

  const haystack = normalizeForSearch(text);
  applyKeywordScores(haystack, scores);

  for (const color of colors) {
    if (colorHasHue(color, 75, 165)) scores.floral += 4;
    if (isGoldLike(color)) scores.luxury += 5;
    if (isDarkColor(color)) {
      scores.luxury += 2;
      scores.artDeco += 3;
      scores.futuristic += 2;
    }
    if (isLightNeutral(color)) {
      scores.minimal += 3;
      scores.luxury += 1;
    }
    if (colorHasHue(color, 175, 205, 0.32) || colorHasHue(color, 260, 325, 0.32)) {
      scores.futuristic += 4;
    }
  }

  if (hasArabicLetters(text)) scores.traditional += 5;
  if (imageMeta.layout === 'portrait') scores.luxury += 1;
  if (colors.length <= 3 && colors.some(isLightNeutral)) scores.minimal += 2;

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best?.[0] || 'modern';
}

function inferFontStyle(text, theme) {
  const haystack = normalizeForSearch(text);
  if (haystack.includes('calligraphy') || haystack.includes('script') || haystack.includes('cursive')) return 'script serif';
  if (theme === 'futuristic') return 'futuristic luxury sans';
  if (theme === 'minimal' || theme === 'modern') return 'modern editorial';
  if (theme === 'traditional' || hasArabicLetters(text)) return 'ceremonial serif';
  if (theme === 'artDeco') return 'art-deco serif';
  return 'luxury serif';
}

function inferDesignElements(text, theme, layout, colors = []) {
  const haystack = normalizeForSearch(text);
  const elements = [];

  if (['floral'].includes(theme) || /floral|rose|flower|leaf|garden|botanical/iu.test(haystack)) elements.push('botanical depth');
  if (['luxury', 'traditional'].includes(theme) || /border|frame|outline|ornament/iu.test(haystack)) elements.push('ornamental frame');
  if (theme === 'artDeco' || /geometric|line|arch|deco/iu.test(haystack)) elements.push('geometric structure');
  if (theme === 'futuristic' || /glass|holographic|neon|particle/iu.test(haystack)) elements.push('reactive light effects');
  if (colors.some(isGoldLike)) elements.push('gold foil accent');
  if (colors.some((color) => colorHasHue(color, 75, 165))) elements.push('soft botanical palette');
  if (layout === 'portrait') elements.push('centered vertical composition');
  if (layout === 'landscape') elements.push('wide editorial composition');
  if (theme === 'minimal') elements.push('generous negative space');
  if (elements.length === 0) elements.push('refined typographic hierarchy');

  return dedupe(elements.filter(Boolean));
}

function inferMoodTags(theme, colors = []) {
  const tags = [];
  if (theme === 'luxury') tags.push('premium', 'warm', 'elegant');
  if (theme === 'traditional') tags.push('ceremonial', 'heritage', 'regal');
  if (theme === 'floral') tags.push('romantic', 'organic', 'soft');
  if (theme === 'minimal') tags.push('calm', 'editorial', 'clean');
  if (theme === 'artDeco') tags.push('dramatic', 'black-tie', 'cinematic');
  if (theme === 'futuristic') tags.push('holographic', 'alive', 'digital');
  if (colors.some(isGoldLike)) tags.push('gold-accented');
  if (colors.some(isDarkColor)) tags.push('high-contrast');
  return dedupe(tags).slice(0, 5);
}

function getMissingFields(fields) {
  return ['bride_name', 'groom_name', 'date', 'time', 'venue', 'address', 'rsvp_phone']
    .filter((field) => !normalizeString(fields[field]));
}

function fieldConfidence(value, presentScore = 82, missingScore = 12) {
  return normalizeString(value) ? presentScore : missingScore;
}

function buildConfidence({ ocrConfidence, names, fields, visualStyle }) {
  const required = ['bride_name', 'groom_name', 'date', 'time', 'venue'];
  const completion = required.filter((field) => normalizeString(fields[field])).length / required.length;
  const visualCompleteness = [visualStyle.theme, visualStyle.layout, ...(visualStyle.primary_colors || [])].filter(Boolean).length;

  return {
    overall: clamp(ocrConfidence * 0.35 + completion * 55 + Math.min(10, visualCompleteness * 1.5), 0, 100),
    ocr: clamp(ocrConfidence, 0, 100),
    names: clamp(names.confidence || 0, 0, 100),
    date: fieldConfidence(fields.date, 88, 10),
    time: fieldConfidence(fields.time, 85, 10),
    venue: fieldConfidence(fields.venue, 78, 14),
    address: fieldConfidence(fields.address, 74, 18),
    rsvp_phone: fieldConfidence(fields.rsvp_phone, 88, 18),
    visual_style: clamp(55 + visualCompleteness * 6, 0, 95),
  };
}

function buildNotes({ text, confidence, missingFields }) {
  const missing = missingFields.length ? ` Missing fields: ${missingFields.join(', ')}.` : '';
  if (!text) return `Limited OCR text was detected. Review the extracted details manually.${missing}`;
  if (confidence.overall < 45) return `Low-confidence extraction. Please review names, date, time, and venue carefully.${missing}`;
  if (text.length < 80) return `OCR extracted partial text. Review the extracted details before export.${missing}`;
  return `Details were extracted with OCR, visual palette analysis, and weighted parsing.${missing}`;
}

function validateImageFile(file) {
  if (!file?.path) {
    throw new Error('analyzeInvitationImage expected a file object with a valid path.');
  }
}

export async function analyzeInvitationImage(file) {
  validateImageFile(file);

  const [textResult, primaryColors, imageMeta] = await Promise.all([
    extractText(file.path),
    extractPalette(file.path),
    extractImageMeta(file.path),
  ]);

  const text = textResult.text;
  const lines = getLines(text);
  const names = extractNames(lines);
  const eventMatch = inferEventMatch(text);
  const eventType = eventMatch.value;
  const cardType = eventMatch.cardType || inferCardType(eventType);
  const date = extractDate(text, lines);
  const time = extractTime(text, lines);
  const venue = extractVenue(lines);
  const address = extractAddress(lines, venue);
  const rsvpPhone = extractPhone(text, lines);
  const theme = inferTheme(text, primaryColors, imageMeta);
  const fontStyle = inferFontStyle(text, theme);
  const designElements = inferDesignElements(text, theme, imageMeta.layout, primaryColors);
  const moodTags = inferMoodTags(theme, primaryColors);

  const fields = {
    card_type: cardType,
    bride_name: names.bride_name,
    groom_name: names.groom_name,
    host_line: extractHostLine(lines),
    invitation_message: extractInvitationMessage(lines),
    event_type: eventType,
    date,
    time,
    venue,
    address,
    rsvp_phone: rsvpPhone,
  };

  const visualStyle = {
    theme,
    primary_colors: primaryColors,
    layout: imageMeta.layout,
    font_style: fontStyle,
    design_elements: designElements,
    mood_tags: moodTags,
  };

  const confidence = buildConfidence({
    ocrConfidence: textResult.confidence,
    names,
    fields,
    visualStyle,
  });
  const missingFields = getMissingFields(fields);

  return {
    ...DEFAULT_ANALYSIS,
    ...fields,
    notes: buildNotes({ text, confidence, missingFields }),
    raw_text: text,
    missing_fields: missingFields,
    confidence,
    extraction_meta: {
      parser_version: PARSER_VERSION,
      ocr_languages: textResult.languages,
      text_length: text.length,
      line_count: lines.length,
      image: imageMeta,
    },
    visual_style: visualStyle,
  };
}

function themeDirectionKey(theme, cardType) {
  const normalizedTheme = normalizeForSearch(theme);
  const normalizedCardType = normalizeForSearch(cardType);

  if (normalizedTheme.includes('future')) return 'futuristic';
  if (normalizedTheme.includes('deco') || normalizedTheme.includes('jazz')) return 'artDeco';
  if (normalizedTheme.includes('flower') || normalizedTheme.includes('floral') || normalizedTheme.includes('garden')) return 'floral';
  if (normalizedTheme.includes('botanical')) return 'botanical';
  if (normalizedTheme.includes('minimal')) return 'minimal';
  if (normalizedTheme.includes('traditional') || normalizedCardType === 'nikah') return 'traditional';
  if (normalizedTheme.includes('luxury') || normalizedTheme.includes('royal')) return 'luxury';
  return 'modern';
}

function inferTemplateIds(theme, cardType, visualStyle = {}) {
  return scoreTemplates({ card_type: cardType, visual_style: { ...visualStyle, theme } })
    .slice(0, 3)
    .map(({ id }) => id);
}

function inferFontFamily(fontStyle, templateId) {
  const style = normalizeForSearch(fontStyle);
  const profile = TEMPLATE_STYLE_PROFILES[templateId];

  if (style.includes('script')) {
    return 'Georgia, Cambria, "Times New Roman", serif';
  }

  if (style.includes('sans') || style.includes('modern') || style.includes('future')) {
    return '"Segoe UI", "Helvetica Neue", Arial, sans-serif';
  }

  if (profile?.fontStyle?.includes('deco')) {
    return '"Cinzel", "Bodoni 72", Georgia, serif';
  }

  if (profile?.fontStyle?.includes('ceremonial')) {
    return '"Palatino Linotype", "Book Antiqua", Georgia, serif';
  }

  return '"Cormorant Garamond", "Palatino Linotype", Georgia, serif';
}

function getMostSaturatedColor(palette, fallback) {
  return palette
    .map((color) => ({ color, hsl: rgbToHsl(hexToRgb(color)) }))
    .sort((a, b) => b.hsl.s - a.hsl.s || Math.abs(0.52 - a.hsl.l) - Math.abs(0.52 - b.hsl.l))[0]?.color || fallback;
}

function getHueColor(palette, minHue, maxHue, fallback) {
  return palette.find((color) => colorHasHue(color, minHue, maxHue)) || fallback;
}

function buildThemeFromPalette(templateId, visualStyle = {}) {
  const profile = TEMPLATE_STYLE_PROFILES[templateId] || TEMPLATE_STYLE_PROFILES.editorialPearl;
  const palette = sortPalette(pickDistinctColors([...(visualStyle.primary_colors || []), ...profile.fallbackPalette], 6));
  const darkest = palette[0] || profile.fallbackPalette[0];
  const lightest = palette[palette.length - 1] || profile.fallbackPalette[profile.fallbackPalette.length - 1];
  const medium = palette[Math.max(1, Math.floor(palette.length / 2))] || mixColors(darkest, lightest, 0.45);
  const gold = palette.find(isGoldLike) || profile.fallbackPalette.find(isGoldLike) || '#C8A45D';
  const botanical = getHueColor(palette, 75, 165, profile.fallbackPalette[1]);
  const vivid = getMostSaturatedColor(palette, medium);

  const primaryByTemplate = {
    editorialPearl: isGoldLike(medium) ? medium : mixColors(medium, gold, 0.35),
    royalHeirloom: isDarkColor(medium) ? gold : medium,
    glassGarden: botanical,
    midnightJazz: gold,
    futureBloom: vivid,
  };

  const primaryColor = normalizeHexColor(primaryByTemplate[templateId]) || normalizeHexColor(medium) || '#876C57';
  const secondaryColor = templateId === 'midnightJazz' || templateId === 'futureBloom'
    ? normalizeHexColor(mixColors(darkest, '#111827', 0.45))
    : normalizeHexColor(mixColors(lightest, '#FFFFFF', 0.38));
  const headingColor = relativeLuminance(primaryColor) > 0.58 ? shiftColor(primaryColor, -90) : primaryColor;
  const darkBody = normalizeHexColor(mixColors(darkest, '#1F2937', 0.25)) || '#4B423A';

  return {
    id: templateId,
    primaryColor,
    secondaryColor: secondaryColor || '#F4EEE7',
    headingColor: normalizeHexColor(headingColor) || '#6F5642',
    subheadingColor: normalizeHexColor(mixColors(primaryColor, darkest, 0.3)) || '#876C57',
    bodyColor: darkBody,
    metaColor: normalizeHexColor(mixColors(primaryColor, lightest, 0.32)) || '#9A7D66',
    accentColor: normalizeHexColor(gold) || primaryColor,
    font: inferFontFamily(visualStyle.font_style || profile.fontStyle, templateId),
    backgroundStyle: profile.backgroundStyle,
    borderStyle: profile.borderStyle,
    sectionShape: profile.sectionShape,
    motionProfile: profile.motionProfile,
    layoutDensity: visualStyle.layout === 'portrait' ? 'vertical-story' : 'editorial-spread',
    enableAnimation: true,
    enableCountdown: true,
    enableGallery: true,
    enableVideo: false,
    enableMusic: false,
  };
}

function scoreTemplates(input = {}) {
  const visualStyle = input.visual_style || {};
  const theme = normalizeForSearch(visualStyle.theme || 'modern');
  const cardType = normalizeForSearch(input.card_type || 'wedding');
  const elements = (visualStyle.design_elements || []).map(normalizeForSearch).join(' ');
  const directionKey = themeDirectionKey(theme, cardType);
  const directedIds = TEMPLATE_DIRECTIONS[directionKey] || TEMPLATE_DIRECTIONS.modern;
  const scores = Object.keys(TEMPLATE_METADATA).map((id) => ({ id, score: 10, reasons: [] }));

  for (const item of scores) {
    const directionIndex = directedIds.indexOf(item.id);
    if (directionIndex >= 0) {
      item.score += 38 - directionIndex * 8;
      item.reasons.push(`matches ${directionKey} style`);
    }

    const profile = TEMPLATE_STYLE_PROFILES[item.id];
    if (profile?.themes.some((profileTheme) => theme.includes(normalizeForSearch(profileTheme)))) {
      item.score += 20;
      item.reasons.push('theme profile match');
    }

    if (cardType === 'nikah' && item.id === 'royalHeirloom') item.score += 16;
    if (cardType === 'reception' && item.id === 'midnightJazz') item.score += 14;
    if (cardType === 'engagement' && ['editorialPearl', 'glassGarden'].includes(item.id)) item.score += 10;
    if (cardType === 'birthday' && item.id === 'futureBloom') item.score += 10;

    if (elements.includes('botanical') && item.id === 'glassGarden') item.score += 14;
    if (elements.includes('gold') && ['royalHeirloom', 'midnightJazz', 'editorialPearl'].includes(item.id)) item.score += 8;
    if (elements.includes('reactive') && item.id === 'futureBloom') item.score += 14;
    if (elements.includes('geometric') && item.id === 'midnightJazz') item.score += 12;
    if (elements.includes('negative space') && item.id === 'editorialPearl') item.score += 12;
  }

  return scores.sort((a, b) => b.score - a.score);
}

function compactPromptValue(value, fallback = 'not detected') {
  const normalized = normalizeString(value).replace(/\s+/g, ' ');
  return normalized ? normalized.slice(0, 160) : fallback;
}

function buildAdaptiveAiPrompt(basePrompt, input = {}, visualStyle = {}, templateId = 'editorialPearl') {
  const colors = (visualStyle.primary_colors || []).slice(0, 5).join(', ') || 'use the template default luxury palette';
  const elements = (visualStyle.design_elements || []).join(', ') || 'refined typography and balanced spacing';
  const names = [input.bride_name, input.groom_name].map((value) => compactPromptValue(value, '')).filter(Boolean).join(' & ') || 'the couple names when provided';
  const profile = TEMPLATE_STYLE_PROFILES[templateId] || TEMPLATE_STYLE_PROFILES.editorialPearl;

  return `${normalizeString(basePrompt)}

SMART ADAPTIVE BRIEF:
Use the extracted invitation data as the source of truth. Do not invent core details that were not detected.
Couple: ${names}.
Event: ${compactPromptValue(input.event_type || input.card_type, 'wedding or invitation event')}.
Date and time: ${compactPromptValue([input.date, input.time].filter(Boolean).join(' at '))}.
Venue: ${compactPromptValue(input.venue)}.
Address: ${compactPromptValue(input.address)}.
Detected visual mood: ${compactPromptValue(visualStyle.theme, 'modern luxury')} with ${elements}.
Detected palette: ${colors}.
Preferred layout: ${compactPromptValue(visualStyle.layout, 'responsive editorial layout')}.
Motion system: ${profile.motionProfile}.
Quality rules: preserve readability, create strong hierarchy, keep mobile-first spacing, use premium micro-interactions, and gracefully hide missing RSVP/address/date sections instead of showing placeholders.`;
}

function buildTemplateOption(templateId, visualStyle, input = {}) {
  const metadata = TEMPLATE_METADATA[templateId] || TEMPLATE_METADATA.editorialPearl;
  const scored = scoreTemplates({ ...input, visual_style: visualStyle }).find((item) => item.id === templateId);

  return {
    id: templateId,
    ...metadata,
    aiPrompt: buildAdaptiveAiPrompt(metadata.aiPrompt, input, visualStyle, templateId),
    match_score: clamp(scored?.score || 0, 0, 100),
    match_reason: scored?.reasons?.join(', ') || 'balanced premium default',
    theme: buildThemeFromPalette(templateId, visualStyle),
  };
}

export async function generateInvitationTemplates(input = {}) {
  const visualStyle = input?.visual_style || {};
  const theme = normalizeString(visualStyle.theme || 'modern');
  const cardType = normalizeString(input?.card_type || 'wedding');

  return inferTemplateIds(theme, cardType, visualStyle)
    .map((templateId) => buildTemplateOption(templateId, visualStyle, input));
}
