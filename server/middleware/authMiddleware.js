import jwt from 'jsonwebtoken';
import { dbStore } from '../data/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_library_super_secret_jwt_key_2026';

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      name: user.name,
      rollNumber: user.rollNumber 
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access Denied: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = dbStore.users.find(u => u._id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found in database' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
  next();
};
