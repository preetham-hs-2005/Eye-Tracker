import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const statsSchema = new mongoose.Schema({
  correctWinners: { type: Number, default: 0 },
  exactPodiums: { type: Number, default: 0 },
  sprintPoints: { type: Number, default: 0 },
  normalPoints: { type: Number, default: 0 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  totalPoints: { type: Number, default: 0 },
  stats: { type: statsSchema, default: () => ({}) },
}, { timestamps: true });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
