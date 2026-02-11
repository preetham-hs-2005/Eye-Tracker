import mongoose from 'mongoose';

const officialResultsSchema = new mongoose.Schema({
  p1: String,
  p2: String,
  p3: String,
  pole: String,
  finalizedAt: Date,
}, { _id: false });

const raceWeekendSchema = new mongoose.Schema({
  raceName: { type: String, required: true, unique: true },
  circuit: { type: String, required: true },
  country: { type: String, required: true },
  qualifyingTime: { type: Date, required: true },
  sprintWeekend: { type: Boolean, default: false },
  raceStartTime: { type: Date, required: true },
  officialResults: officialResultsSchema,
  isLocked: { type: Boolean, default: false },
  scoringRun: { type: Boolean, default: false },
}, { timestamps: true });

raceWeekendSchema.virtual('lockTime').get(function getLockTime() {
  return new Date(new Date(this.qualifyingTime).getTime() - 60000);
});

export default mongoose.model('RaceWeekend', raceWeekendSchema);
