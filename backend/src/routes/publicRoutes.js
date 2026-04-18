import express from 'express';
import { getPublicInvitation, submitRSVP } from '../controllers/publicController.js';

const router = express.Router();

router.get('/invitations/:slug', getPublicInvitation);
router.post('/invitations/:slug/rsvp', submitRSVP);

export default router;
