import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { app } from './app.js';
import { User } from './models/User.js';

async function start() {
  const { MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGODB_URI || !JWT_SECRET || JWT_SECRET.length < 32 || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error('Set MONGODB_URI, JWT_SECRET (32+ chars), ADMIN_EMAIL, and ADMIN_PASSWORD (12+ chars)');
  }
  await mongoose.connect(MONGODB_URI);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({ fullName: 'Administrator', email, phone: '+10000000000', role: 'admin', passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12) });
    console.log('Initial administrator created');
  }
  app.listen(process.env.PORT || 5000, () => console.log(`API listening on port ${process.env.PORT || 5000}`));
}
start().catch(error => { console.error(error); process.exit(1); });
