import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  phone: { type: String, required: true, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  passwordHash: { type: String, select: false }
}, { timestamps: { createdAt: 'dateCreated', updatedAt: 'updatedAt' }, versionKey: false });

userSchema.index({ fullName: 1 });
export const User = mongoose.model('User', userSchema);
