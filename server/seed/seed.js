import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import RaceWeekend from '../models/RaceWeekend.js';
import { raceCalendar2026 } from './raceCalendar2026.js';

dotenv.config({ path: '.env' });

const seed = async () => {
  await connectDB();
  await RaceWeekend.deleteMany();
  await RaceWeekend.insertMany(raceCalendar2026);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@f1league.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const existing = await User.findOne({ email: adminEmail });

  if (!existing) {
    await User.create({
      name: 'League Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
  }

  console.log('Seed complete: races + admin user');
  await mongoose.connection.close();
};

seed();
