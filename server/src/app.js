import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { User } from './models/User.js';
import { userSchema, listSchema } from './validation.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '16kb' }));

const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const publicUser = user => ({ id: String(user._id), fullName: user.fullName, email: user.email, phone: user.phone, role: user.role, dateCreated: user.dateCreated });
const badId = id => !mongoose.isValidObjectId(id);

function authenticate(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = payload;
    next();
  } catch { res.status(401).json({ message: 'Session expired. Please sign in again.' }); }
}

const adminOnly = asyncRoute(async (req, res, next) => {
  const actor = await User.findById(req.auth.sub);
  if (!actor || actor.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false }), asyncRoute(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ message: 'Email and password are required' });
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' });
  const token = jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: publicUser(user) });
}));
app.get('/api/auth/me', authenticate, asyncRoute(async (req, res) => {
  const user = await User.findById(req.auth.sub);
  if (!user) return res.status(401).json({ message: 'Session invalid' });
  res.json({ user: publicUser(user) });
}));

app.use('/api/users', authenticate, adminOnly);
app.get('/api/users', asyncRoute(async (req, res) => {
  const { search, page, limit } = listSchema.parse(req.query);
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter = search ? { $or: [{ fullName: { $regex: escaped, $options: 'i' } }, { email: { $regex: escaped, $options: 'i' } }] } : {};
  const [users, total] = await Promise.all([User.find(filter).sort({ dateCreated: -1, _id: -1 }).skip((page - 1) * limit).limit(limit), User.countDocuments(filter)]);
  res.json({ users: users.map(publicUser), page, limit, total, totalPages: Math.ceil(total / limit) });
}));
app.get('/api/users/:id', asyncRoute(async (req, res) => {
  if (badId(req.params.id)) return res.status(400).json({ message: 'Invalid user ID' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: publicUser(user) });
}));
app.post('/api/users', asyncRoute(async (req, res) => {
  const input = userSchema.parse(req.body);
  const user = await User.create(input);
  res.status(201).json({ user: publicUser(user) });
}));
app.put('/api/users/:id', asyncRoute(async (req, res) => {
  if (badId(req.params.id)) return res.status(400).json({ message: 'Invalid user ID' });
  const input = userSchema.parse(req.body);
  if (String(req.auth.sub) === req.params.id && input.role !== 'admin') return res.status(400).json({ message: 'You cannot remove your own admin access' });
  const user = await User.findByIdAndUpdate(req.params.id, input, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: publicUser(user) });
}));
app.delete('/api/users/:id', asyncRoute(async (req, res) => {
  if (badId(req.params.id)) return res.status(400).json({ message: 'Invalid user ID' });
  if (String(req.auth.sub) === req.params.id) return res.status(400).json({ message: 'You cannot delete your own account' });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.status(204).send();
}));
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, _req, res, _next) => {
  if (err instanceof ZodError) return res.status(400).json({ message: 'Validation failed', errors: err.flatten().fieldErrors });
  if (err.code === 11000) return res.status(409).json({ message: 'Email address is already in use' });
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ message: 'Invalid JSON' });
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});
