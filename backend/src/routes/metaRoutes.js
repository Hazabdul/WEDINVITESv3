import express from 'express';
import { getTemplates, getPackages } from '../controllers/metaController.js';

const router = express.Router();

router.get('/templates', getTemplates);
router.get('/packages', getPackages);

export default router;
