import { generateIntroMessage, generateColorPalette, generateWhatsAppMessage, generateInvitationWizard, generateMagicInvitation, editMagicInvitation } from '../services/textAiService.js';

/**
 * POST /api/ai/generate-text
 * Generate invitation text (intro message, etc.)
 */
export async function handleGenerateText(req, res, next) {
  try {
    const { bride, groom, tagline, parents, tone } = req.body || {};

    if (!bride && !groom) {
      return res.status(400).json({ success: false, message: 'At least bride or groom name is required.' });
    }

    const message = await generateIntroMessage({ bride, groom, tagline, parents, tone });
    return res.json({ success: true, message });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/ai/generate-palette
 * Generate a color palette from a mood description.
 */
export async function handleGeneratePalette(req, res, next) {
  try {
    const { mood, templateId } = req.body || {};

    if (!mood) {
      return res.status(400).json({ success: false, message: 'A mood description is required.' });
    }

    const palette = await generateColorPalette({ mood, templateId });
    return res.json({ success: true, palette });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/ai/generate-whatsapp
 * Generate a WhatsApp sharing message.
 */
export async function handleGenerateWhatsApp(req, res, next) {
  try {
    const { bride, groom, date, venue, shareUrl, style } = req.body || {};

    if (!shareUrl) {
      return res.status(400).json({ success: false, message: 'A share URL is required.' });
    }

    const message = await generateWhatsAppMessage({ bride, groom, date, venue, shareUrl, style });
    return res.json({ success: true, message });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/ai/generate-wizard
 * Generate a full invitation draft from wizard answers.
 */
export async function handleGenerateWizard(req, res, next) {
  try {
    const input = req.body || {};
    
    // Quick validation
    if (!input.coupleNames && !input.eventType) {
      return res.status(400).json({ success: false, message: 'Please provide at least couple names or event type.' });
    }

    const invitationDraft = await generateInvitationWizard(input);
    return res.json({ success: true, draft: invitationDraft });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/ai/magic-build
 * Generate a complete invitation using AI Magic Designer
 */
export async function magicBuildController(req, res, next) {
  try {
    const { prompt, mediaUrls, email, referenceUrl, referenceImageUrls } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Please provide a description for the invitation.' });
    }

    const invitationData = await generateMagicInvitation(
      prompt,
      mediaUrls,
      email,
      referenceUrl,
      referenceImageUrls
    );

    return res.json({ success: true, data: invitationData });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/ai/magic-edit
 * Edit an invitation using AI Magic Designer
 */
export async function magicEditController(req, res, next) {
  try {
    const { currentData, prompt, referenceUrl, referenceImageUrls } = req.body || {};

    if (!currentData || !prompt) {
      return res.status(400).json({ success: false, message: 'Current data and edit prompt are required.' });
    }

    const invitationData = await editMagicInvitation(
      currentData,
      prompt,
      referenceUrl,
      referenceImageUrls
    );

    return res.json({ success: true, data: invitationData });
  } catch (error) {
    return next(error);
  }
}
