import Invitation from '../models/Invitation.js';
import RSVP from '../models/RSVP.js';
import { invitationSchema } from '../validators/invitationValidator.js';
import crypto from 'crypto';

export const createInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.create({
      status: 'DRAFT',
      package: 'BASIC',
      content: {},
      theme: {},
      media: { gallery: [] },
      positions: {}
    });
    res.status(201).json(invitation);
  } catch (error) {
    next(error);
  }
};

export const getInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find().sort({ createdAt: -1 });
    res.json(invitations);
  } catch (error) {
    next(error);
  }
};

export const getInvitationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invitation = await Invitation.findById(id);

    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    // Fetch RSVPs separately as they are a different collection
    const rsvps = await RSVP.find({ invitationId: id }).sort({ createdAt: -1 });
    
    // Merge or send together
    const result = invitation.toObject();
    result.rsvps = rsvps;
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = invitationSchema.parse(req.body);

    const updated = await Invitation.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Invitation not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const publishInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invitation = await Invitation.findById(id);

    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    // Generate slug if not exists
    let slug = invitation.slug;
    if (!slug) {
      const bride = invitation.brideName || 'wedding';
      const groom = invitation.groomName || 'party';
      const random = crypto.randomBytes(3).toString('hex');
      slug = `${bride.toLowerCase()}-${groom.toLowerCase()}-${random}`.replace(/\s+/g, '-');
    }

    invitation.status = 'PUBLISHED';
    invitation.slug = slug;
    await invitation.save();

    res.json({ message: 'Published successfully', slug: invitation.slug });
  } catch (error) {
    next(error);
  }
};

export const unpublishInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Invitation.findByIdAndUpdate(id, { status: 'DRAFT' });
    res.json({ message: 'Unpublished successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Invitation.findByIdAndUpdate(id, { status: 'ARCHIVED' });
    res.json({ message: 'Invitation archived' });
  } catch (error) {
    next(error);
  }
};

export const getRSVPs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rsvps = await RSVP.find({ invitationId: id }).sort({ createdAt: -1 });
    res.json(rsvps);
  } catch (error) {
    next(error);
  }
};
