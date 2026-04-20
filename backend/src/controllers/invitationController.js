import Invitation from '../models/Invitation.js';
import RSVP from '../models/RSVP.js';
import { ensureDBReady } from '../config/db.js';
import { invitationSchema } from '../validators/invitationValidator.js';
import crypto from 'crypto';

const defaultTheme = {
  id: 'ceremony',
  primaryColor: '#876c57',
  secondaryColor: '#efe2d3',
  headingColor: '#6f5642',
  subheadingColor: '#876c57',
  bodyColor: '#705f53',
  metaColor: '#9a7d66',
  font: 'serif',
  backgroundStyle: 'soft-gradient',
  borderStyle: 'rounded',
  sectionShape: 'rounded-3xl',
  enableAnimation: true,
  enableCountdown: true,
  enableGallery: true,
  enableVideo: true,
  enableMusic: false,
};

export const createInvitation = async (req, res, next) => {
  try {
    await ensureDBReady();
    const invitation = await Invitation.create({
      status: 'DRAFT',
      package: 'BASIC',
      content: {},
      theme: defaultTheme,
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
    await ensureDBReady();
    const invitations = await Invitation.find().sort({ createdAt: -1 });
    res.json(invitations);
  } catch (error) {
    next(error);
  }
};

export const getInvitationById = async (req, res, next) => {
  try {
    await ensureDBReady();
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
    await ensureDBReady();
    const { id } = req.params;
    const parsed = invitationSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: parsed.error.issues,
      });
    }

    const updated = await Invitation.findByIdAndUpdate(
      id,
      { $set: parsed.data },
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
    await ensureDBReady();
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
    await ensureDBReady();
    const { id } = req.params;
    await Invitation.findByIdAndUpdate(id, { status: 'DRAFT' });
    res.json({ message: 'Unpublished successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteInvitation = async (req, res, next) => {
  try {
    await ensureDBReady();
    const { id } = req.params;
    await Invitation.findByIdAndUpdate(id, { status: 'ARCHIVED' });
    res.json({ message: 'Invitation archived' });
  } catch (error) {
    next(error);
  }
};

export const getRSVPs = async (req, res, next) => {
  try {
    await ensureDBReady();
    const { id } = req.params;
    const rsvps = await RSVP.find({ invitationId: id }).sort({ createdAt: -1 });
    res.json(rsvps);
  } catch (error) {
    next(error);
  }
};
