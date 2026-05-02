import Invitation from '../models/Invitation.js';
import RSVP from '../models/RSVP.js';
import { ensureDBReady } from '../config/db.js';
import { rsvpSchema } from '../validators/invitationValidator.js';
import { sendRsvpNotification } from '../services/emailService.js';

export const listPublishedInvitations = async (req, res, next) => {
  try {
    await ensureDBReady();
    const page = Math.max(Number.parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '6', 10), 1), 24);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Invitation.find({ status: 'PUBLISHED' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Invitation.countDocuments({ status: 'PUBLISHED' }),
    ]);

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + items.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicInvitation = async (req, res, next) => {
  try {
    await ensureDBReady();
    const { slug } = req.params;
    const invitation = await Invitation.findOne({ slug, status: 'PUBLISHED' });

    if (!invitation) return res.status(404).json({ message: 'Invitation not found or not published' });

    invitation.viewCount = (invitation.viewCount || 0) + 1;
    invitation.lastViewedAt = new Date();
    await invitation.save();

    res.json(invitation);
  } catch (error) {
    next(error);
  }
};

async function createRsvpForInvitation(invitation, payload) {
  const validatedData = rsvpSchema.parse(payload);

  const rsvp = await RSVP.create({
    ...validatedData,
    invitationId: invitation._id
  });

  const recipient = invitation.email || invitation.customerEmail;
  if (recipient) {
    sendRsvpNotification(recipient, invitation, rsvp).catch((emailError) => {
      console.error('Failed to send RSVP notification:', emailError);
    });
  }

  return rsvp;
}

export const submitRSVP = async (req, res, next) => {
  try {
    await ensureDBReady();
    const { slug } = req.params;
    const invitation = await Invitation.findOne({ slug, status: 'PUBLISHED' });

    if (!invitation) return res.status(404).json({ message: 'Invitation not found or not published' });

    await createRsvpForInvitation(invitation, req.body);

    res.status(201).json({ success: true, message: 'RSVP submitted successfully' });
  } catch (error) {
    next(error);
  }
};

export const submitRSVPByInvitationId = async (req, res, next) => {
  try {
    await ensureDBReady();
    const { id } = req.params;
    const invitation = await Invitation.findById(id);

    if (!invitation || invitation.status !== 'PUBLISHED') {
      return res.status(404).json({ message: 'Invitation not found or not published' });
    }

    await createRsvpForInvitation(invitation, req.body);

    res.status(201).json({ success: true, message: 'RSVP submitted successfully' });
  } catch (error) {
    next(error);
  }
};
