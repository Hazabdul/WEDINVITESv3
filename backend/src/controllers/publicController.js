import Invitation from '../models/Invitation.js';
import RSVP from '../models/RSVP.js';
import { rsvpSchema } from '../validators/invitationValidator.js';

export const getPublicInvitation = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const invitation = await Invitation.findOne({ slug, status: 'PUBLISHED' });

    if (!invitation) return res.status(404).json({ message: 'Invitation not found or not published' });

    res.json(invitation);
  } catch (error) {
    next(error);
  }
};

export const submitRSVP = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const invitation = await Invitation.findOne({ slug });

    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    const validatedData = rsvpSchema.parse(req.body);

    const rsvp = await RSVP.create({
      ...validatedData,
      invitationId: invitation._id
    });

    res.status(201).json({ success: true, message: 'RSVP submitted successfully' });
  } catch (error) {
    next(error);
  }
};
