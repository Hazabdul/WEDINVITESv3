import express from 'express';
import { getPublicInvitation, listPublishedInvitations, submitRSVP } from '../controllers/publicController.js';

const router = express.Router();

router.get('/invitations', listPublishedInvitations);
router.get('/invitations/:slug', getPublicInvitation);
router.post('/invitations/:slug/rsvp', submitRSVP);

export default router;
