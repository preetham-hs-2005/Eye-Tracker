import { Router } from 'express';
import {
  createOrUpdatePrediction,
  getMyPredictions,
  getPredictionsForRace,
  leaderboard,
  voteUnexpected,
} from '../controllers/predictionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { ensurePredictionOpen } from '../middleware/predictionLockMiddleware.js';
import { validate } from '../middleware/validate.js';
import { predictionSchema } from '../utils/validators.js';

const router = Router();
router.get('/me', protect, getMyPredictions);
router.post('/', protect, validate(predictionSchema), ensurePredictionOpen, createOrUpdatePrediction);
router.get('/race/:raceId', protect, getPredictionsForRace);
router.post('/:id/vote', protect, voteUnexpected);
router.get('/leaderboard/all', protect, leaderboard);

export default router;
