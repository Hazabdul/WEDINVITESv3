import User from '../models/User.js';
import { ensureDBReady } from '../config/db.js';
import { comparePassword, generateToken } from '../services/authService.js';
import { loginSchema } from '../validators/authValidator.js';

export const login = async (req, res, next) => {
  try {
    await ensureDBReady();
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });

    if (user && (await comparePassword(password, user.password))) {
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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
