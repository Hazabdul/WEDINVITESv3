import express from 'express';
import {
  createInvitation,
  getInvitations,
  getInvitationById,
  updateInvitation,
  deleteInvitation,
  publishInvitation,
  unpublishInvitation,
  getRSVPs
} from '../controllers/invitationController.js';
// import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Temporarily remove auth for testing
// router.use(protect);

router.post('/', createInvitation);
router.get('/', getInvitations);
router.get('/:id', getInvitationById);
router.patch('/:id', updateInvitation);
router.delete('/:id', deleteInvitation);

router.post('/:id/publish', publishInvitation);
router.post('/:id/unpublish', unpublishInvitation);
router.get('/:id/rsvps', getRSVPs);

export default router;
