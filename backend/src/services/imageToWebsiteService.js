import fs from 'fs/promises';
import sharp from 'sharp';

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const OPENAI_UI_MODEL = process.env.OPENAI_UI_MODEL?.trim() || 'gpt-4.1-mini';

const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['analysis', 'page'],
  properties: {
    analysis: {
      type: 'object',
      additionalProperties: false,
      required: ['page_title', 'summary', 'layout_style', 'visual_tone', 'palette', 'observed_elements', 'responsive_notes'],
      properties: {
        page_title: { type: 'string' },
        summary: { type: 'string' },
        layout_style: { type: 'string' },
        visual_tone: { type: 'string' },
        palette: {
          type: 'array',
          items: { type: 'string' },
          minItems: 3,
          maxItems: 6,
        },
        observed_elements: {
          type: 'array',
          items: { type: 'string' },
          minItems: 3,
          maxItems: 8,
        },
        responsive_notes: {
          type: 'array',
          items: { type: 'string' },
          minItems: 2,
          maxItems: 6,
        },
      },
    },
    page: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'description', 'theme', 'navigation', 'hero', 'sections'],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        theme: {
          type: 'object',
          additionalProperties: false,
          required: [
            'primaryColor',
            'secondaryColor',
            'accentColor',
            'surfaceColor',
            'backgroundColor',
            'textColor',
            'mutedColor',
            'fontFamily',
            'backgroundStyle',
            'borderRadius',
          ],
          properties: {
            primaryColor: { type: 'string' },
            secondaryColor: { type: 'string' },
            accentColor: { type: 'string' },
            surfaceColor: { type: 'string' },
            backgroundColor: { type: 'string' },
            textColor: { type: 'string' },
            mutedColor: { type: 'string' },
            fontFamily: {
              type: 'string',
              enum: ['serif', 'sans', 'display'],
            },
            backgroundStyle: {
              type: 'string',
              enum: ['solid', 'gradient', 'pattern'],
            },
            borderRadius: {
              type: 'string',
              enum: ['soft', 'rounded', 'sharp'],
            },
          },
        },
        navigation: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['label'],
            properties: {
              label: { type: 'string' },
            },
          },
          maxItems: 6,
        },
        hero: {
          type: 'object',
          additionalProperties: false,
          required: ['eyebrow', 'title', 'subtitle', 'primaryCta', 'secondaryCta', 'highlight'],
          properties: {
            eyebrow: { type: 'string' },
            title: { type: 'string' },
            subtitle: { type: 'string' },
            primaryCta: { type: 'string' },
            secondaryCta: { type: 'string' },
            highlight: { type: 'string' },
            badges: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 4,
            },
            stats: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['value', 'label'],
                properties: {
                  value: { type: 'string' },
                  label: { type: 'string' },
                },
              },
              maxItems: 4,
            },
          },
        },
        sections: {
          type: 'array',
          minItems: 2,
          maxItems: 8,
          items: {
            anyOf: [
              {
                type: 'object',
                additionalProperties: false,
                required: ['type', 'title', 'description', 'items'],
                properties: {
                  type: { type: 'string', enum: ['feature_grid'] },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  items: {
                    type: 'array',
                    minItems: 2,
                    maxItems: 6,
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      required: ['title', 'body'],
                      properties: {
                        title: { type: 'string' },
                        body: { type: 'string' },
                        meta: { type: 'string' },
                      },
                    },
                  },
                },
              },
              {
                type: 'object',
                additionalProperties: false,
                required: ['type', 'title', 'description', 'points', 'panelTitle', 'panelBody'],
                properties: {
                  type: { type: 'string', enum: ['content_split'] },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  points: {
                    type: 'array',
                    minItems: 2,
                    maxItems: 5,
                    items: { type: 'string' },
                  },
                  panelTitle: { type: 'string' },
                  panelBody: { type: 'string' },
                },
              },
              {
                type: 'object',
                additionalProperties: false,
                required: ['type', 'title', 'items'],
                properties: {
                  type: { type: 'string', enum: ['stats_band'] },
                  title: { type: 'string' },
                  items: {
                    type: 'array',
                    minItems: 2,
                    maxItems: 4,
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      required: ['value', 'label'],
                      properties: {
                        value: { type: 'string' },
                        label: { type: 'string' },
                      },
                    },
                  },
                },
              },
              {
                type: 'object',
                additionalProperties: false,
                required: ['type', 'title', 'quote', 'author', 'role'],
                properties: {
                  type: { type: 'string', enum: ['testimonial'] },
                  title: { type: 'string' },
                  quote: { type: 'string' },
                  author: { type: 'string' },
                  role: { type: 'string' },
                },
              },
              {
                type: 'object',
                additionalProperties: false,
                required: ['type', 'title', 'description', 'questions'],
                properties: {
                  type: { type: 'string', enum: ['faq'] },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  questions: {
                    type: 'array',
                    minItems: 2,
                    maxItems: 5,
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      required: ['question', 'answer'],
                      properties: {
                        question: { type: 'string' },
                        answer: { type: 'string' },
                      },
                    },
                  },
                },
              },
              {
                type: 'object',
                additionalProperties: false,
                required: ['type', 'title', 'description', 'primaryCta', 'secondaryCta'],
                properties: {
                  type: { type: 'string', enum: ['cta_banner'] },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  primaryCta: { type: 'string' },
                  secondaryCta: { type: 'string' },
                },
              },
            ],
          },
        },
      },
    },
  },
};

function normalizeHexColor(input, fallback) {
  if (!input) return fallback;
  const value = `${input}`.trim().toUpperCase();
  if (/^#([\dA-F]{6}|[\dA-F]{3})$/.test(value)) return value;
  return fallback;
}

function ensurePalette(palette = []) {
  const fallbackPalette = ['#F5EDE2', '#C89C6D', '#4A3931'];
  const normalized = Array.from(new Set(palette.map((item) => normalizeHexColor(item, null)).filter(Boolean)));
  return normalized.length >= 3 ? normalized.slice(0, 6) : fallbackPalette;
}

async function extractPalette(filePath) {
  const { data, info } = await sharp(filePath)
    .resize(48, 48, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const seen = new Map();

  for (let index = 0; index < data.length; index += info.channels) {
    const hex = `#${[data[index], data[index + 1], data[index + 2]]
      .map((channel) => channel.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()}`;
    seen.set(hex, (seen.get(hex) || 0) + 1);
  }

  return [...seen.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([hex]) => hex)
    .slice(0, 5);
}

function extractResponseText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text;
  }

  if (!Array.isArray(payload?.output)) return '';

  const parts = [];

  for (const item of payload.output) {
    if (item?.type !== 'message' || !Array.isArray(item.content)) continue;
    for (const contentItem of item.content) {
      if (typeof contentItem?.text === 'string') {
        parts.push(contentItem.text);
      }
    }
  }

  return parts.join('\n').trim();
}

function finalizeSpec(spec, fallbackPalette) {
  const palette = ensurePalette(spec?.analysis?.palette?.length ? spec.analysis.palette : fallbackPalette);
  const page = spec.page || {};
  const theme = page.theme || {};

  return {
    analysis: {
      ...spec.analysis,
      palette,
      observed_elements: Array.isArray(spec.analysis?.observed_elements) ? spec.analysis.observed_elements.slice(0, 8) : [],
      responsive_notes: Array.isArray(spec.analysis?.responsive_notes) ? spec.analysis.responsive_notes.slice(0, 6) : [],
    },
    page: {
      ...page,
      navigation: Array.isArray(page.navigation) ? page.navigation.slice(0, 6) : [],
      hero: {
        badges: [],
        stats: [],
        ...(page.hero || {}),
      },
      theme: {
        primaryColor: normalizeHexColor(theme.primaryColor, palette[1] || palette[0]),
        secondaryColor: normalizeHexColor(theme.secondaryColor, palette[0]),
        accentColor: normalizeHexColor(theme.accentColor, palette[2] || palette[1]),
        surfaceColor: normalizeHexColor(theme.surfaceColor, '#FFFDFC'),
        backgroundColor: normalizeHexColor(theme.backgroundColor, '#FFF8F1'),
        textColor: normalizeHexColor(theme.textColor, '#2F2925'),
        mutedColor: normalizeHexColor(theme.mutedColor, '#6D6257'),
        fontFamily: ['serif', 'sans', 'display'].includes(theme.fontFamily) ? theme.fontFamily : 'serif',
        backgroundStyle: ['solid', 'gradient', 'pattern'].includes(theme.backgroundStyle) ? theme.backgroundStyle : 'gradient',
        borderRadius: ['soft', 'rounded', 'sharp'].includes(theme.borderRadius) ? theme.borderRadius : 'rounded',
      },
      sections: Array.isArray(page.sections) ? page.sections.slice(0, 8) : [],
    },
  };
}

function buildPrompt(fallbackPalette, instructions = '') {
  const paletteText = fallbackPalette.join(', ');
  const instructionText = instructions.trim()
    ? `Additional user instructions: ${instructions.trim()}`
    : 'Additional user instructions: none.';

  return [
    'You analyze UI screenshots and convert them into a structured webpage plan for an existing React/Tailwind product.',
    'Return only JSON that matches the schema exactly.',
    'The generated page must be responsive, production-oriented, and map the screenshot into reusable sections instead of copying pixels blindly.',
    'Preserve the screenshot’s visual hierarchy, palette, spacing rhythm, density, and tone.',
    'Prefer the kinds of sections an existing component-based app can render cleanly: hero, feature grid, split content, stats, FAQ, testimonial, and CTA banner.',
    'Do not output code. Do not reference implementation details. Do not invent unsupported section types.',
    'Use concise but credible copy inferred from the screenshot.',
    `If any colors are ambiguous, stay close to this extracted palette: ${paletteText}.`,
    instructionText,
  ].join('\n');
}

async function callOpenAIForPageSpec({ imageDataUrl, instructions, fallbackPalette }) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing. Add it to the backend environment to enable image-to-website generation.');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_UI_MODEL,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: 'You are a senior UI systems designer. Convert screenshots into structured, reusable webpage specifications for a React/Tailwind app.',
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: buildPrompt(fallbackPalette, instructions),
            },
            {
              type: 'input_image',
              image_url: imageDataUrl,
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'ui_to_page_spec',
          strict: true,
          schema: RESPONSE_SCHEMA,
        },
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      `OpenAI request failed with status ${response.status}.`;
    throw new Error(message);
  }

  const content = extractResponseText(payload);
  if (!content) {
    throw new Error('The model response did not include a structured page specification.');
  }

  return JSON.parse(content);
}

export async function generateWebsiteFromImage(file, instructions = '') {
  const buffer = await fs.readFile(file.path);
  const mimeType = file.mimetype || 'image/png';
  const base64 = buffer.toString('base64');
  const fallbackPalette = await extractPalette(file.path);

  const rawSpec = await callOpenAIForPageSpec({
    imageDataUrl: `data:${mimeType};base64,${base64}`,
    instructions,
    fallbackPalette,
  });

  return finalizeSpec(rawSpec, fallbackPalette);
}
