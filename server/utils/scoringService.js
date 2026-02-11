import Prediction from '../models/Prediction.js';
import User from '../models/User.js';
import { POINTS } from './constants.js';

const hasMajorityApproval = (votes) => {
  if (!votes.length) return false;
  const approvals = votes.filter((v) => v.approve).length;
  return approvals > votes.length / 2;
};

export const calculatePredictionScore = (prediction, raceWeekend) => {
  if (!raceWeekend.officialResults?.p1) return { total: 0, breakdown: {} };

  const b = {
    winner: prediction.predictedP1 === raceWeekend.officialResults.p1 ? POINTS.winner : 0,
    p2: prediction.predictedP2 === raceWeekend.officialResults.p2 ? POINTS.p2 : 0,
    p3: prediction.predictedP3 === raceWeekend.officialResults.p3 ? POINTS.p3 : 0,
    pole: prediction.predictedPole === raceWeekend.officialResults.pole ? POINTS.pole : 0,
    unexpected: hasMajorityApproval(prediction.unexpectedVotes) ? POINTS.unexpected : 0,
    exactPodiumBonus:
      prediction.predictedP1 === raceWeekend.officialResults.p1 &&
      prediction.predictedP2 === raceWeekend.officialResults.p2 &&
      prediction.predictedP3 === raceWeekend.officialResults.p3
        ? POINTS.exactPodiumBonus
        : 0,
    multiplier: raceWeekend.sprintWeekend ? 0.5 : 1,
  };

  const raw = b.winner + b.p2 + b.p3 + b.pole + b.unexpected + b.exactPodiumBonus;
  return { total: raw * b.multiplier, breakdown: b };
};

export const runScoringForRace = async (raceWeekend) => {
  const predictions = await Prediction.find({ raceId: raceWeekend._id, isFinalized: false });

  for (const prediction of predictions) {
    const { total, breakdown } = calculatePredictionScore(prediction, raceWeekend);
    prediction.calculatedPoints = total;
    prediction.breakdown = breakdown;
    prediction.isFinalized = true;
    await prediction.save();

    const user = await User.findById(prediction.userId);
    user.totalPoints += total;
    if (breakdown.winner) user.stats.correctWinners += 1;
    if (breakdown.exactPodiumBonus) user.stats.exactPodiums += 1;
    if (raceWeekend.sprintWeekend) user.stats.sprintPoints += total;
    else user.stats.normalPoints += total;
    await user.save();
  }

  raceWeekend.scoringRun = true;
  await raceWeekend.save();

  return predictions.length;
};
