import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
};

export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: ['*'],
  [ROLES.ADMIN]: ['*'],
  [ROLES.EDITOR]: [
    'dashboard:read',
    'invitations:read',
    'invitations:write',
    'rsvps:read',
    'rsvps:write',
    'orders:read',
    'uploads:write',
    'config:read',
  ],
  [ROLES.VIEWER]: [
    'dashboard:read',
    'invitations:read',
    'rsvps:read',
    'orders:read',
    'config:read',
  ],
};

export const hasPermission = (user, permission) => {
  const permissions = ROLE_PERMISSIONS[user?.role] || [];
  return permissions.includes('*') || permissions.includes(permission);
};

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (req.user && allowedRoles.includes(req.user.role)) {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden - You do not have permission' });
};

export const requirePermission = (permission) => (req, res, next) => {
  if (hasPermission(req.user, permission)) {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden - You do not have permission' });
};

export const adminOnly = (req, res, next) => {
  if (req.user && [ROLES.OWNER, ROLES.ADMIN].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
