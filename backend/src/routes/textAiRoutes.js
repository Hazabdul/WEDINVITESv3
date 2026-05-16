import express from 'express';
import { handleGenerateText, handleGeneratePalette, handleGenerateWhatsApp, handleGenerateWizard, magicBuildController, magicEditController } from '../controllers/textAiController.js';

const router = express.Router();

router.post('/generate-text', handleGenerateText);
router.post('/generate-palette', handleGeneratePalette);
router.post('/generate-whatsapp', handleGenerateWhatsApp);
router.post('/generate-wizard', handleGenerateWizard);
router.post('/magic-build', magicBuildController);
router.post('/magic-edit', magicEditController);

export default router;
