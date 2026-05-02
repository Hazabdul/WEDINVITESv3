import express from 'express';
import { uploadSingle } from '../controllers/uploadController.js';
import { analyzeInvitation, generateTemplate } from '../controllers/invitationAiController.js';

const router = express.Router();

router.post('/analyze-invitation', uploadSingle('image'), analyzeInvitation);
router.post('/generate-template', generateTemplate);

export default router;
