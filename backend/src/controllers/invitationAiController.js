import fs from 'fs/promises';
import { analyzeInvitationImage, generateInvitationTemplates } from '../services/invitationAiService.js';

export async function analyzeInvitation(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Invitation image is required.' });
    }

    const analysis = await analyzeInvitationImage(req.file);
    return res.json(analysis);
  } catch (error) {
    return next(error);
  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path).catch(() => {});
    }
  }
}

export async function generateTemplate(req, res, next) {
  try {
    const templates = await generateInvitationTemplates(req.body || {});
    return res.json({ templates });
  } catch (error) {
    return next(error);
  }
}
