import Order from '../models/Order.js';
import Invitation from '../models/Invitation.js';
import { ensureDBReady } from '../config/db.js';
import { sendPaymentConfirmation } from '../services/emailService.js';
import { orderCreateSchema, verifyPaymentSchema } from '../validators/adminValidator.js';

const slugify = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const createOrder = async (req, res, next) => {
  try {
    await ensureDBReady();
    const parsed = orderCreateSchema.parse(req.body);
    const invitation = await Invitation.findById(parsed.invitationId);

    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    const order = await Order.create({
      ...parsed,
      status: 'PENDING'
    });

    invitation.paymentStatus = 'PENDING';
    invitation.package = parsed.package;
    invitation.customerEmail = parsed.customerEmail;
    await invitation.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    await ensureDBReady();
    const orders = await Order.find()
      .populate('invitationId', 'brideName groomName')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    await ensureDBReady();
    const { id } = req.params;
    const { transactionId } = verifyPaymentSchema.parse(req.body);

    const order = await Order.findById(id).populate('invitationId');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Update order status
    order.status = 'PAID';
    order.transactionId = transactionId;
    order.verifiedBy = req.user?._id;
    order.verifiedAt = new Date();
    await order.save();

    // Update invitation status and ensure slug exists
    const invitation = order.invitationId;
    let slug = invitation.slug;
    if (!slug) {
      const bride = invitation.brideName || 'wedding';
      const groom = invitation.groomName || 'party';
      const random = Math.random().toString(36).substring(7);
      slug = `${slugify(bride)}-${slugify(groom)}-${random}`;
    }

    invitation.paymentStatus = 'PAID';
    invitation.package = order.package;
    invitation.status = 'PUBLISHED';
    invitation.slug = slug;
    invitation.publishedAt = invitation.publishedAt || new Date();
    await invitation.save();

    // Send email
    try {
      const inviteLink = `${process.env.FRONTEND_URL}/invitation/${slug}`;
      const coupleNames = `${invitation.brideName || 'Bride'} & ${invitation.groomName || 'Groom'}`;
      
      await sendPaymentConfirmation(order.customerEmail, {
        coupleNames,
        packageName: order.package,
        inviteLink
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.json({ message: 'Payment verified and invitation published', order });
  } catch (error) {
    next(error);
  }
};
