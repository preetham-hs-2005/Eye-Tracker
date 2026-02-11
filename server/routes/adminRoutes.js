import { Router } from 'express';
import {
  analytics,
  enterResults,
  manageUsers,
  manualOverride,
  runScoring,
} from '../controllers/adminController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { resultsSchema } from '../utils/validators.js';

const router = Router();
router.use(protect, adminOnly);
router.put('/races/:id/results', validate(resultsSchema), enterResults);
router.post('/races/:id/score', runScoring);
router.patch('/predictions/:id/override', manualOverride);
router.get('/analytics', analytics);
router.get('/users', manageUsers);

export default router;
