import { Router } from 'express';
import { getCurrentRace, getRaceWeekends, toggleLockRace } from '../controllers/raceController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', protect, getRaceWeekends);
router.get('/current', protect, getCurrentRace);
router.patch('/:id/lock', protect, adminOnly, toggleLockRace);

export default router;
