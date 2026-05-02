import express from 'express';
import { handleUpload, uploadSingle } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/', uploadSingle('file'), handleUpload);

export default router;
