import dayjs from 'dayjs';
import Prediction from '../models/Prediction.js';
import RaceWeekend from '../models/RaceWeekend.js';
import User from '../models/User.js';

export const createOrUpdatePrediction = async (req, res) => {
  const predictionData = { ...req.body, userId: req.user._id };
  const prediction = await Prediction.findOneAndUpdate(
    { userId: req.user._id, raceId: req.body.raceId },
    predictionData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(prediction);
};

export const getMyPredictions = async (req, res) => {
  const predictions = await Prediction.find({ userId: req.user._id }).populate('raceId').sort({ createdAt: -1 });
  res.json(predictions);
};

export const getPredictionsForRace = async (req, res) => {
  const race = await RaceWeekend.findById(req.params.raceId);
  if (!race) return res.status(404).json({ message: 'Race not found' });

  const lockTime = dayjs(race.qualifyingTime).subtract(1, 'minute');
  const isClosed = dayjs().isAfter(lockTime);
  if (!isClosed && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Predictions are private until lock' });
  }

  const predictions = await Prediction.find({ raceId: req.params.raceId }).populate('userId', 'name');
  res.json(predictions);
};

export const voteUnexpected = async (req, res) => {
  const prediction = await Prediction.findById(req.params.id).populate('raceId');
  if (!prediction) return res.status(404).json({ message: 'Prediction not found' });

  const raceEnd = dayjs(prediction.raceId.raceStartTime).add(24, 'hour');
  if (dayjs().isAfter(raceEnd)) return res.status(400).json({ message: 'Voting window closed' });

  const existing = prediction.unexpectedVotes.find((vote) => vote.voter.toString() === req.user._id.toString());
  if (existing) existing.approve = req.body.approve;
  else prediction.unexpectedVotes.push({ voter: req.user._id, approve: req.body.approve });

  await prediction.save();
  res.json(prediction);
};

export const leaderboard = async (req, res) => {
  const users = await User.find().select('name totalPoints stats').sort({ totalPoints: -1 });
  const ranked = users.map((user, index) => ({ ...user.toObject(), rank: index + 1 }));
  res.json(ranked);
};
