import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { googleSignIn } from '../controllers/googleAuth.controller';

const router = Router();

router.post('/register', authController.registerInitiate);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOTP);
router.post('/reset-password', authController.resetPassword);

// Google OAuth
router.post('/google', googleSignIn);

export default router;
