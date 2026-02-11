import RaceWeekend from '../models/RaceWeekend.js';

export const ensurePredictionOpen = async (req, res, next) => {
  const raceId = req.body.raceId || req.params.raceId;
  const race = await RaceWeekend.findById(raceId);
  if (!race) return res.status(404).json({ message: 'Race weekend not found' });

  const lockTime = new Date(new Date(race.qualifyingTime).getTime() - 60000);
  const isLocked = race.isLocked || Date.now() >= lockTime.getTime();

  if (isLocked) {
    return res.status(400).json({ message: 'Predictions are locked for this race weekend.' });
  }

  req.raceWeekend = race;
  next();
};
