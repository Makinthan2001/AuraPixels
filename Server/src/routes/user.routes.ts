import { Router } from 'express';
import { getProfile, updateProfile, uploadPhoto } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/upload-photo', protect, upload.single('photo'), uploadPhoto);

export default router;
