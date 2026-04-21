import fs from 'fs/promises';
import { generateWebsiteFromImage } from '../services/imageToWebsiteService.js';

export async function generateWebsite(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Website reference image is required.' });
    }

    const result = await generateWebsiteFromImage(req.file, req.body?.instructions || '');
    return res.json(result);
  } catch (error) {
    return next(error);
  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path).catch(() => {});
    }
  }
}
