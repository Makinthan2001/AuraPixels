import express from 'express';
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favorite.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', protect, addFavorite);
router.get('/', protect, getFavorites);
router.delete('/:id', protect, removeFavorite);

export default router;
