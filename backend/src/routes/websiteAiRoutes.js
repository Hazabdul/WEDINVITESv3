import express from 'express';
import { uploadSingle } from '../controllers/uploadController.js';
import { generateWebsite } from '../controllers/websiteAiController.js';

const router = express.Router();

router.post('/image-to-website', uploadSingle('image'), generateWebsite);

export default router;
