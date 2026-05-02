import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  invitationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invitation',
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  customerName: {
    type: String,
    trim: true,
  },
  package: {
    type: String,
    enum: ['BASIC', 'STANDARD', 'PREMIUM'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  paymentMethod: {
    type: String,
    default: 'manual',
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING',
  },
  notes: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: Date,
}, {
  timestamps: true,
});

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ customerEmail: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
