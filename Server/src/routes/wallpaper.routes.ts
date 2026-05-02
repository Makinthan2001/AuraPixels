import express from 'express';
import { getWallpapers, getWallpaperById } from '../controllers/wallpaper.controller';

const router = express.Router();

router.get('/', getWallpapers);
router.get('/:id', getWallpaperById);

export default router;
