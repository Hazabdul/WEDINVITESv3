import User from '../models/User.js';
import { ensureDBReady } from '../config/db.js';
import { comparePassword, generateToken } from '../services/authService.js';
import { loginSchema } from '../validators/authValidator.js';

export const login = async (req, res, next) => {
  try {
    await ensureDBReady();
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await comparePassword(password, user.password))) {
      if (user.status === 'DISABLED') {
        return res.status(403).json({ message: 'Account disabled' });
      }

      user.lastLoginAt = new Date();
      await user.save();

      const authUser = {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      res.json({
        ...authUser,
        user: authUser,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    await ensureDBReady();
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};
