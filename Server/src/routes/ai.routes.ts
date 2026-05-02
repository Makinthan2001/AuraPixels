import express from 'express';
import { generateWallpaper } from '../controllers/ai.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/generate', protect, generateWallpaper);

export default router;
