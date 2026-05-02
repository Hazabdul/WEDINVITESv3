import express from 'express';
import { getTemplates, getPackages } from '../controllers/metaController.js';
import { getConfig, updateConfig } from '../controllers/configController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/templates', getTemplates);
router.get('/packages', getPackages);
router.get('/config', getConfig);
router.put('/config', protect, adminOnly, updateConfig);

export default router;
