import express from 'express';
import { upload, handleUpload } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, upload.single('file'), handleUpload);

export default router;
