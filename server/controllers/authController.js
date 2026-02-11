import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';

const sendAuth = (res, user) => {
  const token = signToken({ id: user._id, role: user.role });
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      totalPoints: user.totalPoints,
      stats: user.stats,
    },
  });
};

export const register = async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const user = await User.create(req.body);
  sendAuth(res.status(201), user);
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  sendAuth(res, user);
};

export const me = async (req, res) => {
  res.json(req.user);
};
