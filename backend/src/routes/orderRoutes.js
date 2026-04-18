import express from 'express';
import { createOrder, getOrders, verifyPayment } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createOrder); // Public can create orders
router.get('/', protect, adminOnly, getOrders);
router.patch('/:id/verify-payment', protect, adminOnly, verifyPayment);

export default router;
