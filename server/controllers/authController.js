import { dbStore } from '../data/store.js';
import { generateToken } from '../middleware/authMiddleware.js';

export const register = (req, res) => {
  try {
    const { name, email, password, role = 'student', department, rollNumber, phone, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = dbStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const newUser = {
      _id: `usr_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password, // In full production with mongodb, hashed via bcrypt
      role,
      department: department || 'General Studies',
      rollNumber: rollNumber || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      phone: phone || '',
      year: year || '1st Year',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    dbStore.users.push(newUser);
    dbStore.save();

    const token = generateToken(newUser);
    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Smart Library.',
      token,
      user: userSafe
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

export const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const user = dbStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userSafe
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

export const getMe = (req, res) => {
  try {
    const user = dbStore.users.find(u => u._id === req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password: _, ...userSafe } = user;
    return res.json({ success: true, user: userSafe });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
  }
};

export const getAllUsers = (req, res) => {
  try {
    const students = dbStore.users
      .filter(u => u.role === 'student')
      .map(({ password: _, ...rest }) => rest);
    return res.json({ success: true, count: students.length, users: students });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
};
