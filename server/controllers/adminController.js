import Prediction from '../models/Prediction.js';
import RaceWeekend from '../models/RaceWeekend.js';
import User from '../models/User.js';
import { runScoringForRace } from '../utils/scoringService.js';

export const enterResults = async (req, res) => {
  const race = await RaceWeekend.findById(req.params.id);
  if (!race) return res.status(404).json({ message: 'Race not found' });
  race.officialResults = { ...req.body, finalizedAt: new Date() };
  race.scoringRun = false;
  await race.save();
  res.json(race);
};

export const runScoring = async (req, res) => {
  const race = await RaceWeekend.findById(req.params.id);
  if (!race || !race.officialResults?.p1) return res.status(404).json({ message: 'Official results missing' });
  const processed = await runScoringForRace(race);
  res.json({ message: 'Scoring complete', processed });
};

export const manualOverride = async (req, res) => {
  const prediction = await Prediction.findById(req.params.id);
  if (!prediction) return res.status(404).json({ message: 'Prediction not found' });

  const delta = req.body.points - prediction.calculatedPoints;
  prediction.calculatedPoints = req.body.points;
  prediction.isFinalized = true;
  await prediction.save();

  const user = await User.findById(prediction.userId);
  user.totalPoints += delta;
  await user.save();

  res.json({ message: 'Points overridden', prediction });
};

export const analytics = async (req, res) => {
  const users = await User.find();
  const allPredictions = await Prediction.find().populate('userId', 'name');

  const mostAccurate = [...users].sort((a, b) => b.stats.correctWinners - a.stats.correctWinners)[0];
  const mostPodiums = [...users].sort((a, b) => b.stats.exactPodiums - a.stats.exactPodiums)[0];

  const byUser = new Map();
  allPredictions.forEach((p) => {
    const key = p.userId._id.toString();
    if (!byUser.has(key)) byUser.set(key, []);
    byUser.get(key).push(p.calculatedPoints);
  });

  let biggestJump = { name: '-', jump: 0 };
  byUser.forEach((points, userId) => {
    const max = Math.max(...points, 0);
    if (max > biggestJump.jump) {
      const user = users.find((u) => u._id.toString() === userId);
      biggestJump = { name: user?.name || '-', jump: max };
    }
  });

  const worstPrediction = allPredictions
    .filter((p) => p.isFinalized)
    .sort((a, b) => a.calculatedPoints - b.calculatedPoints)[0];

  res.json({
    mostAccurate,
    mostPodiums,
    biggestJump,
    worstPrediction,
  });
};

export const manageUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
};
