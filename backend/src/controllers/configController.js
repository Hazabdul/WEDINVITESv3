import crypto from 'crypto';
import SiteConfig, { DEFAULT_SITE_CONFIG } from '../models/SiteConfig.js';
import Invitation from '../models/Invitation.js';
import { ensureDBReady } from '../config/db.js';
import { siteConfigSchema } from '../validators/adminValidator.js';

const slugify = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const toPlain = (item) => (item?.toObject ? item.toObject() : item);

const withDefaultConfig = (config) => ({
  ...DEFAULT_SITE_CONFIG,
  ...(config || {}),
  key: 'default',
});

async function getOrCreateConfig() {
  const existing = await SiteConfig.findOne({ key: 'default' });
  if (existing) {
    return withDefaultConfig(toPlain(existing));
  }

  const created = await SiteConfig.findOneAndUpdate(
    { key: 'default' },
    { $set: DEFAULT_SITE_CONFIG },
    { new: true, upsert: true, runValidators: true }
  );

  return withDefaultConfig(toPlain(created));
}

export const getConfig = async (req, res, next) => {
  try {
    await ensureDBReady();
    const config = await getOrCreateConfig();
    res.json(config);
  } catch (error) {
    next(error);
  }
};

export const getConfigAsAdmin = async (req, res, next) => {
  try {
    await ensureDBReady();
    const config = await getOrCreateConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
};

export const updateConfig = async (req, res, next) => {
  try {
    await ensureDBReady();
    const parsed = siteConfigSchema.parse(req.body);
    const updated = await SiteConfig.findOneAndUpdate(
      { key: 'default' },
      { $set: { ...parsed, key: 'default' } },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(withDefaultConfig(toPlain(updated)));
  } catch (error) {
    next(error);
  }
};

export const updateConfigAsAdmin = async (req, res, next) => {
  try {
    await ensureDBReady();
    const parsed = siteConfigSchema.parse(req.body);
    const updated = await SiteConfig.findOneAndUpdate(
      { key: 'default' },
      { $set: { ...parsed, key: 'default' } },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: withDefaultConfig(toPlain(updated)) });
  } catch (error) {
    next(error);
  }
};

export const publishInvitationAsAdmin = async (req, res, next) => {
  try {
    await ensureDBReady();
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    if (!invitation.slug) {
      const bride = slugify(invitation.brideName || invitation.couple?.bride || 'wedding');
      const groom = slugify(invitation.groomName || invitation.couple?.groom || 'party');
      invitation.slug = `${bride}-${groom}-${crypto.randomBytes(3).toString('hex')}`;
    }

    invitation.status = 'PUBLISHED';
    invitation.publishedAt = invitation.publishedAt || new Date();
    await invitation.save();

    res.json({ success: true, data: invitation, message: 'Invitation published' });
  } catch (error) {
    next(error);
  }
};

export const unpublishInvitationAsAdmin = async (req, res, next) => {
  try {
    await ensureDBReady();
    const invitation = await Invitation.findByIdAndUpdate(
      req.params.id,
      { status: 'DRAFT' },
      { new: true, runValidators: true }
    );

    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    res.json({ success: true, data: invitation, message: 'Invitation unpublished' });
  } catch (error) {
    next(error);
  }
};

export const archiveInvitation = async (req, res, next) => {
  try {
    await ensureDBReady();
    const invitation = await Invitation.findByIdAndUpdate(
      req.params.id,
      { status: 'ARCHIVED', archivedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    res.json({ success: true, data: invitation, message: 'Invitation archived' });
  } catch (error) {
    next(error);
  }
};
