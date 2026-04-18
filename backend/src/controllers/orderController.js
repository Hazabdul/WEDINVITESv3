import Order from '../models/Order.js';
import Invitation from '../models/Invitation.js';
import { sendPaymentConfirmation } from '../services/emailService.js';

export const createOrder = async (req, res, next) => {
  try {
    const { invitationId, customerEmail, package: selectedPackage, amount } = req.body;

    const order = await Order.create({
      invitationId,
      customerEmail,
      package: selectedPackage,
      amount,
      status: 'PENDING'
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
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
    const { id } = req.params;
    const { transactionId } = req.body;

    const order = await Order.findById(id).populate('invitationId');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Update order status
    order.status = 'PAID';
    order.transactionId = transactionId;
    await order.save();

    // Update invitation status and ensure slug exists
    const invitation = order.invitationId;
    let slug = invitation.slug;
    if (!slug) {
      const bride = invitation.brideName || 'wedding';
      const groom = invitation.groomName || 'party';
      const random = Math.random().toString(36).substring(7);
      slug = `${bride.toLowerCase()}-${groom.toLowerCase()}-${random}`.replace(/\s+/g, '-');
    }

    invitation.paymentStatus = 'PAID';
    invitation.package = order.package;
    invitation.status = 'PUBLISHED';
    invitation.slug = slug;
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
