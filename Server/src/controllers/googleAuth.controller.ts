import { Request, Response } from 'express';
import { googleAuthService } from '../services/googleAuth.service';

/**
 * POST /api/auth/google
 *
 * Accepts a Google ID Token from the mobile client,
 * verifies it server-side, and returns JWT tokens.
 *
 * Body: { idToken: string }
 */
export const googleSignIn = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'idToken is required and must be a string',
      });
    }

    const result = await googleAuthService.googleSignIn(idToken);

    return res.status(200).json({
      success: true,
      message: 'Google Sign-In successful',
      ...result,
    });
  } catch (error: any) {
    // Distinguish between invalid tokens and server errors
    const isAuthError =
      error.message?.includes('Invalid Google token') ||
      error.message?.includes('email is not verified') ||
      error.message?.includes('Token used too late') ||
      error.message?.includes('Invalid token signature');

    return res.status(isAuthError ? 401 : 500).json({
      success: false,
      message: error.message || 'Google Sign-In failed',
    });
  }
};
