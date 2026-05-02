import express from 'express';
import {
  createUser,
  deleteRsvp,
  getDashboard,
  getInvitationDetails,
  listInvitations,
  listOrders,
  listRsvps,
  listUsers,
  updateInvitationAsAdmin,
  updateOrder,
  updateRsvp,
  updateUser,
} from '../controllers/adminController.js';
import { verifyPayment } from '../controllers/orderController.js';
import { handleUpload, uploadSingle } from '../controllers/uploadController.js';
import {
  archiveInvitation,
  getConfigAsAdmin,
  publishInvitationAsAdmin,
  unpublishInvitationAsAdmin,
  updateConfigAsAdmin,
} from '../controllers/configController.js';
import { protect, requirePermission, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', requirePermission('dashboard:read'), getDashboard);

router.get('/invitations', requirePermission('invitations:read'), listInvitations);
router.get('/invitations/:id', requirePermission('invitations:read'), getInvitationDetails);
router.patch('/invitations/:id', requirePermission('invitations:write'), updateInvitationAsAdmin);
router.post('/invitations/:id/publish', requirePermission('invitations:write'), publishInvitationAsAdmin);
router.post('/invitations/:id/unpublish', requirePermission('invitations:write'), unpublishInvitationAsAdmin);
router.post('/invitations/:id/archive', requirePermission('invitations:write'), archiveInvitation);

router.get('/rsvps', requirePermission('rsvps:read'), listRsvps);
router.patch('/rsvps/:id', requirePermission('rsvps:write'), updateRsvp);
router.delete('/rsvps/:id', requirePermission('rsvps:write'), deleteRsvp);

router.get('/orders', requirePermission('orders:read'), listOrders);
router.patch('/orders/:id', adminOnly, updateOrder);
router.patch('/orders/:id/verify-payment', adminOnly, verifyPayment);

router.get('/config', requirePermission('config:read'), getConfigAsAdmin);
router.put('/config', adminOnly, updateConfigAsAdmin);

router.post('/uploads', requirePermission('uploads:write'), uploadSingle('file'), handleUpload);

router.get('/users', adminOnly, listUsers);
router.post('/users', adminOnly, createUser);
router.patch('/users/:id', adminOnly, updateUser);

export default router;
