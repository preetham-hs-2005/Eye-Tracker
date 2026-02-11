import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approve: { type: Boolean, required: true },
  votedAt: { type: Date, default: Date.now },
}, { _id: false });

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  raceId: { type: mongoose.Schema.Types.ObjectId, ref: 'RaceWeekend', required: true },
  predictedP1: { type: String, required: true },
  predictedP2: { type: String, required: true },
  predictedP3: { type: String, required: true },
  predictedPole: { type: String, required: true },
  unexpectedStatement: { type: String, required: true },
  unexpectedVotes: { type: [voteSchema], default: [] },
  calculatedPoints: { type: Number, default: 0 },
  breakdown: {
    winner: { type: Number, default: 0 },
    p2: { type: Number, default: 0 },
    p3: { type: Number, default: 0 },
    pole: { type: Number, default: 0 },
    unexpected: { type: Number, default: 0 },
    exactPodiumBonus: { type: Number, default: 0 },
    multiplier: { type: Number, default: 1 },
  },
  isFinalized: { type: Boolean, default: false },
}, { timestamps: true });

predictionSchema.index({ userId: 1, raceId: 1 }, { unique: true });

export default mongoose.model('Prediction', predictionSchema);
