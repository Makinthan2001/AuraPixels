import express from 'express';
import { 
  addHistory, 
  getHistory, 
  deleteHistoryItem, 
  clearAllHistory 
} from '../controllers/history.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', protect, addHistory);
router.get('/', protect, getHistory);
router.delete('/:id', protect, deleteHistoryItem);
router.delete('/', protect, clearAllHistory);

export default router;
