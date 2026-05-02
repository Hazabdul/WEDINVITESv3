import Invitation from '../models/Invitation.js';
import Order from '../models/Order.js';
import RSVP from '../models/RSVP.js';
import User from '../models/User.js';
import { ensureDBReady } from '../config/db.js';
import { hashPassword } from '../services/authService.js';
import { invitationSchema } from '../validators/invitationValidator.js';
import {
  createUserSchema,
  invitationListQuerySchema,
  orderListQuerySchema,
  orderUpdateSchema,
  paginationQuerySchema,
  rsvpListQuerySchema,
  updateRsvpSchema,
  updateUserSchema,
} from '../validators/adminValidator.js';

const respond = (res, data, extra = {}) => res.json({ success: true, data, ...extra });

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const asArray = async (query) => {
  const result = await query;
  return Array.isArray(result) ? result : [];
};

const toPlain = (item) => (item?.toObject ? item.toObject() : item);

const buildInvitationFilter = (query) => {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.package) filter.package = query.package;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [
      { brideName: pattern },
      { groomName: pattern },
      { email: pattern },
      { customerEmail: pattern },
      { slug: pattern },
    ];
  }

  return filter;
};

const buildOrderFilter = (query) => {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [
      { customerEmail: pattern },
      { customerName: pattern },
      { transactionId: pattern },
    ];
  }

  return filter;
};

const buildRsvpFilter = (query) => {
  const filter = {};

  if (query.invitationId) filter.invitationId = query.invitationId;
  if (query.attending !== undefined) filter.attending = query.attending;
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [
      { guestName: pattern },
      { email: pattern },
      { phone: pattern },
      { message: pattern },
    ];
  }

  return filter;
};

async function paginateModel(Model, filter, query, options = {}) {
  const skip = (query.page - 1) * query.limit;
  let findQuery = Model.find(filter)
    .sort(options.sort || { createdAt: -1 })
    .skip(skip)
    .limit(query.limit);

  if (options.populate && typeof findQuery.populate === 'function') {
    findQuery = findQuery.populate(options.populate);
  }

  const [items, total] = await Promise.all([
    asArray(findQuery),
    Model.countDocuments(filter),
  ]);

  return {
    items: items.map(toPlain),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
      hasMore: skip + items.length < total,
    },
  };
}

export const getDashboard = async (req, res, next) => {
  try {
    await ensureDBReady();

    const [
      totalInvitations,
      publishedInvitations,
      draftInvitations,
      archivedInvitations,
      paidOrders,
      pendingOrders,
      failedOrders,
      totalRsvps,
      attendingRsvps,
      recentInvitations,
      recentOrders,
    ] = await Promise.all([
      Invitation.countDocuments({}),
      Invitation.countDocuments({ status: 'PUBLISHED' }),
      Invitation.countDocuments({ status: 'DRAFT' }),
      Invitation.countDocuments({ status: 'ARCHIVED' }),
      asArray(Order.find({ status: 'PAID' })),
      Order.countDocuments({ status: 'PENDING' }),
      Order.countDocuments({ status: 'FAILED' }),
      RSVP.countDocuments({}),
      RSVP.countDocuments({ attending: true }),
      asArray(Invitation.find({}).sort({ createdAt: -1 }).limit(5)),
      asArray(Order.find({}).sort({ createdAt: -1 }).limit(5).populate('invitationId', 'brideName groomName slug')),
    ]);

    const paidOrderCount = paidOrders.length;
    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

    respond(res, {
      totals: {
        invitations: totalInvitations,
        publishedInvitations,
        draftInvitations,
        archivedInvitations,
        orders: paidOrderCount + pendingOrders + failedOrders,
        paidOrders: paidOrderCount,
        pendingOrders,
        failedOrders,
        rsvps: totalRsvps,
        attendingRsvps,
        declinedRsvps: totalRsvps - attendingRsvps,
        revenue,
      },
      recent: {
        invitations: recentInvitations.map(toPlain),
        orders: recentOrders.map(toPlain),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listInvitations = async (req, res, next) => {
  try {
    await ensureDBReady();
    const query = invitationListQuerySchema.parse(req.query);
    const result = await paginateModel(Invitation, buildInvitationFilter(query), query);
    respond(res, result.items, { pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const getInvitationDetails = async (req, res, next) => {
  try {
    await ensureDBReady();
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    const [rsvps, orders] = await Promise.all([
      asArray(RSVP.find({ invitationId: req.params.id }).sort({ createdAt: -1 })),
      asArray(Order.find({ invitationId: req.params.id }).sort({ createdAt: -1 })),
    ]);

    respond(res, {
      ...toPlain(invitation),
      rsvps: rsvps.map(toPlain),
      orders: orders.map(toPlain),
    });
  } catch (error) {
    next(error);
  }
};

export const updateInvitationAsAdmin = async (req, res, next) => {
  try {
    await ensureDBReady();
    const parsed = invitationSchema.parse(req.body);
    const invitation = await Invitation.findByIdAndUpdate(req.params.id, { $set: parsed }, { new: true, runValidators: true });

    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    respond(res, invitation);
  } catch (error) {
    next(error);
  }
};

export const listRsvps = async (req, res, next) => {
  try {
    await ensureDBReady();
    const query = rsvpListQuerySchema.parse(req.query);
    const result = await paginateModel(RSVP, buildRsvpFilter(query), query);
    respond(res, result.items, { pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const updateRsvp = async (req, res, next) => {
  try {
    await ensureDBReady();
    const parsed = updateRsvpSchema.parse(req.body);
    const rsvp = await RSVP.findByIdAndUpdate(req.params.id, { $set: parsed }, { new: true, runValidators: true });

    if (!rsvp) return res.status(404).json({ message: 'RSVP not found' });

    respond(res, rsvp);
  } catch (error) {
    next(error);
  }
};

export const deleteRsvp = async (req, res, next) => {
  try {
    await ensureDBReady();
    const rsvp = await RSVP.findByIdAndDelete(req.params.id);

    if (!rsvp) return res.status(404).json({ message: 'RSVP not found' });

    respond(res, { message: 'RSVP deleted' });
  } catch (error) {
    next(error);
  }
};

export const listOrders = async (req, res, next) => {
  try {
    await ensureDBReady();
    const query = orderListQuerySchema.parse(req.query);
    const result = await paginateModel(Order, buildOrderFilter(query), query, {
      populate: 'invitationId',
    });
    respond(res, result.items, { pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    await ensureDBReady();
    const parsed = orderUpdateSchema.parse(req.body);
    const order = await Order.findByIdAndUpdate(req.params.id, { $set: parsed }, { new: true, runValidators: true });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    respond(res, order);
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    await ensureDBReady();
    const query = paginationQuerySchema.parse(req.query);
    const filter = query.search
      ? {
          $or: [
            { name: new RegExp(escapeRegex(query.search), 'i') },
            { email: new RegExp(escapeRegex(query.search), 'i') },
          ],
        }
      : {};
    const result = await paginateModel(User, filter, query);
    respond(res, result.items.map(({ password, ...user }) => user), { pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    await ensureDBReady();
    const parsed = createUserSchema.parse(req.body);
    const existingUser = await User.findOne({ email: parsed.email });

    if (existingUser) return res.status(409).json({ message: 'User already exists' });

    const user = await User.create({
      ...parsed,
      password: await hashPassword(parsed.password),
    });
    const { password, ...safeUser } = toPlain(user);

    respond(res.status(201), safeUser);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    await ensureDBReady();
    const parsed = updateUserSchema.parse(req.body);

    if (parsed.password) {
      parsed.password = await hashPassword(parsed.password);
    }

    const user = await User.findByIdAndUpdate(req.params.id, { $set: parsed }, { new: true, runValidators: true }).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    respond(res, user);
  } catch (error) {
    next(error);
  }
};
