import express from 'express';
import { upload } from '../controllers/uploadController.js';
import { generateWebsite } from '../controllers/websiteAiController.js';

const router = express.Router();

router.post('/image-to-website', upload.single('image'), generateWebsite);

export default router;
