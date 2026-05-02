import express from 'express';
import { addHistory, getHistory } from '../controllers/history.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', protect, addHistory);
router.get('/:userId', protect, getHistory);

export default router;
