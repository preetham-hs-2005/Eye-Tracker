import dayjs from 'dayjs';
import RaceWeekend from '../models/RaceWeekend.js';

export const getRaceWeekends = async (req, res) => {
  const races = await RaceWeekend.find().sort({ qualifyingTime: 1 });
  const now = dayjs();
  const data = races.map((race) => {
    const lockTime = dayjs(race.qualifyingTime).subtract(1, 'minute');
    return {
      ...race.toObject(),
      lockTime: lockTime.toISOString(),
      isLockedDynamic: race.isLocked || now.isAfter(lockTime),
    };
  });
  res.json(data);
};

export const getCurrentRace = async (req, res) => {
  const now = new Date();
  const race = await RaceWeekend.findOne({ raceStartTime: { $gte: now } }).sort({ raceStartTime: 1 });
  if (!race) return res.status(404).json({ message: 'No upcoming races' });
  res.json(race);
};

export const toggleLockRace = async (req, res) => {
  const race = await RaceWeekend.findById(req.params.id);
  if (!race) return res.status(404).json({ message: 'Race not found' });
  race.isLocked = !race.isLocked;
  await race.save();
  res.json(race);
};
