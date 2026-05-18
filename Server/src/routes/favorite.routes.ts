import express from 'express';
import { addFavorite, getFavorites, removeFavorite, toggleFavorite } from '../controllers/favorite.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/:wallpaperId', protect, toggleFavorite);
router.post('/', protect, addFavorite);
router.get('/', protect, getFavorites);
router.delete('/:id', protect, removeFavorite);

export default router;
