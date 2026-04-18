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
  },
  package: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING',
  },
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
