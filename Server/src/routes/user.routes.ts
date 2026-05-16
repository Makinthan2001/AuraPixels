import { Router } from 'express';
import { getProfile, updateProfile, uploadPhoto } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/upload-photo', authenticate, upload.single('photo'), uploadPhoto);

export default router;
